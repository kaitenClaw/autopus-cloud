import { Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import os from 'os';
import { readdir, readFile } from 'fs/promises';

const MODEL_COST_PER_MILLION_USD: Array<{ match: RegExp; usdPerMillion: number }> = [
  { match: /google-antigravity\//i, usdPerMillion: 0 },
  { match: /gemini-3-pro|gemini-2\.5-pro|gpt-5/i, usdPerMillion: 1.25 },
  { match: /gemini-2\.5-flash-thinking/i, usdPerMillion: 0.15 },
  { match: /gemini-3-flash|gemini-2\.5-flash|gemini-2\.0-flash/i, usdPerMillion: 0.075 },
  { match: /claude|anthropic/i, usdPerMillion: 0.8 },
];

const estimateCostUsd = (model: string, tokens: number): number => {
  const normalized = String(model || '').toLowerCase();
  const pricing = MODEL_COST_PER_MILLION_USD.find((row) => row.match.test(normalized));
  const rate = pricing?.usdPerMillion ?? 0.5;
  return (Math.max(0, Number(tokens) || 0) / 1_000_000) * rate;
};

const classifyRouteEvent = (primaryModel: string, usedModel: string): 'ESCALATION' | 'FALLBACK' | null => {
  const primary = String(primaryModel || '').toLowerCase();
  const used = String(usedModel || '').toLowerCase();
  if (!primary || !used || primary === used) return null;

  const primaryIsFlash = primary.includes('flash');
  const usedIsDeeper = used.includes('pro') || used.includes('thinking') || used.includes('gpt-5');
  if (primaryIsFlash && usedIsDeeper) {
    return 'ESCALATION';
  }
  return 'FALLBACK';
};

type ProfileId = 'default' | 'forge' | 'sight' | 'pulse' | 'fion';

interface SpecialModelPackage {
  id: string;
  name: string;
  description: string;
  model: string;
  skills: string[];
  tasks: string[];
  applicableProfiles: string[];
}

const OPENCLAW_HOME = process.env.OPENCLAW_HOME || `${os.homedir()}/.openclaw`;
const PROFILE_INFO: Array<{ profile: ProfileId; label: string; root: string; skillDirs: string[] }> = [
  { profile: 'default', label: 'Prime', root: `${os.homedir()}/.openclaw`, skillDirs: [`${OPENCLAW_HOME}/skills`, `${OPENCLAW_HOME}/workspace/skills`] },
  { profile: 'forge', label: 'Forge', root: `${os.homedir()}/.openclaw-forge`, skillDirs: [`${OPENCLAW_HOME}/workspace-forge/skills`] },
  { profile: 'sight', label: 'Sight', root: `${os.homedir()}/.openclaw-sight`, skillDirs: [`${OPENCLAW_HOME}/workspace-sight/skills`] },
  { profile: 'pulse', label: 'Pulse', root: `${os.homedir()}/.openclaw-pulse`, skillDirs: [`${OPENCLAW_HOME}/workspace-pulse/skills`] },
  { profile: 'fion', label: 'Fion', root: `${os.homedir()}/.openclaw-fion`, skillDirs: [] },
];

const readJsonSafe = async <T>(filePath: string): Promise<T | null> => {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const readSkillsFromDir = async (dirPath: string): Promise<string[]> => {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const skillFolders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    const checks = await Promise.all(
      skillFolders.map(async (folder) => {
        try {
          await readFile(`${dirPath}/${folder}/SKILL.md`, 'utf8');
          return folder;
        } catch {
          return null;
        }
      })
    );
    return checks.filter((name): name is string => Boolean(name)).sort();
  } catch {
    return [];
  }
};

const readSpecialModelPackages = async (): Promise<SpecialModelPackage[]> => {
  const filePath = `${OPENCLAW_HOME}/skills/model-manager/model-task-packages.json`;
  const parsed = await readJsonSafe<{ packages?: SpecialModelPackage[] }>(filePath);
  return Array.isArray(parsed?.packages) ? parsed!.packages : [];
};

const loadKaitenAgentCapabilities = async (packages: SpecialModelPackage[]) => {
  const profiles = await Promise.all(
    PROFILE_INFO.map(async (profileMeta) => {
      const config = await readJsonSafe<{
        agents?: {
          defaults?: {
            model?: { primary?: string; fallbacks?: string[] };
            models?: Record<string, { alias?: string }>;
          };
        };
      }>(`${profileMeta.root}/openclaw.json`);

      const skillSets = await Promise.all(profileMeta.skillDirs.map(readSkillsFromDir));
      const skills = Array.from(new Set(skillSets.flat())).sort();
      const primary = config?.agents?.defaults?.model?.primary || 'unknown';
      const fallbacksRaw = config?.agents?.defaults?.model?.fallbacks;
      const fallbacks = Array.isArray(fallbacksRaw) ? fallbacksRaw : [];
      const availableModels = Object.keys(config?.agents?.defaults?.models || {});
      const packageIds = packages
        .filter((pkg) => pkg.applicableProfiles.includes(profileMeta.profile))
        .map((pkg) => pkg.id);

      return {
        profile: profileMeta.profile,
        name: profileMeta.label,
        primary,
        fallbacks,
        availableModels,
        skills,
        packageIds,
      };
    })
  );

  const allSkills = Array.from(new Set(profiles.flatMap((p) => p.skills))).sort();
  return { profiles, allSkills };
};

export class DashboardController {
  getOverview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const agents = await prisma.agent.findMany({
      where: { userId, deletedAt: null },
      include: { agentConfig: true },
    });

    const running = agents.filter((a) => a.status === 'RUNNING').length;
    const error = agents.filter((a) => a.status === 'ERROR').length;

    // Aggregate usage from last 24h and 7d
    const now = new Date();
    const day = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [usage24h, usage7d] = await Promise.all([
      prisma.usage.aggregate({
        where: { userId, timestamp: { gte: day } },
        _sum: { tokens: true },
        _count: true,
      }),
      prisma.usage.aggregate({
        where: { userId, timestamp: { gte: week } },
        _sum: { tokens: true },
        _count: true,
      }),
    ]);

    // Model usage breakdown (7d)
    const modelUsage = await prisma.usage.groupBy({
      by: ['model'],
      where: { userId, timestamp: { gte: week } },
      _sum: { tokens: true },
      _count: true,
    });

    const [recentSessions, recentUsageRows, specialModelPackages] = await Promise.all([
      prisma.chatSession.findMany({
        where: { agent: { userId, deletedAt: null } },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          agent: { select: { name: true } },
          _count: { select: { messages: true } },
        },
      }),
      prisma.usage.findMany({
        where: { userId, timestamp: { gte: week } },
        orderBy: { timestamp: 'desc' },
        take: 250,
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              modelPreset: true,
              agentConfig: { select: { model: true } },
            },
          },
        },
      }),
      readSpecialModelPackages(),
    ]);
    const kaitenCapabilities = await loadKaitenAgentCapabilities(specialModelPackages);

    const routingByAgent: Record<string, {
      agentId: string;
      agentName: string;
      primaryModel: string;
      escalations: number;
      fallbacks: number;
      totalEvents: number;
      estimatedCostUsd: number;
      incrementalCostUsd: number;
      lastEventAt: string | null;
      events: Array<{
        timestamp: string;
        eventType: 'ESCALATION' | 'FALLBACK';
        fromModel: string;
        toModel: string;
        tokens: number;
        estimatedCostUsd: number;
        incrementalCostUsd: number;
      }>;
    }> = {};

    for (const row of recentUsageRows) {
      if (!row.agentId || !row.agent) continue;
      const agentId = row.agentId;
      const primaryModel = row.agent.agentConfig?.model || row.agent.modelPreset || 'unknown';
      const usedModel = row.model || 'unknown';
      const eventType = classifyRouteEvent(primaryModel, usedModel);
      if (!eventType) continue;

      const usedCostUsd = estimateCostUsd(usedModel, row.tokens);
      const baselineCostUsd = estimateCostUsd(primaryModel, row.tokens);
      const incrementalCostUsd = usedCostUsd - baselineCostUsd;

      if (!routingByAgent[agentId]) {
        routingByAgent[agentId] = {
          agentId,
          agentName: row.agent.name,
          primaryModel,
          escalations: 0,
          fallbacks: 0,
          totalEvents: 0,
          estimatedCostUsd: 0,
          incrementalCostUsd: 0,
          lastEventAt: null,
          events: [],
        };
      }

      const bucket = routingByAgent[agentId];
      bucket.totalEvents += 1;
      bucket.estimatedCostUsd += usedCostUsd;
      bucket.incrementalCostUsd += incrementalCostUsd;
      bucket.lastEventAt = bucket.lastEventAt || row.timestamp.toISOString();
      if (eventType === 'ESCALATION') bucket.escalations += 1;
      if (eventType === 'FALLBACK') bucket.fallbacks += 1;
      if (bucket.events.length < 6) {
        bucket.events.push({
          timestamp: row.timestamp.toISOString(),
          eventType,
          fromModel: primaryModel,
          toModel: usedModel,
          tokens: row.tokens,
          estimatedCostUsd: Number(usedCostUsd.toFixed(6)),
          incrementalCostUsd: Number(incrementalCostUsd.toFixed(6)),
        });
      }
    }

    const routingAgents = Object.values(routingByAgent)
      .map((item) => ({
        ...item,
        estimatedCostUsd: Number(item.estimatedCostUsd.toFixed(6)),
        incrementalCostUsd: Number(item.incrementalCostUsd.toFixed(6)),
      }))
      .sort((a, b) => b.totalEvents - a.totalEvents);

    const routingSummary = {
      totalEvents: routingAgents.reduce((sum, a) => sum + a.totalEvents, 0),
      totalEscalations: routingAgents.reduce((sum, a) => sum + a.escalations, 0),
      totalFallbacks: routingAgents.reduce((sum, a) => sum + a.fallbacks, 0),
      estimatedCostUsd: Number(routingAgents.reduce((sum, a) => sum + a.estimatedCostUsd, 0).toFixed(6)),
      incrementalCostUsd: Number(routingAgents.reduce((sum, a) => sum + a.incrementalCostUsd, 0).toFixed(6)),
    };

    // Alerts — derive from agent state
    const alerts: Array<{ code: string; level: 'info' | 'warning' | 'critical'; message: string }> = [];
    if (error > 0) {
      alerts.push({
        code: 'AGENT_ERROR',
        level: 'critical',
        message: `${error} agent(s) in ERROR state. Check gateway logs.`,
      });
    }
    if (agents.length === 0) {
      alerts.push({
        code: 'NO_AGENTS',
        level: 'info',
        message: 'No agents created yet. Use the Launch Wizard to deploy your first agent.',
      });
    }

    res.json({
      status: 'success',
      data: {
        summary: {
          runtime: { running, total: agents.length, error },
        },
        usage: {
          requests24h: usage24h._count ?? 0,
          requests7d: usage7d._count ?? 0,
          tokens24h: usage24h._sum.tokens ?? 0,
          tokens7d: usage7d._sum.tokens ?? 0,
        },
        runtimeAgents: agents.map((a) => ({
          id: a.id,
          name: a.name,
          status: a.status,
          model: a.agentConfig?.model ?? a.modelPreset,
          location: a.port ? 'Local' : 'Unknown',
          gatewayMode: a.port ? 'local' : 'none',
          error: null,
        })),
        models: modelUsage.map((row) => ({
          model: row.model,
          requests: row._count,
          tokens: row._sum.tokens ?? 0,
        })),
        fallbackRoutes: [
          { step: 1, route: 'Primary', provider: 'Google Antigravity', model: 'gemini-3-flash', reason: 'Free tier — zero cost' },
          { step: 2, route: 'Fallback 1', provider: 'Google (Vertex)', model: 'gemini-3-flash', reason: 'Higher-rate fallback using Vertex-backed key' },
        ],
        routingInsights: {
          summary: routingSummary,
          byAgent: routingAgents,
          generatedAt: new Date().toISOString(),
        },
        memoryScopes: { workspace: recentSessions.length, global: 0, shared: 0 },
        recentSessions: recentSessions.map((s) => ({
          id: s.id,
          title: s.title,
          memoryScope: 'workspace',
          agent: { name: s.agent.name },
          messageCount: s._count.messages,
        })),
        alerts,
        agentCapabilities: kaitenCapabilities,
        specialModelPackages,
      },
    });
  });

  getOnboarding = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const [agentCount, messageCount] = await Promise.all([
      prisma.agent.count({ where: { userId, deletedAt: null } }),
      prisma.message.count({ where: { agent: { userId } } }),
    ]);

    const hasAgent = agentCount > 0;
    const hasMessage = messageCount > 0;

    const step = !hasAgent ? 2 : !hasMessage ? 3 : 3;
    const status = hasAgent && hasMessage ? 'completed' : 'active';

    res.json({
      status: 'success',
      data: {
        status,
        step,
        checks: {
          apiReachable: true,
          authOk: true,
          runtimeOk: hasAgent,
          agentCreated: hasAgent,
          messageRoundtrip: hasMessage,
          feedVisible: hasMessage,
        },
      },
    });
  });

  bootstrapOnboarding = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { mode } = req.body as { mode: 'first_agent' | 'kaiten_core'; autoStart?: boolean };

    if (mode === 'first_agent') {
      // Create a default agent if none exists
      const existing = await prisma.agent.count({ where: { userId, deletedAt: null } });
      if (existing === 0) {
        await prisma.agent.create({
          data: {
            name: 'My First Agent',
            modelPreset: 'gemini-3-flash',
            userId,
            agentConfig: {
              create: {
                model: 'gemini-3-flash',
                temperature: 0.7,
                systemPrompt: 'You are a helpful assistant.',
              },
            },
          },
        });
      }
    }

    // Re-compute onboarding state
    const [agentCount, messageCount] = await Promise.all([
      prisma.agent.count({ where: { userId, deletedAt: null } }),
      prisma.message.count({ where: { agent: { userId } } }),
    ]);

    const hasAgent = agentCount > 0;
    const hasMessage = messageCount > 0;

    res.json({
      status: 'success',
      data: {
        state: {
          status: hasAgent && hasMessage ? 'completed' : 'active',
          step: !hasAgent ? 2 : !hasMessage ? 3 : 3,
          checks: {
            apiReachable: true,
            authOk: true,
            runtimeOk: hasAgent,
            agentCreated: hasAgent,
            messageRoundtrip: hasMessage,
            feedVisible: hasMessage,
          },
        },
      },
    });
  });

  verifyFirstMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const [agentCount, messageCount] = await Promise.all([
      prisma.agent.count({ where: { userId, deletedAt: null } }),
      prisma.message.count({ where: { agent: { userId } } }),
    ]);

    const hasAgent = agentCount > 0;
    const hasMessage = messageCount > 0;

    res.json({
      status: 'success',
      data: {
        state: {
          status: hasAgent && hasMessage ? 'completed' : 'active',
          step: !hasAgent ? 2 : !hasMessage ? 3 : 3,
          checks: {
            apiReachable: true,
            authOk: true,
            runtimeOk: hasAgent,
            agentCreated: hasAgent,
            messageRoundtrip: hasMessage,
            feedVisible: hasMessage,
          },
        },
      },
    });
  });
}

export const dashboardController = new DashboardController();
