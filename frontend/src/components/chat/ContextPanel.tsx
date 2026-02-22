import { useState } from 'react';
import { Wrench, Brain, Lightbulb, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../../utils';
import type { Skill } from '../../api';

interface ContextPanelProps {
  activeSkills: Skill[];
  recentMemories: MemorySnippet[];
  suggestedPrompts: string[];
  onPromptClick: (prompt: string) => void;
}

interface MemorySnippet {
  id: string;
  content: string;
  timestamp: Date;
  source: string;
}

const MOCK_MEMORIES: MemorySnippet[] = [
  { id: '1', content: 'Prefers Cantonese for technical updates', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), source: 'Preference' },
  { id: '2', content: 'Working on Autopus Cloud 4-pillar architecture', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), source: 'Project' },
  { id: '3', content: 'VPS at 108.160.137.70 (Vultr)', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), source: 'Infrastructure' },
];

const MOCK_PROMPTS = [
  'Check my VPS health',
  'Summarize my recent emails',
  'Review today\'s calendar',
  'Help me draft a tweet about Autopus',
];

export function ContextPanel({
  activeSkills,
  recentMemories,
  onPromptClick,
}: ContextPanelProps) {
  const [expanded, setExpanded] = useState<'none' | 'skills' | 'memory' | 'prompts'>('prompts');

  return (
    <div className="space-y-3">
      {/* Quick Prompts - Always Visible */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={12} className="text-amber-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Quick Actions</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MOCK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onPromptClick(prompt)}
              className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2.5 py-1 text-[10px] text-[var(--text-secondary)] transition hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Active Skills */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] overflow-hidden">
        <button
          onClick={() => setExpanded(expanded === 'skills' ? 'none' : 'skills')}
          className="flex w-full items-center justify-between p-3 hover:bg-[var(--surface-2)]/50 transition"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
              <Wrench size={12} />
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)]">Active Skills</span>
            <span className="rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[9px] text-[var(--text-muted)]">
              {activeSkills?.length || 3}
            </span>
          </div>
          <ChevronRight
            size={14}
            className={cn(
              'text-[var(--text-muted)] transition-transform',
              expanded === 'skills' && 'rotate-90'
            )}
          />
        </button>

        {expanded === 'skills' && (
          <div className="border-t border-[var(--border-subtle)] p-2 space-y-1">
            {activeSkills?.length > 0 ? (
              activeSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                >
                  <span>{skill.icon}</span>
                  <span>{skill.name}</span>
                </div>
              ))
            ) : (
              <>
                {['📧 Email Ninja', '📅 Calendar Sage', '🔍 Web Search Pro'].map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-[var(--text-secondary)]"
                  >
                    <span>{skill}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Recent Memories */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] overflow-hidden">
        <button
          onClick={() => setExpanded(expanded === 'memory' ? 'none' : 'memory')}
          className="flex w-full items-center justify-between p-3 hover:bg-[var(--surface-2)]/50 transition"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-400">
              <Brain size={12} />
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)]">Recent Memory</span>
          </div>
          <ChevronRight
            size={14}
            className={cn(
              'text-[var(--text-muted)] transition-transform',
              expanded === 'memory' && 'rotate-90'
            )}
          />
        </button>

        {expanded === 'memory' && (
          <div className="border-t border-[var(--border-subtle)] p-2 space-y-1">
            {(recentMemories || MOCK_MEMORIES).map((memory) => (
              <div
                key={memory.id}
                className="rounded-lg px-2 py-1.5 text-[10px] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
              >
                <p className="line-clamp-2">{memory.content}</p>
                <div className="mt-1 flex items-center gap-2 text-[9px] text-[var(--text-muted)]">
                  <span>{memory.source}</span>
                  <span>•</span>
                  <span>{formatTime(memory.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proactive Suggestion */}
      <div className="rounded-xl border border-[var(--accent)]/20 bg-gradient-to-r from-[var(--accent-muted)]/30 to-transparent p-3">
        <div className="flex items-start gap-2">
          <Sparkles size={14} className="mt-0.5 text-[var(--accent)]" />
          <div className="flex-1">
            <p className="text-[11px] text-[var(--text-secondary)]">
              Based on your recent activity, installing{' '}
              <span className="font-bold text-[var(--accent)]">Meeting Scribe</span>
              {' '}could save you 30 min/day.
            </p>
            <button className="mt-2 rounded-lg bg-[var(--accent)]/20 px-2 py-1 text-[10px] font-bold text-[var(--accent)] transition hover:bg-[var(--accent)]/30">
              View Recommendation
            </button>
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
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
