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
import { AgentCard } from './components/AgentCard';
import { CommunicationFlow } from './components/CommunicationFlow';
import { AGENT_PORTS, fetchAgentStatus } from './utils/agents';

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
      <div className="glass-card w-full max-w-md p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create New Agent</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-white/60 mb-2">Agent Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-colors min-h-[44px]"
              placeholder="e.g., Nova"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-white/60 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[44px] appearance-none cursor-pointer"
              required
            >
              <option value="" className="bg-gray-900">Select a role...</option>
              <option value="Builder" className="bg-gray-900">Builder</option>
              <option value="Researcher" className="bg-gray-900">Researcher</option>
              <option value="DevOps" className="bg-gray-900">DevOps</option>
              <option value="Creative" className="bg-gray-900">Creative</option>
              <option value="Orchestrator" className="bg-gray-900">Orchestrator</option>
              <option value="Analyst" className="bg-gray-900">Analyst</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors min-h-[44px]"
            >
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
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
      currentTask: 'forge-mvp-001',
      taskProgress: 100,
      lastHeartbeat: new Date(),
      metrics: { cpuUsage: 25, memoryUsage: 256, tasksCompleted: 18, uptime: 43200 }
    },
    { 
      id: 'sight', 
      name: 'SIGHT', 
      role: 'Researcher', 
      status: 'busy',
      port: AGENT_PORTS.sight,
      currentTask: 'mvp-marathon-sight-001',
      taskProgress: 75,
      lastHeartbeat: new Date(),
      metrics: { cpuUsage: 35, memoryUsage: 192, tasksCompleted: 23, uptime: 86400 }
    },
    { 
      id: 'pulse', 
      name: 'PULSE', 
      role: 'DevOps', 
      status: 'online',
      port: AGENT_PORTS.pulse,
      currentTask: 'pulse-cloud-001',
      taskProgress: 60,
      lastHeartbeat: new Date(),
      metrics: { cpuUsage: 20, memoryUsage: 164, tasksCompleted: 12, uptime: 3600 }
    },
    { 
      id: 'fion', 
      name: 'Fion', 
      role: 'Creative', 
      status: 'online',
      port: AGENT_PORTS.fion,
      lastHeartbeat: new Date(),
      metrics: { cpuUsage: 10, memoryUsage: 96, tasksCompleted: 8, uptime: 172800 }
    },
  ]);

  const [events] = useState<CommunicationEvent[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000),
      from: 'kaiten',
      to: 'forge',
      type: 'task_assignment',
      message: 'Assigned: Fix MVP Blockers',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 240000),
      from: 'forge',
      to: 'kaiten',
      type: 'status_update',
      message: 'Progress: 50% complete',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 180000),
      from: 'kaiten',
      to: 'pulse',
      type: 'task_assignment',
      message: 'Restart gateway service',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 120000),
      from: 'pulse',
      to: 'kaiten',
      type: 'completion',
      message: 'Gateway restarted successfully (PID 99377)',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 60000),
      from: 'kaiten',
      to: 'sight',
      type: 'task_assignment',
      message: 'Security audit findings review',
    },
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    // TODO: Implement chat functionality
  };

  const handleLogs = (agentId: string) => {
    console.log('View logs for agent:', agentId);
    // TODO: Implement logs viewer
  };

  const handleSettings = (agentId: string) => {
    console.log('Settings for agent:', agentId);
    // TODO: Implement settings modal
  };

  const handleDelete = (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      setAgents(agents.filter(a => a.id !== agentId));
    }
  };

  const onlineAgents = agents.filter(a => a.status === 'online').length;
  const busyAgents = agents.filter(a => a.status === 'busy').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.metrics.tasksCompleted, 0);

  const stats = [
    { icon: Cloud, label: 'Cloud Agents', value: `${onlineAgents}/${agents.length}`, color: '#6366F1' },
    { icon: Activity, label: 'Busy Agents', value: busyAgents, color: '#f59e0b' },
    { icon: CheckCircle, label: 'Total Tasks', value: totalTasks, color: '#10B981' },
    { icon: Shield, label: 'Security Status', value: 'Healthy', color: '#22c55e' },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-24">
      {/* Header */}
      <header className="mb-6 sm:mb-8">
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
              Autopus Station
            </h1>
            <p className="text-sm sm:text-base text-white/50 mt-1">
              Cloud Agent Network Dashboard
            </p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, i) => (
          <div 
            key={i}
            className="glass-card p-3 sm:p-4 flex items-center gap-3"
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

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Agent Grid */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Cloud Agents</h2>
            <span className="text-sm text-white/40">{agents.length} agents</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
            {agents.map(agent => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
                onChat={handleChat}
                onLogs={handleLogs}
                onSettings={handleSettings}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>

        {/* Communication Flow */}
        <div className="xl:col-span-1">
          <CommunicationFlow events={events} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 pt-6 border-t border-white/10">
        <p className="text-center text-sm text-white/30">
          Autopus Station v2.0 | Last updated: {new Date().toLocaleString()}
        </p>
      </footer>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fab-button"
        title="Create New Agent"
      >
        <Plus size={24} />
      </button>

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
