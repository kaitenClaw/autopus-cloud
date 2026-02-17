import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const getAuthToken = () => localStorage.getItem('ocaas_token');

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

export interface Agent {
  id: string;
  name: string;
}

export interface Session {
  id: string;
  agentId: string;
  title: string;
  createdAt: string;
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
  error: string | null;
  checkedAt: string;
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
  // Backend session routes are not implemented yet; provide stable local default.
  return [{ id: 'default', agentId, title: 'Default Session', createdAt: new Date().toISOString() }];
};

export const createSession = async (agentId: string, title: string): Promise<Session> => {
  // Local-only session placeholder until backend session APIs are added.
  return { id: `${Date.now()}`, agentId, title, createdAt: new Date().toISOString() };
};

export const getMessages = async (agentId: string, _sessionId: string): Promise<Message[]> => {
  const response = await api.get(`/agents/${agentId}/messages`);
  const data = extractData(response);
  return data.messages ?? [];
};

export const sendMessage = async (agentId: string, message: string, _sessionId?: string): Promise<Message> => {
  const response = await api.post(`/agents/${agentId}/message`, { message });
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

const LOCAL_KAITEN_DEFAULT_PRESETS: LaunchPresetSet[] = [
  {
    id: 'default-kaiten',
    name: 'Default KAITEN Stack',
    description: 'Prime / Forge / Sight / Pulse',
    agents: [
      { name: 'Prime', model: 'gpt-4o', include: true },
      { name: 'Forge', model: 'gpt-4o', include: true },
      { name: 'Sight', model: 'gpt-4o', include: true },
      { name: 'Pulse', model: 'gpt-4o', include: true },
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
        model: String(agent?.model ?? 'gpt-4o'),
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
    return normalized.length > 0 ? normalized : LOCAL_KAITEN_DEFAULT_PRESETS;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return LOCAL_KAITEN_DEFAULT_PRESETS;
    }
    throw error;
  }
};

export const bulkCreateAgents = async (payload: {
  presetId?: string;
  autoStart: boolean;
  agents: Array<{ name: string; model: string }>;
}): Promise<BulkCreateAgentsSummary> => {
  const response = await api.post('/agents/bulk-create', payload);
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
  const created = resultsRaw
    .filter((item: any) => item?.success)
    .map((item: any) => ({ name: String(item?.name ?? 'Unknown'), success: true, id: item?.id ? String(item.id) : undefined }));
  const failed = resultsRaw
    .filter((item: any) => !item?.success)
    .map((item: any) => ({ name: String(item?.name ?? 'Unknown'), success: false, error: item?.error ? String(item.error) : 'Failed' }));

  return { created, failed };
};
export const getKaitenAgentsStatus = async (): Promise<KAITENAgentRuntime[]> => {
  const response = await api.get('/system/kaiten/agents');
  const data = extractData(response);
  return data.agents ?? [];
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

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password });
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

  const response = await fetch(`${API_BASE_URL}/agents/${agentId}/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, stream: true, sessionId }),
  });

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
