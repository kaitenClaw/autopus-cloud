import { Response } from 'express';
import { agentService } from '../services/agent.service';
import { spawnerService } from '../services/spawner.service';
import { messageProxyService } from '../services/message-proxy.service';
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

  start = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const agentId = String(req.params.id);
    
    // Ensure agent belongs to user
    await agentService.getAgentById(userId, agentId);
    
    const agent = await spawnerService.startAgent(agentId);
    res.json({ status: 'success', data: { agent } });
  });

  stop = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const agentId = String(req.params.id);
    
    // Ensure agent belongs to user
    await agentService.getAgentById(userId, agentId);
    
    const agent = await spawnerService.stopAgent(agentId);
    res.json({ status: 'success', data: { agent } });
  });

  chat = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const agentId = String(req.params.id);
    const { message } = req.body;
    
    // Ensure agent belongs to user
    await agentService.getAgentById(userId, agentId);
    
    const response = await messageProxyService.sendMessage(agentId, message);
    res.json({ status: 'success', data: { response } });
  });
}

export const agentController = new AgentController();
