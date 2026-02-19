import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getAgents, getMessages, sendMessage, getConfig, updateConfig, streamMessage, getSessions, createSession,
  getOpenClawThreads, getOpenClawThreadMessages, getKaitenAgentsStatus,
  promoteSelfToAdmin, getModelCatalog, getCoordinationOverview, getBusinessValue,
  type Agent, type Message, type AgentConfig, type Session, type ModelCatalog
} from '../api';

const getAuthToken = () => localStorage.getItem('ocaas_token');

export interface CurrentUser {
  name: string;
  plan: string;
  role: string;
}

export function useChatState() {
  const isVirtualKaitenAgent = (agentId?: string | null) => String(agentId || '').startsWith('kaiten:');
  const getKaitenProfileFromAgentId = (agentId?: string | null) => String(agentId || '').replace(/^kaiten:/, '');

  const isMobileViewport = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  };

  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobileViewport());
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(!isMobileViewport());
  const [activeRightPanelTab, setActiveRightPanelTab] = useState<'settings' | 'interactions' | 'coordination'>('settings');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const [playgroundMode, setPlaygroundMode] = useState<'guided' | 'pro'>('guided');
  const [showLaunchWizard, setShowLaunchWizard] = useState(false);
  const [matrixRefreshKey, setMatrixRefreshKey] = useState(0);
  const [currentUser, setCurrentUser] = useState<CurrentUser>({ name: 'Guest', plan: 'Free', role: 'USER' });
  const [highlightMessageId, setHighlightMessageId] = useState<string | null>(null);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [modelFallbackByProfile, setModelFallbackByProfile] = useState<Record<string, string[]>>({});
  const [defaultModelChain, setDefaultModelChain] = useState<{ primary: string; fallbacks: string[] } | null>(null);
  const [coordinationOverview, setCoordinationOverview] = useState<any | null>(null);
  const [businessValue, setBusinessValue] = useState<any | null>(null);
  const [modelCatalog, setModelCatalog] = useState<ModelCatalog | null>(null);
  const initialConfigRef = useRef<AgentConfig | null>(null);
  const configSaveTimeoutRef = useRef<number | null>(null);

  const fetchAgents = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setAgents([]);
      setSelectedAgent(null);
      return;
    }
    try {
      const [dbAgents, kaitenStatus] = await Promise.all([
        getAgents(),
        getKaitenAgentsStatus().catch(() => []),
      ]);
      const virtualAgents: Agent[] = kaitenStatus.map((agent) => ({
        id: `kaiten:${agent.id}`,
        name: agent.name,
      }));
      const virtualNames = new Set(virtualAgents.map((agent) => agent.name.trim().toLowerCase()));
      const filteredDbAgents = dbAgents.filter((agent) => !virtualNames.has(agent.name.trim().toLowerCase()));
      const mergedById = new Map<string, Agent>();
      [...virtualAgents, ...filteredDbAgents].forEach((agent) => mergedById.set(agent.id, agent));
      const merged = Array.from(mergedById.values());
      setAgents(merged);
      if (merged.length > 0 && !selectedAgent) {
        setSelectedAgent(merged[0]);
      }
    } catch (e: any) {
      if (e?.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('ocaas_token');
      }
    }
  }, [selectedAgent]);

  const fetchSessions = useCallback(async (agentId: string) => {
    try {
      const isVirtual = isVirtualKaitenAgent(agentId);
      const profile = isVirtual ? getKaitenProfileFromAgentId(agentId) : undefined;
      const [threads, dbSessions] = await Promise.all([
        getOpenClawThreads(isVirtual ? { profile } : { agentId }).catch(() => [] as Session[]),
        isVirtual ? Promise.resolve([] as Session[]) : getSessions(agentId).catch(() => [] as Session[]),
      ]);
      const data = threads.length > 0 ? threads : dbSessions;
      setSessions(data);
      if (data.length > 0) {
        setSelectedSession((prev) => {
          if (prev && data.some((session) => session.id === prev.id)) return prev;
          return data[0];
        });
      }
    } catch (e: any) {
      console.error('Sessions fetch failed', e);
    }
  }, []);

  const fetchMessages = useCallback(async (agentId: string, sessionId: string) => {
    try {
      const activeSession = sessions.find((session) => session.id === sessionId);
      const isTelegramThread = activeSession?.memoryScope === 'TELEGRAM';
      const data = isTelegramThread
        ? await getOpenClawThreadMessages(agentId, sessionId).catch(() => [] as Message[])
        : await getMessages(agentId, sessionId).catch(() => [] as Message[]);
      setMessages(data);
    } catch (e: any) {
      console.error('Messages fetch failed', e);
    }
  }, [sessions]);

  const fetchConfig = useCallback(async (agentId: string) => {
    try {
      if (isVirtualKaitenAgent(agentId)) {
        const profile = getKaitenProfileFromAgentId(agentId).toLowerCase();
        const chain = modelCatalog?.profiles?.[profile] || modelCatalog?.defaults || null;
        const virtualConfig: AgentConfig = {
          model: chain?.primary || 'google-antigravity/gemini-3-flash',
          temperature: 0.7,
          maxTokens: 2048,
          systemPrompt: 'OpenClaw profile-managed agent. Settings are synced from model catalog.',
        };
        setConfig(virtualConfig);
        initialConfigRef.current = virtualConfig;
        return;
      }
      const data = await getConfig(agentId);
      setConfig(data);
      initialConfigRef.current = data;
    } catch (e: any) {
      console.error('Config fetch failed', e);
    }
  }, [modelCatalog]);

  useEffect(() => {
    if (isAuthenticated) fetchAgents();
  }, [isAuthenticated, fetchAgents]);

  useEffect(() => {
    if (!isAuthenticated) {
      setModelOptions([]);
      setModelFallbackByProfile({});
      setDefaultModelChain(null);
      return;
    }
    const loadModelCatalog = async () => {
      try {
        const catalog = await getModelCatalog();
        setModelCatalog(catalog);
        setModelOptions(catalog.models);
        const mapped: Record<string, string[]> = {};
        Object.entries(catalog.profiles || {}).forEach(([profile, chain]) => {
          mapped[profile.toLowerCase()] = Array.isArray(chain?.fallbacks) ? chain.fallbacks : [];
        });
        setModelFallbackByProfile(mapped);
        setDefaultModelChain(catalog.defaults || null);
      } catch {
        // Keep compatibility with local fallback options
      }
    };
    loadModelCatalog();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCoordinationOverview(null);
      setBusinessValue(null);
      return;
    }
    const loadCoordination = async () => {
      try {
        const data = await getCoordinationOverview();
        setCoordinationOverview(data);
      } catch {
        // Non-blocking.
      }
    };
    const loadBusinessValue = async () => {
      try {
        const data = await getBusinessValue();
        setBusinessValue(data);
      } catch {
        // Non-blocking.
      }
    };
    loadCoordination();
    loadBusinessValue();
    const interval = window.setInterval(loadCoordination, 15000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, matrixRefreshKey]);

  useEffect(() => {
    if (selectedAgent) {
      fetchSessions(selectedAgent.id);
      fetchConfig(selectedAgent.id);
    }
  }, [selectedAgent, fetchSessions, fetchConfig]);

  useEffect(() => {
    if (selectedAgent && selectedSession) {
      fetchMessages(selectedAgent.id, selectedSession.id);
    }
  }, [selectedAgent, selectedSession, fetchMessages]);

  useEffect(() => {
    if (!selectedAgent || !selectedSession) return;
    if (selectedSession.memoryScope !== 'TELEGRAM') return;

    const poll = window.setInterval(() => {
      fetchMessages(selectedAgent.id, selectedSession.id);
    }, 8000);

    return () => window.clearInterval(poll);
  }, [selectedAgent, selectedSession, fetchMessages]);

  useEffect(() => {
    if (!selectedAgent || !config || !initialConfigRef.current) return;
    const current = JSON.stringify(config);
    const baseline = JSON.stringify(initialConfigRef.current);
    if (current === baseline) return;

    if (configSaveTimeoutRef.current) {
      window.clearTimeout(configSaveTimeoutRef.current);
    }

    configSaveTimeoutRef.current = window.setTimeout(() => {
      handleUpdateConfig(config);
    }, 500);

    return () => {
      if (configSaveTimeoutRef.current) {
        window.clearTimeout(configSaveTimeoutRef.current);
      }
    };
  }, [config, selectedAgent]);

  useEffect(() => {
    const onResize = () => {
      if (isMobileViewport()) {
        setIsSidebarOpen(false);
        setIsRightPanelOpen(false);
      }
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleCreateSession = async () => {
    if (!selectedAgent) return;
    if (isVirtualKaitenAgent(selectedAgent.id)) {
      setError('KAITEN mirrored agents use Telegram/OpenClaw threads. Start chat from Telegram.');
      return;
    }
    try {
      const newSession = await createSession(selectedAgent.id, `New Session`);
      setSessions(prev => [newSession, ...prev]);
      setSelectedSession(newSession);
      setMessages([]);
    } catch (e: any) {
      setError('Failed to create session');
    }
  };

  const handleUpdateConfig = async (newConfig: AgentConfig) => {
    if (!selectedAgent) return;
    if (isVirtualKaitenAgent(selectedAgent.id)) {
      setConfig(newConfig);
      setLastSaved(new Date());
      return;
    }
    setIsConfigSaving(true);
    try {
      await updateConfig(selectedAgent.id, newConfig);
      initialConfigRef.current = newConfig;
      setLastSaved(new Date());
    } catch (e: any) {
      setError('Failed to save config');
    } finally {
      setIsConfigSaving(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent || isLoading) return;
    if (isVirtualKaitenAgent(selectedAgent.id)) {
      setError('KAITEN agents are mirrored from Telegram/OpenClaw. Send from Telegram for live routing.');
      return;
    }
    if (selectedSession?.memoryScope === 'TELEGRAM') {
      setError('This is a mirrored Telegram thread. Send from Telegram directly for now.');
      return;
    }

    let currentSession = selectedSession;
    if (!currentSession) {
      try {
        currentSession = await createSession(selectedAgent.id, 'New Chat');
        setSessions(prev => [currentSession!, ...prev]);
        setSelectedSession(currentSession);
      } catch (e: any) {
        setError('Failed to start chat');
        return;
      }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      await streamMessage(selectedAgent.id, currentSession.id, input, (chunk) => {
        setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m
        ));
      });
    } catch (error: any) {
      try {
        const response = await sendMessage(selectedAgent.id, input, currentSession.id);
        setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? response : m
        ));
      } catch (e: any) {
        setError('Message failed to send');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ocaas_token');
    setIsAuthenticated(false);
    setAgents([]);
    setSelectedAgent(null);
    setSessions([]);
    setSelectedSession(null);
    setMessages([]);
  };

  const tryAutoPromoteToAdmin = async () => {
    try {
      await promoteSelfToAdmin();
    } catch {
      // Ignore if user is not eligible yet.
    }
  };

  const handleLoginSuccess = async (token: string) => {
    localStorage.setItem('ocaas_token', token);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    await tryAutoPromoteToAdmin();
    fetchAgents();
    window.dispatchEvent(new Event('ocaas-auth-changed'));
  };

  const handleSignUpSuccess = async (token: string) => {
    localStorage.setItem('ocaas_token', token);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    await tryAutoPromoteToAdmin();
    fetchAgents();
    window.dispatchEvent(new Event('ocaas-auth-changed'));
  };

  const handleLaunchSuccess = async () => {
    fetchAgents();
    setMatrixRefreshKey(prev => prev + 1);
  };

  const applyGuidedPreset = (preset: 'balanced' | 'creative' | 'precise') => {
    if (!config) return;
    const presets = {
      balanced: { temperature: 0.7, maxTokens: 2048 },
      creative: { temperature: 1.1, maxTokens: 2600 },
      precise: { temperature: 0.2, maxTokens: 1600 }
    };
    const newConfig = { ...config, ...presets[preset] };
    setConfig(newConfig);
    handleUpdateConfig(newConfig);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleRightPanel = () => setIsRightPanelOpen(!isRightPanelOpen);

  return {
    agents, selectedAgent, setSelectedAgent,
    sessions, selectedSession, setSelectedSession,
    messages, input, setInput,
    config, setConfig, isConfigSaving, lastSaved,
    isLoading, isSidebarOpen, setIsSidebarOpen,
    isRightPanelOpen, setIsRightPanelOpen,
    activeRightPanelTab, setActiveRightPanelTab,
    error, setError, isAuthenticated,
    showAuthModal, setShowAuthModal,
    isAutoRefreshEnabled, setIsAutoRefreshEnabled,
    playgroundMode, setPlaygroundMode,
    showLaunchWizard, setShowLaunchWizard,
    matrixRefreshKey,
    currentUser, setCurrentUser,
    highlightMessageId, setHighlightMessageId,
    modelOptions, modelFallbackByProfile, defaultModelChain,
    coordinationOverview,
    businessValue,
    handleCreateSession, handleSend, handleLogout,
    handleUpdateConfig,
    handleLoginSuccess, handleSignUpSuccess, handleLaunchSuccess,
    applyGuidedPreset, toggleSidebar, toggleRightPanel
  };
}

export type UseChatState = ReturnType<typeof useChatState>;
