import { prisma } from '../config/prisma';

export class PortManager {
  private readonly minPort = 19000;
  private readonly maxPort = 19999;

  async getAvailablePort(): Promise<number> {
    const agents = await prisma.agent.findMany({
      where: {
        port: { not: null },
        status: 'RUNNING'
      },
      select: { port: true }
    });

    const usedPorts = new Set(agents.map(a => a.port as number));

    for (let port = this.minPort; port <= this.maxPort; port++) {
      if (!usedPorts.has(port)) {
        return port;
      }
    }

    throw new Error('No available ports for new agents');
  }
}

export const portManager = new PortManager();
