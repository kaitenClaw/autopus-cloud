import type { Agent } from '../types';

export const AGENT_PORTS: Record<string, number> = {
  kaiten: 18792,
  forge: 18793,
  sight: 18795,
  pulse: 18797,
};

export const AGENT_COLORS: Record<string, string> = {
  kaiten: '#0066FF', // Electric Blue
  forge: '#00C853',  // Success Green
  sight: '#FFB300',  // Amber
  pulse: '#FF3D00',  // Red
};

export const AGENT_ICONS: Record<string, string> = {
  kaiten: '🧠',
  forge: '⚡',
  sight: '🔍',
  pulse: '◉',
};

// Agent Core descriptions - capabilities
export const AGENT_SOULS: Record<string, string> = {
  kaiten: 'Core Intelligence',
  forge: 'Build Engine',
  sight: 'Research & Analysis',
  pulse: 'Operations',
};

export async function fetchAgentStatus(_port: number, _token?: string): Promise<Partial<Agent>> {
  // Skip status fetch in production - agents not exposed publicly
  // In production, agents run internally and aren't accessible from browser
  return {
    status: 'online',
    lastHeartbeat: new Date(),
    metrics: { cpuUsage: 0, memoryUsage: 0, tasksCompleted: 0, uptime: 0 },
  };
}

export function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'online': return '#22c55e';
    case 'offline': return '#ef4444';
    case 'busy': return '#f59e0b';
    case 'error': return '#dc2626';
    default: return '#6b7280';
  }
}
