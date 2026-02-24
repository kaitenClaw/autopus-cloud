import React from 'react';
import { 
  MessageSquare, 
  Brain,
  Settings, 
  Trash2,
  Sparkles,
  Zap
} from 'lucide-react';
import type { Agent } from '../types';
import { AGENT_ICONS, AGENT_SOULS } from '../utils/agents';

interface LifeAgentCardProps {
  agent: Agent;
  memoryCount?: number;
  skillCount?: number;
  todayConversations?: number;
  onChat?: (agentId: string) => void;
  onMemory?: (agentId: string) => void;
  onSettings?: (agentId: string) => void;
  onDelete?: (agentId: string) => void;
}

export const LifeAgentCard: React.FC<LifeAgentCardProps> = ({ 
  agent, 
  memoryCount = 1247,
  skillCount = 8,
  todayConversations = 23,
  onChat, 
  onMemory, 
  onSettings, 
  onDelete 
}) => {
  const agentIcon = AGENT_ICONS[agent.id] || '🤖';
  const agentSoul = AGENT_SOULS[agent.id] || 'Your digital companion';

  const isOnline = agent.status === 'online';
  const isBusy = agent.status === 'busy';

  return (
    <div className="persona-card relative overflow-hidden group">
      {/* Status indicator */}
      {isOnline && (
        <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-green-500" />
      )}
      
      {isBusy && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] text-amber-500 font-medium">BUSY</span>
        </div>
      )}

      {/* Main Content */}
      <div className="p-5">
        {/* Header: Avatar + Name + Soul */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
            style={{ 
              background: 'linear-gradient(135deg, #F4845F20, #F4845F10)',
              border: '2px solid #F4845F30'
            }}
          >
            {agentIcon}
          </div>

          {/* Name and Soul */}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-lg font-bold text-primary truncate mb-0.5">
              {agent.name}
            </h3>
            <p className="text-xs text-secondary truncate italic">
              "{agentSoul}"
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ 
                  background: '#F4845F15',
                  color: '#F4845F',
                  border: '1px solid #F4845F30'
                }}
              >
                {agent.role}
              </span>
            </div>
          </div>
        </div>

        {/* Life Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-autopus rounded-xl p-2.5 text-center transition-colors hover:bg-surface">
            <Brain size={14} className="mx-auto mb-1 text-accent" />
            <p className="text-lg font-bold text-primary leading-none">{memoryCount.toLocaleString()}</p>
            <p className="text-[10px] text-tertiary mt-1">Memory</p>
          </div>
          <div className="bg-autopus rounded-xl p-2.5 text-center transition-colors hover:bg-surface">
            <Sparkles size={14} className="mx-auto mb-1 text-accent" />
            <p className="text-lg font-bold text-primary leading-none">{skillCount}</p>
            <p className="text-[10px] text-tertiary mt-1">Skills</p>
          </div>
          <div className="bg-autopus rounded-xl p-2.5 text-center transition-colors hover:bg-surface">
            <MessageSquare size={14} className="mx-auto mb-1 text-accent" />
            <p className="text-lg font-bold text-primary leading-none">{todayConversations}</p>
            <p className="text-[10px] text-tertiary mt-1">Today</p>
          </div>
        </div>

        {/* Current Task with progress */}
        {agent.currentTask && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={12} className="text-tertiary" />
              <p className="text-xs text-secondary truncate">{agent.currentTask}</p>
            </div>
            {agent.taskProgress !== undefined && (
              <div className="h-1.5 bg-autopus rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out bg-accent"
                  style={{ width: `${agent.taskProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onChat?.(agent.id)}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
          >
            <MessageSquare size={14} />
            Chat
          </button>
          <button
            onClick={() => onMemory?.(agent.id)}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
          >
            <Brain size={14} />
            Memory
          </button>
          <button
            onClick={() => onSettings?.(agent.id)}
            className="btn-secondary p-2.5"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => onDelete?.(agent.id)}
            className="p-2.5 rounded-xl border border-autopus-border text-tertiary transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
