import { useState, useCallback, useEffect } from 'react';
import { Sparkles, AlignLeft, Zap } from 'lucide-react';
import { cn } from '../utils';
import type { AgentConfig } from '../api';

interface VibeValues {
  /** 0 = precise/logical, 100 = wild/imaginative */
  creativity: number;
  /** 0 = brief/concise, 100 = thorough/detailed */
  detail: number;
}

interface VibeSlidersProps {
  config: AgentConfig | null;
  onChange: (config: AgentConfig) => void;
  disabled?: boolean;
}

/**
 * Map human-friendly vibe values to raw model parameters.
 *
 * Creativity (0-100) → temperature (0.0-1.5):
 *   Linear: temp = c * 0.015. Validated against existing presets:
 *     precise  c=13 → 0.20,  balanced c=47 → 0.71,  creative c=73 → 1.10
 *
 * Detail (0-100) → maxTokens (512-4096):
 *   Linear: tokens = 512 + d * 35.84, rounded to nearest 64.
 *     precise  d=30 → 1587,  balanced d=43 → 2053,  creative d=58 → 2591
 */
function vibeToParams(vibes: VibeValues): { temperature: number; maxTokens: number } {
  const temperature = Math.round(vibes.creativity * 0.015 * 100) / 100;
  const rawTokens = 512 + (vibes.detail / 100) * 3584;
  const maxTokens = Math.round(rawTokens / 64) * 64;
  return { temperature, maxTokens };
}

/** Reverse: given raw params, estimate the closest vibe slider positions. */
function paramsToVibe(temperature: number, maxTokens: number): VibeValues {
  const creativity = Math.round(Math.min(100, Math.max(0, (temperature / 1.5) * 100)));
  const detail = Math.round(Math.min(100, Math.max(0, ((maxTokens - 512) / 3584) * 100)));
  return { creativity, detail };
}

const PRESETS: { label: string; icon: typeof Sparkles; vibes: VibeValues }[] = [
  { label: 'Precise', icon: Zap, vibes: { creativity: 13, detail: 30 } },
  { label: 'Balanced', icon: AlignLeft, vibes: { creativity: 47, detail: 43 } },
  { label: 'Creative', icon: Sparkles, vibes: { creativity: 73, detail: 58 } },
];

export function VibeSliders({ config, onChange, disabled }: VibeSlidersProps) {
  const [vibes, setVibes] = useState<VibeValues>({ creativity: 47, detail: 43 });
  const [activePreset, setActivePreset] = useState<string | null>('Balanced');

  // Sync slider positions when config loads or changes externally
  useEffect(() => {
    if (!config) return;
    const derived = paramsToVibe(config.temperature, config.maxTokens);
    setVibes(derived);

    // Check if it matches a preset
    const match = PRESETS.find(
      (p) => Math.abs(p.vibes.creativity - derived.creativity) < 8 && Math.abs(p.vibes.detail - derived.detail) < 8
    );
    setActivePreset(match?.label ?? null);
  }, [config?.temperature, config?.maxTokens]);

  const handleSliderChange = useCallback(
    (key: keyof VibeValues, value: number) => {
      if (!config || disabled) return;
      const next = { ...vibes, [key]: value };
      setVibes(next);
      setActivePreset(null);
      const params = vibeToParams(next);
      onChange({ ...config, ...params });
    },
    [config, vibes, disabled, onChange]
  );

  const applyPreset = useCallback(
    (preset: (typeof PRESETS)[number]) => {
      if (!config || disabled) return;
      setVibes(preset.vibes);
      setActivePreset(preset.label);
      const params = vibeToParams(preset.vibes);
      onChange({ ...config, ...params });
    },
    [config, disabled, onChange]
  );

  if (!config) return null;

  return (
    <div className="space-y-4">
      {/* Preset quick-picks */}
      <div className="flex gap-1.5">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = activePreset === preset.label;
          return (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              disabled={disabled}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-bold transition-all',
                isActive
                  ? 'bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/30'
                  : 'bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--text-secondary)] hover:border-[var(--border-default)]',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Icon size={12} />
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Creativity slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Creativity
          </span>
          <span className="text-[10px] tabular-nums text-[var(--text-muted)]">
            {vibes.creativity}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={vibes.creativity}
          onChange={(e) => handleSliderChange('creativity', Number(e.target.value))}
          disabled={disabled}
          className="vibe-slider w-full"
        />
        <div className="flex justify-between text-[9px] text-[var(--text-muted)]">
          <span>Logical</span>
          <span>Imaginative</span>
        </div>
      </div>

      {/* Detail slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Detail
          </span>
          <span className="text-[10px] tabular-nums text-[var(--text-muted)]">
            {vibes.detail}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={vibes.detail}
          onChange={(e) => handleSliderChange('detail', Number(e.target.value))}
          disabled={disabled}
          className="vibe-slider w-full"
        />
        <div className="flex justify-between text-[9px] text-[var(--text-muted)]">
          <span>Concise</span>
          <span>Thorough</span>
        </div>
      </div>

      {/* Raw values preview (collapsed by default in guided mode) */}
      <details className="group">
        <summary className="cursor-pointer text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition">
          Raw parameters
        </summary>
        <div className="mt-2 rounded-lg bg-[var(--surface-0)] border border-[var(--border-subtle)] p-2 text-[10px] font-mono text-[var(--text-muted)] space-y-0.5">
          <div>temperature: {config.temperature}</div>
          <div>maxTokens: {config.maxTokens}</div>
        </div>
      </details>
    </div>
  );
}
