import { useOutletContext } from 'react-router-dom';
import { MessageList } from '../components/chat/MessageList';
import { PromptInput } from '../components/chat/PromptInput';
import { ContextPanel } from '../components/chat/ContextPanel';
import { Settings, CloudOff, X, Loader2, CheckCircle2, CircleDollarSign } from 'lucide-react';
import { cn } from '../utils';
import { VibeSliders } from '../components/VibeSliders';
import type { UseChatState } from '../hooks/useChatState';

export default function ChatPage() {
  const chat = useOutletContext<UseChatState>();
  const {
    selectedAgent,
    selectedSession,
    messages,
    input,
    setInput,
    config,
    setConfig,
    isConfigSaving,
    lastSaved,
    isLoading,
    isRightPanelOpen,
    activeRightPanelTab,
    setActiveRightPanelTab,
    error,
    setError,
    isAuthenticated,
    isAutoRefreshEnabled,
    setIsAutoRefreshEnabled,
    playgroundMode,
    setPlaygroundMode,
    handleSend,
    toggleRightPanel,
    coordinationOverview,
  } = chat;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Chat main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Chat header */}
        <div className="flex h-12 items-center justify-between border-b border-[var(--border-subtle)] px-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {selectedAgent?.name || 'Select a partner'}
              </span>
              {selectedSession && (
                <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[200px]">
                  {selectedSession.title}
                  {selectedSession.memoryScope === 'TELEGRAM' ? ' · Mirrored from Telegram/OpenClaw' : ''}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="hidden sm:flex items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-0.5">
              {(['guided', 'pro'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPlaygroundMode(mode)}
                  className={cn(
                    'px-3 py-1 text-[11px] font-bold rounded-lg transition-all capitalize',
                    playgroundMode === mode
                      ? 'bg-white text-black shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={toggleRightPanel}
              className={cn(
                'rounded-lg p-2 transition-all',
                isRightPanelOpen
                  ? 'bg-[var(--surface-2)] text-white'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-secondary)]'
              )}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between border-b border-red-500/20 bg-[var(--error-muted)] px-4 py-2 text-xs text-red-400 animate-slide-in-from-top">
            <div className="flex items-center gap-2">
              <CloudOff size={14} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="rounded p-1 transition hover:bg-red-500/10">
              <X size={14} />
            </button>
          </div>
        )}

        {selectedSession?.memoryScope === 'TELEGRAM' && (
          <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
            This thread is mirrored from Telegram/OpenClaw. Send from source channel.
          </div>
        )}

        {/* Messages */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          playgroundMode={playgroundMode}
          onPromptSelect={setInput}
          isAuthenticated={isAuthenticated}
          onAuthOpen={() => chat.setShowAuthModal(true)}
        />

        <PromptInput input={input} setInput={setInput} onSend={handleSend} isLoading={isLoading} />
      </div>

      {/* Right panel */}
      <aside
        className={cn(
          'border-l border-[var(--border-subtle)] bg-[var(--surface-1)] transition-all duration-300 flex flex-col',
          isRightPanelOpen
            ? 'w-80 max-md:absolute max-md:right-0 max-md:top-0 max-md:h-full max-md:z-30 max-md:shadow-2xl'
            : 'w-0 overflow-hidden'
        )}
      >
        {/* Panel tabs */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-3">
          <div className="flex items-center gap-0.5 rounded-xl bg-[var(--surface-0)] p-0.5">
            {(['context', 'settings', 'interactions', 'coordination'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveRightPanelTab(tab)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-[11px] font-bold capitalize transition-all',
                  activeRightPanelTab === tab
                    ? 'bg-[var(--surface-2)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={toggleRightPanel}
            className="rounded-lg p-1 text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {activeRightPanelTab === 'context' && (
            <div className="p-4">
              <ContextPanel
                activeSkills={[]}
                recentMemories={[]}
                suggestedPrompts={[]}
                onPromptClick={(prompt) => {
                  setInput(prompt);
                  handleSend();
                }}
              />
            </div>
          )}

          {activeRightPanelTab === 'settings' && (
            <div className="p-4 space-y-4">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Agent Vibe
                </p>
                <VibeSliders
                  config={config}
                  onChange={(newConfig) => setConfig(newConfig)}
                />
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                <button
                  onClick={() => (window.location.href = '/settings')}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-3)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                  Advanced Settings
                </button>
              </div>
            </div>
          )}

          {activeRightPanelTab === 'interactions' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-label text-[var(--text-muted)]">Recent Events</span>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] cursor-pointer">Live</label>
                  <input
                    type="checkbox"
                    checked={isAutoRefreshEnabled}
                    onChange={(e) => setIsAutoRefreshEnabled(e.target.checked)}
                    className="h-3.5 w-3.5 rounded accent-[var(--accent)]"
                  />
                </div>
              </div>
              {messages.slice(-5).reverse().map((m) => (
                <div key={m.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 transition hover:border-[var(--border-default)]">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase',
                        m.role === 'user'
                          ? 'bg-[var(--accent-muted)] text-[var(--accent-hover)]'
                          : 'bg-[var(--surface-3)] text-white'
                      )}
                    >
                      {m.role}
                    </span>
                    <span className="text-[9px] text-[var(--text-muted)]">{new Date(m.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="line-clamp-3 text-xs text-[var(--text-secondary)]">{m.content}</p>
                </div>
              ))}
            </div>
          )}

          {activeRightPanelTab === 'coordination' && (
            <div className="p-4 space-y-4">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                <p className="text-label text-[var(--text-muted)] mb-2">Shared Memory & Cooperation</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Agents share context through coordination files and fallback chains.
                </p>
              </div>
              {coordinationOverview && (
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                  <p className="text-xs font-semibold text-[var(--text-primary)] mb-2">Assignee Load</p>
                  {Object.entries(coordinationOverview.assigneeLoad || {}).map(([assignee, load]: any) => (
                    <div key={assignee} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-2 mb-1 text-[11px] text-[var(--text-secondary)]">
                      {assignee}: total {load.total}, in-progress {load.inProgress}, review {load.review}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Panel footer */}
        <div className="border-t border-[var(--border-subtle)] p-3">
          {activeRightPanelTab === 'settings' ? (
            <div className="flex items-center gap-2 px-1">
              {isConfigSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin text-[var(--accent)]" />
                  <span className="text-label text-[var(--text-muted)]">Syncing...</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-label text-[var(--text-muted)]">
                    Synced {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </>
              ) : (
                <span className="text-label text-[var(--text-muted)]">Cloud Auto-save</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-1">
              <CircleDollarSign size={14} className="text-[var(--accent)]" />
              <span className="text-label text-[var(--text-muted)]">Usage: $0.00 this session</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
