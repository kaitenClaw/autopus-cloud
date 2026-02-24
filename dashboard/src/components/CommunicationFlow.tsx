import React from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';
import type { CommunicationEvent } from '../types';
import { AGENT_COLORS } from '../utils/agents';

interface CommunicationFlowProps {
  events: CommunicationEvent[];
}

export const CommunicationFlow: React.FC<CommunicationFlowProps> = ({ events }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task_assignment': return '📤';
      case 'status_update': return '📊';
      case 'completion': return '✅';
      case 'error': return '❌';
      default: return '💬';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'task_assignment': return '#F4845F';
      case 'status_update': return '#2B2D42';
      case 'completion': return '#22C55E';
      case 'error': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  return (
    <div className="persona-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-primary">
          Communication Flow
        </h3>
        <span className="text-xs text-tertiary">{events.length} events</span>
      </div>

      <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto">
        {events.slice(0, 10).map((event) => (
          <div 
            key={event.id}
            className="flex items-start gap-3 p-3 bg-autopus rounded-xl border-l-2 hover:bg-surface transition-colors"
            style={{ borderLeftColor: getEventColor(event.type) }}
          >
            <div className="text-xl flex-shrink-0">{getEventIcon(event.type)}</div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span 
                  className="text-xs sm:text-sm font-semibold truncate max-w-[80px]"
                  style={{ color: AGENT_COLORS[event.from] || '#2B2D42' }}
                >
                  {event.from}
                </span>
                <ArrowRight size={14} className="text-tertiary flex-shrink-0" />
                <span 
                  className="text-xs sm:text-sm font-semibold truncate max-w-[80px]"
                  style={{ color: AGENT_COLORS[event.to] || '#2B2D42' }}
                >
                  {event.to}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-secondary truncate">{event.message}</p>
            </div>
            
            <div className="text-xs text-tertiary flex-shrink-0">
              {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {events.length === 0 && (
          <div className="text-center py-10 text-tertiary">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No communication events yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
