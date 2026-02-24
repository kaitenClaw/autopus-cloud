import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Activity, 
  Plus, 
  Cloud,
  CheckCircle,
  X
} from 'lucide-react';
import type { Agent, CommunicationEvent } from './types';
import { LifeAgentCard } from './components/LifeAgentCard';
import { CommunicationFlow } from './components/CommunicationFlow';
import { MobileBottomNav, DesktopSideNav } from './components/Navigation';
import { AgentDNA } from './components/AgentDNA';
import { AGENT_PORTS, AGENT_ICONS, fetchAgentStatus } from './utils/agents';

// Modal Component for Create Agent
interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (agent: Partial<Agent>) => void;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ name, role });
    setName('');
    setRole('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div 
        className="w-full max-w-md p-6 relative z-10 rounded-2xl border border-white/10 backdrop-blur-xl"
        style={{ 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">收養新 Agent</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-2">Agent 名稱</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors min-h-[44px]"
              placeholder="例如：Nova"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-white/60 mb-2">角色類型</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[44px] appearance-none cursor-pointer"
              required
            >
              <option value="" className="bg-gray-900">選擇角色...</option>
              <option value="Builder" className="bg-gray-900">建造者 (Builder)</option>
              <option value="Researcher" className="bg-gray-900">研究者 (Researcher)</option>
              <option value="DevOps" className="bg-gray-900">運維 (DevOps)</option>
              <option value="Creative" className="bg-gray-900">創意 (Creative)</option>
              <option value="Orchestrator" className="bg-gray-900">協調者 (Orchestrator)</option>
              <option value="Analyst" className="bg-gray-900">分析師 (Analyst)</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white transition-colors min-h-[44px]"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors min-h-[44px]"
            >
              創建 Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Agents Tab Content
interface AgentsTabProps {
  agents: Agent[];
  onChat: (agentId: string) => void;
  onMemory: (agentId: string) => void;
  onSettings: (agentId: string) => void;
  onDelete: (agentId: string) => void;
  onCreateClick: () => void;
}

const AgentsTab: React.FC<AgentsTabProps> = ({ 
  agents, 
  onChat, 
  onMemory, 
  onSettings, 
  onDelete,
  onCreateClick 
}) => {
  const onlineAgents = agents.filter(a => a.status === 'online').length;
  const busyAgents = agents.filter(a => a.status === 'busy').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.metrics.tasksCompleted, 0);

  const stats = [
    { icon: Cloud, label: '在線 Agents', value: `${onlineAgents}/${agents.length}`, color: '#6366F1' },
    { icon: Activity, label: '忙碌中', value: busyAgents, color: '#f59e0b' },
    { icon: CheckCircle, label: '完成任務', value: totalTasks, color: '#10B981' },
    { icon: Shield, label: '安全狀態', value: '健康', color: '#22c55e' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div 
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
            style={{ 
              background: 'linear-gradient(135deg, #6366F1, #8b5cf6)',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)'
            }}
          >
            🐙
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Your Personas
            </h1>
            <p className="text-sm sm:text-base text-white/50 mt-1">
              {agents.length} AI personas active
            </p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i}
            className="rounded-xl p-3 sm:p-4 flex items-center gap-3 border border-white/10 backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <div 
              className="p-2 sm:p-2.5 rounded-lg flex-shrink-0"
              style={{ background: `${stat.color}20` }}
            >
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/50 truncate">{stat.label}</p>
              <p className="text-lg sm:text-xl font-semibold text-white truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Agent 展示廳</h2>
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            收養 Agent
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map(agent => (
            <LifeAgentCard 
              key={agent.id} 
              agent={agent} 
              onChat={onChat}
              onMemory={onMemory}
              onSettings={onSettings}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Placeholder tabs with props
const ChatTab: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
      <span className="text-4xl">💬</span>
    </div>
    <h2 className="text-xl font-semibold text-white mb-2">Chat Coming Soon</h2>
    <p className="text-white/50 max-w-md">Real-time messaging with your AI personas is under development...</p>
  </div>
);

interface DnaTabProps {
  agents: Agent[];
}

const DnaTab: React.FC<DnaTabProps> = ({ agents }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  if (!selectedAgent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
          <span className="text-4xl">🧬</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">沒有可用的 Agent</h2>
        <p className="text-white/50 max-w-md">請先創建一個 Agent</p>
      </div>
    );
  }

  return (
    <div>
      {/* Agent Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => setSelectedAgentId(agent.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
              selectedAgentId === agent.id
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-white/50 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            <span>{AGENT_ICONS[agent.id] || '🤖'}</span>
            {agent.name}
          </button>
        ))}
      </div>

      {/* Agent DNA */}
      <AgentDNA agent={selectedAgent} />
    </div>
  );
};

const MarketplaceTab: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
      <span className="text-4xl">🛒</span>
    </div>
    <h2 className="text-xl font-semibold text-white mb-2">Skill Marketplace 即將推出</h2>
    <p className="text-white/50 max-w-md">為你的 Agent 學習新技能，擴展能力邊界</p>
  </div>
);

const ProfileTab: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
      <span className="text-4xl">👤</span>
    </div>
    <h2 className="text-xl font-semibold text-white mb-2">個人中心即將推出</h2>
    <p className="text-white/50 max-w-md">管理你的賬戶、訂閱和偏好設置</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agents' | 'chat' | 'dna' | 'marketplace' | 'profile'>('agents');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [unreadMessages] = useState(3);

  const [agents, setAgents] = useState<Agent[]>([
    { 
      id: 'kaiten', 
      name: 'KAITEN', 
      role: 'Orchestrator', 
      status: 'online',
      port: AGENT_PORTS.kaiten,
      currentTask: 'sprint-acceleration-sync',
      lastHeartbeat: new Date(),
      metrics: { cpuUsage: 15, memoryUsage: 128, tasksCompleted: 42, uptime: 86400 }
    },
    { 
      id: 'forge', 
      name: 'FORGE', 
      role: 'Builder', 
      status: 'online',
      port: AGENT_PORTS.forge,
      currentTask: 'dashboard-2.0-ui-refactor',
      taskProgress: 65,
      lastHeartbeat: new Date(),
      metrics: { cpuUsage: 25, memoryUsage: 256, tasksCompleted: 18, uptime: 43200 }
    },
    { 
      id: 'sight', 
      name: 'SIGHT', 
      role: 'Researcher', 
      status: 'busy',
      port: AGENT_PORTS.sight,
      currentTask: 'security-audit-findings',
      taskProgress: 90,
      lastHeartbeat: new Date(),
      metrics: { cpuUsage: 35, memoryUsage: 192, tasksCompleted: 23, uptime: 86400 }
    },
    { 
      id: 'pulse', 
      name: 'PULSE', 
      role: 'DevOps', 
      status: 'online',
      port: AGENT_PORTS.pulse,
      currentTask: 'infrastructure-optimization',
      taskProgress: 40,
      lastHeartbeat: new Date(),
      metrics: { cpuUsage: 20, memoryUsage: 164, tasksCompleted: 12, uptime: 3600 }
    },
  ]);

  const [events] = useState<CommunicationEvent[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000),
      from: 'kaiten',
      to: 'forge',
      type: 'task_assignment',
      message: 'Assigned: Dashboard 2.0 UI Refactor',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 240000),
      from: 'forge',
      to: 'kaiten',
      type: 'status_update',
      message: 'Progress: 65% complete - LifeAgentCard component done',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 180000),
      from: 'kaiten',
      to: 'sight',
      type: 'task_assignment',
      message: 'Review security findings',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 120000),
      from: 'sight',
      to: 'kaiten',
      type: 'completion',
      message: '3 critical issues resolved and deployed',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 60000),
      from: 'kaiten',
      to: 'pulse',
      type: 'task_assignment',
      message: 'Monitor deployment health',
    },
  ]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedAgents = await Promise.all(
        agents.map(async (agent) => {
          const status = await fetchAgentStatus(agent.port);
          return { ...agent, ...status };
        })
      );
      setAgents(updatedAgents);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateAgent = (newAgent: Partial<Agent>) => {
    const agent: Agent = {
      id: Date.now().toString(),
      name: newAgent.name || 'New Agent',
      role: newAgent.role || 'Unknown',
      status: 'offline',
      port: 18800 + agents.length,
      lastHeartbeat: new Date(),
      metrics: { cpuUsage: 0, memoryUsage: 0, tasksCompleted: 0, uptime: 0 }
    };
    setAgents([...agents, agent]);
  };

  const handleChat = (agentId: string) => {
    console.log('Chat with agent:', agentId);
    setActiveTab('chat');
  };

  const handleMemory = (agentId: string) => {
    console.log('View memory for agent:', agentId);
    setActiveTab('dna');
  };

  const handleSettings = (agentId: string) => {
    console.log('Settings for agent:', agentId);
  };

  const handleDelete = (agentId: string) => {
    if (confirm('確定要移除這個 Agent 嗎？')) {
      setAgents(agents.filter(a => a.id !== agentId));
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'agents':
        return (
          <AgentsTab
            agents={agents}
            onChat={handleChat}
            onMemory={handleMemory}
            onSettings={handleSettings}
            onDelete={handleDelete}
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        );
      case 'chat':
        return <ChatTab />;
      case 'dna':
        return <DnaTab agents={agents} />;
      case 'marketplace':
        return <MarketplaceTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Side Navigation */}
      <DesktopSideNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        unreadMessages={unreadMessages}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {renderTabContent()}

        {/* Communication Flow - Only show on agents tab */}
        {activeTab === 'agents' && (
          <div className="mt-8">
            <CommunicationFlow events={events} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 border-t border-white/10">
          <p className="text-center text-sm text-white/30">
            Autopus Station v2.0 | 最後更新: {new Date().toLocaleString()}
          </p>
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        unreadMessages={unreadMessages}
      />

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateAgent}
      />
    </div>
  );
};

export default Dashboard;
