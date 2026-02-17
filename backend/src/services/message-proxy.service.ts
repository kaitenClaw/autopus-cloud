import WebSocket from 'ws';
import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/errors';

export class MessageProxyService {
  async sendMessage(agentId: string, message: string): Promise<string> {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) throw new NotFoundError('Agent not found');
    if (agent.status !== 'RUNNING' || !agent.port) {
      throw new Error('Agent is not running');
    }

    const wsUrl = `ws://localhost:${agent.port}`;

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      let response = '';
      let timer: NodeJS.Timeout;

      const cleanup = () => {
        clearTimeout(timer);
        if (ws.readyState === WebSocket.OPEN) ws.close();
      };

      timer = setTimeout(() => {
        cleanup();
        reject(new Error('Agent response timeout'));
      }, 60000);

      ws.on('open', () => {
        // Simple protocol for OpenClaw webchat proxy
        ws.send(JSON.stringify({
          type: 'user_message',
          payload: { text: message }
        }));
      });

      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        
        if (msg.type === 'agent_chunk') {
          response += msg.payload.text || '';
        } else if (msg.type === 'agent_response_end') {
          cleanup();
          resolve(response);
        } else if (msg.type === 'error') {
          cleanup();
          reject(new Error(msg.payload.message || 'Unknown agent error'));
        }
      });

      ws.on('error', (err) => {
        cleanup();
        reject(err);
      });
    });
  }
}

export const messageProxyService = new MessageProxyService();
