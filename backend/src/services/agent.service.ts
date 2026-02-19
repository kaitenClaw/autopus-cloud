import { prisma } from '../config/prisma';
import { ConflictError, NotFoundError } from '../utils/errors';

export class AgentService {
  async createAgent(userId: string, name: string, modelPreset: string) {
    const [subscription, existingAgents] = await Promise.all([
      prisma.subscription.findUnique({
        where: { userId },
        select: { maxAgents: true },
      }),
      prisma.agent.count({
        where: { userId, deletedAt: null },
      }),
    ]);

    const maxAgents = subscription?.maxAgents ?? 1;
    if (existingAgents >= maxAgents) {
      throw new ConflictError(`Agent limit reached: your current plan allows ${maxAgents} active agent(s).`);
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        modelPreset,
        userId,
        agentConfig: {
          create: {
            model: modelPreset || 'gemini-3-flash',
            temperature: 0.7,
            systemPrompt: 'You are a helpful assistant.'
          }
        }
      },
      include: {
        agentConfig: true
      }
    });
    return agent;
  }

  async getAgents(userId: string) {
    const agents = await prisma.agent.findMany({
      where: {
        userId,
        deletedAt: null,
      },
    });
    return agents;
  }

  async getAgentById(userId: string, agentId: string) {
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        userId,
        deletedAt: null,
      },
    });

    if (!agent) {
      throw new NotFoundError('Agent not found');
    }

    return agent;
  }

  async deleteAgent(userId: string, agentId: string) {
    // Soft delete
    await prisma.agent.updateMany({
      where: {
        id: agentId,
        userId,
      },
      data: {
        deletedAt: new Date(),
        status: 'STOPPED',
      },
    });
  }
}

export const agentService = new AgentService();
