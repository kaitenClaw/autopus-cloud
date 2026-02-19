import { Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';

const startTime = Date.now();

export class AdminController {
  listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '50'), 10)));
    const skip = (page - 1) * limit;

    // TODO(human): Implement user list query with agent count aggregation
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: { select: { agents: true } },
        },
      }),
      prisma.user.count(),
    ]);

    res.json({
      status: 'success',
      data: {
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          agentCount: u._count.agents,
          createdAt: u.createdAt,
        })),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  });

  listAllAgents = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const agents = await prisma.agent.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    res.json({
      status: 'success',
      data: {
        agents: agents.map((a) => ({
          id: a.id,
          name: a.name,
          modelPreset: a.modelPreset,
          status: a.status,
          port: a.port,
          owner: a.user,
          createdAt: a.createdAt,
        })),
      },
    });
  });

  systemHealth = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const [userCount, agentCounts, dbCheck] = await Promise.all([
      prisma.user.count(),
      prisma.agent.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.$queryRaw`SELECT 1 as ok`.then(() => 'connected' as const).catch(() => 'disconnected' as const),
    ]);

    const agentsByStatus: Record<string, number> = {};
    let totalAgents = 0;
    for (const row of agentCounts) {
      agentsByStatus[row.status] = row._count;
      totalAgents += row._count;
    }

    const uptimeMs = Date.now() - startTime;
    const uptimeMinutes = Math.floor(uptimeMs / 60000);
    const hours = Math.floor(uptimeMinutes / 60);
    const minutes = uptimeMinutes % 60;

    res.json({
      status: 'success',
      data: {
        version: '0.2.0',
        database: dbCheck,
        uptime: `${hours}h ${minutes}m`,
        users: userCount,
        agents: {
          total: totalAgents,
          running: agentsByStatus['RUNNING'] ?? 0,
          stopped: agentsByStatus['STOPPED'] ?? 0,
          error: agentsByStatus['ERROR'] ?? 0,
          starting: agentsByStatus['STARTING'] ?? 0,
        },
        timestamp: new Date().toISOString(),
      },
    });
  });
}

export const adminController = new AdminController();
