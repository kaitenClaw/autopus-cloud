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

## 🎨 Dashboard 4.1 — Agent Companion Platform (DEPLOYED)

**Status:** 🟢 Live at https://dashboard.autopus.cloud  
**Updated:** 2026-02-25  
**Version:** v4.1 (UI Simplification)
**Commits:** `1c1b294`, `b9c9b2c`, `8455256`, `b732961`, `cc06da4`

### Design System v4.0 (LOCKED)

| Element | Value | Usage |
|---------|-------|-------|
| **Navy** | #2B2D42 | Primary text, headers, backgrounds |
| **Coral** | #F4845F | CTAs, accents, active states |
| **Warm White** | #F5F5F0 | Page background |
| **Surface** | #FFFFFF | Cards, modals |
| **Border** | #E8E8E4 | Dividers, borders |

**Style:** Clean, minimal, enterprise-ready (DeepMind/Notion-inspired)  
**Language:** English-first for global market

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

## 🚀 Landing Page v4.0 (DEPLOYED)

**Status:** 🟢 Live at http://108.160.137.70:3001  
**Domain:** https://autopus.cloud (routing in progress)  
**Updated:** 2026-02-24  
**Commit:** `3a07394`

### Features
- **Hero Section:** Value proposition + dual CTAs
- **Features Grid:** Memory & Growth, Agent Swarm, Data Sovereignty, Skill Marketplace
- **AI Team Showcase:** KAITEN, FORGE, SIGHT, PULSE cards
- **CTA Section:** Navy background with coral accent
- **Footer:** Logo + links

### Design
- Matches Dashboard v4.0 (Navy + Coral + Warm White)
- English-only content
- Responsive for all devices
- New octopus logo integration

---

## 🗄️ Storage Architecture (DOCUMENTED)

**Location:** `docs/STORAGE-ARCHITECTURE.md`

### Database Schema (PostgreSQL)
- **User Management:** Users, subscriptions, billing
- **Agent System:** Agents, configurations, sessions
- **Chat & Memory:** Sessions, messages with 90-day retention
- **Skills Marketplace:** Skills, installations
- **Analytics:** Usage tracking with cost calculation

---

## 🔧 Infrastructure Access (CRITICAL — ALL AGENTS READ)

### VPS SSH Access
| Setting | Value |
|---------|-------|
| **IP Address** | `108.160.137.70` |
| **Provider** | Vultr |
| **User** | `root` |
| **SSH Key** | `~/.openclaw/workspace-forge/vultr_key` |
| **Access** | ✅ FORGE confirmed working |
| **Command** | `ssh -i ~/.openclaw/workspace-forge/vultr_key root@108.160.137.70` |

### ⚠️ AGENT CAPABILITY NOTICE
- **FORGE**: ✅ Has SSH access — can deploy, restart services, manage VPS
- **KAITEN (Prime)**: ❌ No SSH — must request FORGE for VPS operations
- **SIGHT**: ❌ No SSH — must request FORGE for VPS operations  
- **PULSE**: ❌ No SSH — must request FORGE for VPS operations

### VPS Services
| Service | Container | Port | Status |
|---------|-----------|------|--------|
| Dashboard | `ocaas-frontend-final` | 80 | 🟢 Live |
| Landing Page | `autopus-landing` | 3001 | 🟢 Live (Blog deployed) |
| Backend API | `ocaas-backend-final` | 3000 | 🟢 Healthy |
| Database | `ocaas-postgres-new` | 5432 | 🟢 Running |
| LiteLLM Proxy | `litellm-kcc0wcos4sss04sggccocs8g` | 4000 | 🟢 Proxy Ready |
| PULSE Cloud | `pulse-lite` | 18797 | 🟢 Online |
| Redis | `coolify-redis` | 6379 | 🟢 Running |

### When Agents Need VPS Operations
1. **Check if FORGE is available** (fastest)
2. **If FORGE unavailable**: Use Coolify dashboard (https://coolify.autopus.cloud)
3. **Emergency only**: Contact Alton

---

## 🗄️ Storage Architecture (DOCUMENTED)

**Location:** `docs/STORAGE-ARCHITECTURE.md`

### Database Schema (PostgreSQL)
- **User Management:** Users, subscriptions, billing
- **Agent System:** Agents, configurations, sessions
- **Chat & Memory:** Sessions, messages with 90-day retention
- **Skills Marketplace:** Skills, installations
- **Analytics:** Usage tracking with cost calculation

### Storage Strategy
| Data Type | Storage | Retention |
|-----------|---------|-----------|
| Agent Config | Filesystem | Persistent |
| Chat History | PostgreSQL | 90 days |
| Session Context | Filesystem | Active only |
| User Files | S3 | Persistent |
| Analytics | PostgreSQL | 1 year |

### Caching (Redis)
- Rate limiting counters
- Session cache (24h TTL)
- Agent status cache
- Pub/sub for real-time events

---

## Agent Status Overview

| Agent | Role | Status | Level | Current Focus |
|-------|------|--------|-------|---------------|
| **KAITEN** | Orchestrator | growing | 2 | Strategy & Coordination |
| **FORGE** | Builder | growing | 2 | MVP Completion |
| **SIGHT** | Researcher | growing | 1 | Content + SEO |
| **PULSE** | DevOps | growing | 1 | Infrastructure |

---

## Security Status ✅

**2026-02-23:** All 3 critical findings resolved.  
**2026-02-24:** Dashboard v4.0 security hardened.

---

## Active Work Streams

### 🎨 Dashboard 2.0 (FORGE) — ✅ COMPLETED
- **Status:** Production deployed at dashboard.autopus.cloud
- **Features:** LifeAgentCard, Agent DNA page, 5-tab navigation
- **Design:** Design System v4.0 (Navy + Coral)

### 🚀 Landing Page (FORGE) — ✅ COMPLETED
- **Status:** Deployed at port 3001, domain routing in progress
- **Features:** Hero, Features, Team, CTA, Footer
- **Next:** Domain config, auth flow

### 🔒 Security & Intelligence (SIGHT) — ✅ COMPLETED
- Security audit: 0 critical findings
- SEO meta tags: Updated with "AI Persona Companion"
- Content strategy: Blog, Twitter, Reddit, Newsletter

### ☁️ Infrastructure (PULSE)
- VPS: 108.160.137.70 operational
- Docker: All services containerized
- Coolify: Deployment automation

### 💳 Billing Integration (PENDING)
- Stripe: Account setup
- Pricing tiers: FREE, LAUNCH, PRO, ENTERPRISE
- Webhook handling: Pending

### 💬 Chat System (PENDING)
- WebSocket: Architecture defined
- Real-time: Message streaming
- History: Persistent storage

---

## Production Environment

| Service | URL | Status |
|---------|-----|--------|
| Landing Page | https://autopus.cloud | 🟡 DNS Pending |
| Dashboard | https://dashboard.autopus.cloud | 🟢 Live v4.0 |
| API | https://api.autopus.cloud | 🟢 Healthy |
| LiteLLM | https://api.autopus.cloud | 🟢 Proxy Ready |

**VPS:** 108.160.137.70 (Vultr)  
**Orchestration:** Coolify + Docker  
**Database:** PostgreSQL (ocaas-postgres-new)  
**Cache:** Redis (coolify-redis)

---

## Key Documents

- **MVP Task Board:** `coordination/MVP-TASK-BOARD.md`
- **Storage Architecture:** `docs/STORAGE-ARCHITECTURE.md`
- **Session State:** `coordination/SESSION-STATE.md`
- **Status Board:** `status-board.json`

---

## MVP Progress

| Phase | Progress |
|-------|----------|
| 1. Foundation | 100% ✅ |
| 2. Dashboard | 100% ✅ |
| 3. Landing Page | 95% 🟠 |
| 4. Integration | 40% ⏳ |
| 5. Launch Prep | 25% ⏳ |

**Overall: 72%**

---

*Last Synced: 2026-02-24 21:45 HKT*  
*Dashboard: https://dashboard.autopus.cloud*
