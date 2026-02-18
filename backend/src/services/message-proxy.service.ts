import WebSocket from 'ws';
import { prisma } from '../config/prisma';
import { NotFoundError, AppError } from '../utils/errors';

export class MessageProxyService {
  async sendMessage(agentId: string, message: string): Promise<string> {
    let fullResponse = '';
    await this.streamMessage(agentId, message, (chunk) => {
      fullResponse += chunk;
    });
    return fullResponse;
  }

  async streamMessage(
    agentId: string,
    message: string,
    onToken: (token: string) => void
  ): Promise<void> {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) throw new NotFoundError('Agent not found');
    if (agent.status !== 'RUNNING') throw new AppError('Agent is not running', 400);

    // If running in docker on 'coolify' network, we use container name
    // If local, we use localhost
    const isLocal = process.env.NODE_ENV !== 'production';
    const containerName = `agent-${agent.id}`;
    const host = isLocal ? 'localhost' : containerName;
    const port = isLocal && agent.port ? agent.port : 18789; // Local uses mapped port, Docker uses internal port

    const wsUrl = `ws://${host}:${port}`;

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      const timeout = setTimeout(() => {
        ws.terminate();
        reject(new AppError('Agent response timeout', 504));
      }, 60000); // Increased timeout for long responses

      ws.on('open', () => {
        ws.send(
          JSON.stringify({
            type: 'message',
            content: message,
          })
        );
      });

      ws.on('message', (data) => {
        try {
          const payload = JSON.parse(data.toString());
          if (payload.type === 'token') {
            onToken(payload.content);
          } else if (payload.type === 'done') {
            clearTimeout(timeout);
            ws.close();
            resolve();
          } else if (payload.type === 'error') {
            clearTimeout(timeout);
            ws.close();
            reject(new AppError(payload.message || 'Agent error', 500));
          }
        } catch (e) {
          // If not JSON, handle as raw text (or ignore)
        }
      });

      ws.on('error', (err) => {
        clearTimeout(timeout);
        reject(new AppError(`Failed to connect to agent: ${err.message}`, 502));
      });
    });
  }
}

export const messageProxyService = new MessageProxyService();
