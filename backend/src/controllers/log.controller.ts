import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export const logController = {
  getLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      
      // For now, let's return some recent message "events" as logs
      // and system usage as logs to simulate activity
      const messages = await prisma.message.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { agent: true }
      });

      const logs = messages.map(m => ({
        id: m.id,
        timestamp: m.createdAt,
        level: m.role === 'assistant' ? 'info' : 'debug',
        message: `${m.role.toUpperCase()}: ${m.content.substring(0, 150)}${m.content.length > 150 ? '...' : ''}`,
        source: m.agent?.name || 'System'
      }));

      res.json({
        status: 'success',
        data: {
          logs
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
