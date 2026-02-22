import { Response } from 'express';
import { agentService } from '../services/agent.service';
import { spawnerService } from '../services/spawner.service';
import { messageProxyService } from '../services/message-proxy.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';

const DEFAULT_AGENT_PRESETS = [
  {
    id: 'ghostwriter',
    name: 'Digital Ghostwriter',
    description: 'Specializes in tone-matching and content creation for X/Moltbook.',
    agents: [{ name: 'My Writer', model: 'google-antigravity/gemini-3-flash' }],
  },
  {
    id: 'growth-hacker',
    name: 'Growth Hacker',
    description: 'Proactive outreach and business lead generation partner.',
    agents: [{ name: 'My Growth Partner', model: 'google-antigravity/gemini-3-pro-high' }],
  },
  {
    id: 'solo-cfo',
    name: 'Solo CFO',
    description: 'Monitors usage, billing, and system health for your business.',
    agents: [{ name: 'My CFO', model: 'openai-codex/gpt-5.3-codex' }],
  },
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
      agents: Array<{ name: string; modelPreset?: string; model?: string }>;
      autoStart?: boolean;
    };
    const userId = req.user!.userId;
    const activeCount = await agentService.getAgents(userId).then((list) => list.length);
    if (activeCount > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Starter tier supports one active agent. Delete the existing agent or upgrade plan.',
      });
    }

    const results: Array<{
      name: string;
      modelPreset: string;
      status: 'created' | 'failed';
      message: string;
      agent?: unknown;
    }> = [];

    for (const item of agents) {
      try {
        const modelPreset = item.modelPreset || item.model || 'gemini-3-flash';
        const createdAgent = await agentService.createAgent(userId, item.name, modelPreset);

        if (autoStart) {
          await spawnerService.startAgent(createdAgent.id);
        }

        results.push({
          name: item.name,
          modelPreset,
          status: 'created',
          message: autoStart ? 'Agent created and started' : 'Agent created',
          agent: createdAgent,
        });
      } catch (error) {
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

  getPresets = asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.json({ status: 'success', data: { presets: DEFAULT_AGENT_PRESETS } });
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
