# OCaaS Shared Context (All Agents Read This)
**Last Updated:** 2026-02-17 16:15 HKT
**Updated By:** Prime (System Review + Skill Upgrade)

---

## Current State Summary
- **Phase:** Week 2 — Core Product (Accelerated)
- **Goal:** Demo-able MVP by end of week (Feb 23)
- **Backend:** Express + Prisma + JWT auth — DEPLOYED LOCALLY, needs VPS deploy
- **Core Gap:** NO OpenClaw integration yet (the actual product)
- **Upgrade:** All agents now have project-specific skills + coordination protocol v2

## What's Built
| Component | Location | Status |
|-----------|----------|--------|
| Express server | `~/ocaas-project/backend/src/app.ts` | ✅ Working |
| Prisma schema | `~/ocaas-project/backend/prisma/schema.prisma` | ✅ Working (needs update) |
| Auth (signup/login/refresh/logout) | `src/services/auth.service.ts` | ✅ Working |
| Agent CRUD | `src/services/agent.service.ts` | ✅ DB only (no spawner) |
| Rate limiting | `src/app.ts` | ✅ Working |
| Test suite (7 tests) | `src/__tests__/` | ✅ Passing |
| Docker setup | `Dockerfile`, `docker-compose.yml` | ✅ Basic |
| Coordination checker (fixed) | `~/.openclaw/scripts/coordination-checker.sh` | ✅ Fixed |
| Agent skills (new) | See Skills Inventory below | ✅ Installed |

## What's Missing (Priority Order)
1. **OpenClaw Spawner** — Create real agent profiles + start gateways
2. **Message Proxy** — POST /api/agents/:id/chat → talk to agent
3. **VPS Deployment** — Push to Coolify on 108.160.137.70
4. **Git repo** — No version control yet!
5. **Subscription/Tier model** — Schema update needed
6. **Admin UI** — Not started
7. **Stripe billing** — Not started

## API Endpoints (Current)
```
POST   /api/auth/signup    — Create account (email, password, name?)
POST   /api/auth/login     — Get JWT tokens
POST   /api/auth/refresh   — Refresh access token
POST   /api/auth/logout    — Invalidate refresh token
GET    /api/agents         — List user's agents
POST   /api/agents         — Create agent (name, modelPreset)
GET    /api/agents/:id     — Get agent details
DELETE /api/agents/:id     — Soft delete agent
GET    /health             — Health check
```

## API Endpoints (Needed This Week)
```
POST   /api/agents/:id/start   — Spawn OpenClaw instance
POST   /api/agents/:id/stop    — Stop agent gateway
POST   /api/agents/:id/chat    — Send message, get response
GET    /api/agents/:id/status  — Running? Port? Model?
```

## Infrastructure
- **Local Mac Mini:** 5 OpenClaw profiles running (ports 18789-18797)
- **VPS:** 108.160.137.70 (Vultr), Coolify at https://coolify.autopus.cloud
- **Database:** Local PostgreSQL `ocaas` (needs VPS migration)
- **Domain:** api.autopus.cloud (ready for backend)

## Skills Inventory (NEW — 2026-02-17)
| Agent | Skill | Purpose |
|-------|-------|---------|
| Forge | `ocaas-builder` | npm, Prisma, git, Docker, deploy |
| Forge | `task-coordination` | Task protocol (shared) |
| Sight | `ocaas-qa` | Testing, auditing, bug reports |
| Sight | `task-coordination` | Task protocol (shared) |
| Pulse | `ocaas-devops` | Health check, gateway mgmt, alerts |
| Pulse | `task-coordination` | Task protocol (shared) |

## Coordination Protocol v2
- **Primary trigger:** Telegram messages containing `TASK::{json}`
- **Backup/audit:** File-based inbox/outbox in `~/ocaas-project/coordination/`
- **State:** `status-board.json` updated by Pulse
- **Shared context:** This file (SHARED-CONTEXT.md) — read before every task

## Known Issues (Updated)
1. ~~Sight stuck on task-w1-sight-002 for 48 hours~~ → CLEARED, new task assigned
2. ~~Coordination checker double output~~ → FIXED (lock file mechanism)
3. ~~Timestamp calculation broken~~ → FIXED (proper macOS date handling)
4. ~~Status board stale since Feb 15~~ → UPDATED to current
5. 6/5 gateways running — stale process needs cleanup (Sight task)
6. Logs growing fast (75MB/day) — needs rotation (Sight task)
7. No git repo — Forge should `git init` as first Week 2 action

## Agent Assignments (Current Sprint)
| Agent | Task | Priority | Status |
|-------|------|----------|--------|
| Forge | F4: Schema update | Critical | Pending |
| Forge | F2: Build spawner | Critical | Pending |
| Forge | F3: Build message proxy | High | Pending |
| Forge | F1: Deploy to VPS | Critical | Pending |
| Sight | S1: Fix checker + system audit | High | Pending (new) |
| Sight | S2: Integration tests | High | Blocked on F2+F3 |
| Pulse | P1: Real monitoring + status updates | Medium | Pending |

## File Locations
```
Backend Code:     ~/ocaas-project/backend/
Coordination:     ~/ocaas-project/coordination/
System Review:    ~/ocaas-project/coordination/SYSTEM-REVIEW-2026-02-17.md
Build Plan:       ~/.openclaw/workspace-forge/OCAAS-BUILD-PLAN.md
OpenClaw Configs: ~/.openclaw/openclaw.json
Model Registry:   ~/.openclaw/MODEL-REGISTRY.json
VPS Migration:    ~/ocaas-project/coordination/VPS-MIGRATION-PLAN.md
Checker Script:   ~/.openclaw/scripts/coordination-checker.sh
```

## Decision Log
- **Auth:** JWT with refresh token rotation (decided Feb 15)
- **Database:** PostgreSQL via Prisma (decided Feb 15)
- **Hosting:** Coolify on Vultr VPS (decided Feb 15)
- **Agent isolation:** Separate OpenClaw profile per customer agent (decided Feb 17)
- **Port allocation:** 19000-19999 range for customer agents (decided Feb 17)
- **MVP scope:** API-only, no UI, curl/Postman demo (decided Feb 17)
- **Coordination:** Telegram-first + file backup (upgraded Feb 17)
