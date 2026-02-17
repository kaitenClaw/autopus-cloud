import { spawn } from 'child_process';
import * as path from 'path';
import { prisma } from '../config/prisma';
import { profileGenerator } from './profile-generator';
import { portManager } from './port-manager';

export class SpawnerService {
  async startAgent(agentId: string) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { user: true }
    });

    if (!agent) throw new Error('Agent not found');
    if (agent.status === 'RUNNING') return agent;

    const port = agent.port || (await portManager.allocatePort());
    
    const profilePath = await profileGenerator.generate(agent.id, {
      name: agent.name,
      modelPreset: agent.modelPreset,
      telegramBotToken: agent.telegramBotToken || undefined,
      customPrompt: agent.customPrompt || undefined,
      port: port,
      allowedUserIds: [851026641] // Default to Alton for testing
    });

    // Start OpenClaw gateway
    const child = spawn('openclaw', ['gateway', 'start', '--profile-dir', profilePath], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, OPENCLAW_PROFILE_DIR: profilePath }
    });

    child.unref();

    // In a real scenario, we'd wait for the port to be active
    // For MVP, we'll just update the DB
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        status: 'RUNNING',
        port,
        profilePath,
        gatewayPid: child.pid
      }
    });

    return updatedAgent;
  }

  async stopAgent(agentId: string) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent || !agent.profilePath) return;

    // Use openclaw CLI to stop
    const stopProcess = spawn('openclaw', ['gateway', 'stop', '--profile-dir', agent.profilePath]);

    return new Promise((resolve, reject) => {
      stopProcess.on('exit', async (code) => {
        const updatedAgent = await prisma.agent.update({
          where: { id: agentId },
          data: {
            status: 'STOPPED',
            gatewayPid: null
          }
        });
        resolve(updatedAgent);
      });
      stopProcess.on('error', reject);
    });
  }
}

export const spawnerService = new SpawnerService();
