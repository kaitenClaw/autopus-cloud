# SHARED CONTEXT — OCaaS Project

**Sprint:** Agent Independence & Growth Mode  
**Status:** ACTIVE (since 2026-02-23 13:30 HKT)  
**Previous:** MVP Marathon (concluded)

---

## 🎨 Brand Identity Update (2026-02-24)

**New Corporate Minimalist Theme:**
- **Primary:** Navy (#1a2332) — Deep, trustworthy, professional
- **Secondary:** White (#f8fafc) — Clean, crisp, modern
- **Accent:** Coral (#f4a261) — Warm, human, approachable
- **Logo:** Geometric octopus with 8 tentacles (8 agents), coral nodes
- **Style:** DeepMind/Notion-inspired, enterprise-ready

**Files Updated:**
- `frontend/src/index.css` — New color tokens
- `frontend/src/components/AutopusLogo.tsx` — New SVG logo
- `frontend/index.html` — New favicon
- `frontend/src/components/LandingPage.tsx` — Updated to match

---

## 🎨 Dashboard 2.0 — Agent Companion Platform (DEPLOYED)

**Status:** 🟢 Live at https://dashboard.autopus.cloud  
**Updated:** 2026-02-24  
**Commits:** `1c1b294`, `b9c9b2c`

### Core Concept: Agent Swarm Architecture

Autopus is **"Your Agent Companion Platform"** — users adopt digital life forms that are sovereign entities in a swarm, each with:

| Component | Description |
|-----------|-------------|
| **SOUL** | Core personality, speaking style, values |
| **MEMORY** | Interaction history, decisions, learnings |
| **SKILLS** | Installed capabilities from marketplace |
| **FILES** | Workspace (SOUL.md, MEMORY.md, etc.) |
| **CRON** | Autonomous scheduled tasks |
| **USER** | Relationship depth with owner |

### Dashboard 2.0 Features

**LifeAgentCard Component:**
- Glassmorphism design with breathing light effect
- Agent stats: Memory count, Skills, Today's conversations
- Avatar with SOUL description (e.g., "Your Strategy Brain")
- Action buttons: [💬 Chat] [🧠 Memory] [⚙️ Settings]

**Navigation (5 Tabs):**
| Tab | Purpose |
|-----|---------|
| 🏠 My Agents | Agent gallery with life cards |
| 💬 Chat | Real-time conversation (WIP) |
| 🧬 DNA | Agent life档案 — SOUL/MEMORY/SKILLS/FILES/CRON/USER |
| 🛒 Marketplace | Skill store for agent learning |
| 👤 Profile | User settings & preferences |

**Agent DNA Page:**
- **SOUL**: Personality, speaking style, core values, growth goals
- **MEMORY**: Timeline of decisions/learning/events with importance
- **SKILLS**: Skill grid with levels + "Learn New Skill" button
- **FILES**: Workspace file browser (SOUL.md, MEMORY.md, etc.)
- **CRON**: Scheduled tasks with last/next run times
- **USER**: Interaction stats, understanding level, favorite topics

**Technical Stack:**
- React + TypeScript + Tailwind + shadcn/ui
- Glassmorphism effects (backdrop-blur-xl)
- Breathing animation for online status (3s pulse)
- Mobile-first responsive design
- Desktop side nav + Mobile bottom nav

---

## Current Mission

Transform from "MVP rush" to **sustainable multi-agent operation**. Each agent (KAITEN, FORGE, SIGHT, PULSE) is now a sovereign entity with:
- Independent workspace, memory, and gateway
- Specialized capabilities and growth paths
- XP/Leveling system
- Daily autonomy with coordinated checkpoints

---

## Agent Status Overview

| Agent | Role | Status | Level | Current Focus |
|-------|------|--------|-------|---------------|
| **KAITEN** | Orchestrator | growing | 2 | Strategy & Coordination |
| **FORGE** | Builder | growing | 1 | Dashboard 2.0 Dev |
| **SIGHT** | Researcher | growing | 1 | Security + OSINT |
| **PULSE** | DevOps | growing | 1 | Infrastructure Optimization |

---

## Security Status ✅

**2026-02-23:** All 3 critical findings resolved.
- Config permissions: `chmod 600` applied
- Telegram groupPolicy: `allowlist` with authorized IDs
- Elevated tools: Restricted to allowlist-only triggers

---

## Active Work Streams

### 🎨 Dashboard 2.0 (FORGE) — ✅ COMPLETED
- **Status:** Production deployed at dashboard.autopus.cloud
- **Features:** LifeAgentCard, Agent DNA page, 5-tab navigation
- **Next:** Chat integration, Marketplace backend

### 🔒 Security & Intelligence (SIGHT)
- Daily security scans
- OSINT briefings (Moltbook/GitHub/Twitter)
- Threat intelligence
- Skill security audits

### ☁️ Infrastructure (PULSE)
- Production endpoint monitoring
- Automated deployment pipeline
- CI/CD with GitHub Actions
- Cost tracking alerts

### 💬 Chat System (PENDING)
- WebSocket integration for real-time messaging
- Agent-to-user direct communication
- Message history persistence

---

## Production Environment

| Service | URL | Status |
|---------|-----|--------|
| Landing Page | https://autopus.cloud | 🟢 Live |
| Dashboard | https://dashboard.autopus.cloud | 🟢 Live |
| API | https://api.autopus.cloud | 🟢 Live |

**VPS:** 108.160.137.70 (Vultr)  
**Orchestration:** Coolify + Docker

---

## Key Documents

- **Sprint Plan:** `SPRINT-GROWTH-MODE.md`
- **Status Board:** `status-board.json`
- **Business Strategy:** `~/workspace/AUTOPUS-BUSINESS-STRATEGY.md`
- **Master Plan:** `~/workspace/AUTOPUS-MASTER-PLAN.md`

---

## Communication Protocol

1. **Mentions in Group:** Direct mention (@agent) for tasks requiring attention
2. **ACTIVE-TASK.md:** Each agent maintains their own task file
3. **Daily Checkpoints:** 09:00 and 18:00 HKT
4. **Blocker Escalation:** Immediately to KAITEN → Alton if unresolved

---

*Last Synced: 2026-02-24*  
*Dashboard 2.0 Deployed: https://dashboard.autopus.cloud*
