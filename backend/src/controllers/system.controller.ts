import { Request, Response, NextFunction } from 'express';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/authenticate';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

const execFileAsync = promisify(execFile);

type RuntimeMode = 'local' | 'cloud' | 'hybrid';
type AgentLocation = 'Local' | 'Cloud' | 'Unknown';
type AgentStatus = 'RUNNING' | 'STOPPED' | 'ERROR' | 'UNKNOWN';

interface KaitenProfile {
  id: string;
  name: string;
  profile: string;
}

interface OpenClawStatusResponse {
  gateway?: {
    mode?: string;
    url?: string;
    urlSource?: string;
    reachable?: boolean;
    self?: {
      host?: string;
      ip?: string;
    } | null;
    error?: string | null;
  };
  gatewayService?: {
    runtimeShort?: string;
  };
  sessions?: {
    defaults?: {
      model?: string;
    };
    recent?: Array<{
      model?: string;
    }>;
  };
}

const KAITEN_PROFILES: KaitenProfile[] = [
  { id: 'prime', name: 'Prime', profile: 'main' },
  { id: 'forge', name: 'Forge', profile: 'forge' },
  { id: 'sight', name: 'Sight', profile: 'sight' },
  { id: 'pulse', name: 'Pulse', profile: 'pulse' },
];
const PLACEHOLDER_EMAIL_DOMAINS = ['example.com', 'example.org', 'example.net'];

const getLocation = (status: OpenClawStatusResponse): AgentLocation => {
  const mode = String(status.gateway?.mode || '').toLowerCase();
  const url = String(status.gateway?.url || '').toLowerCase();
  const source = String(status.gateway?.urlSource || '').toLowerCase();

  if (mode === 'cloud' || mode === 'hybrid') return 'Cloud';
  if (mode === 'local') return 'Local';
  if (url.includes('127.0.0.1') || url.includes('localhost') || source.includes('local loopback')) return 'Local';
  if (url.startsWith('ws://') || url.startsWith('wss://')) return 'Cloud';

  return 'Unknown';
};

const getAgentStatus = (status: OpenClawStatusResponse): AgentStatus => {
  const reachable = !!status.gateway?.reachable;
  const runtimeShort = String(status.gatewayService?.runtimeShort || '').toLowerCase();
  const gatewayError = String(status.gateway?.error || '').toLowerCase();

  if (reachable) return 'RUNNING';
  if (runtimeShort.includes('stopped') || runtimeShort.includes('not loaded')) return 'STOPPED';
  if (gatewayError) return 'ERROR';
  return 'UNKNOWN';
};

const getModel = (status: OpenClawStatusResponse): string => {
  return (
    status.sessions?.recent?.[0]?.model ||
    status.sessions?.defaults?.model ||
    'unknown'
  );
};

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return 'Unknown error';
};

const isPlaceholderEmail = (email: string): boolean => {
  const domain = email.toLowerCase().split('@')[1];
  return domain ? PLACEHOLDER_EMAIL_DOMAINS.includes(domain) : false;
};

const getConfiguredAdminEmails = (): Set<string> => {
  return new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
};

const fetchKaitenProfileStatus = async (profile: KaitenProfile) => {
  const checkedAt = new Date().toISOString();

  try {
    const { stdout } = await execFileAsync(
      'openclaw',
      ['--profile', profile.profile, 'status', '--json'],
      { timeout: 20000, maxBuffer: 1024 * 1024 }
    );

    const parsed = JSON.parse(stdout) as OpenClawStatusResponse;

    return {
      id: profile.id,
      name: profile.name,
      profile: profile.profile,
      status: getAgentStatus(parsed),
      reachable: !!parsed.gateway?.reachable,
      location: getLocation(parsed),
      gatewayMode: parsed.gateway?.mode || 'unknown',
      gatewayUrl: parsed.gateway?.url || null,
      runtimeHost: parsed.gateway?.self?.host || null,
      runtimeIp: parsed.gateway?.self?.ip || null,
      serviceState: parsed.gatewayService?.runtimeShort || null,
      model: getModel(parsed),
      error: parsed.gateway?.error || null,
      checkedAt,
    };
  } catch (err) {
    return {
      id: profile.id,
      name: profile.name,
      profile: profile.profile,
      status: 'ERROR' as AgentStatus,
      reachable: false,
      location: 'Unknown' as AgentLocation,
      gatewayMode: 'unknown',
      gatewayUrl: null,
      runtimeHost: null,
      runtimeIp: null,
      serviceState: null,
      model: 'unknown',
      error: `openclaw status failed: ${getErrorMessage(err)}`,
      checkedAt,
    };
  }
};

export const systemController = {
  getRuntimeStatus: (req: Request, res: Response, next: NextFunction) => {
    try {
      const runtimeHost = process.env.RUNTIME_HOST || os.hostname();
      const runtimeMode = (process.env.RUNTIME_MODE || 'local') as RuntimeMode;
      const timestamp = new Date().toISOString();

      res.json({
        status: 'success',
        data: {
          runtimeHost,
          runtimeMode,
          timestamp,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getKaitenAgentsStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const agents = await Promise.all(KAITEN_PROFILES.map(fetchKaitenProfileStatus));
      res.json({
        status: 'success',
        data: {
          agents,
          checkedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  promoteSelfToAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true }
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (user.role === 'ADMIN') {
        return res.json({
          status: 'success',
          data: { user, promoted: false, reason: 'already_admin' }
        });
      }

      const adminEmails = getConfiguredAdminEmails();
      const isConfiguredAdmin = adminEmails.has(user.email.toLowerCase());
      const existingAdminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      const canBootstrap = existingAdminCount === 0 && !isPlaceholderEmail(user.email);

      if (!isConfiguredAdmin && !canBootstrap) {
        throw new ForbiddenError(
          'Admin promotion denied. Add your email to ADMIN_EMAILS or ensure no admin exists.'
        );
      }

      const promotedUser = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
        select: { id: true, email: true, role: true }
      });

      return res.json({
        status: 'success',
        data: { user: promotedUser, promoted: true, reason: isConfiguredAdmin ? 'configured_email' : 'bootstrap_first_admin' }
      });
    } catch (error) {
      next(error);
    }
  },
};
