import { Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import os from 'os';

type OpenClawThreadMeta = {
  sessionId: string;
  displayName: string;
  channel: string;
  chatType: string;
  updatedAt: number;
  subject?: string;
  sessionFile?: string;
};

const HOME_DIR = process.env.OPENCLAW_HOME || os.homedir();
const OPENCLAW_PROFILE_FALLBACKS: Record<string, string[]> = {
  forge: [path.join(HOME_DIR, '.openclaw-forge'), '/data/openclaw/forge'],
  sight: [path.join(HOME_DIR, '.openclaw-sight'), '/data/openclaw/sight'],
  pulse: [path.join(HOME_DIR, '.openclaw-pulse'), '/data/openclaw/pulse'],
  prime: [path.join(HOME_DIR, '.openclaw'), '/data/openclaw/prime'],
  fion: [path.join(HOME_DIR, '.openclaw-fion'), '/data/openclaw/fion'],
};

const PROFILE_ALIASES: Record<string, string> = {
  main: 'prime',
  prime: 'prime',
  forge: 'forge',
  sight: 'sight',
  pulse: 'pulse',
  fion: 'fion',
};

const parseProfileMapFromEnv = (): Record<string, string> => {
  try {
    return JSON.parse(process.env.OPENCLAW_PROFILE_MAP || '{}');
  } catch {
    return {};
  }
};

const existsFile = async (filePath: string): Promise<boolean> => {
  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile();
  } catch {
    return false;
  }
};

const resolveProfileCandidates = (agentName: string, profilePath?: string | null): string[] => {
  if (profilePath) return [profilePath];
  const mapped = parseProfileMapFromEnv();
  const key = agentName.trim().toLowerCase();
  if (mapped[key]) return [mapped[key]];
  return OPENCLAW_PROFILE_FALLBACKS[key] || [];
};

const resolveCandidatesByProfileId = (profileId: string): string[] => {
  const normalized = PROFILE_ALIASES[String(profileId || '').trim().toLowerCase()];
  if (!normalized) return [];
  return OPENCLAW_PROFILE_FALLBACKS[normalized] || [];
};

const resolveSessionsIndexPath = async (profileRoot: string): Promise<string | null> => {
  const candidates = [
    path.join(profileRoot, 'agents/main/sessions/sessions.json'),
    path.join(profileRoot, 'sessions/sessions.json'),
  ];
  for (const candidate of candidates) {
    if (await existsFile(candidate)) return candidate;
  }
  return null;
};

const parseThreadsFromSessionsIndex = async (sessionsIndexPath: string): Promise<OpenClawThreadMeta[]> => {
  const raw = await readFile(sessionsIndexPath, 'utf8');
  const parsed = JSON.parse(raw) as Record<string, any>;
  const rows = Object.values(parsed || {})
    .map((entry: any) => ({
      sessionId: String(entry?.sessionId || ''),
      displayName: String(entry?.displayName || entry?.subject || entry?.lastTo || 'OpenClaw Session'),
      channel: String(entry?.channel || entry?.lastChannel || 'unknown'),
      chatType: String(entry?.chatType || 'direct'),
      updatedAt: Number(entry?.updatedAt || 0),
      subject: entry?.subject ? String(entry.subject) : undefined,
      sessionFile: entry?.sessionFile ? String(entry.sessionFile) : undefined,
    }))
    .filter((entry) => !!entry.sessionId);

  rows.sort((a, b) => b.updatedAt - a.updatedAt);
  return rows;
};

const extractText = (content: unknown): string => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((part: any) => {
      if (typeof part === 'string') return part;
      if (part?.type === 'text' && typeof part?.text === 'string') return part.text;
      if (part?.type === 'toolResult' && typeof part?.text === 'string') return part.text;
      return '';
    })
    .filter(Boolean)
    .join('\n')
    .trim();
};

export class HubController {
  getOpenClawThreads = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const agentId = String(req.query.agentId || '');
    const profile = String(req.query.profile || '');
    if (!agentId && !profile) {
      return res.status(400).json({ status: 'error', message: 'agentId or profile is required' });
    }

    let profileCandidates: string[] = [];
    if (agentId) {
      const agent = await prisma.agent.findFirst({
        where: { id: agentId, userId, deletedAt: null },
        select: { id: true, name: true, profilePath: true },
      });
      if (!agent) {
        return res.status(404).json({ status: 'error', message: 'Agent not found' });
      }
      profileCandidates = resolveProfileCandidates(agent.name, agent.profilePath);
    } else {
      profileCandidates = resolveCandidatesByProfileId(profile);
    }
    if (!profileCandidates.length) {
      return res.json({ status: 'success', data: { threads: [], source: null } });
    }

    let sessionsIndexPath: string | null = null;
    for (const candidate of profileCandidates) {
      sessionsIndexPath = await resolveSessionsIndexPath(candidate);
      if (sessionsIndexPath) break;
    }
    if (!sessionsIndexPath) {
      return res.json({ status: 'success', data: { threads: [], source: profileCandidates[0] } });
    }

    const threads = await parseThreadsFromSessionsIndex(sessionsIndexPath);
    return res.json({
      status: 'success',
      data: {
        threads: threads.map((thread) => ({
          id: thread.sessionId,
          title: thread.subject || thread.displayName,
          channel: thread.channel,
          chatType: thread.chatType,
          updatedAt: thread.updatedAt ? new Date(thread.updatedAt).toISOString() : null,
        })),
        source: sessionsIndexPath,
      },
    });
  });

  getOpenClawThread = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const agentId = String(req.query.agentId || '');
    const profile = String(req.query.profile || '');
    const threadId = String(req.params.threadId || '');
    if ((!agentId && !profile) || !threadId) {
      return res.status(400).json({ status: 'error', message: 'threadId and (agentId or profile) are required' });
    }

    let profileCandidates: string[] = [];
    if (agentId) {
      const agent = await prisma.agent.findFirst({
        where: { id: agentId, userId, deletedAt: null },
        select: { id: true, name: true, profilePath: true },
      });
      if (!agent) {
        return res.status(404).json({ status: 'error', message: 'Agent not found' });
      }
      profileCandidates = resolveProfileCandidates(agent.name, agent.profilePath);
    } else {
      profileCandidates = resolveCandidatesByProfileId(profile);
    }
    if (!profileCandidates.length) {
      return res.json({ status: 'success', data: { messages: [] } });
    }

    let sessionsIndexPath: string | null = null;
    let profilePath = profileCandidates[0];
    for (const candidate of profileCandidates) {
      sessionsIndexPath = await resolveSessionsIndexPath(candidate);
      if (sessionsIndexPath) {
        profilePath = candidate;
        break;
      }
    }
    if (!sessionsIndexPath) {
      return res.json({ status: 'success', data: { messages: [] } });
    }

    const threads = await parseThreadsFromSessionsIndex(sessionsIndexPath);
    const target = threads.find((thread) => thread.sessionId === threadId);
    if (!target?.sessionFile) {
      return res.json({ status: 'success', data: { messages: [] } });
    }

    const sessionFile = path.isAbsolute(target.sessionFile)
      ? target.sessionFile
      : path.join(profilePath, target.sessionFile);
    if (!(await existsFile(sessionFile))) {
      return res.json({ status: 'success', data: { messages: [] } });
    }

    const rawLog = await readFile(sessionFile, 'utf8');
    const lines = rawLog.split('\n').filter(Boolean).slice(-400);
    const messages = lines
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((row) => row && row.type === 'message' && row.message && typeof row.message.role === 'string')
      .map((row: any) => {
        const roleRaw = String(row.message.role || 'system').toLowerCase();
        const role = roleRaw === 'assistant' ? 'assistant' : roleRaw === 'user' ? 'user' : 'system';
        return {
          id: String(row.id || `line-${Math.random().toString(36).slice(2)}`),
          role,
          content: extractText(row.message.content),
          createdAt: row.timestamp || new Date().toISOString(),
        };
      })
      .filter((msg) => msg.content.length > 0);

    return res.json({ status: 'success', data: { messages } });
  });

  getFeed = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const {
      limit: rawLimit,
      scope,
      timeWindow,
      direction,
      agentId,
      sessionId,
      cursor,
    } = req.query;

    const limit = Math.min(200, Math.max(1, parseInt(String(rawLimit ?? '80'), 10)));

    // Build time filter
    let since: Date | undefined;
    const now = new Date();
    switch (timeWindow) {
      case '1h': since = new Date(now.getTime() - 60 * 60 * 1000); break;
      case '24h': since = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case '7d': since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
    }

    // Build message query — transform messages into feed events
    const where: Record<string, unknown> = {};

    if (scope !== 'system' && scope !== 'aggregate') {
      where.agent = { userId, deletedAt: null };
    }
    if (agentId && agentId !== 'all') {
      where.agentId = String(agentId);
    }
    if (sessionId && sessionId !== 'all') {
      where.sessionId = String(sessionId);
    }
    if (since) {
      where.createdAt = { gte: since };
    }
    if (direction && direction !== 'all') {
      if (direction === 'user_to_agent') where.role = 'user';
      if (direction === 'agent_to_user') where.role = 'assistant';
    }
    if (cursor) {
      where.createdAt = { ...(where.createdAt as object ?? {}), lt: new Date(String(cursor)) };
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      include: {
        agent: { select: { id: true, name: true } },
        session: { select: { id: true, title: true } },
      },
    });

    const hasMore = messages.length > limit;
    const page = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? page[page.length - 1].createdAt.toISOString() : null;

    const events = page.map((m) => ({
      id: m.id,
      eventType: 'message' as const,
      direction: m.role === 'user' ? 'user_to_agent' : 'agent_to_user',
      scope: 'workspace' as const,
      threadId: m.sessionId ?? m.agentId,
      contentPreview: m.content.slice(0, 300),
      createdAt: m.createdAt.toISOString(),
      agent: m.agent ? { id: m.agent.id, name: m.agent.name } : undefined,
      session: m.session ? { id: m.session.id, title: m.session.title, memoryScope: 'workspace' } : undefined,
    }));

    res.json({
      status: 'success',
      data: { events, nextCursor },
    });
  });

  getThread = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const threadId = String(req.params.threadId);

    // Thread = all messages in a session (or agent fallback)
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sessionId: threadId, agent: { userId } },
          { agentId: threadId, agent: { userId } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
      include: {
        agent: { select: { id: true, name: true } },
        session: { select: { id: true, title: true } },
      },
    });

    const events = messages.map((m) => ({
      id: m.id,
      eventType: 'message' as const,
      direction: m.role === 'user' ? 'user_to_agent' : 'agent_to_user',
      scope: 'workspace' as const,
      threadId,
      contentPreview: m.content.slice(0, 300),
      createdAt: m.createdAt.toISOString(),
      agent: m.agent ? { id: m.agent.id, name: m.agent.name } : undefined,
      session: m.session ? { id: m.session.id, title: m.session.title, memoryScope: 'workspace' } : undefined,
    }));

    res.json({
      status: 'success',
      data: { events },
    });
  });
}

export const hubController = new HubController();
