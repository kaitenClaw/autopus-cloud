import { Response } from 'express';
import { agentService } from '../services/agent.service';
import { spawnerService } from '../services/spawner.service';
import { messageProxyService } from '../services/message-proxy.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';

const DEFAULT_KAITEN_PRESETS = [
  { name: 'Prime', suggestedModel: 'gpt-5' },
  { name: 'Forge', suggestedModel: 'claude-sonnet-4-20250514' },
  { name: 'Sight', suggestedModel: 'gpt-4.1' },
  { name: 'Pulse', suggestedModel: 'gemini-2.5-flash' },
] as const;

export class AgentController {
  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, modelPreset } = req.body;
    const userId = req.user!.userId;
    
    const agent = await agentService.createAgent(userId, name, modelPreset);
    
    res.status(201).json({ status: 'success', data: { agent } });
  });

  bulkCreate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { agents, autoStart = false } = req.body as {
      agents: Array<{ name: string; modelPreset: string }>;
      autoStart?: boolean;
    };
    const userId = req.user!.userId;

    const results: Array<{
      name: string;
      modelPreset: string;
      status: 'created' | 'failed';
      message: string;
      agent?: unknown;
    }> = [];

    for (const item of agents) {
      try {
        const createdAgent = await agentService.createAgent(userId, item.name, item.modelPreset);

        if (autoStart) {
          await spawnerService.startAgent(createdAgent.id);
        }

        results.push({
          name: item.name,
          modelPreset: item.modelPreset,
          status: 'created',
          message: autoStart ? 'Agent created and started' : 'Agent created',
          agent: createdAgent,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          name: item.name,
          modelPreset: item.modelPreset,
          status: 'failed',
          message,
        });
      }
    }

    res.status(201).json({ status: 'success', data: { agents: results } });
  });

  getPresets = asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.json({ status: 'success', data: { presets: DEFAULT_KAITEN_PRESETS } });
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
