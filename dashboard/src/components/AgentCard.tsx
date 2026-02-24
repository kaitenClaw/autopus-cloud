import React from 'react';
import { 
  MessageSquare, 
  FileText, 
  Settings, 
  Trash2, 
  Cpu, 
  Activity, 
  CheckCircle, 
  Clock,
  Globe
} from 'lucide-react';
import type { Agent } from '../types';
import { AGENT_COLORS, AGENT_ICONS, formatUptime } from '../utils/agents';

interface AgentCardProps {
  agent: Agent;
  onChat?: (agentId: string) => void;
  onLogs?: (agentId: string) => void;
  onSettings?: (agentId: string) => void;
  onDelete?: (agentId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ 
  agent, 
  onChat, 
  onLogs, 
  onSettings, 
  onDelete 
}) => {
  const agentColor = AGENT_COLORS[agent.id] || '#6366f1';
  const agentIcon = AGENT_ICONS[agent.id] || '🤖';

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'online': return 'status-online';
      case 'offline': return 'status-offline';
      case 'busy': return 'status-busy';
      case 'error': return 'status-error';
      default: return 'bg-gray-500';
    }
  };

  const handleChat = () => onChat?.(agent.id);
  const handleLogs = () => onLogs?.(agent.id);
  const handleSettings = () => onSettings?.(agent.id);
  const handleDelete = () => onDelete?.(agent.id);

  return (
    <div className="glass-card p-4 sm:p-5 md:p-6 relative overflow-hidden group">
      {/* Status indicator pulse effect for online agents */}
      {agent.status === 'online' && (
        <div 
          className="absolute top-4 right-4 w-3 h-3 rounded-full animate-pulse-ring"
          style={{ backgroundColor: agentColor }}
        />
      )}

      {/* Header: Icon, Name, Role, Status */}
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        {/* Agent Icon */}
        <div 
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
          style={{ 
            background: `linear-gradient(135deg, ${agentColor}30, ${agentColor}10)`,
            border: `1px solid ${agentColor}40`
          }}
        >
          {agentIcon}
        </div>

        {/* Name and Role */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-white truncate">
            {agent.name}
          </h3>
          <p className="text-xs sm:text-sm text-white/60 truncate">{agent.role}</p>
        </div>

        {/* Status Dot */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`status-dot ${getStatusClass(agent.status)}`} />
        </div>
      </div>

      {/* Port & Connection Info */}
      <div className="flex items-center gap-2 mb-4 text-xs sm:text-sm text-white/50">
        <Globe size={14} className="flex-shrink-0" />
        <span className="font-mono">Port {agent.port}</span>
        <span className="mx-1">•</span>
        <span className={`capitalize ${
          agent.status === 'online' ? 'text-emerald-400' : 
          agent.status === 'busy' ? 'text-amber-400' : 'text-red-400'
        }`}>
          {agent.status}
        </span>
      </div>

      {/* Current Task */}
      {agent.currentTask && (
        <div className="bg-black/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-white/50 mb-1">Current Task</p>
          <p className="text-sm text-white truncate">{agent.currentTask}</p>
          {agent.taskProgress !== undefined && (
            <div className="mt-2">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${agent.taskProgress}%`,
                    background: `linear-gradient(90deg, ${agentColor}, ${agentColor}80)`
                  }}
                />
              </div>
              <p className="text-xs text-white/40 mt-1">{agent.taskProgress}%</p>
            </div>
          )}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
        <div className="glass-button p-2 sm:p-2.5 gap-2">
          <Cpu size={14} className="text-white/60 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-white/80 font-mono truncate">
            {agent.metrics.cpuUsage.toFixed(1)}%
          </span>
        </div>
        <div className="glass-button p-2 sm:p-2.5 gap-2">
          <Activity size={14} className="text-white/60 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-white/80 font-mono truncate">
            {agent.metrics.memoryUsage.toFixed(0)} MB
          </span>
        </div>
        <div className="glass-button p-2 sm:p-2.5 gap-2">
          <CheckCircle size={14} className="text-white/60 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-white/80 font-mono truncate">
            {agent.metrics.tasksCompleted} tasks
          </span>
        </div>
        <div className="glass-button p-2 sm:p-2.5 gap-2">
          <Clock size={14} className="text-white/60 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-white/80 font-mono truncate">
            {formatUptime(agent.metrics.uptime)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10">
        <button
          onClick={handleChat}
          className="glass-button p-2 sm:p-2.5 min-h-[44px] hover:bg-indigo-500/20 hover:border-indigo-500/30 group/btn"
          title="Chat"
        >
          <MessageSquare size={16} className="text-white/70 group-hover/btn:text-indigo-400 transition-colors" />
        </button>
        <button
          onClick={handleLogs}
          className="glass-button p-2 sm:p-2.5 min-h-[44px] hover:bg-emerald-500/20 hover:border-emerald-500/30 group/btn"
          title="Logs"
        >
          <FileText size={16} className="text-white/70 group-hover/btn:text-emerald-400 transition-colors" />
        </button>
        <button
          onClick={handleSettings}
          className="glass-button p-2 sm:p-2.5 min-h-[44px] hover:bg-amber-500/20 hover:border-amber-500/30 group/btn"
          title="Settings"
        >
          <Settings size={16} className="text-white/70 group-hover/btn:text-amber-400 transition-colors" />
        </button>
        <button
          onClick={handleDelete}
          className="glass-button p-2 sm:p-2.5 min-h-[44px] hover:bg-red-500/20 hover:border-red-500/30 group/btn"
          title="Delete"
        >
          <Trash2 size={16} className="text-white/70 group-hover/btn:text-red-400 transition-colors" />
        </button>
      </div>

      {/* Last Heartbeat */}
      <div className="mt-3 text-xs text-white/30 text-center">
        Last heartbeat: {agent.lastHeartbeat.toLocaleTimeString()}
      </div>
    </div>
  );
};
