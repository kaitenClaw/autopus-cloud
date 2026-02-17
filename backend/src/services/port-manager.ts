import { prisma } from '../config/prisma';

export class PortManager {
  private static readonly START_PORT = 19000;
  private static readonly END_PORT = 19999;

  async allocatePort(): Promise<number> {
    const agentsWithPorts = await prisma.agent.findMany({
      where: {
        port: {
          not: null,
        },
        status: {
          in: ['STARTING', 'RUNNING'],
        },
      },
      select: {
        port: true,
      },
    });

    const usedPorts = new Set(agentsWithPorts.map((a) => a.port as number));

    for (let port = PortManager.START_PORT; port <= PortManager.END_PORT; port++) {
      if (!usedPorts.has(port)) {
        return port;
      }
    }

    throw new Error('No available ports');
  }
}

export const portManager = new PortManager();
