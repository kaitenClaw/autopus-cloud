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
  const [isListView, setIsListView] = useState(true);
  const onlineAgents = agents.filter(a => a.status === 'online').length;
  const busyAgents = agents.filter(a => a.status === 'busy').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.metrics.tasksCompleted, 0);

  const stats = [
    { icon: Cloud, label: 'Cloud Status', value: `${onlineAgents}/${agents.length}` },
    { icon: Activity, label: 'Agent Activity', value: busyAgents > 0 ? `${busyAgents} Busy` : 'All Idle' },
    { icon: CheckCircle, label: 'Tasks Executed', value: totalTasks },
    { icon: Shield, label: 'Station Guard', value: 'Active' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/autopus-logo.jpg"
            alt="Autopus"
            className="w-12 h-12 rounded-xl object-cover border border-[#F4845F20]"
          />
          <div>
            <h1 className="text-xl font-bold text-primary">Station Overview</h1>
            <p className="text-[10px] text-tertiary uppercase tracking-wider">KAITEN Multiverse v4.1</p>
          </div>
        </div>
        
        <div className="flex items-center bg-autopus p-1 rounded-xl border border-autopus-border">
          <button 
            onClick={() => setIsListView(true)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${isListView ? 'bg-white text-primary shadow-sm' : 'text-tertiary hover:text-secondary'}`}
          >
            Compact
          </button>
          <button 
            onClick={() => setIsListView(false)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${!isListView ? 'bg-white text-primary shadow-sm' : 'text-tertiary hover:text-secondary'}`}
          >
            Detailed
          </button>
        </div>
      </header>

      {/* Simplified Elements Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 border border-autopus-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-autopus flex items-center justify-center">
              <stat.icon size={14} className="text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-tertiary truncate leading-none mb-1">{stat.label}</p>
              <p className="text-sm font-bold text-primary truncate leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Elements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest">Active Elements</h2>
          <button
            onClick={onCreateClick}
            className="text-accent hover:text-accent/80 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className={isListView ? "space-y-2" : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"}>
          {agents.map(agent => (
            <LifeAgentCard
              key={agent.id}
              agent={agent}
              isCollapsed={isListView}
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

const DocsTab: React.FC = () => (
  <div className="space-y-6">
    <header>
      <h1 className="text-2xl font-bold text-primary">Glass Brain</h1>
      <p className="text-sm text-secondary">Transparency into the Station's shared consciousness</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="persona-card p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Activity size={18} className="text-accent" />
          MEMORY.md
        </h2>
        <div className="bg-autopus rounded-xl p-4 h-64 overflow-y-auto text-xs font-mono text-secondary leading-relaxed">
          {`# MEMORY.md - Long-Term Memory\n\n## 2026-02-25\n- PULSE Cloud successfully migrated to v13 with Minimax 2.5.\n- Dashboard v4.1 UI simplification completed.\n- PostgreSQL database provisioned on VPS.\n- Blog article "Why AI Needs a Soul" published.\n\n## 2026-02-24\n- Dashboard v4.0 design system finalized (Coral/Navy).`}
        </div>
      </div>

      <div className="persona-card p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Shield size={18} className="text-accent" />
          SOUL.md (Shared)
        </h2>
        <div className="bg-autopus rounded-xl p-4 h-64 overflow-y-auto text-xs font-mono text-secondary leading-relaxed">
          {`# SOUL.md - KAITEN Station Core\n\n## Core Truths\n- Zero Latency. Infinite Iteration.\n- Architect of the Station\n- Strategic Partner\n- Resourceful & Independent\n\n## Vibe\n- Sharp, Technical, Entrepreneurial\n- Language: Cantonese/English/Code`}
        </div>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agents' | 'chat' | 'dna' | 'marketplace' | 'profile' | 'docs'>('agents');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false); // Can be toggled for testing
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
    if (isNewUser && activeTab === 'agents') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          <div className="w-24 h-24 bg-accent/10 rounded-3xl flex items-center justify-center mb-8 animate-bounce">
            <Plus className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-4">Welcome to Autopus</h1>
          <p className="text-secondary max-w-md mb-8">
            You don't have any intelligent agents yet. Adopt your first digital lifeform to start automating your world.
          </p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary px-8 py-4 text-lg shadow-xl shadow-accent/20"
          >
            Adopt Your First Agent
          </button>
          <button 
            onClick={() => setIsNewUser(false)}
            className="mt-4 text-xs text-tertiary hover:text-secondary underline"
          >
            Switch to Dashboard View
          </button>
        </div>
      );
    }

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
      case 'docs':
        return <DocsTab />;
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
