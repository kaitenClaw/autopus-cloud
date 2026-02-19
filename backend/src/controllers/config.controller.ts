import { Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { NotFoundError } from '../utils/errors';

export class ConfigController {
  getConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const agentId = String(req.params.id);
    const userId = req.user!.userId;

    // Verify agent ownership and get config
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId },
      include: { agentConfig: true }
    });

    if (!agent) {
      throw new NotFoundError('Agent not found');
    }

    res.json({
      status: 'success',
      data: { config: agent.agentConfig }
    });
  });

  updateConfig = asyncHandler(async (req: AuthRequest, res: Response) => {
    const agentId = String(req.params.id);
    const userId = req.user!.userId;
    const { systemPrompt, model, temperature, topP, maxTokens, stopSequences } = req.body;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId }
    });

    if (!agent) {
      throw new NotFoundError('Agent not found');
    }

    const updatedConfig = await prisma.agentConfig.upsert({
      where: { agentId },
      update: {
        systemPrompt,
        model,
        temperature,
        topP,
        maxTokens,
        stopSequences
      },
      create: {
        agentId,
        systemPrompt,
        model: model || 'gemini-3-flash',
        temperature: temperature ?? 0.7,
        topP: topP ?? 1.0,
        maxTokens: maxTokens ?? 2048,
        stopSequences: stopSequences || []
      }
    });

    res.json({
      status: 'success',
      data: { config: updatedConfig }
    });
  });
}

export const configController = new ConfigController();
