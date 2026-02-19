import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Rocket, X } from 'lucide-react';
import {
  bulkCreateAgents,
  getAgentPresets,
  type BulkCreateAgentsSummary,
  type LaunchPresetSet,
} from '../api';
import { cn } from '../utils';

type EditableAgent = {
  name: string;
  model: string;
  include: boolean;
};

interface KaitenLaunchWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function KaitenLaunchWizard({ isOpen, onClose, onSuccess }: KaitenLaunchWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [presets, setPresets] = useState<LaunchPresetSet[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [agents, setAgents] = useState<EditableAgent[]>([]);
  const [autoStart, setAutoStart] = useState(true);
  const [summary, setSummary] = useState<BulkCreateAgentsSummary | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadPresets = async () => {
      setIsLoadingPresets(true);
      setLoadError(null);
      setSummary(null);
      setStep(1);
      setAutoStart(true);

      try {
        const data = await getAgentPresets();
        setPresets(data);
        const first = data[0];
        setSelectedPresetId(first?.id ?? '');
      } catch (error: any) {
        setLoadError(error?.response?.data?.message || error?.message || 'Failed to load presets');
        setPresets([]);
        setSelectedPresetId('');
      } finally {
        setIsLoadingPresets(false);
      }
    };

    loadPresets();
  }, [isOpen]);

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId) ?? presets[0],
    [presets, selectedPresetId]
  );

  useEffect(() => {
    if (!selectedPreset) return;
    setAgents(selectedPreset.agents.map((agent) => ({ ...agent, include: agent.include !== false })));
  }, [selectedPreset]);

  const includedCount = agents.filter((agent) => agent.include).length;

  const updateAgent = (index: number, field: keyof EditableAgent, value: string | boolean) => {
    setAgents((prev) => prev.map((agent, i) => (i === index ? { ...agent, [field]: value } : agent)));
  };

  const handleLaunch = async () => {
    const payloadAgents = agents
      .filter((agent) => agent.include)
      .map((agent) => ({ name: agent.name.trim(), model: agent.model.trim() }))
      .filter((agent) => agent.name && agent.model);

    if (payloadAgents.length === 0) return;

    setIsLaunching(true);
    setLoadError(null);

    try {
      const result = await bulkCreateAgents({
        presetId: selectedPreset?.id,
        autoStart,
        agents: payloadAgents,
      });
      setSummary(result);
      setStep(3);
      onSuccess();
    } catch (error: any) {
      setLoadError(error?.response?.data?.message || error?.message || 'Failed to launch agent');
    } finally {
      setIsLaunching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#121212] text-zinc-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-white sm:text-lg">Create New Agent</h2>
            <p className="text-[11px] text-zinc-500 sm:text-xs">Setup a new autonomous agent</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200">
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-white/10 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            {[1, 2, 3].map((num) => (
              <div key={num} className={cn('rounded-full px-2 py-1', step === num ? 'bg-white text-black' : 'bg-white/5 text-zinc-400')}>
                Step {num}
              </div>
            ))}
          </div>
        </div>

        <div className="max-h-[68vh] space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          {loadError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{loadError}</div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">Choose a starter template</p>
              {isLoadingPresets ? (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Loader2 size={14} className="animate-spin" /> Loading presets...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={cn(
                        'rounded-xl border px-3 py-3 text-left transition',
                        selectedPresetId === preset.id
                          ? 'border-indigo-400/60 bg-indigo-500/10'
                          : 'border-white/10 bg-[#1a1a1a] hover:bg-[#202020]'
                      )}
                    >
                      <p className="text-sm font-medium text-zinc-100">{preset.name}</p>
                      {preset.description && <p className="mt-1 text-xs text-zinc-400">{preset.description}</p>}
                      <p className="mt-2 text-[11px] text-zinc-500">{preset.agents.map((a) => a.name).join(' • ')}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">Edit agent details</p>
              <div className="space-y-2">
                {agents.map((agent, index) => (
                  <div key={`${agent.name}-${index}`} className="grid grid-cols-1 gap-2 rounded-xl border border-white/10 bg-[#1a1a1a] p-3 sm:grid-cols-[auto,1fr,1fr] sm:items-center">
                    <div className="inline-flex items-center gap-2 text-xs text-zinc-500">Single agent mode</div>
                    <input
                      value={agent.name}
                      onChange={(e) => updateAgent(index, 'name', e.target.value)}
                      className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                      placeholder="Agent name"
                    />
                    <input
                      value={agent.model}
                      onChange={(e) => updateAgent(index, 'model', e.target.value)}
                      className="rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                      placeholder="Model"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500">Plan limit: 1 active agent</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {!summary ? (
                <>
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={autoStart}
                      onChange={(e) => setAutoStart(e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 bg-[#111]"
                    />
                    Auto start created agents
                  </label>

                  <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-3 text-xs text-zinc-300">
                    <p className="mb-2 text-zinc-100">Ready to launch:</p>
                    <ul className="space-y-1 text-zinc-400">
                      {agents
                        .filter((agent) => agent.include)
                        .map((agent, index) => (
                          <li key={`${agent.name}-${index}`}>{agent.name} · {agent.model}</li>
                        ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 size={16} />
                    <span className="text-sm font-medium">Launch completed</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-3 text-xs text-zinc-300">
                    <p>Created: <span className="text-emerald-300">{summary.created.length}</span></p>
                    <p>Failed: <span className="text-red-300">{summary.failed.length}</span></p>
                    {summary.failed.length > 0 && (
                      <ul className="mt-2 space-y-1 text-red-200">
                        {summary.failed.map((item, i) => (
                          <li key={`${item.name}-${i}`}>{item.name}: {item.error || 'Failed'}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-[11px] text-zinc-500">
            {step < 3 ? 'Next: configure and confirm launch' : summary ? 'Agent list and matrix refreshed' : 'Confirm and launch now'}
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && !summary && (
              <button onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/5">
                Back
              </button>
            )}
            {summary ? (
              <button onClick={onClose} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:bg-zinc-200">
                Done
              </button>
            ) : step < 3 ? (
              <button
                onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                disabled={(step === 1 && !selectedPreset) || (step === 2 && includedCount === 0)}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleLaunch}
                disabled={isLaunching || includedCount === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLaunching ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                Launch Agent
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
