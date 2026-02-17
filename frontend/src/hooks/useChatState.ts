import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getAgents, getMessages, sendMessage, getConfig, updateConfig, streamMessage, getSessions, createSession,
  promoteSelfToAdmin,
  type Agent, type Message, type AgentConfig, type Session
} from '../api';

const getAuthToken = () => localStorage.getItem('ocaas_token');

export function useChatState() {
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [activeRightPanelTab, setActiveRightPanelTab] = useState<'settings' | 'interactions'>('settings');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const [playgroundMode, setPlaygroundMode] = useState<'guided' | 'pro'>('guided');
  const [showLaunchWizard, setShowLaunchWizard] = useState(false);
  const [matrixRefreshKey, setMatrixRefreshKey] = useState(0);
  const initialConfigRef = useRef<AgentConfig | null>(null);

  const fetchAgents = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setAgents([]);
      setSelectedAgent(null);
      return;
    }
    try {
      const data = await getAgents();
      setAgents(data);
      if (data.length > 0 && !selectedAgent) {
        setSelectedAgent(data[0]);
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
      const data = await getSessions(agentId);
      setSessions(data);
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0]);
      }
    } catch (e: any) {
      console.error('Sessions fetch failed', e);
    }
  }, [selectedSession]);

  const fetchMessages = useCallback(async (agentId: string, sessionId: string) => {
    try {
      const data = await getMessages(agentId, sessionId);
      setMessages(data);
    } catch (e: any) {
      console.error('Messages fetch failed', e);
    }
  }, []);

  const fetchConfig = useCallback(async (agentId: string) => {
    try {
      const data = await getConfig(agentId);
      setConfig(data);
      initialConfigRef.current = data;
    } catch (e: any) {
      console.error('Config fetch failed', e);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchAgents();
  }, [isAuthenticated, fetchAgents]);

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

  const handleCreateSession = async () => {
    if (!selectedAgent) return;
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

  const handleLoginSuccess = async (token: string) => {
    localStorage.setItem('ocaas_token', token);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    fetchAgents();
  };

  const handleSignUpSuccess = async (token: string) => {
    localStorage.setItem('ocaas_token', token);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    fetchAgents();
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
    handleCreateSession, handleSend, handleLogout,
    handleLoginSuccess, handleSignUpSuccess, handleLaunchSuccess,
    applyGuidedPreset, toggleSidebar, toggleRightPanel
  };
}
