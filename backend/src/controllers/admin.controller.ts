import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';

// List all users (Admin only)
export const listUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: { agents: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ status: 'success', data: { users } });
});

// System-wide Agent Monitor (Admin only)
export const listAllAgents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const agents = await prisma.agent.findMany({
    include: {
      user: {
        select: { email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ status: 'success', data: { agents } });
});

// System Health Check (Admin only)
export const systemHealth = asyncHandler(async (req: AuthRequest, res: Response) => {
  const health = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString()
  };

  res.json({ status: 'success', data: { health } });
});

// Legacy class-based export for backward compatibility
export class AdminController {
  listUsers = listUsers;
  listAllAgents = listAllAgents;
  systemHealth = systemHealth;
}

export const adminController = new AdminController();
