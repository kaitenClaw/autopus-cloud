import { useState } from 'react';
import { TrendingUp, Brain, Wrench, MessageSquare, Zap } from 'lucide-react';
import { cn } from '../../utils';

interface GrowthMetric {
  label: string;
  value: number;
  change: number;
  icon: typeof TrendingUp;
}

interface MemoryEvent {
  id: string;
  type: 'learned' | 'connected' | 'used';
  description: string;
  timestamp: Date;
}

interface SkillProgress {
  skillName: string;
  icon: string;
  usageCount: number;
  mastery: number;
  lastUsed: Date;
}

const MOCK_METRICS: GrowthMetric[] = [
  { label: 'Things Learned', value: 247, change: 23, icon: Brain },
  { label: 'Skills Active', value: 8, change: 2, icon: Wrench },
  { label: 'Interactions', value: 1523, change: 156, icon: MessageSquare },
  { label: 'Memory Connections', value: 89, change: 12, icon: Zap },
];

const MOCK_MEMORY_EVENTS: MemoryEvent[] = [
  { id: '1', type: 'learned', description: 'Your preference for Cantonese in technical discussions', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '2', type: 'connected', description: 'Linked "Autopus Project" to "4-pillar architecture"', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: '3', type: 'used', description: 'Recalled your VPS login preferences', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  { id: '4', type: 'learned', description: 'Your security audit checklist requirements', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
];

const MOCK_SKILL_PROGRESS: SkillProgress[] = [
  { skillName: 'Email Ninja', icon: '📧', usageCount: 45, mastery: 78, lastUsed: new Date(Date.now() - 1000 * 60 * 30) },
  { skillName: 'VPS Guardian', icon: '🖥️', usageCount: 23, mastery: 65, lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { skillName: 'Code Reviewer', icon: '💻', usageCount: 12, mastery: 45, lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 4) },
];

export function GrowthTimeline() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--accent)]" />
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Agent Growth</h2>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-[var(--surface-2)] p-0.5">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'rounded-md px-2 py-1 text-[10px] font-bold capitalize transition-all',
                timeRange === range
                  ? 'bg-[var(--surface-3)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {MOCK_METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3 hover:border-[var(--border-default)] transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent)]">
                  <Icon size={16} />
                </div>
                <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                  +{metric.change}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-lg font-bold text-[var(--text-primary)]">{metric.value}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{metric.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skill Mastery */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wrench size={14} className="text-[var(--accent-secondary)]" />
          <span className="text-xs font-bold text-[var(--text-primary)]">Skill Mastery</span>
        </div>

        <div className="space-y-3">
          {MOCK_SKILL_PROGRESS.map((skill) => (
            <div key={skill.skillName} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{skill.icon}</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">{skill.skillName}</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">{skill.mastery}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--surface-2)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] transition-all"
                  style={{ width: `${skill.mastery}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] text-[var(--text-muted)]">
                <span>Used {skill.usageCount} times</span>
                <span>Last: {formatTime(skill.lastUsed)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory Timeline */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain size={14} className="text-purple-400" />
          <span className="text-xs font-bold text-[var(--text-primary)]">Recent Learning</span>
        </div>

        <div className="space-y-2">
          {MOCK_MEMORY_EVENTS.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-2 rounded-lg bg-[var(--surface-2)]/50 p-2"
            >
              <div className={cn(
                'mt-0.5 h-2 w-2 rounded-full shrink-0',
                event.type === 'learned' && 'bg-emerald-400',
                event.type === 'connected' && 'bg-blue-400',
                event.type === 'used' && 'bg-amber-400'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {event.description}
                </p>
                <span className="text-[9px] text-[var(--text-muted)]">{formatTime(event.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Insight */}
      <div className="rounded-xl border border-[var(--accent)]/20 bg-gradient-to-r from-[var(--accent-muted)]/30 to-transparent p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
            <Zap size={14} />
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-primary)]">Growth Insight</div>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
              Your agent has learned enough about your workflow to start suggesting 
              automations. Enable "Proactive Mode" in settings to see suggestions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
