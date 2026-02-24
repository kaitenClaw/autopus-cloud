import type { Agent } from '../types';

export const AGENT_PORTS: Record<string, number> = {
  kaiten: 18792,
  forge: 18793,
  sight: 18795,
  pulse: 18797,
  fion: 18799,
};

export const AGENT_COLORS: Record<string, string> = {
  kaiten: '#6366f1', // Indigo
  forge: '#f59e0b',  // Amber
  sight: '#10b981',  // Emerald
  pulse: '#ef4444',  // Red
  fion: '#ec4899',   // Pink
};

export const AGENT_ICONS: Record<string, string> = {
  kaiten: '🧠',
  forge: '🔨',
  sight: '👁️',
  pulse: '⚡',
  fion: '🎨',
};

// Agent SOUL descriptions - core personality essence
export const AGENT_SOULS: Record<string, string> = {
  kaiten: '你的策略大腦',
  forge: '你的建造者',
  sight: '你的觀察者',
  pulse: '你的脈動',
  fion: '你的創意夥伴',
};

export async function fetchAgentStatus(port: number, token?: string): Promise<Partial<Agent>> {
  try {
    const url = token 
      ? `http://localhost:${port}/status?token=${token}`
      : `http://localhost:${port}/status`;
    
    const response = await fetch(url, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return {
      status: data.gateway?.reachable ? 'online' : 'offline',
      lastHeartbeat: new Date(),
      metrics: {
        cpuUsage: data.system?.cpu || 0,
        memoryUsage: data.system?.memory || 0,
        tasksCompleted: data.sessions?.totalSessions || 0,
        uptime: data.gatewayService?.runtimeShort || 0,
      },
    };
  } catch (error) {
    return {
      status: 'offline',
      lastHeartbeat: new Date(),
      metrics: { cpuUsage: 0, memoryUsage: 0, tasksCompleted: 0, uptime: 0 },
    };
  }
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
