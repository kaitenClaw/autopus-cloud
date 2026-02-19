import fs from 'fs';
import path from 'path';

export type OnboardingMode = 'first_agent' | 'kaiten_core';
export type OnboardingStatus =
  | 'not_started'
  | 'account_ready'
  | 'deploy_pending'
  | 'first_message_pending'
  | 'completed';

export interface OnboardingChecks {
  apiReachable: boolean;
  authOk: boolean;
  runtimeOk: boolean;
  agentCreated: boolean;
  messageRoundtrip: boolean;
  feedVisible: boolean;
}

export interface OnboardingState {
  userId: string;
  step: 1 | 2 | 3;
  status: OnboardingStatus;
  mode: OnboardingMode;
  createdAgentId: string | null;
  createdAgentIds: string[];
  firstMessageVerified: boolean;
  checks: OnboardingChecks;
  updatedAt: string;
  completedAt: string | null;
}

interface OnboardingStore {
  users: Record<string, OnboardingState>;
}

const STATE_PATH_CANDIDATES = [
  process.env.ONBOARDING_STATE_PATH,
  path.resolve(process.cwd(), '../coordination/onboarding-state.json'),
  '/root/ocaas-project/coordination/onboarding-state.json',
  '/data/ocaas-project/coordination/onboarding-state.json',
].filter(Boolean) as string[];

const DEFAULT_CHECKS: OnboardingChecks = {
  apiReachable: true,
  authOk: true,
  runtimeOk: false,
  agentCreated: false,
  messageRoundtrip: false,
  feedVisible: false,
};

const nowIso = () => new Date().toISOString();

const defaultState = (userId: string): OnboardingState => ({
  userId,
  step: 1,
  status: 'account_ready',
  mode: 'first_agent',
  createdAgentId: null,
  createdAgentIds: [],
  firstMessageVerified: false,
  checks: { ...DEFAULT_CHECKS, authOk: true, apiReachable: true },
  updatedAt: nowIso(),
  completedAt: null,
});

const resolvePath = (): string => {
  for (const candidate of STATE_PATH_CANDIDATES) {
    try {
      const dir = path.dirname(candidate);
      if (!fs.existsSync(dir)) continue;
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      // try next
    }
  }

  const fallback = STATE_PATH_CANDIDATES[0];
  fs.mkdirSync(path.dirname(fallback), { recursive: true });
  return fallback;
};

const STATE_PATH = resolvePath();

const loadStore = (): OnboardingStore => {
  try {
    if (!fs.existsSync(STATE_PATH)) return { users: {} };
    const raw = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')) as Partial<OnboardingStore>;
    return {
      users: raw.users && typeof raw.users === 'object' ? (raw.users as Record<string, OnboardingState>) : {},
    };
  } catch {
    return { users: {} };
  }
};

const saveStore = (store: OnboardingStore) => {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
};

const normalizeState = (userId: string, state: OnboardingState | undefined): OnboardingState => {
  if (!state) return defaultState(userId);
  return {
    ...defaultState(userId),
    ...state,
    userId,
    createdAgentIds: Array.isArray(state.createdAgentIds)
      ? state.createdAgentIds.filter((id) => typeof id === 'string' && id.trim())
      : [],
    checks: {
      ...DEFAULT_CHECKS,
      ...(state.checks || {}),
    },
    updatedAt: state.updatedAt || nowIso(),
    completedAt: state.completedAt || null,
  };
};

export const onboardingService = {
  getState(userId: string): OnboardingState {
    const store = loadStore();
    const normalized = normalizeState(userId, store.users[userId]);
    if (!store.users[userId]) {
      store.users[userId] = normalized;
      saveStore(store);
    }
    return normalized;
  },

  upsertState(userId: string, patch: Partial<OnboardingState>): OnboardingState {
    const store = loadStore();
    const existing = normalizeState(userId, store.users[userId]);

    const merged: OnboardingState = {
      ...existing,
      ...patch,
      userId,
      checks: {
        ...existing.checks,
        ...(patch.checks || {}),
      },
      createdAgentIds: Array.isArray(patch.createdAgentIds)
        ? patch.createdAgentIds.filter((id) => typeof id === 'string' && id.trim())
        : existing.createdAgentIds,
      updatedAt: nowIso(),
      completedAt:
        patch.status === 'completed'
          ? patch.completedAt || existing.completedAt || nowIso()
          : patch.completedAt !== undefined
            ? patch.completedAt
            : existing.completedAt,
    };

    store.users[userId] = merged;
    saveStore(store);
    return merged;
  },
};
