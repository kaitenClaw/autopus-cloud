import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Download, Star, Package, Loader2 } from 'lucide-react';
import { getSkills, installSkill, type Skill } from '../api';
import { SmartRecommendations } from '../components/marketplace/SmartRecommendations';
import { cn } from '../utils';
import type { UseChatState } from '../hooks/useChatState';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'research', label: 'Research' },
  { id: 'communication', label: 'Communication' },
  { id: 'development', label: 'Development' },
  { id: 'creative', label: 'Creative' },
];

export default function MarketplacePage() {
  const chat = useOutletContext<UseChatState>();
  const { selectedAgent } = chat;

  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [installingSlug, setInstallingSlug] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const params: any = {};
        if (activeCategory !== 'all') params.category = activeCategory;
        if (search.trim()) params.search = search.trim();
        const data = await getSkills(params);
        setSkills(data);
      } catch {
        // Skills API may not be deployed yet — show empty state
        setSkills([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeCategory, search]);

  const handleInstall = async (skill: Skill) => {
    if (!selectedAgent || installingSlug) return;
    setInstallingSlug(skill.slug);
    try {
      await installSkill(skill.slug, selectedAgent.id);
      setSkills((prev) =>
        prev.map((s) => (s.id === skill.id ? { ...s, installs: s.installs + 1 } : s))
      );
    } catch {
      // Ignore for MVP
    } finally {
      setInstallingSlug(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-heading-lg text-[var(--text-primary)]">Skill Marketplace</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Give your agent new superpowers. Install skills in one click.
          </p>
        </div>

        {/* Search + Categories */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold transition',
                  activeCategory === cat.id
                    ? 'bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/30'
                    : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--text-secondary)]'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Smart Recommendations - NEW */}
        {selectedAgent && (
          <SmartRecommendations
            agentId={selectedAgent.id}
            installedSkills={[]}
            userPatterns={[]}
            onInstall={async (skill) => {
              await handleInstall(skill);
            }}
            onDismiss={(id) => console.log('Dismissed:', id)}
          />
        )}

        {/* Skills Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
          </div>
        ) : skills.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-12 text-center">
            <Package size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
            <h2 className="text-heading text-[var(--text-primary)] mb-2">Marketplace Coming Soon</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Skills are being curated. Soon you'll be able to give your agent abilities like web search,
              calendar management, email summarization, and more.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 hover:border-[var(--border-default)] transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent)] text-lg">
                      {skill.icon || '🧩'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">{skill.name}</h3>
                      <span className="text-[10px] text-[var(--text-muted)]">v{skill.version}</span>
                    </div>
                  </div>
                  {skill.featured && (
                    <Star size={14} className="text-[var(--warning)] fill-[var(--warning)]" />
                  )}
                </div>

                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">
                  {skill.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded font-bold uppercase',
                      skill.tier === 'FREE' ? 'bg-[var(--success-muted)] text-[var(--success)]' : 'bg-[var(--accent-secondary-muted)] text-[var(--accent-secondary)]'
                    )}>
                      {skill.tier === 'FREE' ? 'Free' : `$${skill.priceUsd}/mo`}
                    </span>
                    <span>
                      <Download size={10} className="inline mr-0.5" />
                      {skill.installs}
                    </span>
                  </div>

                  <button
                    onClick={() => handleInstall(skill)}
                    disabled={!selectedAgent || installingSlug === skill.slug}
                    className="rounded-lg bg-[var(--accent)] text-[var(--surface-0)] px-3 py-1.5 text-[11px] font-bold hover:bg-[var(--accent-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {installingSlug === skill.slug ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Download size={12} />
                    )}
                    Install
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
