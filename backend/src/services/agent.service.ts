import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/errors';

export class AgentService {
  async createAgent(userId: string, name: string, modelPreset: string) {
    const agent = await prisma.agent.create({
      data: {
        name,
        modelPreset,
        userId,
        agentConfig: {
          create: {
            model: modelPreset || 'gpt-3.5-turbo',
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
