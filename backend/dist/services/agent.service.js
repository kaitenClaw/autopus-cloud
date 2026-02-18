"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentService = exports.AgentService = void 0;
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
class AgentService {
    async createAgent(userId, name, modelPreset) {
        const agent = await prisma_1.prisma.agent.create({
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
    async getAgents(userId) {
        const agents = await prisma_1.prisma.agent.findMany({
            where: {
                userId,
                deletedAt: null,
            },
        });
        return agents;
    }
    async getAgentById(userId, agentId) {
        const agent = await prisma_1.prisma.agent.findFirst({
            where: {
                id: agentId,
                userId,
                deletedAt: null,
            },
        });
        if (!agent) {
            throw new errors_1.NotFoundError('Agent not found');
        }
        return agent;
    }
    async deleteAgent(userId, agentId) {
        // Soft delete
        await prisma_1.prisma.agent.updateMany({
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
exports.AgentService = AgentService;
exports.agentService = new AgentService();
