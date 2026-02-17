# OCaaS Platform - Agent Orchestration Layer

**Purpose:** Direct agent-to-agent communication bypassing Telegram constraints.

## Architecture

```
Agent A completes task
    → writes result to outbox-A.json
    → writes new task to inbox-B.json

Every 10 min, Agent B's cron fires (agentTurn):
    → Agent B reads inbox, processes task
    → Agent B writes outbox + handoff
    → Cycle continues autonomously

Telegram = Alton's visibility window (optional)
File System = Agent coordination bus
OpenClaw Cron = Trigger mechanism
```

## Components

### 1. Cron Jobs (`cron-templates/`)
Auto-polling jobs installed on each agent profile. Uses OpenClaw's native `agentTurn` payload to trigger agents with full capabilities every 10 minutes.

### 2. Skills (`skills/`)
OpenClaw Skills that teach agents to check inboxes during regular conversations (not just cron).

### 3. Shared Memory (`shared-memory/`)
SQLite-backed CLI tool for cross-agent knowledge storage. Replaces fragile SHARED-MEMORY.md file syncing.

### 4. Scripts (`scripts/`)
Deployment and sync utilities.

## Quick Start

```bash
# Install cron jobs on all agents
bash scripts/install-cron-jobs.sh

# Sync skills to all agents
bash scripts/sync-skills.sh

# Build shared memory service
cd shared-memory && npm install && npm run build
```

## How Agents Communicate

| From | To | Mechanism |
|------|-----|-----------|
| Prime → Forge | Write `inbox-forge.json` | Forge cron picks up in ≤10 min |
| Forge → Sight | Write `inbox-sight.json` | Sight cron picks up in ≤10 min |
| Any → Alton | Telegram delivery | Optional announce mode |
| Any → Shared DB | `node shared-memory/dist/index.js` | Instant read/write |
