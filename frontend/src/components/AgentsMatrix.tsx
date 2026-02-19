import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { getKaitenAgentsStatus, type KAITENAgentRuntime } from '../api';

type MatrixStatus = 'RUNNING' | 'STOPPED' | 'ERROR' | 'UNKNOWN' | 'unregistered';
type RuntimeLocation = 'Local' | 'Cloud' | 'Unknown';

interface MatrixAgent {
  id: string;
  name: string;
  status: MatrixStatus;
  location: RuntimeLocation;
  model: string;
  configuredModel?: string | null;
  heartbeatAge: string;
  lastUpdated: string;
  lastError: string | null;
  source: 'live' | 'placeholder';
}

const statusStyles: Record<MatrixStatus, string> = {
  RUNNING: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
  STOPPED: 'text-zinc-300 bg-zinc-500/15 border-zinc-500/25',
  ERROR: 'text-red-400 bg-red-500/15 border-red-500/25',
  UNKNOWN: 'text-amber-300 bg-amber-500/15 border-amber-500/25',
  unregistered: 'text-zinc-400 bg-zinc-600/15 border-zinc-600/25',
};

const locationStyles: Record<RuntimeLocation, string> = {
  Local: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
  Cloud: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
  Unknown: 'text-zinc-400 bg-zinc-600/15 border-zinc-600/25',
};

const formatHeartbeatAge = (checkedAt?: string) => {
  if (!checkedAt) return 'n/a';
  const ms = Date.now() - new Date(checkedAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return 'n/a';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

interface AgentsMatrixProps {
  refreshKey?: number;
}

export default function AgentsMatrix({ refreshKey = 0 }: AgentsMatrixProps) {
  const [items, setItems] = useState<MatrixAgent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('ocaas_token');
    const now = new Date().toLocaleTimeString();

    if (!token) {
      setItems([]);
      setLastUpdated(now);
      return;
    }

    setIsLoading(true);
    try {
      const runtimes = await getKaitenAgentsStatus().catch(() => [] as KAITENAgentRuntime[]);
      const built = runtimes.map((live) => ({
        id: live.id,
        name: live.name || live.id,
        status: live.status,
        location: live.location,
        model: live.model || 'unknown',
        configuredModel: live.configuredPrimaryModel || null,
        heartbeatAge: formatHeartbeatAge(live.checkedAt),
        lastUpdated: now,
        lastError: live.error,
        source: 'live' as const,
      }));

      setItems(built);
      setLastUpdated(now);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh, refreshKey]);

  const headerText = useMemo(() => lastUpdated ?? 'Never', [lastUpdated]);

  return (
    <section className="border-b border-white/5 bg-[#0f0f0f] px-4 py-3">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Agent Runtime Matrix</p>
            <p className="text-[11px] text-zinc-500">Last refresh: {headerText}</p>
          </div>
          <button
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1b1b1b] px-2.5 py-1.5 text-[11px] text-zinc-300 transition hover:bg-[#232323] disabled:opacity-60"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
          {items.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#171717] p-3 text-xs text-zinc-500">
              No runtime agents discovered yet.
            </div>
          ) : items.map((item) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-[#171717] p-2.5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">{item.name}</h3>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${locationStyles[item.location]}`}>
                  {item.location}
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-zinc-400">
                <div className="flex items-center justify-between gap-2">
                  <span>Status</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] ${statusStyles[item.status]}`}>{item.status}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Model</span>
                  <span className="truncate text-zinc-200">{item.configuredModel || item.model}</span>
                </div>
                {item.configuredModel && item.model && item.configuredModel !== item.model ? (
                  <div className="flex items-center justify-between gap-2">
                    <span>Active Runtime</span>
                    <span className="truncate text-zinc-400">{item.model}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-2">
                  <span>Heartbeat</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-zinc-300">{item.heartbeatAge}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Backend</span>
                  <span className="text-zinc-300">{item.source === 'live' ? 'live' : 'unregistered'}</span>
                </div>
                {item.lastError ? (
                  <div className="flex items-start gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 p-1.5 text-[10px] text-red-300">
                    <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{item.lastError}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-2">
                  <span>Updated</span>
                  <span className="text-zinc-500">{item.lastUpdated}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
