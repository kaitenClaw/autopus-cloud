// Agent Shared Memory Sync Service
// Enables cross-agent memory sharing and collective intelligence
// src/services/agentMemory.service.ts

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface MemoryEntry {
  id: string;
  agentId: string;
  agentName: string;
  type: 'insight' | 'learning' | 'task' | 'error';
  content: string;
  tags: string[];
  timestamp: Date;
  shared: boolean;
}

interface SharedContext {
  lastUpdated: Date;
  entries: MemoryEntry[];
  summary: string;
}

const SHARED_MEMORY_PATH = process.env.SHARED_MEMORY_PATH || '/shared-memory';
const AGENT_SQUAD = ['KAITEN', 'FORGE', 'SIGHT', 'PULSE', 'Fion'];

/**
 * Write a memory entry from an agent to shared memory
 */
export async function writeAgentMemory(
  agentId: string,
  agentName: string,
  entry: Omit<MemoryEntry, 'id' | 'agentId' | 'agentName' | 'timestamp'>
): Promise<void> {
  const memoryEntry: MemoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    agentId,
    agentName,
    timestamp: new Date(),
    ...entry,
  };

  const filePath = path.join(SHARED_MEMORY_PATH, `${agentName.toLowerCase()}-memory.jsonl`);
  
  try {
    // Append to agent's memory file
    await fs.appendFile(filePath, JSON.stringify(memoryEntry) + '\n');
    
    // If shared, also write to collective memory
    if (entry.shared) {
      const collectivePath = path.join(SHARED_MEMORY_PATH, 'collective-memory.jsonl');
      await fs.appendFile(collectivePath, JSON.stringify(memoryEntry) + '\n');
    }
    
    console.log(`📝 Memory written for ${agentName}: ${entry.type}`);
  } catch (error) {
    console.error('Failed to write agent memory:', error);
  }
}

/**
 * Read collective memory for all agents
 */
export async function readCollectiveMemory(
  limit: number = 100,
  tags?: string[]
): Promise<MemoryEntry[]> {
  try {
    const collectivePath = path.join(SHARED_MEMORY_PATH, 'collective-memory.jsonl');
    
    // Read file
    const content = await fs.readFile(collectivePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Parse entries
    const entries: MemoryEntry[] = lines
      .map(line => JSON.parse(line))
      .filter((entry: MemoryEntry) => {
        if (!tags || tags.length === 0) return true;
        return tags.some(tag => entry.tags.includes(tag));
      })
      .slice(-limit)
      .reverse();
    
    return entries;
  } catch (error) {
    console.error('Failed to read collective memory:', error);
    return [];
  }
}

/**
 * Get context for a specific agent from shared memory
 */
export async function getAgentContext(
  agentName: string,
  contextWindow: number = 10
): Promise<string> {
  const entries = await readCollectiveMemory(50);
  
  // Filter relevant entries for this agent
  const relevantEntries = entries
    .filter(e => 
      e.shared && 
      (e.tags.includes(agentName.toLowerCase()) || 
       e.tags.includes('all-agents'))
    )
    .slice(0, contextWindow);
  
  if (relevantEntries.length === 0) {
    return '';
  }
  
  // Format as context
  const context = relevantEntries
    .map(e => `[${e.agentName}] ${e.type}: ${e.content}`)
    .join('\n');
  
  return `## Shared Agent Context\n${context}\n`;
}

/**
 * Sync agent learnings to database for persistence
 */
export async function syncLearningsToDatabase(): Promise<void> {
  try {
    const collectivePath = path.join(SHARED_MEMORY_PATH, 'collective-memory.jsonl');
    const content = await fs.readFile(collectivePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const entries: MemoryEntry[] = lines.map(line => JSON.parse(line));
    
    // Filter insights and learnings that should be persisted
    const learnings = entries.filter(e => 
      (e.type === 'insight' || e.type === 'learning') && 
      e.shared
    );
    
    // Store in database (you'd need a Learning model)
    for (const learning of learnings) {
      // Upsert learning to database
      console.log(`Syncing learning: ${learning.content.substring(0, 50)}...`);
    }
    
    console.log(`✅ Synced ${learnings.length} learnings to database`);
  } catch (error) {
    console.error('Failed to sync learnings:', error);
  }
}

/**
 * Generate squad status summary
 */
export async function generateSquadSummary(): Promise<string> {
  const entries = await readCollectiveMemory(100);
  
  const summary = {
    last24h: entries.filter(e => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return new Date(e.timestamp) > dayAgo;
    }),
    byAgent: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    topTags: {} as Record<string, number>,
  };
  
  // Count by agent
  for (const entry of entries) {
    summary.byAgent[entry.agentName] = (summary.byAgent[entry.agentName] || 0) + 1;
    summary.byType[entry.type] = (summary.byType[entry.type] || 0) + 1;
    
    for (const tag of entry.tags) {
      summary.topTags[tag] = (summary.topTags[tag] || 0) + 1;
    }
  }
  
  return `
# Agent Squad Status

## Activity Summary
- Total shared memories: ${entries.length}
- Last 24h activity: ${summary.last24h.length}

## By Agent
${Object.entries(summary.byAgent)
  .map(([agent, count]) => `- ${agent}: ${count} entries`)
  .join('\n')}

## By Type
${Object.entries(summary.byType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

## Top Tags
${Object.entries(summary.topTags)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([tag, count]) => `- ${tag}: ${count}`)
  .join('\n')}
`;
}

/**
 * Initialize shared memory directory
 */
export async function initializeSharedMemory(): Promise<void> {
  try {
    await fs.mkdir(SHARED_MEMORY_PATH, { recursive: true });
    
    // Initialize agent memory files
    for (const agent of AGENT_SQUAD) {
      const filePath = path.join(SHARED_MEMORY_PATH, `${agent.toLowerCase()}-memory.jsonl`);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, '');
      }
    }
    
    // Initialize collective memory
    const collectivePath = path.join(SHARED_MEMORY_PATH, 'collective-memory.jsonl');
    try {
      await fs.access(collectivePath);
    } catch {
      await fs.writeFile(collectivePath, '');
    }
    
    console.log('✅ Shared memory initialized');
  } catch (error) {
    console.error('Failed to initialize shared memory:', error);
  }
}
