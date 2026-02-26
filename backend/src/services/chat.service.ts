import { prisma } from '../config/prisma';
import { NotFoundError, AppError } from '../utils/errors';
import { messageProxyService } from './message-proxy.service';
import { calculateCost } from '../utils/cost-calc';
import { socketService } from './socket.service';

export class ChatService {
  async processMessage(params: {
    userId: string;
    agentId: string;
    message: string;
    sessionId?: string;
    isWebSocket?: boolean;
  }) {
    const { userId, agentId, message, sessionId, isWebSocket } = params;

    // 1. Verify agent ownership
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId }
    });

    if (!agent) {
      throw new NotFoundError('Agent not found');
    }

    // 2. Ensure session exists
    let targetSessionId = sessionId;
    if (!targetSessionId) {
      const defaultSession = await prisma.chatSession.findFirst({
        where: { agentId },
        orderBy: { createdAt: 'asc' }
      });
      targetSessionId = defaultSession ? defaultSession.id : (await prisma.chatSession.create({
        data: { agentId, title: 'Default Session' }
      })).id;
    }

    // 3. Save user message
    const userMessage = await prisma.message.create({
      data: {
        agentId,
        sessionId: targetSessionId,
        role: 'user',
        content: message
      }
    });

    let assistantResponseContent = '';

    try {
      if (agent.status === 'RUNNING') {
        await messageProxyService.streamMessage(agentId, message, (token) => {
          assistantResponseContent += token;
          if (isWebSocket) {
            socketService.emitToUser(userId, 'chat:token', {
              agentId,
              sessionId: targetSessionId,
              token
            });
          }
        });
      } else {
        assistantResponseContent = `[Mock] Agent ${agent.name} is ${agent.status}. 
Status verified by Pulse. Spawner required for live runtime.`;
        if (isWebSocket) {
          socketService.emitToUser(userId, 'chat:token', {
            agentId,
            sessionId: targetSessionId,
            token: assistantResponseContent
          });
        }
      }

      // 4. Save assistant response
      const assistantMessage = await prisma.message.create({
        data: {
          agentId,
          sessionId: targetSessionId,
          role: 'assistant',
          content: assistantResponseContent
        }
      });

      // 5. Track usage
      const estimatedTokens = Math.ceil((message.length + assistantResponseContent.length) / 4);
      const model = agent.modelPreset || 'unknown';
      await prisma.usage.create({
        data: {
          userId,
          agentId,
          tokens: estimatedTokens,
          model: model,
          cost: calculateCost(model, 'unknown', estimatedTokens)
        }
      });

      if (isWebSocket) {
        socketService.emitToUser(userId, 'chat:done', {
          agentId,
          sessionId: targetSessionId,
          userMessage,
          assistantMessage
        });
      }

      return { userMessage, assistantMessage };
    } catch (error) {
      console.error('Chat processing error:', error);
      if (isWebSocket) {
        socketService.emitToUser(userId, 'chat:error', {
          agentId,
          message: error instanceof Error ? error.message : 'Chat failed'
        });
      }
      throw error;
    }
  }
}

export const chatService = new ChatService();
