/**
 * PULSE Integration Service
 * Provides health checks, deployment coordination, and agent management
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface PulseAgentStatus {
  id: string;
  name: string;
  port: number;
  status: 'online' | 'offline' | 'error';
  pid?: number;
  uptime: number;
  lastHeartbeat: Date;
  currentTask?: string;
  taskProgress?: number;
}

export interface PulseCommand {
  agentId: string;
  command: 'start' | 'stop' | 'restart' | 'status' | 'deploy';
  payload?: any;
}

const AGENT_PORTS: Record<string, number> = {
  kaiten: 18792,
  forge: 18793,
  sight: 18795,
  pulse: 18797,
  fion: 18799,
};

const AGENT_NAMES: Record<string, string> = {
  kaiten: 'KAITEN',
  forge: 'FORGE',
  sight: 'SIGHT',
  pulse: 'PULSE',
  fion: 'Fion',
};

/**
 * Get status of a specific agent by checking its gateway
 */
export async function getAgentStatus(agentId: string): Promise<PulseAgentStatus> {
  const port = AGENT_PORTS[agentId];
  if (!port) {
    throw new Error(`Unknown agent: ${agentId}`);
  }

  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      const data = (await response.json()) as any;
      return {
        id: agentId,
        name: AGENT_NAMES[agentId],
        port,
        status: 'online',
        uptime: data.uptime || 0,
        lastHeartbeat: new Date(),
        currentTask: data.currentTask,
      };
    }
  } catch (error) {
    // Agent is offline or unreachable
  }

  return {
    id: agentId,
    name: AGENT_NAMES[agentId],
    port,
    status: 'offline',
    uptime: 0,
    lastHeartbeat: new Date(),
  };
}

/**
 * Get status of all agents
 */
export async function getAllAgentStatuses(): Promise<PulseAgentStatus[]> {
  const agents = Object.keys(AGENT_PORTS);
  const statuses = await Promise.all(
    agents.map(id => getAgentStatus(id).catch(() => ({
      id,
      name: AGENT_NAMES[id],
      port: AGENT_PORTS[id],
      status: 'error' as const,
      uptime: 0,
      lastHeartbeat: new Date(),
    })))
  );
  return statuses;
}

/**
 * Execute a command on an agent
 */
export async function executeAgentCommand(command: PulseCommand): Promise<any> {
  const { agentId, command: cmd, payload } = command;
  
  switch (cmd) {
    case 'restart':
      return restartAgent(agentId);
    case 'status':
      return getAgentStatus(agentId);
    case 'deploy':
      return deployToAgent(agentId, payload);
    default:
      throw new Error(`Unknown command: ${cmd}`);
  }
}

/**
 * Restart an agent via launchd
 */
async function restartAgent(agentId: string): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const label = `ai.openclaw.${agentId}`;
    const child = spawn('launchctl', ['kickstart', '-k', label]);
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, message: `Agent ${agentId} restarted successfully` });
      } else {
        resolve({ success: false, message: `Failed to restart agent ${agentId}` });
      }
    });
  });
}

/**
 * Deploy configuration to an agent
 */
async function deployToAgent(agentId: string, config: any): Promise<{ success: boolean; message: string }> {
  try {
    const configPath = join(process.env.HOME || '', `.openclaw-${agentId}`, 'openclaw.json');
    
    // Read existing config
    const existingConfig = JSON.parse(readFileSync(configPath, 'utf8'));
    
    // Merge new config
    const newConfig = { ...existingConfig, ...config };
    
    // Write back
    writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    
    return { success: true, message: `Configuration deployed to ${agentId}` };
  } catch (error) {
    return { 
      success: false, 
      message: `Failed to deploy to ${agentId}: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Get coordination status board
 */
export function getStatusBoard(): any {
  try {
    const statusPath = join(process.env.HOME || '', 'ocaas-project', 'coordination', 'status-board.json');
    const data = readFileSync(statusPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { error: 'Failed to read status board' };
  }
}

/**
 * Update coordination status board
 */
export function updateStatusBoard(updates: any): void {
  try {
    const statusPath = join(process.env.HOME || '', 'ocaas-project', 'coordination', 'status-board.json');
    const existing = getStatusBoard();
    const updated = { ...existing, ...updates, lastUpdated: new Date().toISOString() };
    writeFileSync(statusPath, JSON.stringify(updated, null, 2));
  } catch (error) {
    console.error('Failed to update status board:', error);
  }
}

export default {
  getAgentStatus,
  getAllAgentStatuses,
  executeAgentCommand,
  getStatusBoard,
  updateStatusBoard,
};
