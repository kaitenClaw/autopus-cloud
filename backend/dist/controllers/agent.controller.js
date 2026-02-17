"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentController = exports.AgentController = void 0;
const agent_service_1 = require("../services/agent.service");
const errorHandler_1 = require("../middleware/errorHandler");
class AgentController {
    constructor() {
        this.create = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { name, modelPreset } = req.body;
            const userId = req.user.userId;
            const agent = await agent_service_1.agentService.createAgent(userId, name, modelPreset);
            res.status(201).json({ status: 'success', data: { agent } });
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
    }
}
exports.AgentController = AgentController;
exports.agentController = new AgentController();
