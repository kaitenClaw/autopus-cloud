import { ActivityStream } from '../hub/ActivityStream';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  ChevronDown,
  CloudOff,
  MessageSquare,
  RefreshCw,
  Rocket,
  Search,
  Split,
} from 'lucide-react';
import AgentsMatrix from '../AgentsMatrix';
import {
  getHubFeed,
  getHubThread,
  type HubFeedEvent,
  type HubFeedQuery,
} from '../../api';
import { cn } from '../../utils';
import { runPolledTask, shouldPoll } from '../../utils/polling';
import type { UseChatState } from '../../hooks/useChatState';

interface HubSurfaceProps {
  chat: UseChatState;
  onOpenLaunchWizard: () => void;
  onOpenAuthModal: () => void;
  onSwitchToDashboard?: () => void;
}

type MobilePane = 'chat' | 'feed';
type FeedDirection = 'all' | 'user_to_agent' | 'agent_to_user' | 'agent_to_agent' | 'system';
type FeedEventType = 'all' | 'message' | 'handoff' | 'task_transition' | 'system';
type FeedScope = 'workspace' | 'system' | 'aggregate';
type FeedTimeWindow = 'all' | '1h' | '24h' | '7d' | '30d';

const directionLabel: Record<FeedDirection, string> = {
  all: 'All',
  user_to_agent: 'User -> Agent',
  agent_to_user: 'Agent -> User',
  agent_to_agent: 'Agent -> Agent',
  system: 'System',
};

const eventTypeLabel: Record<FeedEventType, string> = {
  all: 'All Types',
  message: 'Messages',
  handoff: 'Handoffs',
  task_transition: 'Task Sync',
  system: 'System',
};

const scopeLabel: Record<FeedScope, string> = {
  workspace: 'Workspace',
  system: 'System',
  aggregate: 'Aggregate',
};

const timeWindowLabel: Record<FeedTimeWindow, string> = {
  all: 'All time',
  '1h': 'Last 1 hour',
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
};

const parseErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const maybeAxios = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return maybeAxios.response?.data?.message || maybeAxios.message || 'Failed to load live feed';
  }
  return 'Failed to load live feed';
};

const formatTs = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function HubSurface({
  chat,
  onOpenLaunchWizard,
  onOpenAuthModal,
  onSwitchToDashboard,
}: HubSurfaceProps) {
  const {
    agents,
    selectedAgent,
    setSelectedAgent,
    sessions,
    selectedSession,
    setSelectedSession,
    messages,
    isAuthenticated,
    matrixRefreshKey,
    currentUser,
    highlightMessageId,
    setHighlightMessageId,
  } = chat;

  const isAdmin = currentUser.role === 'ADMIN';
  const [mobilePane, setMobilePane] = useState<MobilePane>('chat');
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedEvents, setFeedEvents] = useState<HubFeedEvent[]>([]);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [lastFeedRefresh, setLastFeedRefresh] = useState<string>('Never');
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [scope, setScope] = useState<FeedScope>('workspace');
  const [eventType, setEventType] = useState<FeedEventType>('all');
  const [direction, setDirection] = useState<FeedDirection>('all');
  const [timeWindow, setTimeWindow] = useState<FeedTimeWindow>('24h');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [sessionFilter, setSessionFilter] = useState<string>('all');

  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [threadEvents, setThreadEvents] = useState<HubFeedEvent[]>([]);

  const refreshFeed = useCallback(
    async (loadMore = false) => {
      if (!isAuthenticated) {
        setFeedEvents([]);
        setFeedError(null);
        setLastFeedRefresh('Guest mode');
        setNextCursor(null);
        return;
      }

      const query: HubFeedQuery = {
        limit: Number(localStorage.getItem('autopus_feed_limit') || 80),
        scope,
        timeWindow,
      };
      if (eventType !== 'all') query.eventTypes = [eventType];
      if (direction !== 'all') query.direction = direction;
      if (agentFilter !== 'all') query.agentId = agentFilter;
      if (sessionFilter !== 'all') query.sessionId = sessionFilter;
      if (loadMore && nextCursor) query.cursor = nextCursor;

      if (!loadMore && !shouldPoll('hub.feed', 30000)) return;
      setFeedLoading(true);
      if (!loadMore) setFeedError(null);

      try {
        let response: { events: HubFeedEvent[]; nextCursor: string | null } = { events: [], nextCursor: null };
        await runPolledTask('hub.feed', async () => {
          response = await getHubFeed(query);
        });
        setFeedEvents((prev) => {
          if (!loadMore) return response.events;
          const merged = [...prev];
          const seen = new Set(prev.map((item) => item.id));
          for (const event of response.events) {
            if (!seen.has(event.id)) merged.push(event);
          }
          return merged;
        });
        setNextCursor(response.nextCursor);
        setLastFeedRefresh(new Date().toLocaleTimeString());
      } catch (errorValue) {
        setFeedError(parseErrorMessage(errorValue));
      } finally {
        setFeedLoading(false);
      }
    },
    [agentFilter, direction, eventType, isAuthenticated, nextCursor, scope, sessionFilter, timeWindow]
  );

  useEffect(() => {
    refreshFeed(false);
  }, [refreshFeed, matrixRefreshKey]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = window.setInterval(() => {
      refreshFeed(false);
    }, 30000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, refreshFeed]);

  useEffect(() => {
    if (selectedSession) {
      setMobilePane('chat');
    }
  }, [selectedSession]);

  useEffect(() => {
    setExpandedEventId(null);
    setThreadEvents([]);
    setThreadError(null);
  }, [scope, eventType, direction, timeWindow, agentFilter, sessionFilter]);

  const feedStats = useMemo(() => {
    const byDirection = {
      user_to_agent: feedEvents.filter((event) => event.direction === 'user_to_agent').length,
      agent_to_user: feedEvents.filter((event) => event.direction === 'agent_to_user').length,
      agent_to_agent: feedEvents.filter((event) => event.direction === 'agent_to_agent').length,
      system: feedEvents.filter((event) => event.direction === 'system').length,
    };
    return {
      total: feedEvents.length,
      ...byDirection,
      taskTransitions: feedEvents.filter((event) => event.eventType === 'task_transition').length,
    };
  }, [feedEvents]);

  const availableAgents = useMemo(() => {
    const rows = feedEvents
      .filter((event) => event.agent?.id)
      .map((event) => ({ id: event.agent!.id, name: event.agent!.name }));
    const unique = new Map(rows.map((row) => [row.id, row]));
    return Array.from(unique.values());
  }, [feedEvents]);

  const availableSessions = useMemo(() => {
    const rows = feedEvents
      .filter((event) => event.session?.id)
      .map((event) => ({ id: event.session!.id, title: event.session!.title }));
    const unique = new Map(rows.map((row) => [row.id, row]));
    return Array.from(unique.values());
  }, [feedEvents]);

  const openThreadDetails = useCallback(
    async (event: HubFeedEvent) => {
      if (expandedEventId === event.id) {
        setExpandedEventId(null);
        setThreadEvents([]);
        setThreadError(null);
        return;
      }

      setExpandedEventId(event.id);
      setThreadError(null);
      setThreadLoading(true);
      try {
        const response = await getHubThread(event.threadId, scope);
        setThreadEvents(response.events);
      } catch (errorValue) {
        setThreadError(parseErrorMessage(errorValue));
        setThreadEvents([]);
      } finally {
        setThreadLoading(false);
      }
    },
    [expandedEventId, scope]
  );

  const focusEventContext = useCallback(
    (event: HubFeedEvent) => {
      if (event.scope !== 'workspace') return;
      if (event.agent) {
        const match = agents.find((agent) => agent.id === event.agent?.id);
        if (match && selectedAgent?.id !== match.id) {
          setSelectedAgent(match);
        }
      }
      if (event.session) {
        const sessionMatch = sessions.find((session) => session.id === event.session?.id);
        if (sessionMatch) {
          setSelectedSession(sessionMatch);
        } else {
          const fallbackAgentId = event.agent?.id || selectedAgent?.id;
          if (fallbackAgentId) {
            setSelectedSession({
              id: event.session.id,
              agentId: fallbackAgentId,
              title: event.session.title,
              memoryScope: event.session.memoryScope,
              createdAt: event.createdAt,
              updatedAt: event.createdAt,
            });
          }
        }
      }
      if (event.eventType === 'message' || event.eventType === 'handoff' || event.eventType === 'system') {
        setHighlightMessageId(event.id);
      }
      window.location.href = '/chat';
    },
    [agents, selectedAgent?.id, sessions, setHighlightMessageId, setSelectedAgent, setSelectedSession]
  );

  return (
    <div className="flex h-full flex-col text-[var(--text-primary)] overflow-hidden">
      <div className="px-3 py-3">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 py-3 shadow-[var(--elev-2)]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Hub.autopus.cloud</p>
            <h1 className="text-lg font-semibold">Timeline + Drilldown Interaction Console</h1>
          </div>
          <div className="flex items-center gap-2">
            {onSwitchToDashboard ? (
              <button
                onClick={onSwitchToDashboard}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)]"
              >
                <Split size={14} />
                Dashboard
              </button>
            ) : null}
            {isAuthenticated ? (
              <button
                onClick={onOpenLaunchWizard}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--accent)]/50 bg-[color:var(--accent)]/15 px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[color:var(--accent)]/25"
              >
                <Rocket size={14} />
                Launch
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

      <div className="px-3 pb-2 pt-2 lg:hidden">
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-1">
          {(['chat', 'feed'] as const).map((pane) => (
            <button
              key={pane}
              onClick={() => setMobilePane(pane)}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition',
                mobilePane === pane
                  ? 'bg-[var(--surface-3)] text-[var(--text-primary)] shadow-[var(--elev-1)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              {pane === 'chat' ? 'Overview' : 'Live Feed'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-3 pb-3">
        <div className="mx-auto h-full w-full max-w-[1500px] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] shadow-[var(--elev-2)]">
          <div className="flex h-full overflow-hidden">
            <main className={cn('flex min-w-0 flex-1 flex-col bg-[var(--surface-0)]', mobilePane !== 'chat' && 'max-lg:hidden')}>
              <header className="flex h-14 items-center justify-between border-b border-[var(--border-subtle)] px-4">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">Hub Monitoring</p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">Runtime and timeline only. Chat lives in /chat.</p>
                  </div>
                </div>
                <div className="hidden items-center gap-2 text-[11px] text-[var(--text-muted)] sm:flex">
                  <ArrowRightLeft size={13} />
                  <span>{feedStats.user_to_agent} inbound</span>
                  <span>•</span>
                  <span>{feedStats.agent_to_user} outbound</span>
                  <span>•</span>
                  <span>{feedStats.agent_to_agent} handoffs</span>
                  <span>•</span>
                  <span>{feedStats.taskTransitions} transitions</span>
                </div>
              </header>

              <div className="flex flex-1 items-center justify-center p-8">
                <div className="w-full max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-1)] p-5">
                  {/* Activity Stream - NEW */}
                  <ActivityStream />
                  
                  <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                    <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">Conversation Surface</p>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">Use Chat For Messaging</h2>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      Hub now focuses on runtime and live event monitoring. Open Chat to start or continue conversations.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => (window.location.href = '/chat')}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)]"
                      >
                        <MessageSquare size={14} />
                        Open Chat
                      </button>
                      {messages.length > 0 ? (
                        <span className="inline-flex items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-muted)]">
                          Recent messages: {messages.length}
                        </span>
                      ) : null}
                      {highlightMessageId ? (
                        <span className="inline-flex items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-muted)]">
                          Highlighted event: {highlightMessageId.slice(0, 8)}...
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <aside className={cn('w-full border-l border-[var(--border-subtle)] bg-[var(--surface-1)] lg:flex lg:max-w-[430px] lg:flex-col', mobilePane !== 'feed' ? 'hidden' : 'flex')}>
              <div className="border-b border-[var(--border-subtle)] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Live feed</p>
                    <p className="text-xs text-[var(--text-secondary)]">Last refresh {lastFeedRefresh}</p>
                  </div>
                  <button
                    onClick={() => refreshFeed(false)}
                    disabled={feedLoading}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-1 text-[11px] text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] disabled:opacity-60"
                  >
                    <RefreshCw size={12} className={feedLoading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </div>

                <div className="mb-2 grid grid-cols-2 gap-1">
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as FeedEventType)}
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-1 text-[11px]"
                  >
                    {Object.keys(eventTypeLabel).map((type) => (
                      <option key={type} value={type}>{eventTypeLabel[type as FeedEventType]}</option>
                    ))}
                  </select>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as FeedDirection)}
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-1 text-[11px]"
                  >
                    {Object.keys(directionLabel).map((item) => (
                      <option key={item} value={item}>{directionLabel[item as FeedDirection]}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-2 grid grid-cols-2 gap-1">
                  <select
                    value={agentFilter}
                    onChange={(e) => setAgentFilter(e.target.value)}
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-1 text-[11px]"
                  >
                    <option value="all">All agents</option>
                    {availableAgents.map((agent) => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                  <select
                    value={sessionFilter}
                    onChange={(e) => setSessionFilter(e.target.value)}
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-1 text-[11px]"
                  >
                    <option value="all">All sessions</option>
                    {availableSessions.map((session) => (
                      <option key={session.id} value={session.id}>{session.title}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-2 grid grid-cols-2 gap-1">
                  <select
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value as FeedTimeWindow)}
                    className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-1 text-[11px]"
                  >
                    {Object.entries(timeWindowLabel).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {isAdmin ? (
                    <select
                      value={scope}
                      onChange={(e) => setScope(e.target.value as FeedScope)}
                      className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-1 text-[11px]"
                    >
                      <option value="workspace">{scopeLabel.workspace}</option>
                      <option value="system">{scopeLabel.system}</option>
                      <option value="aggregate">{scopeLabel.aggregate}</option>
                    </select>
                  ) : (
                    <div className="flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-1 text-[11px] text-[var(--text-muted)]">
                      <Search size={11} className="mr-1" />
                      Workspace only
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-1 text-[var(--text-muted)]">
                    Total
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{feedStats.total}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-1 text-[var(--text-muted)]">
                    Handoffs
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{feedStats.agent_to_agent}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-1 text-[var(--text-muted)]">
                    Tasks
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{feedStats.taskTransitions}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {feedError ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{feedError}</div>
                ) : null}

                {!isAuthenticated ? (
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-secondary)]">
                    <div className="mb-1 flex items-center gap-2 text-[var(--text-primary)]">
                      <CloudOff size={14} />
                      Sign in required
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Authenticate to observe cross-agent conversation traffic.</p>
                  </div>
                ) : null}

                {feedEvents.map((event) => (
                  <article key={event.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-[var(--text-primary)]">
                        {event.agent?.name || event.task?.id || 'System Event'}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                          {eventTypeLabel[event.eventType as FeedEventType] || event.eventType}
                        </span>
                        <span className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                          {directionLabel[event.direction as FeedDirection] || event.direction}
                        </span>
                      </div>
                    </div>

                    {event.participants ? (
                      <p className="mb-1 truncate text-[10px] text-[var(--text-muted)]">
                        {event.participants.from} {'->'} {event.participants.to}
                      </p>
                    ) : null}

                    <p className="line-clamp-4 text-xs leading-relaxed text-[var(--text-secondary)]">{event.contentPreview}</p>

                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-[var(--text-muted)]">
                      <span className="truncate">{event.session?.title || event.threadId}</span>
                      <span>{formatTs(event.createdAt)}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      {event.scope === 'workspace' ? (
                        <button
                          onClick={() => focusEventContext(event)}
                          className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-3)] px-2 py-1 text-[10px] font-semibold text-[var(--text-primary)]"
                        >
                          Open Context
                        </button>
                      ) : null}
                      <button
                        onClick={() => openThreadDetails(event)}
                        className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-3)] px-2 py-1 text-[10px] font-semibold text-[var(--text-primary)]"
                      >
                        Details
                        <ChevronDown size={11} className={expandedEventId === event.id ? 'rotate-180 transition-transform' : 'transition-transform'} />
                      </button>
                    </div>

                    {expandedEventId === event.id ? (
                      <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-2 text-[10px] text-[var(--text-muted)]">
                        <div className="grid grid-cols-2 gap-2">
                          <p>Route: <span className="text-[var(--text-secondary)]">{event.route || 'n/a'}</span></p>
                          <p>Reason: <span className="text-[var(--text-secondary)]">{event.reason || 'n/a'}</span></p>
                          <p>Model: <span className="text-[var(--text-secondary)]">{event.model || 'n/a'}</span></p>
                          <p>Latency: <span className="text-[var(--text-secondary)]">{event.latencyMs ?? 'n/a'} ms</span></p>
                          <p>Tokens: <span className="text-[var(--text-secondary)]">{event.tokenCount ?? 'n/a'}</span></p>
                          <p>Thread: <span className="text-[var(--text-secondary)]">{event.threadId}</span></p>
                          <p className="col-span-2">Trace: <span className="text-[var(--text-secondary)]">{event.traceId || 'n/a'}</span></p>
                        </div>

                        <div className="mt-2 border-t border-[var(--border-subtle)] pt-2">
                          {threadLoading ? (
                            <p className="text-[var(--text-muted)]">Loading thread...</p>
                          ) : threadError ? (
                            <p className="text-red-300">{threadError}</p>
                          ) : threadEvents.length > 0 ? (
                            <div className="space-y-1">
                              {threadEvents.slice(-8).map((row) => (
                                <div key={row.id} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2 py-1">
                                  <p className="text-[10px] text-[var(--text-secondary)]">
                                    {formatTs(row.createdAt)} • {eventTypeLabel[row.eventType as FeedEventType] || row.eventType}
                                  </p>
                                  <p className="line-clamp-2 text-[10px] text-[var(--text-muted)]">{row.contentPreview}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[var(--text-muted)]">No thread timeline available.</p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))}

                {!feedLoading && feedEvents.length === 0 ? (
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-center text-xs text-[var(--text-muted)]">
                    No feed events yet.
                  </div>
                ) : null}

                {nextCursor ? (
                  <button
                    onClick={() => refreshFeed(true)}
                    disabled={feedLoading}
                    className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-3)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface-2)] disabled:opacity-60"
                  >
                    {feedLoading ? 'Loading...' : 'Load More'}
                  </button>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
