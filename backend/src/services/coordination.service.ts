import fs from 'fs';
import path from 'path';

export type CoordinationAgentId = 'kaiten' | 'forge' | 'sight' | 'pulse';
export type CoordinationTaskState =
  | 'pending'
  | 'acknowledged'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface CoordinationTaskHistoryEntry {
  state: CoordinationTaskState;
  at: string;
  by: string;
  note?: string;
}

export interface CoordinationTask {
  id: string;
  title: string;
  description: string;
  assignee: CoordinationAgentId;
  priority: 'P0' | 'P1' | 'P2';
  track: 'fast' | 'standard' | 'deep';
  state: CoordinationTaskState;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  dueAt: string | null;
  history: CoordinationTaskHistoryEntry[];
}

export interface CoordinationSummaryAgent {
  id: CoordinationAgentId;
  activeCount: number;
  oldestActiveMinutes: number;
  currentTaskId: string | null;
  currentTaskTitle: string | null;
  lastTransitionAt: string | null;
  stateCounts: Record<CoordinationTaskState, number>;
}

export interface CoordinationSummary {
  updatedAt: string;
  totalTasks: number;
  agents: CoordinationSummaryAgent[];
  totals: {
    active: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
}

export interface TaskTransitionEvent {
  id: string;
  eventType: 'task_transition';
  role: 'system';
  direction: 'system';
  content: string;
  contentPreview: string;
  createdAt: string;
  participants: {
    from: string;
    to: string;
  };
  threadId: string;
  traceId: string;
  route: string | null;
  reason: string | null;
  scope: 'system';
  task: {
    id: string;
    title: string;
    state: CoordinationTaskState;
    assignee: CoordinationAgentId;
    priority: 'P0' | 'P1' | 'P2';
    track: 'fast' | 'standard' | 'deep';
    by: string;
    note: string | null;
  };
}

const AGENTS: CoordinationAgentId[] = ['kaiten', 'forge', 'sight', 'pulse'];
const STATES: CoordinationTaskState[] = [
  'pending',
  'acknowledged',
  'in_progress',
  'review',
  'completed',
  'failed',
  'cancelled',
];
const ACTIVE_STATES = new Set<CoordinationTaskState>(['pending', 'acknowledged', 'in_progress', 'review']);

const TASKS_DIR_CANDIDATES = [
  process.env.COORDINATION_TASKS_DIR,
  path.resolve(process.cwd(), '../coordination/tasks'),
  '/root/ocaas-project/coordination/tasks',
  '/data/ocaas-project/coordination/tasks',
].filter(Boolean) as string[];

const toDateMs = (value: string | null | undefined): number => {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const safeReadJson = (filePath: string): unknown => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
};

const isAgent = (value: unknown): value is CoordinationAgentId | 'prime' =>
  value === 'kaiten' || value === 'forge' || value === 'sight' || value === 'pulse' || value === 'prime';

const normalizeAgent = (value: CoordinationAgentId | 'prime'): CoordinationAgentId =>
  value === 'prime' ? 'kaiten' : value;

const isState = (value: unknown): value is CoordinationTaskState =>
  value === 'pending' ||
  value === 'acknowledged' ||
  value === 'in_progress' ||
  value === 'review' ||
  value === 'completed' ||
  value === 'failed' ||
  value === 'cancelled';

const normalizeTask = (raw: unknown): CoordinationTask | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.id !== 'string' || !isAgent(value.assignee) || !isState(value.state)) return null;

  const historyRaw = Array.isArray(value.history) ? value.history : [];
  const history = historyRaw
    .map((entry) => {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
      const row = entry as Record<string, unknown>;
      if (!isState(row.state) || typeof row.at !== 'string' || typeof row.by !== 'string') return null;
      const item: CoordinationTaskHistoryEntry = {
        state: row.state,
        at: row.at,
        by: row.by,
      };
      if (typeof row.note === 'string') {
        item.note = row.note;
      }
      return item;
    })
    .filter((entry): entry is CoordinationTaskHistoryEntry => entry !== null);

  return {
    id: value.id,
    title: typeof value.title === 'string' ? value.title : value.id,
    description: typeof value.description === 'string' ? value.description : '',
    assignee: normalizeAgent(value.assignee),
    priority: value.priority === 'P0' || value.priority === 'P1' || value.priority === 'P2' ? value.priority : 'P1',
    track: value.track === 'fast' || value.track === 'deep' || value.track === 'standard' ? value.track : 'standard',
    state: value.state,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
    createdBy: typeof value.createdBy === 'string' ? value.createdBy : 'system',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
    dueAt: typeof value.dueAt === 'string' ? value.dueAt : null,
    history,
  };
};

const resolveTasksDir = (): string | null => {
  for (const candidate of TASKS_DIR_CANDIDATES) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        return candidate;
      }
    } catch {
      // try next
    }
  }
  return null;
};

const readTasks = (): CoordinationTask[] => {
  const tasksDir = resolveTasksDir();
  if (!tasksDir) return [];

  const files = fs.readdirSync(tasksDir).filter((file) => file.endsWith('.json') && file !== 'TASK-SCHEMA.json');
  const tasks = files
    .map((file) => normalizeTask(safeReadJson(path.join(tasksDir, file))))
    .filter((task): task is CoordinationTask => !!task);

  tasks.sort((a, b) => toDateMs(b.updatedAt || b.createdAt) - toDateMs(a.updatedAt || a.createdAt));
  return tasks;
};

const buildStateCounts = (tasks: CoordinationTask[]): Record<CoordinationTaskState, number> => {
  const counts = {
    pending: 0,
    acknowledged: 0,
    in_progress: 0,
    review: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  } satisfies Record<CoordinationTaskState, number>;

  for (const task of tasks) {
    counts[task.state] += 1;
  }
  return counts;
};

const taskSortTs = (task: CoordinationTask) => Math.max(toDateMs(task.updatedAt), toDateMs(task.createdAt));

const lastTransitionAt = (task: CoordinationTask): string | null => {
  if (!task.history.length) return null;
  const last = task.history.reduce((acc, row) => (toDateMs(row.at) > toDateMs(acc.at) ? row : acc), task.history[0]);
  return last.at;
};

export const coordinationService = {
  listTasks() {
    return readTasks();
  },

  getSummary(now: Date = new Date()): CoordinationSummary {
    const tasks = readTasks();
    const nowMs = now.getTime();

    const agents = AGENTS.map((agentId) => {
      const mine = tasks.filter((task) => task.assignee === agentId);
      const active = mine.filter((task) => ACTIVE_STATES.has(task.state));
      const sortedActive = active.slice().sort((a, b) => taskSortTs(b) - taskSortTs(a));

      const oldestActiveMinutes = active.length
        ? Math.max(
            0,
            Math.floor((nowMs - Math.min(...active.map((task) => taskSortTs(task)))) / 60000)
          )
        : 0;

      const latestTransition = mine
        .map((task) => lastTransitionAt(task))
        .filter((value): value is string => !!value)
        .sort((a, b) => toDateMs(b) - toDateMs(a))[0] || null;

      return {
        id: agentId,
        activeCount: active.length,
        oldestActiveMinutes,
        currentTaskId: sortedActive[0]?.id ?? null,
        currentTaskTitle: sortedActive[0]?.title ?? null,
        lastTransitionAt: latestTransition,
        stateCounts: buildStateCounts(mine),
      };
    });

    return {
      updatedAt: now.toISOString(),
      totalTasks: tasks.length,
      agents,
      totals: {
        active: tasks.filter((task) => ACTIVE_STATES.has(task.state)).length,
        completed: tasks.filter((task) => task.state === 'completed').length,
        failed: tasks.filter((task) => task.state === 'failed').length,
        cancelled: tasks.filter((task) => task.state === 'cancelled').length,
      },
    };
  },

  getTaskTransitionEvents(options?: {
    taskId?: string;
    assignee?: CoordinationAgentId;
    since?: Date | null;
    until?: Date | null;
  }): TaskTransitionEvent[] {
    const tasks = readTasks();
    const rows: TaskTransitionEvent[] = [];
    const sinceMs = options?.since ? options.since.getTime() : 0;
    const untilMs = options?.until ? options.until.getTime() : Number.POSITIVE_INFINITY;

    for (const task of tasks) {
      if (options?.taskId && task.id !== options.taskId) continue;
      if (options?.assignee && task.assignee !== options.assignee) continue;

      for (let idx = 0; idx < task.history.length; idx += 1) {
        const entry = task.history[idx];
        const ts = toDateMs(entry.at);
        if (ts < sinceMs || ts > untilMs) continue;

        const content = `${task.assignee} moved ${task.id} to ${entry.state}`;
        rows.push({
          id: `task-${task.id}-${idx}`,
          eventType: 'task_transition',
          role: 'system',
          direction: 'system',
          content,
          contentPreview: content,
          createdAt: entry.at,
          participants: {
            from: entry.by,
            to: task.assignee,
          },
          threadId: `task:${task.id}`,
          traceId: `task:${task.id}`,
          route: null,
          reason: entry.note ?? null,
          scope: 'system',
          task: {
            id: task.id,
            title: task.title,
            state: entry.state,
            assignee: task.assignee,
            priority: task.priority,
            track: task.track,
            by: entry.by,
            note: entry.note ?? null,
          },
        });
      }
    }

    rows.sort((a, b) => toDateMs(b.createdAt) - toDateMs(a.createdAt));
    return rows;
  },
};
