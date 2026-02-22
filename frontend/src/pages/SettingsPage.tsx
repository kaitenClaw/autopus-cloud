import { useEffect, useMemo, useState } from 'react';
import { getModelCatalog, updateModelChainForProfile, type ModelCatalog } from '../api';
import { StripeCheckout } from '../components/billing/StripeCheckout';

type SettingsTab = 'models' | 'billing' | 'app' | 'account' | 'integrations' | 'advanced';

const TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: 'models', label: 'Models' },
  { id: 'billing', label: 'Billing' },
  { id: 'app', label: 'App' },
  { id: 'account', label: 'Account' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'advanced', label: 'Advanced' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('models');
  const [catalog, setCatalog] = useState<ModelCatalog | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string>('kaiten');
  const [primary, setPrimary] = useState('');
  const [fallbacks, setFallbacks] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState<boolean>(() => localStorage.getItem('autopus_polling_enabled') !== 'false');
  const [liveFeedLimit, setLiveFeedLimit] = useState<number>(() => Number(localStorage.getItem('autopus_feed_limit') || 80));
  const [streamFallbackEnabled, setStreamFallbackEnabled] = useState<boolean>(() => localStorage.getItem('autopus_stream_fallback') !== 'false');

  const profiles = useMemo(
    () => Object.keys(catalog?.profiles || {}).sort((a, b) => (a === 'kaiten' ? -1 : a.localeCompare(b))),
    [catalog]
  );

  useEffect(() => {
    const load = async () => {
      const next = await getModelCatalog();
      setCatalog(next);
      const defaultProfile = next.profiles?.kaiten ? 'kaiten' : Object.keys(next.profiles || {})[0] || 'kaiten';
      setSelectedProfile(defaultProfile);
    };
    load().catch(() => setCatalog({ models: [], defaults: null, profiles: {}, generatedAt: null }));
  }, []);

  useEffect(() => {
    const chain = catalog?.profiles?.[selectedProfile] || catalog?.defaults || null;
    setPrimary(chain?.primary || '');
    setFallbacks((chain?.fallbacks || []).join(', '));
  }, [catalog, selectedProfile]);

  const saveModelProfile = async () => {
    if (!selectedProfile || !primary.trim()) return;
    setSaving(true);
    setStatus(null);
    try {
      const payload = {
        primary: primary.trim(),
        fallbacks: fallbacks.split(',').map((v) => v.trim()).filter(Boolean),
      };
      await updateModelChainForProfile(selectedProfile, payload);
      const next = await getModelCatalog();
      setCatalog(next);
      setStatus('Model chain saved.');
    } catch {
      setStatus('Failed to save model chain.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('autopus_polling_enabled', pollingEnabled ? 'true' : 'false');
  }, [pollingEnabled]);

  useEffect(() => {
    localStorage.setItem('autopus_feed_limit', String(liveFeedLimit));
  }, [liveFeedLimit]);

  useEffect(() => {
    localStorage.setItem('autopus_stream_fallback', streamFallbackEnabled ? 'true' : 'false');
  }, [streamFallbackEnabled]);

  return (
    <div className="h-full overflow-y-auto bg-[var(--surface-0)] p-4 text-[var(--text-primary)]">
      <div className="mx-auto w-full max-w-[1100px]">
        <h1 className="mb-1 text-xl font-semibold">Settings</h1>
        <p className="mb-4 text-sm text-[var(--text-muted)]">Manage model routing, app behavior, and workspace configuration.</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                tab === item.id
                  ? 'border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--text-primary)]'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-muted)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'models' && (
          <section className="space-y-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4">
            <h2 className="text-sm font-semibold">Model Profiles</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs text-[var(--text-muted)]">
                Profile
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2 text-sm"
                >
                  {profiles.map((profile) => (
                    <option key={profile} value={profile}>
                      {profile}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-[var(--text-muted)]">
                Primary model
                <input
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2 text-sm"
                />
              </label>
            </div>
            <label className="block text-xs text-[var(--text-muted)]">
              Fallbacks (comma separated)
              <input
                value={fallbacks}
                onChange={(e) => setFallbacks(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2 text-sm"
              />
            </label>
            <button
              onClick={saveModelProfile}
              disabled={saving}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Model Chain'}
            </button>
            {status ? <p className="text-xs text-[var(--text-muted)]">{status}</p> : null}
          </section>
        )}

        {tab === 'billing' && (
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-6">
                <h3 className="text-sm font-semibold mb-2">Current Plan</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-bold uppercase tracking-wider">Free Tier</span>
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  Your team is currently on the free plan with limited runtime hours and shared resources.
                </p>
              </div>

              <StripeCheckout 
                planName="Pro Accelerator" 
                amount={49} 
                onSuccess={() => setStatus('Upgraded successfully!')}
                onCancel={() => {}}
              />
            </div>
          </section>
        )}

        {tab === 'app' && (
          <section className="space-y-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4">
            <h2 className="text-sm font-semibold">App Behavior</h2>
            <label className="flex items-center justify-between text-sm">
              <span>Enable background polling</span>
              <input type="checkbox" checked={pollingEnabled} onChange={(e) => setPollingEnabled(e.target.checked)} />
            </label>
            <label className="block text-xs text-[var(--text-muted)]">
              Live feed default limit
              <input
                type="number"
                min={20}
                max={200}
                value={liveFeedLimit}
                onChange={(e) => setLiveFeedLimit(Math.max(20, Math.min(200, Number(e.target.value) || 80)))}
                className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2 text-sm"
              />
            </label>
            <label className="flex items-center justify-between text-sm">
              <span>Fallback to non-stream reply on stream error</span>
              <input type="checkbox" checked={streamFallbackEnabled} onChange={(e) => setStreamFallbackEnabled(e.target.checked)} />
            </label>
          </section>
        )}

        {tab === 'account' && <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-muted)]">Account management is available in this release through dashboard auth/profile controls.</section>}
        {tab === 'integrations' && <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-muted)]">Integrations setup (Telegram, Gmail, X, others) will be managed here.</section>}
        {tab === 'advanced' && <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-muted)]">Advanced runtime, diagnostics, and export controls will be expanded here.</section>}
      </div>
    </div>
  );
}
