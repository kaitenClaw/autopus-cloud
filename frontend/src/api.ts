import axios from 'axios';

const resolveApiBaseFromHostname = (hostname: string): string => {
  const host = hostname.toLowerCase();
  if (host === 'dashboard.autopus.cloud' || host === 'www.dashboard.autopus.cloud') {
    return 'https://api.autopus.cloud/api';
  }
  if (host.endsWith('.autopus.cloud') && host.includes('dashboard')) {
    return `https://${host.replace('dashboard', 'api')}/api`;
  }
  return '/api';
};

const resolveApiBase = (): string => {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_API_BASE_URL || '/api';
  }

  const hostBase = resolveApiBaseFromHostname(window.location.hostname);
  const configuredBase = import.meta.env.VITE_API_BASE_URL;
  const isAutopusDashboard =
    window.location.hostname === 'dashboard.autopus.cloud' ||
    window.location.hostname === 'www.dashboard.autopus.cloud' ||
    (window.location.hostname.endsWith('.autopus.cloud') && window.location.hostname.includes('dashboard'));

  // Production dashboard domains always use the API domain directly.
  if (isAutopusDashboard) {
    return hostBase;
  }

  return configuredBase || hostBase;
};

const API_BASE_URL = resolveApiBase();

if (!import.meta.env.PROD) {
  console.info(`[api] base URL resolved to: ${API_BASE_URL}`);
}

const getAuthToken = () => localStorage.getItem('ocaas_token');
const normalizeProfile = (value?: string | null) => {
  const profile = String(value || '').trim().toLowerCase();
  if (!profile || profile === 'prime' || profile === 'main') return 'kaiten';
  return profile;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error?.config) return Promise.reject(error);
    const status = error?.response?.status;
    if (status === 401) {
      if (typeof window !== 'undefined' && localStorage.getItem('ocaas_token')) {
        localStorage.removeItem('ocaas_token');
        window.dispatchEvent(new Event('ocaas-auth-changed'));
      }
      return Promise.reject(error);
    }
    const method = String(error?.config?.method || 'get').toLowerCase();
    const retryCount = Number(error?.config?._retryCount || 0);
    const shouldRetry = method === 'get' && (status === 429 || status === 502 || status === 503 || status === 504);
    if (!shouldRetry || retryCount >= 2) {
      return Promise.reject(error);
    }
    const delay = 250 * Math.pow(2, retryCount) + Math.floor(Math.random() * 100);
    await new Promise((resolve) => setTimeout(resolve, delay));
    error.config._retryCount = retryCount + 1;
    return api.request(error.config);
  }
);

export interface Agent {
  id: string;
  name: string;
}

export interface Session {
  id: string;
  agentId: string;
  title: string;
  memoryScope?: string;
  channel?: string;
  chatType?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export type KAITENAgentStatus = 'RUNNING' | 'STOPPED' | 'ERROR' | 'UNKNOWN';
export type KAITENAgentLocation = 'Local' | 'Cloud' | 'Unknown';

export interface KAITENAgentRuntime {
  id: string;
  name: string;
  profile: string;
  status: KAITENAgentStatus;
  reachable: boolean;
  location: KAITENAgentLocation;
  gatewayMode: string;
  gatewayUrl: string | null;
  runtimeHost: string | null;
  runtimeIp: string | null;
  serviceState: string | null;
  model: string;
  activeModel?: string;
  configuredPrimaryModel?: string | null;
  configuredFallbacks?: string[];
  error: string | null;
  checkedAt: string;
}

export interface ModelCatalog {
  models: string[];
  defaults: { primary: string; fallbacks: string[] } | null;
  profiles: Record<string, { primary: string; fallbacks: string[] }>;
  generatedAt: string | null;
}

export interface CoordinationOverview {
  agents: Record<string, { status?: string; role?: string; currentTask?: string; model?: string }>;
  activeTasks: Array<{
    id: string;
    title: string;
    assignee: string;
    state: string;
    priority: string;
    track: string;
    updatedAt: string | null;
    dependencies: string[];
  }>;
  assigneeLoad: Record<string, { total: number; inProgress: number; review: number }>;
  agentRoutines?: Array<{ id: string; status: string; model: string; currentTask: string; role: string }>;
  tasksByAssignee?: Record<string, Array<{ id: string; title?: string; state?: string; priority?: string; track?: string }>>;
  chains: Array<{ taskId: string; dependsOn: string[]; assignee: string; state: string }>;
  totalTasks: number;
}

// Utility to extract data from {status, data: {...}} response
const extractData = (response: any) => {
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  return response.data;
};

export const getAgents = async (): Promise<Agent[]> => {
  const response = await api.get('/agents');
  const data = extractData(response);
  return data.agents ?? [];
};

export const getSessions = async (agentId: string): Promise<Session[]> => {
  const response = await api.get(`/agents/${agentId}/sessions`);
  const data = extractData(response);
  return data.sessions ?? [];
};

export const getOpenClawThreads = async (opts: { agentId?: string; profile?: string }): Promise<Session[]> => {
  const normalized = opts.profile ? { ...opts, profile: normalizeProfile(opts.profile) } : opts;
  const response = await api.get('/hub/openclaw/threads', { params: normalized });
  const data = extractData(response);
  const threads = Array.isArray(data?.threads) ? data.threads : [];
  return threads.map((thread: any) => ({
    id: String(thread.id),
    agentId: String(normalized.agentId || `kaiten:${normalizeProfile(normalized.profile)}`),
    title: String(thread.title || 'Telegram Thread'),
    memoryScope: 'TELEGRAM',
    channel: String(thread.channel || 'telegram'),
    chatType: String(thread.chatType || 'direct'),
    createdAt: thread.updatedAt || new Date().toISOString(),
    updatedAt: thread.updatedAt || new Date().toISOString(),
  }));
};

export const createSession = async (agentId: string, title: string): Promise<Session> => {
  const response = await api.post(`/agents/${agentId}/sessions`, { title });
  const data = extractData(response);
  return data.session;
};

export const getMessages = async (agentId: string, sessionId: string): Promise<Message[]> => {
  const response = await api.get(`/agents/${agentId}/messages`, { params: { sessionId } });
  const data = extractData(response);
  return data.messages ?? [];
};

export const getOpenClawThreadMessages = async (agentId: string, threadId: string): Promise<Message[]> => {
  const isVirtual = agentId.startsWith('kaiten:');
  const profile = isVirtual ? normalizeProfile(agentId.replace('kaiten:', '')) : undefined;
  const response = await api.get(`/hub/openclaw/thread/${threadId}`, {
    params: isVirtual ? { profile } : { agentId },
  });
  const data = extractData(response);
  return Array.isArray(data?.messages) ? data.messages : [];
};

export const sendMessage = async (agentId: string, message: string, sessionId?: string): Promise<Message> => {
  const response = await api.post(`/agents/${agentId}/message`, { message, sessionId });
  const data = extractData(response);
  return data.assistantMessage;
};

export const getConfig = async (agentId: string): Promise<AgentConfig> => {
  const response = await api.get(`/agents/${agentId}/config`);
  const data = extractData(response);
  return data.config;
};

export const updateConfig = async (agentId: string, config: Partial<AgentConfig>): Promise<AgentConfig> => {
  const response = await api.patch(`/agents/${agentId}/config`, config);
  const data = extractData(response);
  return data.config;
};


export interface LaunchPresetAgent {
  name: string;
  model: string;
  include?: boolean;
}

export interface LaunchPresetSet {
  id: string;
  name: string;
  description?: string;
  agents: LaunchPresetAgent[];
}

export interface BulkCreateResultItem {
  name: string;
  success: boolean;
  id?: string;
  error?: string;
}

export interface BulkCreateAgentsSummary {
  created: BulkCreateResultItem[];
  failed: BulkCreateResultItem[];
}

const LOCAL_AGENT_DEFAULT_PRESETS: LaunchPresetSet[] = [
  {
    id: 'solo-starter',
    name: 'Solo Starter',
    description: 'Create one OpenClaw agent and start chatting immediately.',
    agents: [
      { name: 'My Agent', model: 'openai-codex/gpt-5.2', include: true },
    ],
  },
];

const normalizePresetSet = (preset: any, index: number): LaunchPresetSet => ({
  id: String(preset?.id ?? preset?.key ?? `preset-${index + 1}`),
  name: String(preset?.name ?? `Preset ${index + 1}`),
  description: preset?.description ? String(preset.description) : undefined,
  agents: Array.isArray(preset?.agents)
    ? preset.agents.map((agent: any, agentIndex: number) => ({
      name: String(agent?.name ?? `Agent ${agentIndex + 1}`),
      model: String(agent?.model ?? 'openai-codex/gpt-5.2'),
      include: agent?.include !== false,
    }))
    : [],
});

export const getAgentPresets = async (): Promise<LaunchPresetSet[]> => {
  try {
    const response = await api.get('/agents/presets');
    const data = extractData(response);
    const rawPresets = Array.isArray(data)
      ? data
      : Array.isArray(data?.presets)
        ? data.presets
        : [];

    const normalized: LaunchPresetSet[] = rawPresets
      .map((preset: any, index: number) => normalizePresetSet(preset, index))
      .filter((preset: LaunchPresetSet) => preset.agents.length > 0);
    return normalized.length > 0 ? normalized : LOCAL_AGENT_DEFAULT_PRESETS;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return LOCAL_AGENT_DEFAULT_PRESETS;
    }
    throw error;
  }
};

export interface BusinessValue {
  proposition: string;
  mvpDefinition: string;
  priorities: string[];
  launchTargets: {
    signupTarget: number;
    payingCustomersTarget: number;
    mrrTargetUsd: number;
  };
  progress: {
    signupsPct: number;
    payingCustomersPct: number;
    mrrPct: number;
  };
  blockers: string[];
  recommendedActions: string[];
  sources: string[];
}

export const getBusinessValue = async (): Promise<BusinessValue> => {
  try {
    const response = await api.get('/system/business/value');
    const data = extractData(response);
    return data as BusinessValue;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return {
        proposition: '',
        mvpDefinition: '',
        priorities: [],
        launchTargets: { signupTarget: 0, payingCustomersTarget: 0, mrrTargetUsd: 0 },
        progress: { signupsPct: 0, payingCustomersPct: 0, mrrPct: 0 },
        blockers: [],
        recommendedActions: [],
        sources: [],
      };
    }
    throw error;
  }
};

export const bulkCreateAgents = async (payload: {
  presetId?: string;
  autoStart: boolean;
  agents: Array<{ name: string; model: string }>;
}): Promise<BulkCreateAgentsSummary> => {
  const requestPayload = {
    presetId: payload.presetId,
    autoStart: payload.autoStart,
    agents: payload.agents.map((agent) => ({
      name: agent.name,
      modelPreset: agent.model,
    })),
  };

  const response = await api.post('/agents/bulk-create', requestPayload);
  const data = extractData(response);

  const createdRaw = Array.isArray(data?.created) ? data.created : [];
  const failedRaw = Array.isArray(data?.failed) ? data.failed : [];

  if (createdRaw.length || failedRaw.length) {
    return {
      created: createdRaw.map((item: any) => ({
        name: String(item?.name ?? 'Unknown'),
        success: true,
        id: item?.id ? String(item.id) : undefined,
      })),
      failed: failedRaw.map((item: any) => ({
        name: String(item?.name ?? 'Unknown'),
        success: false,
        error: item?.error ? String(item.error) : 'Failed',
      })),
    };
  }

  const resultsRaw = Array.isArray(data?.results) ? data.results : [];
  const agentsRaw = Array.isArray(data?.agents) ? data.agents : [];
  if (agentsRaw.length) {
    const created = agentsRaw
      .filter((item: any) => item?.status === 'created')
      .map((item: any) => ({
        name: String(item?.name ?? item?.agent?.name ?? 'Unknown'),
        success: true,
        id: item?.agent?.id ? String(item.agent.id) : undefined,
      }));
    const failed = agentsRaw
      .filter((item: any) => item?.status !== 'created')
      .map((item: any) => ({
        name: String(item?.name ?? 'Unknown'),
        success: false,
        error: item?.message ? String(item.message) : 'Failed',
      }));
    return { created, failed };
  }

  const created = resultsRaw
    .filter((item: any) => item?.success)
    .map((item: any) => ({ name: String(item?.name ?? 'Unknown'), success: true, id: item?.id ? String(item.id) : undefined }));
  const failed = resultsRaw
    .filter((item: any) => !item?.success)
    .map((item: any) => ({ name: String(item?.name ?? 'Unknown'), success: false, error: item?.error ? String(item.error) : 'Failed' }));

  return { created, failed };
};
export const getKaitenAgentsStatus = async (): Promise<KAITENAgentRuntime[]> => {
  try {
    const response = await api.get('/system/kaiten/agents');
    const data = extractData(response);
    return data.agents ?? [];
  } catch (error: any) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

export const getModelCatalog = async (): Promise<ModelCatalog> => {
  try {
    const response = await api.get('/system/model-catalog');
    const data = extractData(response);
    return {
      models: Array.isArray(data?.models) ? data.models : [],
      defaults: data?.defaults ?? null,
      profiles: data?.profiles ?? {},
      generatedAt: data?.generatedAt ?? null,
    };
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return { models: [], defaults: null, profiles: {}, generatedAt: null };
    }
    throw error;
  }
};

export const getCoordinationOverview = async (): Promise<CoordinationOverview> => {
  try {
    const response = await api.get('/system/coordination/overview');
    const data = extractData(response);
    return {
      agents: data?.agents || {},
      activeTasks: Array.isArray(data?.activeTasks) ? data.activeTasks : [],
      assigneeLoad: data?.assigneeLoad || {},
      agentRoutines: Array.isArray(data?.agentRoutines) ? data.agentRoutines : [],
      tasksByAssignee: data?.tasksByAssignee || {},
      chains: Array.isArray(data?.chains) ? data.chains : [],
      totalTasks: Number(data?.totalTasks || 0),
    };
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return {
        agents: {},
        activeTasks: [],
        assigneeLoad: {},
        agentRoutines: [],
        tasksByAssignee: {},
        chains: [],
        totalTasks: 0,
      };
    }
    throw error;
  }
};

export const updateModelChainForProfile = async (
  profile: string,
  payload: { primary: string; fallbacks: string[] }
): Promise<{ profile: string; chain: { primary: string; fallbacks: string[] }; generatedAt: string }> => {
  const response = await api.put(`/system/model-catalog/profile/${encodeURIComponent(profile)}`, payload);
  const data = extractData(response);
  return data;
};

export const promoteSelfToAdmin = async (): Promise<{ promoted: boolean; reason: string }> => {
  const response = await api.post('/system/admin/promote-self');
  const data = extractData(response);
  return {
    promoted: !!data.promoted,
    reason: data.reason || 'unknown',
  };
};

export interface AuthResponse {
  accessToken: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryAuth = (error: any): boolean => {
  const status = error?.response?.status;
  if (status === 502 || status === 503 || status === 504) return true;
  const message = String(error?.message || '').toLowerCase();
  return message.includes('network error') || message.includes('timeout');
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = extractData(response);
      return { accessToken: data.accessToken };
    } catch (error: any) {
      const isLastAttempt = attempt === maxAttempts;
      if (isLastAttempt || !shouldRetryAuth(error)) {
        throw error;
      }
      await sleep(300 * attempt);
    }
  }

  throw new Error('Login failed');
};

export const googleLogin = async (token: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/google', { token });
  const data = extractData(response);
  return { accessToken: data.accessToken };
};

export const signup = async (name: string, email: string, password: string): Promise<void> => {
  const payload: { name?: string; email: string; password: string } = { email, password };
  if (name.trim()) {
    payload.name = name.trim();
  }
  await api.post('/auth/signup', payload);
};

// ── Dashboard Overview ─────────────────────────────────────────────

export interface DashboardOverview {
  summary: {
    runtime: { running: number; total: number; error: number };
  };
  usage: {
    requests24h: number;
    requests7d: number;
    tokens24h: number;
    tokens7d: number;
  };
  fallbackRoutes: Array<{
    step: number;
    route: string;
    provider: string;
    model: string;
    reason: string;
  }>;
  routingInsights?: {
    summary: {
      totalEvents: number;
      totalEscalations: number;
      totalFallbacks: number;
      estimatedCostUsd: number;
      incrementalCostUsd: number;
    };
    byAgent: Array<{
      agentId: string;
      agentName: string;
      primaryModel: string;
      escalations: number;
      fallbacks: number;
      totalEvents: number;
      estimatedCostUsd: number;
      incrementalCostUsd: number;
      lastEventAt: string | null;
      events: Array<{
        timestamp: string;
        eventType: 'ESCALATION' | 'FALLBACK';
        fromModel: string;
        toModel: string;
        tokens: number;
        estimatedCostUsd: number;
        incrementalCostUsd: number;
      }>;
    }>;
    generatedAt: string;
  };
  runtimeAgents: Array<{
    id: string;
    name: string;
    status: string;
    model: string;
    location: string;
    gatewayMode: string;
    error: string | null;
  }>;
  models: Array<{
    model: string;
    requests: number;
    tokens: number;
  }>;
  coordination?: {
    agents: Array<{
      id: string;
      activeCount: number;
      stateCounts: { in_progress: number; review: number };
      oldestActiveMinutes: number;
    }>;
  };
  memoryScopes: Record<string, number>;
  recentSessions: Array<{
    id: string;
    title: string;
    memoryScope: string;
    agent: { name: string };
    messageCount: number;
  }>;
  alerts: Array<{
    code: string;
    level: 'info' | 'warning' | 'critical';
    message: string;
  }>;
  agentCapabilities?: {
    profiles: Array<{
      profile: string;
      name: string;
      primary: string;
      fallbacks: string[];
      availableModels: string[];
      skills: string[];
      packageIds: string[];
    }>;
    allSkills: string[];
  };
  specialModelPackages?: Array<{
    id: string;
    name: string;
    description: string;
    model: string;
    skills: string[];
    tasks: string[];
    applicableProfiles: string[];
  }>;
}

export interface OnboardingState {
  status: 'pending' | 'active' | 'completed';
  step: number;
  checks: {
    apiReachable: boolean;
    authOk: boolean;
    runtimeOk: boolean;
    agentCreated: boolean;
    messageRoundtrip: boolean;
    feedVisible: boolean;
  };
}

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await api.get('/dashboard/overview');
  const data = extractData(response);
  return data;
};

export const getOnboardingState = async (): Promise<OnboardingState> => {
  const response = await api.get('/dashboard/onboarding');
  const data = extractData(response);
  return data;
};

export const bootstrapOnboarding = async (opts: {
  mode: 'first_agent' | 'kaiten_core';
  autoStart?: boolean;
}): Promise<{ state: OnboardingState }> => {
  const response = await api.post('/dashboard/onboarding/bootstrap', opts);
  const data = extractData(response);
  return data;
};

export const verifyOnboardingFirstMessage = async (): Promise<{ state: OnboardingState }> => {
  const response = await api.post('/dashboard/onboarding/verify');
  const data = extractData(response);
  return data;
};

// ── Hub Feed ──────────────────────────────────────────────────────

export interface HubFeedEvent {
  id: string;
  eventType: string;
  direction: string;
  scope: string;
  threadId: string;
  contentPreview: string;
  createdAt: string;
  agent?: { id: string; name: string };
  session?: { id: string; title: string; memoryScope: string };
  task?: { id: string };
  participants?: { from: string; to: string };
  route?: string;
  reason?: string;
  model?: string;
  latencyMs?: number;
  tokenCount?: number;
  traceId?: string;
}

export interface HubFeedQuery {
  limit?: number;
  scope?: string;
  timeWindow?: string;
  eventTypes?: string[];
  direction?: string;
  agentId?: string;
  sessionId?: string;
  cursor?: string;
}

export const getHubFeed = async (
  query: HubFeedQuery,
): Promise<{ events: HubFeedEvent[]; nextCursor: string | null }> => {
  const response = await api.get('/hub/feed', { params: query });
  const data = extractData(response);
  return {
    events: Array.isArray(data?.events) ? data.events : [],
    nextCursor: data?.nextCursor ?? null,
  };
};

export const getHubThread = async (
  threadId: string,
  scope: string,
): Promise<{ events: HubFeedEvent[] }> => {
  const response = await api.get(`/hub/thread/${threadId}`, { params: { scope } });
  const data = extractData(response);
  return { events: Array.isArray(data?.events) ? data.events : [] };
};

// ── Streaming ─────────────────────────────────────────────────────

export const streamMessage = async (
  agentId: string,
  sessionId: string,
  message: string,
  onChunk: (chunk: string) => void
): Promise<void> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}/agents/${agentId}/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, stream: true, sessionId }),
  });

  if (!response.ok && [429, 502, 503, 504].includes(response.status)) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    response = await fetch(`${API_BASE_URL}/agents/${agentId}/message`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, stream: true, sessionId }),
    });
  }

  if (!response.ok) {
    throw new Error('Streaming failed');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader');

  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Server-Sent Events parsing
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep the last, potentially incomplete, line in the buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          return; // Stream finished
        }
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'token') {
            onChunk(parsed.content ?? '');
          } else if (parsed.type === 'error') {
            console.error('SSE Error:', parsed.message);
            throw new Error(parsed.message || 'Streaming failed');
          }
        } catch (e) {
          console.error('Failed to parse SSE data:', e, 'Data:', data);
          // Fallback if not JSON or malformed, treat as plain text chunk
          onChunk(data);
        }
      }
    }
  }
};
