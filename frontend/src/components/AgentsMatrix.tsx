import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api, getAgents, getConfig, type Agent } from '../api';

type MatrixStatus = 'RUNNING' | 'STOPPED' | 'ERROR' | 'unknown' | 'unregistered';
type RuntimeLocation = 'Local' | 'Cloud' | 'Unknown';

interface MatrixAgent {
  id: string;
  name: string;
  status: MatrixStatus;
  location: RuntimeLocation;
  model: string;
  lastUpdated: string;
  source: 'live' | 'placeholder';
}

const TARGET_AGENTS = ['Prime', 'Forge', 'Sight', 'Pulse'];
const normalize = (value: string) => value.trim().toLowerCase();

const statusStyles: Record<MatrixStatus, string> = {
  RUNNING: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
  STOPPED: 'text-zinc-300 bg-zinc-500/15 border-zinc-500/25',
  ERROR: 'text-red-400 bg-red-500/15 border-red-500/25',
  unknown: 'text-amber-300 bg-amber-500/15 border-amber-500/25',
  unregistered: 'text-zinc-400 bg-zinc-600/15 border-zinc-600/25',
};

const locationStyles: Record<RuntimeLocation, string> = {
  Local: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
  Cloud: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
  Unknown: 'text-zinc-400 bg-zinc-600/15 border-zinc-600/25',
};

const inferStatus = (agent: Agent & Record<string, any>): MatrixStatus => {
  const raw = String(agent.status ?? 'unknown').toLowerCase();
  if (raw.includes('run')) return 'RUNNING';
  if (raw.includes('stop')) return 'STOPPED';
  if (raw.includes('error') || raw.includes('fail')) return 'ERROR';
  return 'unknown';
};

const inferLocation = (runtimeMode?: string): RuntimeLocation => {
  if (runtimeMode === 'local') return 'Local';
  if (runtimeMode === 'cloud') return 'Cloud';
  return 'Unknown';
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
      setItems(TARGET_AGENTS.map((name) => ({
        id: `placeholder-${name}`,
        name,
        status: 'unregistered',
        location: 'Unknown',
        model: 'n/a',
        lastUpdated: now,
        source: 'placeholder',
      })));
      setLastUpdated(now);
      return;
    }

    setIsLoading(true);
    try {
      const [agents, runtimeRes] = await Promise.all([
        getAgents().catch(() => [] as Agent[]),
        api.get('/system/runtime').catch(() => null),
      ]);

      const runtimeMode = runtimeRes?.data?.data?.runtimeMode as string | undefined;
      const indexed = new Map(agents.map((a: any) => [normalize(a.name), a]));

      const built = await Promise.all(
        TARGET_AGENTS.map(async (targetName) => {
          const live = indexed.get(normalize(targetName));
          if (!live) {
            return {
              id: `placeholder-${targetName}`,
              name: targetName,
              status: 'unregistered' as const,
              location: inferLocation(runtimeMode),
              model: 'n/a',
              lastUpdated: now,
              source: 'placeholder' as const,
            };
          }

          let model = 'n/a';
          try {
            const cfg = await getConfig(live.id);
            if (cfg?.model) model = cfg.model;
          } catch {
            model = 'n/a';
          }

          return {
            id: live.id,
            name: targetName,
            status: inferStatus(live),
            location: inferLocation(runtimeMode),
            model,
            lastUpdated: now,
            source: 'live' as const,
          };
        })
      );

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
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">KAITEN Agents Live Matrix</p>
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

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {items.map((item) => (
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
                  <span className="truncate text-zinc-200">{item.model}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Backend</span>
                  <span className="text-zinc-300">{item.source === 'live' ? 'live' : 'unregistered'}</span>
                </div>
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
