import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '../config/prisma';
import { portManager } from './port-manager';
import { profileGenerator } from './profile-generator';
import { NotFoundError } from '../utils/errors';
import { socketService } from './socket.service';

const execAsync = promisify(exec);

export class SpawnerService {
  async startAgent(agentId: string) {
    // ... logic ...
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { user: true }
    });

    if (!agent) throw new NotFoundError('Agent not found');
    if (agent.status === 'RUNNING') return agent;

    socketService.emit('agent:status', { agentId, status: 'STARTING' });

    const port = await portManager.getAvailablePort();
    // ...
    const profilePath = await profileGenerator.generate({
      agentId: agent.id,
      modelPrimary: agent.modelPreset,
      telegramToken: agent.telegramBotToken || undefined,
      allowedUserIds: [agent.userId],
      systemPrompt: agent.customPrompt || undefined
    });

    // Start docker container for the agent
    // Note: We use the kaiten-agent:latest image built earlier
    const containerName = `agent-${agent.id}`;
    
    // Command to run the agent in a container
    const cmd = `docker run -d \
      --name ${containerName} \
      --network coolify \
      -p ${port}:18789 \
      -v ${profilePath}:/workspace/.openclaw \
      -e OPENCLAW_GATEWAY_PORT=18789 \
      -e OPENCLAW_GATEWAY_BIND=0.0.0.0 \
      -e OPENCLAW_GATEWAY_MODE=local \
      --restart unless-stopped \
      kaiten-agent:latest gateway run --allow-unconfigured`;

    try {
      // Check if container exists and remove it if it does
      await execAsync(`docker rm -f ${containerName}`).catch(() => {});
      
      const { stdout } = await execAsync(cmd);
      const containerId = stdout.trim();

      await prisma.agent.update({
        where: { id: agentId },
        data: {
          status: 'RUNNING',
          port: port,
          profilePath: profilePath,
          config: { containerId }
        }
      });

      socketService.emit('agent:status', { agentId, status: 'RUNNING', port });

      return { ...agent, status: 'RUNNING', port };
    } catch (error) {
      console.error(`Failed to spawn agent ${agentId}:`, error);
      await prisma.agent.update({
        where: { id: agentId },
        data: { status: 'ERROR' }
      });
      socketService.emit('agent:status', { agentId, status: 'ERROR' });
      throw error;
    }
  }

  async stopAgent(agentId: string) {
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) throw new NotFoundError('Agent not found');

    socketService.emit('agent:status', { agentId, status: 'STOPPING' });

    const containerName = `agent-${agent.id}`;
    await execAsync(`docker stop ${containerName}`).catch(() => {});
    await execAsync(`docker rm ${containerName}`).catch(() => {});

    await prisma.agent.update({
      where: { id: agentId },
      data: { status: 'STOPPED', port: null }
    });

    socketService.emit('agent:status', { agentId, status: 'STOPPED' });
  }
}

export const spawnerService = new SpawnerService();
