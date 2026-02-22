import { useState, useMemo } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Activity,
  Settings,
  Rocket,
  LogOut,
  LogIn,
  Bot,
  Menu,
  X,
  ChevronRight,
  Package,
} from 'lucide-react';
import { cn } from '../utils';
import { AutopusLogo, AutopusWordmark } from './AutopusLogo';
import AuthModal from './Auth/AuthModal';
import KaitenLaunchWizard from './KaitenLaunchWizard';
import { useChatState } from '../hooks/useChatState';
import type { KAITENAgentRuntime } from '../api';
// Agent/Session types used via useChatState

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/hub', label: 'Hub', icon: Activity },
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/marketplace', label: 'Marketplace', icon: Package },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

export default function AppShell() {
  const chat = useChatState();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const {
    agents,
    selectedAgent,
    setSelectedAgent,
    sessions,
    selectedSession,
    setSelectedSession,
    isAuthenticated,
    showAuthModal,
    setShowAuthModal,
    showLaunchWizard,
    setShowLaunchWizard,
    currentUser,
    handleLogout,
    handleLoginSuccess,
    handleSignUpSuccess,
    handleLaunchSuccess,
    handleCreateSession,
    kaitenRuntimes,
  } = chat;

  const closeMobileSidebar = () => setMobileSidebarOpen(false);
  const visibleAgents = agents.filter((agent) => agent.name.trim().toLowerCase() !== 'prime');
  const mapAgentLabel = (name: string) => (name.trim().toLowerCase() === 'prime' ? 'KAITEN' : name);

  // Build a lookup from agent id → runtime info for sidebar enrichment
  const runtimeByAgent = useMemo(() => {
    const map = new Map<string, KAITENAgentRuntime>();
    for (const rt of kaitenRuntimes) {
      const key = `kaiten:${rt.id?.toLowerCase()}`;
      map.set(key, rt);
      // Also map by profile name for fallback matching
      if (rt.profile) map.set(`kaiten:${rt.profile.toLowerCase()}`, rt);
    }
    return map;
  }, [kaitenRuntimes]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0 text-[var(--text-primary)]">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-[var(--sidebar-bg)] transition-all duration-300 ease-out-expo',
          'border-[var(--sidebar-border)]',
          sidebarCollapsed ? 'w-16' : 'w-[260px]',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-[var(--sidebar-border)] px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <AutopusLogo size={28} />
            {!sidebarCollapsed && <AutopusWordmark className="text-sm" />}
          </div>
          <button
            onClick={() => {
              setSidebarCollapsed(!sidebarCollapsed);
              closeMobileSidebar();
            }}
            className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] lg:block hidden"
          >
            <ChevronRight size={16} className={cn('transition-transform', sidebarCollapsed ? '' : 'rotate-180')} />
          </button>
          <button
            onClick={closeMobileSidebar}
            className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-[var(--accent-muted)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-secondary)]'
                )
              }
            >
              <Icon size={18} />
              {!sidebarCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Launch button */}
        {isAuthenticated && (
          <div className="px-3">
            <button
              onClick={() => setShowLaunchWizard(true)}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-muted)] px-3 py-2.5 text-sm font-semibold text-[var(--accent-hover)] transition-all hover:bg-[var(--accent)]/20 active:scale-[0.98]',
                sidebarCollapsed && 'px-0'
              )}
            >
              <Rocket size={16} />
              {!sidebarCollapsed && <span>Launch Agent</span>}
            </button>
          </div>
        )}

        {/* Agent list */}
        <div className="mt-4 flex-1 overflow-y-auto px-3 scrollbar-thin">
          {!sidebarCollapsed && (
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Agents
            </p>
          )}
          <div className="space-y-1">
            {visibleAgents.map((agent) => {
              const rt = runtimeByAgent.get(agent.id.toLowerCase());
              const isSelected = selectedAgent?.id === agent.id;
              const status = rt?.status ?? 'UNKNOWN';
              const isRunning = status === 'RUNNING';
              const isError = status === 'ERROR';
              const modelRaw = rt?.activeModel || rt?.model || '';
              const modelShort = modelRaw.replace(/^.*\//, '').replace(/^gemini-/, 'g').replace(/^claude-/, 'c').replace(/^gpt-/, 'gpt').slice(0, 12);

              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  title={rt ? `${status} · ${modelRaw}` : agent.name}
                  className={cn(
                    'group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all',
                    isSelected
                      ? 'bg-[var(--surface-2)] text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]/60 hover:text-[var(--text-secondary)]'
                  )}
                >
                  {/* Agent icon with status dot */}
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg transition',
                        isSelected ? 'bg-[var(--accent-muted)]' : 'bg-[var(--surface-2)]'
                      )}
                    >
                      <Bot size={14} className={isSelected ? 'text-[var(--accent-hover)]' : ''} />
                    </div>
                    {/* Status indicator dot */}
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-[var(--sidebar-bg)]',
                        isRunning && 'bg-emerald-400',
                        isError && 'bg-red-400',
                        !isRunning && !isError && 'bg-zinc-500'
                      )}
                    />
                  </div>

                  {/* Name + model badge (when sidebar expanded) */}
                  {!sidebarCollapsed && (
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-medium leading-tight">{mapAgentLabel(agent.name)}</span>
                      {modelShort && (
                        <span className="block truncate text-[10px] leading-tight text-[var(--text-muted)] opacity-70">
                          {modelShort}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Pulse indicator for running agents (expanded only) */}
                  {!sidebarCollapsed && isRunning && (
                    <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400/60" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sessions under selected agent */}
          {selectedAgent && !sidebarCollapsed && sessions.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Sessions
                </p>
                <button
                  onClick={handleCreateSession}
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-secondary)]"
                >
                  + New
                </button>
              </div>
              <div className="space-y-0.5">
                {sessions.slice(0, 12).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-all',
                      selectedSession?.id === session.id
                        ? 'bg-[var(--surface-2)] text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]/50 hover:text-[var(--text-secondary)]'
                    )}
                  >
                    <MessageSquare size={12} />
                    <span className="truncate">{session.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User section */}
        <div className="border-t border-[var(--sidebar-border)] p-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-secondary)] text-[10px] font-bold text-[var(--surface-0)] shadow-lg">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{currentUser.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{currentUser.plan}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-400"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--surface-2)] px-3 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] hover:text-white',
                sidebarCollapsed && 'px-0'
              )}
            >
              <LogIn size={16} />
              {!sidebarCollapsed && <span>Sign In</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-0)]/80 px-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] lg:hidden"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-semibold capitalize text-[var(--text-primary)]">
                {location.pathname.split('/')[1] || 'Dashboard'}
              </span>
              {selectedAgent && (
                <>
                  <ChevronRight size={14} className="text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">{mapAgentLabel(selectedAgent.name)}</span>
                </>
              )}
              {selectedSession && (
                <>
                  <ChevronRight size={14} className="text-[var(--text-muted)]" />
                  <span className="max-w-[180px] truncate text-[var(--text-muted)]">{selectedSession.title}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-[var(--text-muted)] md:inline">
              Your Personal AI Team, One Click Away
            </span>
            {isAuthenticated && (
              <button
                onClick={() => setShowLaunchWizard(true)}
                className="hidden items-center gap-1.5 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-hover)] transition hover:bg-[var(--accent)]/20 sm:inline-flex"
              >
                <Rocket size={14} />
                Launch
              </button>
            )}
          </div>
        </header>

        {/* Page content — rendered by router */}
        <main className="flex-1 overflow-hidden">
          <Outlet context={chat} />
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onSignUpSuccess={handleSignUpSuccess}
      />

      <KaitenLaunchWizard
        isOpen={showLaunchWizard}
        onClose={() => setShowLaunchWizard(false)}
        onSuccess={handleLaunchSuccess}
      />
    </div>
  );
}
