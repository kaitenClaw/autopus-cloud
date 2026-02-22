import { useState } from 'react';
import { Activity, Brain, Sparkles } from 'lucide-react';
import { cn } from '../../utils';
import type { Skill } from '../../api';

interface SmartRecommendationsProps {
  agentId: string | null;
  installedSkills: Skill[];
  userPatterns: UserPattern[];
  onInstall: (skill: Skill) => void;
  onDismiss: (skillId: string) => void;
}

interface UserPattern {
  type: string;
  frequency: number;
  lastTriggered: Date;
  suggestedSkill: string;
  confidence: number;
}

interface Recommendation {
  id: string;
  skill: Skill;
  reason: string;
  confidence: number;
  autoInstallAvailable: boolean;
  badge?: 'trending' | 'new' | 'recommended';
}

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    skill: {
      id: 'skill-1',
      slug: 'email-ninja',
      name: 'Email Ninja',
      description: 'Automatically summarize and prioritize your inbox',
      category: 'productivity',
      icon: '📧',
      version: '1.0.0',
      tier: 'FREE',
      priceUsd: null,
      featured: true,
      installs: 1247,
      manifest: {},
      createdAt: new Date().toISOString(),
    },
    reason: 'You mentioned "too many emails" 3 times this week',
    confidence: 0.92,
    autoInstallAvailable: true,
    badge: 'recommended',
  },
  {
    id: 'rec-2',
    skill: {
      id: 'skill-2',
      slug: 'meeting-scribe',
      name: 'Meeting Scribe',
      description: 'Auto-transcribe and summarize your calls',
      category: 'business',
      icon: '📝',
      version: '1.0.0',
      tier: 'PREMIUM',
      priceUsd: 12,
      featured: true,
      installs: 856,
      manifest: {},
      createdAt: new Date().toISOString(),
    },
    reason: 'You have 5 meetings scheduled for tomorrow',
    confidence: 0.88,
    autoInstallAvailable: false,
    badge: 'trending',
  },
  {
    id: 'rec-3',
    skill: {
      id: 'skill-3',
      slug: 'vps-guardian',
      name: 'VPS Guardian',
      description: 'Monitor server health and get alerts',
      category: 'development',
      icon: '🖥️',
      version: '1.0.0',
      tier: 'PREMIUM',
      priceUsd: 5,
      featured: false,
      installs: 432,
      manifest: {},
      createdAt: new Date().toISOString(),
    },
    reason: 'You frequently check VPS status manually',
    confidence: 0.85,
    autoInstallAvailable: true,
    badge: undefined,
  },
];

export function SmartRecommendations({
  agentId,
  onInstall,
  onDismiss,
}: SmartRecommendationsProps) {
  const [recommendations] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleInstall = async (rec: Recommendation) => {
    if (!agentId || installingId) return;
    setInstallingId(rec.id);
    try {
      await onInstall(rec.skill);
      setDismissedIds(prev => new Set([...prev, rec.id]));
    } finally {
      setInstallingId(null);
    }
  };

  const handleDismiss = (recId: string) => {
    setDismissedIds(prev => new Set([...prev, recId]));
    onDismiss(recId);
  };

  const visibleRecommendations = recommendations.filter(r => !dismissedIds.has(r.id));

  if (visibleRecommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-[var(--accent)]" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
          Recommended for You
        </span>
      </div>

      {visibleRecommendations.map((rec) => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          isInstalling={installingId === rec.id}
          onInstall={() => handleInstall(rec)}
          onDismiss={() => handleDismiss(rec.id)}
        />
      ))}
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  isInstalling: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

function RecommendationCard({
  recommendation,
  isInstalling,
  onInstall,
  onDismiss,
}: RecommendationCardProps) {
  const { skill, reason, autoInstallAvailable, badge } = recommendation;

  return (
    <div className="relative rounded-xl border border-[var(--accent)]/20 bg-gradient-to-r from-[var(--accent-muted)]/30 to-transparent p-3">
      {/* Badge */}
      {badge && (
        <span className={cn(
          'absolute -top-2 left-3 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase',
          badge === 'trending' && 'bg-orange-500/20 text-orange-400',
          badge === 'new' && 'bg-emerald-500/20 text-emerald-400',
          badge === 'recommended' && 'bg-[var(--accent)]/20 text-[var(--accent)]'
        )}>
          {badge}
        </span>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-lg">
          {skill.icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-[var(--text-primary)]">
              {skill.name}
            </span>
            {skill.tier === 'PREMIUM' && (
              <span className="rounded bg-[var(--accent-secondary-muted)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--accent-secondary)]">
                ${skill.priceUsd}/mo
              </span>
            )}
          </div>

          <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--text-secondary)]">
            {skill.description}
          </p>

          {/* Why recommended */}
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-[var(--surface-0)]/50 px-2 py-1.5">
            <Brain size={10} className="text-[var(--accent)]" />
            <span className="text-[10px] text-[var(--text-muted)]">{reason}</span>
          </div>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={onInstall}
              disabled={isInstalling}
              className={cn(
                'flex-1 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all',
                autoInstallAvailable && skill.tier === 'FREE'
                  ? 'bg-[var(--accent)] text-[var(--surface-0)] hover:bg-[var(--accent-hover)]'
                  : 'border border-[var(--accent)]/30 bg-[var(--accent-muted)] text-[var(--accent)] hover:bg-[var(--accent)]/20',
                isInstalling && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isInstalling ? (
                <span className="flex items-center justify-center gap-1">
                  <Activity size={10} className="animate-spin" />
                  Installing...
                </span>
              ) : autoInstallAvailable && skill.tier === 'FREE' ? (
                'Install Now'
              ) : (
                `Try Free`
              )}
            </button>

            <button
              onClick={onDismiss}
              className="rounded-lg px-2 py-1.5 text-[10px] text-[var(--text-muted)] transition hover:text-[var(--text-secondary)]"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
