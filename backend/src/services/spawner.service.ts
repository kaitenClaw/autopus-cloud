import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '../config/prisma';
import { portManager } from './port-manager';
import { profileGenerator } from './profile-generator';
import { NotFoundError, ValidationError } from '../utils/errors';
import { socketService } from './socket.service';

const execAsync = promisify(exec);

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class SpawnerService {
  private validateAgentId(agentId: string): void {
    if (!UUID_REGEX.test(agentId)) {
      throw new ValidationError('Invalid agent ID format');
    }
  }

  // Container name validation - alphanumeric and hyphens only
  private readonly CONTAINER_NAME_REGEX = /^[a-z0-9-]+$/;

  private sanitizeContainerName(name: string): string {
    // Remove any potentially dangerous characters
    const sanitized = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!this.CONTAINER_NAME_REGEX.test(sanitized) || sanitized.length === 0) {
      throw new ValidationError('Invalid container name format');
    }
    return sanitized;
  }

  async startAgent(agentId: string) {
    // Validate agentId to prevent command injection
    this.validateAgentId(agentId);
    
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
    // Sanitize container name to prevent injection
    const containerName = this.sanitizeContainerName(`agent-${agent.id}`);
    
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

      // Wait a moment for container to start
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify container is actually running (health check)
      const { stdout: healthCheck } = await execAsync(`docker ps -q --filter "id=${containerId}" --filter "status=running"`);
      if (!healthCheck.trim()) {
        // Container not running - get logs for debugging
        const { stdout: logs } = await execAsync(`docker logs ${containerId} 2>&1 || echo "No logs available"`);
        throw new Error(`Container failed to start. Logs: ${logs}`);
      }

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
      socketService.emit('agent:status', { agentId, status: 'ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async stopAgent(agentId: string) {
    // Validate agentId to prevent command injection
    this.validateAgentId(agentId);
    
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
