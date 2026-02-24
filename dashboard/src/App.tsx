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
      <div className="absolute inset-0 bg-primary/60" onClick={onClose} />
      <div className="persona-card w-full max-w-md p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-primary">Adopt New Agent</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-autopus rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-secondary mb-2">Agent Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full"
              placeholder="e.g., Nova"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-secondary mb-2">Role Type</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field w-full"
              required
            >
              <option value="">Select role...</option>
              <option value="Builder">Builder</option>
              <option value="Researcher">Researcher</option>
              <option value="DevOps">DevOps</option>
              <option value="Creative">Creative</option>
              <option value="Orchestrator">Orchestrator</option>
              <option value="Analyst">Analyst</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              Create Agent
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
    { icon: Cloud, label: 'Online', value: `${onlineAgents}/${agents.length}` },
    { icon: Activity, label: 'Busy', value: busyAgents },
    { icon: CheckCircle, label: 'Tasks Done', value: totalTasks },
    { icon: Shield, label: 'Security', value: 'Healthy' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <img
            src="/autopus-logo.jpg"
            alt="Autopus"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex-shrink-0 object-cover"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              Your Personas
            </h1>
            <p className="text-sm sm:text-base text-secondary mt-1">
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
            className="persona-card p-3 sm:p-4 flex items-center gap-3"
          >
            <div
              className="p-2 sm:p-2.5 rounded-lg flex-shrink-0 bg-autopus"
            >
              <stat.icon size={18} className="text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-tertiary truncate">{stat.label}</p>
              <p className="text-lg sm:text-xl font-semibold text-primary truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">Agent Gallery</h2>
          <button
            onClick={onCreateClick}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Adopt Agent
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
    <div className="w-20 h-20 rounded-full bg-autopus flex items-center justify-center mb-4">
      <span className="text-4xl">💬</span>
    </div>
    <h2 className="text-xl font-semibold text-primary mb-2">Chat Coming Soon</h2>
    <p className="text-secondary max-w-md">Real-time messaging with your AI personas is under development</p>
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
        <div className="w-20 h-20 rounded-full bg-autopus flex items-center justify-center mb-4">
          <span className="text-4xl">🧬</span>
        </div>
        <h2 className="text-xl font-semibold text-primary mb-2">No Agents Available</h2>
        <p className="text-secondary max-w-md">Create an agent to view their DNA</p>
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
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-secondary hover:text-primary hover:bg-autopus'
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
    <div className="w-20 h-20 rounded-full bg-autopus flex items-center justify-center mb-4">
      <span className="text-4xl">🛒</span>
    </div>
    <h2 className="text-xl font-semibold text-primary mb-2">Skill Marketplace Coming Soon</h2>
    <p className="text-secondary max-w-md">Expand your agent's abilities with new skills</p>
  </div>
);

const ProfileTab: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 rounded-full bg-autopus flex items-center justify-center mb-4">
      <span className="text-4xl">👤</span>
    </div>
    <h2 className="text-xl font-semibold text-primary mb-2">Profile Coming Soon</h2>
    <p className="text-secondary max-w-md">Manage your account, subscriptions, and preferences</p>
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
    if (confirm('Are you sure you want to remove this agent?')) {
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
        <footer className="mt-8 sm:mt-12 pt-6 border-t border-autopus-border">
          <p className="text-center text-sm text-tertiary">
            Autopus Station v2.0 | Last updated: {new Date().toLocaleString()}
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
