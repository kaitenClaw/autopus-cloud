import { Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { NotFoundError } from '../utils/errors';
import { messageProxyService } from '../services/message-proxy.service';

export class ChatController {
  sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const agentId = String(req.params.id);
    const { message, stream } = req.body;
    const userId = req.user!.userId;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId }
    });

    if (!agent) {
      throw new NotFoundError('Agent not found');
    }

    // 1. Save user message to DB
    const userMessage = await prisma.message.create({
      data: {
        agentId,
        role: 'user',
        content: message
      }
    });

    if (stream === true) {
      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let assistantResponseContent = '';

      try {
        if (agent.status === 'RUNNING' && agent.port) {
          await messageProxyService.streamMessage(agentId, message, (token) => {
            assistantResponseContent += token;
            res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
          });
        } else {
          assistantResponseContent = `[Mock] Agent ${agent.name} is ${agent.status}${agent.port ? '' : ' (no runtime endpoint yet)'}.
Use Start/Spawner first to attach runtime, then chat will route live.`;
          res.write(`data: ${JSON.stringify({ type: 'token', content: assistantResponseContent })}\n\n`);
        }

        // Save assistant response to DB
        const assistantMessage = await prisma.message.create({
          data: {
            agentId,
            role: 'assistant',
            content: assistantResponseContent
          }
        });

        res.write(`data: ${JSON.stringify({ type: 'done', data: { userMessage, assistantMessage } })}\n\n`);
        res.end();
      } catch (error) {
        console.error('Streaming error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Streaming failed' })}\n\n`);
        res.end();
      }
      return;
    }

    let assistantResponseContent: string;

    try {
      if (agent.status === 'RUNNING' && agent.port) {
        // 2. Call agent via messageProxyService only when runtime endpoint is known
        assistantResponseContent = await messageProxyService.sendMessage(agentId, message);
      } else {
        // Safe fallback when agent runtime is not actually reachable
        assistantResponseContent = `[Mock] Agent ${agent.name} is ${agent.status}${agent.port ? '' : ' (no runtime endpoint yet)'}.
Use Start/Spawner first to attach runtime, then chat will route live.`;
      }
    } catch (error) {
      console.error('Error calling agent:', error);
      assistantResponseContent = "I encountered an error trying to process your message.";
    }

    // 3. Save assistant response to DB
    const assistantMessage = await prisma.message.create({
      data: {
        agentId,
        role: 'assistant',
        content: assistantResponseContent
      }
    });

    res.json({
      status: 'success',
      data: {
        userMessage,
        assistantMessage
      }
    });
  });

  getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const agentId = String(req.params.id);
    const userId = req.user!.userId;

    // Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId }
    });

    if (!agent) {
      throw new NotFoundError('Agent not found');
    }

    const messages = await prisma.message.findMany({
      where: { agentId },
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      status: 'success',
      data: { messages }
    });
  });
}

export const chatController = new ChatController();
