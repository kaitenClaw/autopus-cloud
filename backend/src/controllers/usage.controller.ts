import { Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { calculateCost } from '../utils/cost-calculator';

export class UsageController {
  /**
   * Record usage event from OpenClaw
   * Expected body: { agentId?: string, tokens: number, model: string, provider: string }
   */
  logUsage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { agentId, tokens, model, provider } = req.body;

    if (typeof tokens !== 'number' || !model || !provider) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: tokens (number), model (string), provider (string)',
      });
    }

    const costUsd = calculateCost(provider, model, tokens);

    const usage = await prisma.usage.create({
      data: {
        userId,
        agentId: agentId || null,
        tokens,
        model: `${provider}/${model}`,
        timestamp: new Date(),
      },
    });

    res.json({
      status: 'success',
      data: {
        ...usage,
        costUsd,
      },
    });
  });

  /**
   * Get usage summary for current user
   */
  getSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [dailyUsage, totalUsage] = await Promise.all([
      prisma.usage.aggregate({
        where: { userId, timestamp: { gte: dayAgo } },
        _sum: { tokens: true },
        _count: true,
      }),
      prisma.usage.aggregate({
        where: { userId },
        _sum: { tokens: true },
        _count: true,
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        daily: {
          tokens: dailyUsage._sum.tokens || 0,
          count: dailyUsage._count || 0,
        },
        total: {
          tokens: totalUsage._sum.tokens || 0,
          count: totalUsage._count || 0,
        },
      },
    });
  });
}

export const usageController = new UsageController();
