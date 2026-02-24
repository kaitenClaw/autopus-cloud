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
import { AGENT_COLORS, AGENT_ICONS, AGENT_SOULS } from '../utils/agents';

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
  const agentColor = AGENT_COLORS[agent.id] || '#6366f1';
  const agentIcon = AGENT_ICONS[agent.id] || '🤖';
  const agentSoul = AGENT_SOULS[agent.id] || 'Your digital companion';

  const isOnline = agent.status === 'online';
  const isBusy = agent.status === 'busy';

  return (
    <div 
      className="relative overflow-hidden rounded-2xl border border-white/10 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/20 group"
      style={{ 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        boxShadow: `0 8px 32px ${agentColor}20, inset 0 1px 0 rgba(255,255,255,0.1)`
      }}
    >
      {/* Breathing light effect for online agents */}
      {isOnline && (
        <div 
          className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full animate-breathe"
          style={{ 
            backgroundColor: agentColor,
            boxShadow: `0 0 20px ${agentColor}, 0 0 40px ${agentColor}80`
          }}
        />
      )}
      
      {/* Busy indicator */}
      {isBusy && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] text-amber-400 font-medium">BUSY</span>
        </div>
      )}

      {/* Main Content */}
      <div className="p-5">
        {/* Header: Avatar + Name + Soul */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar with glow */}
          <div 
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ 
              background: `linear-gradient(135deg, ${agentColor}40, ${agentColor}15)`,
              border: `2px solid ${agentColor}50`,
              boxShadow: `0 0 30px ${agentColor}30, inset 0 1px 0 rgba(255,255,255,0.2)`
            }}
          >
            {agentIcon}
            {/* Subtle pulse ring */}
            {isOnline && (
              <div 
                className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                style={{ backgroundColor: agentColor }}
              />
            )}
          </div>

          {/* Name and Soul */}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-lg font-bold text-white truncate mb-0.5">
              {agent.name}
            </h3>
            <p className="text-xs text-white/50 truncate italic">
              「{agentSoul}」
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ 
                  background: `${agentColor}30`,
                  color: agentColor,
                  border: `1px solid ${agentColor}40`
                }}
              >
                {agent.role}
              </span>
            </div>
          </div>
        </div>

        {/* Life Stats — Digital Life Form Data */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div 
            className="rounded-xl p-2.5 text-center transition-colors hover:bg-white/5"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          >
            <Brain size={14} className="mx-auto mb-1 text-indigo-400" />
            <p className="text-lg font-bold text-white leading-none">{memoryCount.toLocaleString()}</p>
            <p className="text-[10px] text-white/40 mt-1">記憶</p>
          </div>
          <div 
            className="rounded-xl p-2.5 text-center transition-colors hover:bg-white/5"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          >
            <Sparkles size={14} className="mx-auto mb-1 text-amber-400" />
            <p className="text-lg font-bold text-white leading-none">{skillCount}</p>
            <p className="text-[10px] text-white/40 mt-1">技能</p>
          </div>
          <div 
            className="rounded-xl p-2.5 text-center transition-colors hover:bg-white/5"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          >
            <MessageSquare size={14} className="mx-auto mb-1 text-emerald-400" />
            <p className="text-lg font-bold text-white leading-none">{todayConversations}</p>
            <p className="text-[10px] text-white/40 mt-1">今日對話</p>
          </div>
        </div>

        {/* Current Task with progress */}
        {agent.currentTask && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={12} className="text-white/40" />
              <p className="text-xs text-white/60 truncate">{agent.currentTask}</p>
            </div>
            {agent.taskProgress !== undefined && (
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${agent.taskProgress}%`,
                    background: `linear-gradient(90deg, ${agentColor}, ${agentColor}60)`
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onChat?.(agent.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium transition-all hover:bg-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageSquare size={14} />
            對話
          </button>
          <button
            onClick={() => onMemory?.(agent.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Brain size={14} />
            記憶
          </button>
          <button
            onClick={() => onSettings?.(agent.id)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 transition-all hover:bg-white/10 hover:text-white"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => onDelete?.(agent.id)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 transition-all hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
