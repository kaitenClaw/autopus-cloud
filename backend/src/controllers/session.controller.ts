import { Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { NotFoundError } from '../utils/errors';

export class SessionController {
  list = asyncHandler(async (req: AuthRequest, res: Response) => {
    const agentId = String(req.params.id);
    const userId = req.user!.userId;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId }
    });

    if (!agent) {
      throw new NotFoundError('Agent not found');
    }

    let sessions = await prisma.chatSession.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' }
    });

    // Auto-create default session if none exist
    if (sessions.length === 0) {
      const defaultSession = await prisma.chatSession.create({
        data: {
          agentId,
          title: 'Default Session',
          memoryScope: 'WORKSPACE'
        }
      });
      sessions = [defaultSession];
    }

    res.json({
      status: 'success',
      data: { sessions }
    });
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const agentId = String(req.params.id);
    const { title, memoryScope } = req.body;
    const userId = req.user!.userId;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId }
    });

    if (!agent) {
      throw new NotFoundError('Agent not found');
    }

    const session = await prisma.chatSession.create({
      data: {
        agentId,
        title: title || 'New Session',
        memoryScope: memoryScope || 'WORKSPACE'
      }
    });

    res.status(201).json({
      status: 'success',
      data: { session }
    });
  });
}

export const sessionController = new SessionController();
