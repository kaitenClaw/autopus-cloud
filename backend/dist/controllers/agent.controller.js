"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentController = exports.AgentController = void 0;
const agent_service_1 = require("../services/agent.service");
const spawner_service_1 = require("../services/spawner.service");
const message_proxy_service_1 = require("../services/message-proxy.service");
const errorHandler_1 = require("../middleware/errorHandler");
const DEFAULT_AGENT_PRESETS = [
    {
        id: 'solo-starter',
        name: 'Solo Starter',
        description: 'Create one OpenClaw agent and start chatting immediately.',
        agents: [{ name: 'My Agent', model: 'openai-codex/gpt-5.2' }],
    },
];
class AgentController {
    constructor() {
        this.create = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { name, modelPreset } = req.body;
            const userId = req.user.userId;
            const agent = await agent_service_1.agentService.createAgent(userId, name, modelPreset);
            res.status(201).json({ status: 'success', data: { agent } });
        });
        this.bulkCreate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { agents, autoStart = false } = req.body;
            const userId = req.user.userId;
            const activeCount = await agent_service_1.agentService.getAgents(userId).then((list) => list.length);
            if (activeCount > 0) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Starter tier supports one active agent. Delete the existing agent or upgrade plan.',
                });
            }
            const results = [];
            for (const item of agents) {
                try {
                    const modelPreset = item.modelPreset || item.model || 'gemini-3-flash';
                    const createdAgent = await agent_service_1.agentService.createAgent(userId, item.name, modelPreset);
                    if (autoStart) {
                        await spawner_service_1.spawnerService.startAgent(createdAgent.id);
                    }
                    results.push({
                        name: item.name,
                        modelPreset,
                        status: 'created',
                        message: autoStart ? 'Agent created and started' : 'Agent created',
                        agent: createdAgent,
                    });
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : 'Unknown error';
                    results.push({
                        name: item.name,
                        modelPreset: item.modelPreset || item.model || 'gemini-3-flash',
                        status: 'failed',
                        message,
                    });
                }
            }
            res.status(201).json({ status: 'success', data: { agents: results } });
        });
        this.getPresets = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
            res.json({ status: 'success', data: { presets: DEFAULT_AGENT_PRESETS } });
        });
        this.list = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.userId;
            const agents = await agent_service_1.agentService.getAgents(userId);
            res.json({ status: 'success', data: { agents } });
        });
        this.getOne = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.userId;
            const agentId = String(req.params.id);
            const agent = await agent_service_1.agentService.getAgentById(userId, agentId);
            res.json({ status: 'success', data: { agent } });
        });
        this.delete = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.userId;
            const agentId = String(req.params.id);
            await agent_service_1.agentService.deleteAgent(userId, agentId);
            res.json({ status: 'success', message: 'Agent deleted' });
        });
        this.start = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.userId;
            const agentId = String(req.params.id);
            // Ensure agent belongs to user
            await agent_service_1.agentService.getAgentById(userId, agentId);
            const agent = await spawner_service_1.spawnerService.startAgent(agentId);
            res.json({ status: 'success', data: { agent } });
        });
        this.stop = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.userId;
            const agentId = String(req.params.id);
            // Ensure agent belongs to user
            await agent_service_1.agentService.getAgentById(userId, agentId);
            const agent = await spawner_service_1.spawnerService.stopAgent(agentId);
            res.json({ status: 'success', data: { agent } });
        });
        this.chat = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user.userId;
            const agentId = String(req.params.id);
            const { message } = req.body;
            // Ensure agent belongs to user
            await agent_service_1.agentService.getAgentById(userId, agentId);
            const response = await message_proxy_service_1.messageProxyService.sendMessage(agentId, message);
            res.json({ status: 'success', data: { response } });
        });
    }
}
exports.AgentController = AgentController;
exports.agentController = new AgentController();
