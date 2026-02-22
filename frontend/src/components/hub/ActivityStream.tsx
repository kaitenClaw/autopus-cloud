import { useEffect, useState } from 'react';
import { 
  MessageCircle, 
  Wrench, 
  Brain, 
  Zap, 
  Users, 
  Bot,
  Clock,
  Sparkles
} from 'lucide-react';
import { cn } from '../../utils';

interface ActivityEvent {
  id: string;
  type: 'skill-used' | 'memory-added' | 'surprise' | 'a2a' | 'learning' | 'milestone';
  agent: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
  metadata?: {
    skillName?: string;
    memorySnippet?: string;
    partnerAgent?: string;
  };
}

const MOCK_ACTIVITIES: ActivityEvent[] = [
  {
    id: '1',
    type: 'surprise',
    agent: { name: 'Pulse' },
    content: 'Noticed you check VPS health 5 times today. Installed "VPS Guardian" skill to automate this.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    metadata: { skillName: 'VPS Guardian' }
  },
  {
    id: '2',
    type: 'skill-used',
    agent: { name: 'Forge' },
    content: 'Analyzed 3 pull requests using Code Reviewer skill. Found 2 potential issues and suggested fixes.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    metadata: { skillName: 'Code Reviewer' }
  },
  {
    id: '3',
    type: 'a2a',
    agent: { name: 'Pulse' },
    content: 'Asked Forge about database optimization tips for your project',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    metadata: { partnerAgent: 'Forge' }
  },
  {
    id: '4',
    type: 'memory-added',
    agent: { name: 'Sight' },
    content: 'Learned that you prefer detailed security reports with specific CVE references',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '5',
    type: 'learning',
    agent: { name: 'Prime' },
    content: 'Analyzed your project structure and added context about the 4-pillar architecture',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    id: '6',
    type: 'milestone',
    agent: { name: 'Forge' },
    content: 'Congratulations! You\'ve completed 100 interactions with your AI team 🎉',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

export function ActivityStream() {
  const [activities] = useState<ActivityEvent[]>(MOCK_ACTIVITIES);

  // In real implementation, this would connect to WebSocket
  useEffect(() => {
    // Simulating real-time updates
    const interval = setInterval(() => {
      // Add new activity occasionally
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'skill-used': return Wrench;
      case 'memory-added': return Brain;
      case 'surprise': return Sparkles;
      case 'a2a': return Users;
      case 'learning': return Zap;
      case 'milestone': return Bot;
      default: return MessageCircle;
    }
  };

  const getTypeColor = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'skill-used': return 'text-blue-400 bg-blue-500/10';
      case 'memory-added': return 'text-purple-400 bg-purple-500/10';
      case 'surprise': return 'text-amber-400 bg-amber-500/10';
      case 'a2a': return 'text-emerald-400 bg-emerald-500/10';
      case 'learning': return 'text-cyan-400 bg-cyan-500/10';
      case 'milestone': return 'text-pink-400 bg-pink-500/10';
      default: return 'text-[var(--text-muted)] bg-[var(--surface-2)]';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 5) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">Agent Activity</h2>
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live
        </div>
      </div>

      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-4 top-3 bottom-3 w-px bg-[var(--border-subtle)]" />

        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          const colors = getTypeColor(activity.type);

          return (
            <div key={activity.id} className="relative flex gap-3 pl-1">
              {/* Icon */}
              <div className={cn(
                'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                colors
              )}>
                <Icon size={14} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3 hover:border-[var(--border-default)] transition">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--accent)]">
                      {activity.agent.name}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {activity.type === 'a2a' ? '→' : '•'}
                    </span>
                    {activity.metadata?.partnerAgent && (
                      <span className="text-xs font-bold text-[var(--accent-secondary)]">
                        {activity.metadata.partnerAgent}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-[var(--text-muted)]">
                    <Clock size={10} />
                    {formatTime(activity.timestamp)}
                  </div>
                </div>

                <p className="mt-1.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activity.content}
                </p>

                {activity.metadata?.skillName && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[var(--surface-2)] px-2 py-1 text-[10px] text-[var(--text-muted)]">
                    <Wrench size={10} />
                    {activity.metadata.skillName}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
