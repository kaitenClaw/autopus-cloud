import { Response } from 'express';
import { agentService } from '../services/agent.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';

export class AgentController {
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, modelPreset } = req.body;
    const userId = req.user!.userId;
    
    const agent = await agentService.createAgent(userId, name, modelPreset);
    
    res.status(201).json({ status: 'success', data: { agent } });
  });

  list = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const agents = await agentService.getAgents(userId);
    res.json({ status: 'success', data: { agents } });
  });

  getOne = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const agentId = String(req.params.id);
    const agent = await agentService.getAgentById(userId, agentId);
    res.json({ status: 'success', data: { agent } });
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const agentId = String(req.params.id);
    await agentService.deleteAgent(userId, agentId);
    res.json({ status: 'success', message: 'Agent deleted' });
  });
}

export const agentController = new AgentController();
