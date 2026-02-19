import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Gauge,
  Layers,
  Network,
  RefreshCw,
  Rocket,
  Split,
  Sparkles,
  Zap,
} from 'lucide-react';
import AgentsMatrix from '../AgentsMatrix';
import {
  bootstrapOnboarding,
  getDashboardOverview,
  getOnboardingState,
  verifyOnboardingFirstMessage,
  type DashboardOverview,
  type OnboardingState,
} from '../../api';
import { cn } from '../../utils';
import { runPolledTask } from '../../utils/polling';
import type { UseChatState } from '../../hooks/useChatState';

interface DashboardSurfaceProps {
  chat: UseChatState;
  onOpenLaunchWizard: () => void;
  onOpenAuthModal: () => void;
  onSwitchToHub?: () => void;
}

const HUB_URL = import.meta.env.VITE_HUB_URL || 'https://hub.autopus.cloud';
const ENABLE_ONBOARDING_V2 = import.meta.env.VITE_FEATURE_DASHBOARD_ONBOARDING_V2 !== 'false';
const ONBOARDING_STATE_KEY = 'autopus_onboarding_state_v1';

const alertTone: Record<'info' | 'warning' | 'critical', string> = {
  info: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  critical: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
};

const runtimeTone = (status: string) => {
  const key = status.toUpperCase();
  if (key === 'RUNNING') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100';
  if (key === 'ERROR') return 'border-rose-500/30 bg-rose-500/10 text-rose-100';
  if (key === 'STOPPED') return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-200';
  return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
};

const parseErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const maybeAxios = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return maybeAxios.response?.data?.message || maybeAxios.message || 'Failed to load dashboard overview';
  }
  return 'Failed to load dashboard overview';
};

const stepState = (onboarding: OnboardingState | null, step: 1 | 2 | 3) => {
  if (!onboarding) return 'pending';
  if (onboarding.status === 'completed') return 'completed';
  if (onboarding.step > step) return 'completed';
  if (onboarding.step === step) return 'active';
  return 'pending';
};

export default function DashboardSurface({
  chat,
  onOpenLaunchWizard,
  onOpenAuthModal,
  onSwitchToHub,
}: DashboardSurfaceProps) {
  const { isAuthenticated, matrixRefreshKey, currentUser } = chat;
  const isAdmin = currentUser.role === 'ADMIN';
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(() => {
    try {
      const raw = localStorage.getItem(ONBOARDING_STATE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as OnboardingState;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState('Never');

  const refreshOverview = useCallback(async () => {
    if (!isAuthenticated) {
      setOverview(null);
      setOnboarding(null);
      setLoadError(null);
      setLastRefresh('Guest mode');
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      let snapshot: DashboardOverview | null = null;
      let onboardingState: OnboardingState | null = null;
      await runPolledTask('dashboard.overview', async () => {
        [snapshot, onboardingState] = await Promise.all([
          getDashboardOverview(),
          getOnboardingState(),
        ]);
      });
      if (!snapshot || !onboardingState) return;
      setOverview(snapshot);
      setOnboarding(onboardingState);
      localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(onboardingState));
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (error) {
      setLoadError(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshOverview();
    if (!isAuthenticated) return;
    const interval = window.setInterval(() => {
      if (localStorage.getItem('autopus_polling_enabled') === 'false') return;
      if (document.visibilityState !== 'visible') return;
      refreshOverview();
    }, 45000);
    const onAuthSuccess = () => refreshOverview();
    window.addEventListener('ocaas-onboarding-auth-success', onAuthSuccess);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('ocaas-onboarding-auth-success', onAuthSuccess);
    };
  }, [isAuthenticated, matrixRefreshKey, refreshOverview]);

  const runOnboardingBootstrap = useCallback(async (mode: 'first_agent' | 'kaiten_core') => {
    if (!isAuthenticated) {
      onOpenAuthModal();
      return;
    }
    setActionBusy(mode);
    setLoadError(null);
    try {
      const result = await bootstrapOnboarding({
        mode,
        autoStart: true,
      });
      setOnboarding(result.state);
      localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(result.state));
      await refreshOverview();
    } catch (error) {
      setLoadError(parseErrorMessage(error));
    } finally {
      setActionBusy(null);
    }
  }, [isAuthenticated, onOpenAuthModal, refreshOverview]);

  const runVerifyFirstMessage = useCallback(async () => {
    if (!isAuthenticated) {
      onOpenAuthModal();
      return;
    }
    setActionBusy('verify');
    setLoadError(null);
    try {
      const result = await verifyOnboardingFirstMessage();
      setOnboarding(result.state);
      localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(result.state));
      await refreshOverview();
    } catch (error) {
      setLoadError(parseErrorMessage(error));
    } finally {
      setActionBusy(null);
    }
  }, [isAuthenticated, onOpenAuthModal, refreshOverview]);

  const kpis = useMemo(() => {
    if (!overview) {
      return [
        { label: 'Runtime Agents', value: '0', hint: 'No data', icon: Bot },
        { label: 'Requests (24h)', value: '0', hint: 'No data', icon: Activity },
        { label: 'Tokens (24h)', value: '0', hint: 'No data', icon: Gauge },
        { label: 'Fallback Routes', value: '0', hint: 'No data', icon: Network },
      ];
    }

    return [
      {
        label: 'Runtime Agents',
        value: `${overview.summary.runtime.running}/${overview.summary.runtime.total}`,
        hint: `${overview.summary.runtime.error} error`,
        icon: Bot,
      },
      {
        label: 'Requests (24h)',
        value: overview.usage.requests24h.toLocaleString(),
        hint: `${overview.usage.requests7d.toLocaleString()} in 7d`,
        icon: Activity,
      },
      {
        label: 'Tokens (24h)',
        value: overview.usage.tokens24h.toLocaleString(),
        hint: `${overview.usage.tokens7d.toLocaleString()} in 7d`,
        icon: Gauge,
      },
      {
        label: 'Fallback Routes',
        value: String(overview.fallbackRoutes.length),
        hint: 'Cross-provider resilience',
        icon: Network,
      },
    ];
  }, [overview]);

  const formatUsd = (value: number) => `$${value.toFixed(4)}`;

  return (
    <div className="flex h-full flex-col text-[var(--text-primary)] overflow-hidden">
      <div className="px-3 py-3">
        <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-3 shadow-[var(--elev-2)]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Dashboard.autopus.cloud</p>
            <h1 className="text-lg font-semibold">Your Personal AI Team, One Click Away</h1>
            <p className="text-xs text-[var(--text-muted)]">Start with one agent, then expand to the KAITEN core when ready.</p>
          </div>
          <div className="flex items-center gap-2">
            {onSwitchToHub ? (
              <button
                onClick={onSwitchToHub}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)]"
              >
                <Split size={14} />
                Hub
              </button>
            ) : (
              <button
                onClick={() => { window.location.href = HUB_URL; }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)]"
              >
                <Split size={14} />
                Hub
              </button>
            )}
            <button
              onClick={refreshOverview}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] disabled:opacity-60"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {isAuthenticated ? (
              <button
                onClick={onOpenLaunchWizard}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--accent)]/50 bg-[color:var(--accent)]/15 px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[color:var(--accent)]/25"
              >
                <Rocket size={14} />
                Launch Wizard
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)]"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      <AgentsMatrix refreshKey={matrixRefreshKey} />

      <div className="flex-1 overflow-y-auto px-3 pb-6 pt-3">
        <div className="mx-auto w-full max-w-[1500px] space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
              <article key={item.label} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-[var(--elev-1)]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{item.label}</p>
                  <item.icon size={15} className="text-[var(--text-secondary)]" />
                </div>
                <p className="text-2xl font-semibold leading-none text-[var(--text-primary)]">{item.value}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{item.hint}</p>
              </article>
            ))}
          </div>

          {loadError ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">{loadError}</div>
          ) : null}

          {ENABLE_ONBOARDING_V2 ? (
            <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-[var(--elev-1)]">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--text-secondary)]" />
                <h2 className="text-base font-semibold">Guided Onboarding (3 Steps)</h2>
              </div>

              {!isAuthenticated ? (
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4">
                  <p className="mb-2 text-sm text-[var(--text-secondary)]">
                    Step 1: authenticate and run readiness checks (API, auth, runtime).
                  </p>
                  <button
                    onClick={onOpenAuthModal}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-3)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-2)]"
                  >
                    Sign In to Start
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  <article className={cn('rounded-xl border p-3', stepState(onboarding, 1) === 'completed' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-[var(--border-subtle)] bg-[var(--surface-2)]')}>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Step 1</p>
                    <h3 className="text-sm font-semibold">Account + Readiness</h3>
                    <div className="mt-2 space-y-1 text-[11px] text-[var(--text-muted)]">
                      <p>API: {onboarding?.checks.apiReachable ? 'Ready' : 'Waiting'}</p>
                      <p>Auth: {onboarding?.checks.authOk ? 'Ready' : 'Waiting'}</p>
                      <p>Runtime: {onboarding?.checks.runtimeOk ? 'Ready' : 'Waiting'}</p>
                    </div>
                    {stepState(onboarding, 1) === 'completed' ? <CheckCircle2 size={16} className="mt-2 text-emerald-300" /> : null}
                  </article>

                  <article className={cn('rounded-xl border p-3', stepState(onboarding, 2) === 'active' ? 'border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10' : 'border-[var(--border-subtle)] bg-[var(--surface-2)]')}>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Step 2</p>
                    <h3 className="text-sm font-semibold">Deploy</h3>
                    <p className="mb-2 text-[11px] text-[var(--text-muted)]">Default: create first agent. Optional: expand to KAITEN core.</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => runOnboardingBootstrap('first_agent')}
                        disabled={actionBusy !== null}
                        className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-3)] px-2 py-1.5 text-xs font-semibold text-[var(--text-primary)] disabled:opacity-60"
                      >
                        {actionBusy === 'first_agent' ? 'Creating...' : 'Create First Agent'}
                      </button>
                      <button
                        onClick={() => runOnboardingBootstrap('kaiten_core')}
                        disabled={actionBusy !== null}
                        className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-3)] px-2 py-1.5 text-xs font-semibold text-[var(--text-primary)] disabled:opacity-60"
                      >
                        {actionBusy === 'kaiten_core' ? 'Expanding...' : 'Expand to KAITEN Core'}
                      </button>
                    </div>
                  </article>

                  <article className={cn('rounded-xl border p-3', stepState(onboarding, 3) === 'active' ? 'border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10' : 'border-[var(--border-subtle)] bg-[var(--surface-2)]')}>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Step 3</p>
                    <h3 className="text-sm font-semibold">First Success Checkpoint</h3>
                    <div className="mb-2 space-y-1 text-[11px] text-[var(--text-muted)]">
                      <p>Agent created: {onboarding?.checks.agentCreated ? 'Yes' : 'No'}</p>
                      <p>Message roundtrip: {onboarding?.checks.messageRoundtrip ? 'Yes' : 'No'}</p>
                      <p>Feed visible in Hub: {onboarding?.checks.feedVisible ? 'Yes' : 'No'}</p>
                    </div>
                    <button
                      onClick={runVerifyFirstMessage}
                      disabled={actionBusy !== null}
                      className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-3)] px-2 py-1.5 text-xs font-semibold text-[var(--text-primary)] disabled:opacity-60"
                    >
                      {actionBusy === 'verify' ? 'Verifying...' : 'Run First Prompt Check'}
                    </button>
                  </article>
                </div>
              )}

              {onboarding?.status === 'completed' ? (
                <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <p className="mb-2 text-sm font-semibold text-emerald-100">Onboarding completed</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { window.location.href = HUB_URL; }}
                      className="rounded-lg border border-emerald-400/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-100"
                    >
                      Go to Hub Interaction Timeline
                    </button>
                    <button
                      onClick={refreshOverview}
                      className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-3)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]"
                    >
                      Open Control Dashboard
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {overview ? (
            <>
              <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-[var(--elev-1)]">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Runtime Agent Fleet</h3>
                    <span className="text-[11px] text-[var(--text-muted)]">Updated {lastRefresh}</span>
                  </div>
                  <div className="space-y-2">
                    {overview.runtimeAgents.map((agent) => (
                      <div key={agent.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{agent.name}</p>
                          <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', runtimeTone(agent.status))}>
                            {agent.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-[11px] text-[var(--text-muted)] sm:grid-cols-3">
                          <p className="truncate">Model: <span className="text-[var(--text-secondary)]">{agent.model}</span></p>
                          <p>Location: <span className="text-[var(--text-secondary)]">{agent.location}</span></p>
                          <p>Gateway: <span className="text-[var(--text-secondary)]">{agent.gatewayMode}</span></p>
                        </div>
                        {agent.error ? (
                          <p className="mt-2 rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200">{agent.error}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-[var(--elev-1)]">
                  <h3 className="mb-3 text-sm font-semibold">Model Usage (7d)</h3>
                  <div className="space-y-2">
                    {overview.models.length ? overview.models.map((row) => (
                      <div key={row.model} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                        <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                          <span className="truncate font-semibold text-[var(--text-primary)]">{row.model}</span>
                          <span className="text-[var(--text-muted)]">{row.requests} req</span>
                        </div>
                        <div className="h-2 rounded-full bg-black/25">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-[#4ecdc4] to-[#ffd166]"
                            style={{ width: `${Math.max(6, Math.min(100, overview.usage.tokens7d > 0 ? (row.tokens / overview.usage.tokens7d) * 100 : 0))}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-[var(--text-muted)]">{row.tokens.toLocaleString()} tokens</p>
                      </div>
                    )) : (
                      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-muted)]">
                        No usage events yet.
                      </div>
                    )}
                  </div>
                </article>
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-[var(--elev-1)]">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Agent Model + Skills Inventory</h3>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {overview.agentCapabilities?.allSkills?.length || 0} skills tracked
                    </span>
                  </div>
                  <div className="space-y-2">
                    {overview.agentCapabilities?.profiles?.length ? overview.agentCapabilities.profiles.map((agentProfile) => (
                      <div key={agentProfile.profile} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{agentProfile.name}</p>
                          <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                            {agentProfile.profile}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-[var(--text-muted)]">
                          Primary: <span className="text-[var(--text-secondary)]">{agentProfile.primary}</span>
                        </p>
                        <p className="truncate text-[11px] text-[var(--text-muted)]">
                          Fallback: <span className="text-[var(--text-secondary)]">{agentProfile.fallbacks.join(' -> ') || 'none'}</span>
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {agentProfile.skills.length ? agentProfile.skills.map((skill) => (
                            <span key={`${agentProfile.profile}-${skill}`} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                              {skill}
                            </span>
                          )) : (
                            <span className="text-[10px] text-[var(--text-muted)]">No skills detected</span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-muted)]">
                        Capability inventory not available yet.
                      </div>
                    )}
                  </div>
                </article>

                <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-[var(--elev-1)]">
                  <h3 className="mb-3 text-sm font-semibold">Special Model Packages</h3>
                  <div className="space-y-2">
                    {overview.specialModelPackages?.length ? overview.specialModelPackages.map((pkg) => (
                      <div key={pkg.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[var(--text-primary)]">{pkg.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{pkg.id}</span>
                        </div>
                        <p className="mb-1 text-[11px] text-[var(--text-muted)]">{pkg.description}</p>
                        <p className="truncate text-[11px] text-[var(--text-muted)]">
                          Model: <span className="text-[var(--text-secondary)]">{pkg.model}</span>
                        </p>
                        <p className="truncate text-[11px] text-[var(--text-muted)]">
                          Skills: <span className="text-[var(--text-secondary)]">{pkg.skills.join(', ') || 'none'}</span>
                        </p>
                        <p className="truncate text-[11px] text-[var(--text-muted)]">
                          Tasks: <span className="text-[var(--text-secondary)]">{pkg.tasks.join(', ') || 'none'}</span>
                        </p>
                      </div>
                    )) : (
                      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-muted)]">
                        No special model packages configured.
                      </div>
                    )}
                  </div>
                </article>
              </section>

              {isAdmin && overview.coordination ? (
                <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-[var(--elev-1)]">
                  <div className="mb-3 flex items-center gap-2">
                    <Zap size={16} className="text-[var(--text-secondary)]" />
                    <h3 className="text-sm font-semibold">KAITEN Core Control (4-Agent Sync)</h3>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                    {overview.coordination.agents.map((agent) => (
                      <article key={agent.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                        <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{agent.id}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">Active {agent.activeCount}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">In Progress {agent.stateCounts.in_progress}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">Review {agent.stateCounts.review}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">Oldest {agent.oldestActiveMinutes}m</p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-[var(--elev-1)]">
                  <div className="mb-3 flex items-center gap-2">
                    <Network size={15} className="text-[var(--text-secondary)]" />
                    <h3 className="text-sm font-semibold">Fallback Routing Chain</h3>
                  </div>
                  <div className="space-y-2">
                    {overview.fallbackRoutes.map((route) => (
                      <div key={route.step} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <p className="text-xs font-semibold text-[var(--text-primary)]">Step {route.step}: {route.route}</p>
                          <span className="text-[10px] text-[var(--text-muted)]">{route.provider}</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">{route.model}</p>
                        <p className="mt-1 text-[11px] text-[var(--text-muted)]">{route.reason}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-[var(--elev-1)]">
                  <div className="mb-3 flex items-center gap-2">
                    <Layers size={15} className="text-[var(--text-secondary)]" />
                    <h3 className="text-sm font-semibold">Memory and Session Activity</h3>
                  </div>
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {Object.entries(overview.memoryScopes).map(([scope, value]) => (
                      <div key={scope} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 text-center">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">{scope}</p>
                        <p className="text-lg font-semibold text-[var(--text-primary)]">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {overview.recentSessions.map((session) => (
                      <div key={session.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{session.title}</p>
                          <span className="text-[10px] text-[var(--text-muted)]">{session.memoryScope}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {session.agent.name} • {session.messageCount} messages
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-[var(--elev-1)]">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Network size={15} className="text-[var(--text-secondary)]" />
                    <h3 className="text-sm font-semibold">Escalation and Fallback Events (7d)</h3>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Events {overview.routingInsights?.summary.totalEvents ?? 0} • Escalations {overview.routingInsights?.summary.totalEscalations ?? 0} • Fallbacks {overview.routingInsights?.summary.totalFallbacks ?? 0}
                  </p>
                </div>
                <div className="mb-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Estimated Cost</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">{formatUsd(overview.routingInsights?.summary.estimatedCostUsd ?? 0)}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Incremental Impact</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">{formatUsd(overview.routingInsights?.summary.incrementalCostUsd ?? 0)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {overview.routingInsights?.byAgent?.length ? overview.routingInsights.byAgent.map((agent) => (
                    <div key={agent.agentId} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--text-primary)]">{agent.agentName}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          E:{agent.escalations} F:{agent.fallbacks} • {formatUsd(agent.incrementalCostUsd)}
                        </p>
                      </div>
                      <p className="mb-2 text-[11px] text-[var(--text-muted)]">
                        Primary {agent.primaryModel}
                      </p>
                      <div className="space-y-1">
                        {agent.events.map((event, idx) => (
                          <div key={`${agent.agentId}-${idx}-${event.timestamp}`} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] px-2 py-1.5 text-[11px]">
                            <span className="font-medium text-[var(--text-primary)]">{event.eventType}</span>
                            <span className="truncate text-[var(--text-muted)]">{event.fromModel} → {event.toModel}</span>
                            <span className="text-[var(--text-muted)]">{event.tokens.toLocaleString()} tok</span>
                            <span className="text-[var(--text-muted)]">{formatUsd(event.incrementalCostUsd)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-muted)]">
                      No escalation or fallback events detected in the last 7 days.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-[var(--elev-1)]">
                <div className="mb-3 flex items-center gap-2">
                  <BarChart3 size={15} className="text-[var(--text-secondary)]" />
                  <h3 className="text-sm font-semibold">Operational Alerts</h3>
                </div>
                <div className="space-y-2">
                  {overview.alerts.length ? (
                    overview.alerts.map((alert) => (
                      <div key={alert.code} className={cn('flex items-start gap-2 rounded-xl border px-3 py-2 text-sm', alertTone[alert.level])}>
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        <span>{alert.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                      <CheckCircle2 size={14} className="mr-1 inline-block" />
                      All clear. No active control-plane alerts.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-[var(--elev-1)]">
                <div className="mb-2 flex items-center gap-2">
                  <Zap size={15} className="text-[var(--text-secondary)]" />
                  <h3 className="text-sm font-semibold">Bootstrap Flow</h3>
                </div>
                <p className="mb-3 text-sm text-[var(--text-muted)]">
                  Start with one agent, validate output quality, then scale to a full decentralized team with monitored fallbacks.
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {['Create first agent', 'Enable monitoring', 'Scale to multi-agent mesh'].map((step, index) => (
                    <div key={step} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                      <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Step {index + 1}</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{step}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
