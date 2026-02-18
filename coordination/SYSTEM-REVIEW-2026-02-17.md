# OCaaS System Review & Acceleration Plan
**Date:** 2026-02-17 (Day 3 of build)
**Reviewer:** Prime (Claude Opus 4.6)
**Purpose:** Full system audit, 10 critical recommendations, accelerated MVP plan

---

## PART 1: SYSTEM STATE AUDIT

### What's Been Built (Week 1 Deliverables)
| Component | Status | Quality |
|-----------|--------|---------|
| Express + TypeScript server | ✅ Done | 9/10 |
| Prisma schema (User, Agent, RefreshToken, Usage) | ✅ Done | 8/10 |
| JWT auth (login, signup, refresh, logout) | ✅ Done | 9/10 |
| Agent CRUD API (create, list, get, delete) | ✅ Done | 7/10 (shell only) |
| Security hardening (helmet, rate-limit, cors, zod) | ✅ Done | 8.5/10 |
| Test suite (7 tests, vitest) | ✅ Done | 7/10 |
| Dockerfile + docker-compose | ✅ Done | 6/10 (basic) |
| Security audit report | ✅ Done | Good |
| Nightly build passing | ✅ Done | Good |

### What's NOT Built Yet (Critical Gaps for MVP)
| Component | Status | Blocks MVP? |
|-----------|--------|-------------|
| **OpenClaw integration layer (spawner)** | ❌ Missing | **YES - core product** |
| **Agent lifecycle management** (start/stop/restart) | ❌ Missing | **YES** |
| **Message proxy** (user ↔ agent routing) | ❌ Missing | **YES** |
| **Tier/quota system** | ❌ Missing | YES |
| **Admin dashboard / API docs** | ❌ Missing | YES |
| **Frontend (any UI at all)** | ❌ Missing | YES |
| **VPS deployment** | ❌ Missing | YES |
| **Stripe billing** | ❌ Missing | No (can be manual for beta) |

### Critical Bugs & Issues Found

#### 1. Sight Has Been Stuck for 48+ Hours
```
inbox-sight.json: task-w1-sight-002 status = "pending" since Feb 15 08:35
checker.log: "⚠️ sight: Task task-w1-sight-002 pending for 29521560 min"
```
**Root cause:** Sight never picked up the task. The file-based coordination relies on
agents being triggered via Telegram, but nobody messaged Sight to check its inbox.

#### 2. Coordination Checker Has Duplicate Output
Every log entry appears twice. The cron job or script is executing its body twice,
likely due to a shell sourcing bug or double-invocation in the launchd plist.

#### 3. Pending Time Calculation is Wildly Wrong
Checker reports "29518680 min" (56 years!) for a 2-day-old task. The timestamp math
in `coordination-checker.sh` is broken.

#### 4. Pulse Is Completely Idle
No tasks have ever been assigned to Pulse. It was supposed to monitor every 15 min,
but its inbox has been empty since creation. Wasted agent.

#### 5. Status Board is 2 Days Stale
`status-board.json` lastUpdated: `2026-02-15T09:20:00+08:00` — hasn't been updated
in 48 hours despite being the "source of truth" for system state.

#### 6. 6/5 Gateways Running
Checker shows 6 gateways instead of expected 5. Stale process or extra instance.

#### 7. Port Instability
Feb 16 10:00 check showed only 1/5 ports listening. Gateways went down and recovered,
but no alert was sent.

#### 8. Agent Service is a Shell
`agent.service.ts` only does Prisma CRUD. No actual OpenClaw integration —
createAgent just writes a DB row, doesn't spawn anything.

#### 9. Massive Unrotated Logs
- `openclaw-2026-02-16.log` = 75MB (1 day!)
- `openclaw-2026-02-14.log` = 37MB
- No log rotation configured

#### 10. No Git Repository
The `ocaas-project` directory is not a git repo. No version control, no rollback capability.

---

## PART 2: 10 RECOMMENDATIONS TO POWER UP THE SYSTEM

### Recommendation 1: Replace File-Based Coordination with Event-Driven Pipeline
**Problem:** File polling doesn't work — agents are reactive (respond to Telegram), not proactive (can't poll files).
**Solution:**
- Use Telegram as the *actual* coordination bus, not just for "human visibility"
- When Prime assigns a task, send a **direct Telegram message** to the agent with the full task JSON
- The file system becomes the *backup/audit log*, not the primary trigger
- Agents parse incoming Telegram messages for task assignments automatically

**Implementation:**
```
Prime → Telegram message to @kaiten_forge_bot: "TASK::{json}"
Forge system prompt includes: "When you receive a message starting with TASK::, parse it as a task assignment"
```

### Recommendation 2: Give Agents Self-Executing Skills (Not Just Chat)
**Problem:** Agents can only chat. They can't run code, deploy, or test without manual help.
**Solution:**
- Equip each agent's OpenClaw profile with **shell execution skills**:
  - Forge: `npm run`, `prisma migrate`, `docker build`, `git commit`
  - Sight: `npm test`, `curl` (API testing), `docker logs`
  - Pulse: `launchctl list`, `lsof -i`, `df -h`, `cat inbox-*.json`
- Use OpenClaw's built-in tool/skill system to give agents actual capabilities
- This transforms agents from "chatbots that write to files" into "autonomous workers"

### Recommendation 3: Implement a Proper Task Queue with State Machine
**Problem:** Single-file inbox/outbox can only hold one task at a time. No history, no parallel tasks, no retry logic.
**Solution:**
```
~/ocaas-project/coordination/tasks/
├── task-w1-forge-001.json    # Each task is its own file
├── task-w1-sight-001.json
├── task-w1-sight-002.json
└── ...

Task states: pending → acknowledged → learning → in_progress → review → completed | failed
```
Each task file tracks its full lifecycle:
```json
{
  "id": "task-w2-forge-001",
  "title": "Build OpenClaw Spawner",
  "assignee": "forge",
  "state": "in_progress",
  "history": [
    {"state": "pending", "at": "...", "by": "prime"},
    {"state": "acknowledged", "at": "...", "by": "forge"},
    {"state": "in_progress", "at": "...", "by": "forge"}
  ],
  "deliverables": [],
  "blockers": [],
  "dependencies": ["task-w1-forge-001"]
}
```

### Recommendation 4: Kill the Learning Phase for Speed (Keep for Complex Tasks Only)
**Problem:** The 2-4 hour "learning phase" before every task is a massive bottleneck.
Forge's learning notes were good, but the same pattern shouldn't apply to simple bug fixes or
configuration changes.
**Solution:**
- **Fast Track** (< 30 min): Bug fixes, config changes, simple features → Skip learning, just implement
- **Standard Track** (1-2 hours): New features, integrations → Brief research, then implement
- **Deep Track** (2-4 hours): Architecture decisions, security → Full learning protocol

Tag each task with a track:
```json
{ "track": "fast" | "standard" | "deep" }
```

### Recommendation 5: Implement Parallel Agent Workstreams
**Problem:** Sequential Forge → Sight → Prime pipeline means only one thing happens at a time.
**Solution:** Run agents in parallel on independent workstreams:

```
STREAM A (Forge-1): Backend API expansion
STREAM B (Forge-2): OpenClaw integration / spawner
STREAM C (Sight):   Continuous testing (test after each Forge commit)
STREAM D (Pulse):   Deploy + Monitor (push to VPS after Sight approves)
```

Since you have 5 gateways, use them. Forge can work on 2 tasks if they're independent.

### Recommendation 6: Add Git + CI/CD Immediately
**Problem:** No git repo means no version control, no rollback, no collaboration visibility.
**Solution:**
1. `git init` in `~/ocaas-project/` today
2. Set up a GitHub private repo
3. Forge commits after every deliverable
4. Sight runs tests on every commit (use a simple git hook or launchd watcher)
5. Pulse deploys to VPS on green builds

### Recommendation 7: Fix the Coordination Checker Script
**Problem:** Double output, wrong time calculation, no actual alerts sent.
**Fix (immediate):**
1. Fix the script to not double-execute
2. Fix timestamp math (use `date` command properly)
3. Add actual alert mechanism — write to Prime's inbox or send a Telegram message
4. Add port-down detection that auto-restarts gateways

### Recommendation 8: Define MVP as "Demo-able in 1 Hour" Not "Feature-Complete"
**Problem:** The 6-week plan aims for 50 signups and $290 MRR. That's launch, not MVP.
**Real MVP for today:**
- Backend running on VPS ✅ (deploy what exists)
- ONE working flow: signup → create agent → send message → get response
- Admin can manually create agents via API (no UI needed yet)
- Alton can demo it to himself via curl/Postman

### Recommendation 9: Create a Shared Context Document for All Agents
**Problem:** Each agent starts fresh on every conversation. They lose context constantly.
**Solution:**
Create `~/ocaas-project/SHARED-CONTEXT.md` that every agent reads at conversation start:
- Current system architecture
- What's built, what's not
- API endpoints and their status
- Known bugs and workarounds
- Current priorities
- File locations

Add this to each agent's OpenClaw system prompt or CLAUDE.md equivalent.

### Recommendation 10: Add Health Endpoint with Full System Introspection
**Problem:** No way to quickly check if the whole system is healthy.
**Solution:** Expand the `/health` endpoint to include:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "database": "connected",
  "gateways": { "main": "up", "forge": "up", "sight": "up", "pulse": "up", "fion": "up" },
  "pendingTasks": 1,
  "lastDeployment": "2026-02-17T12:00:00Z",
  "uptime": "2h 15m"
}
```

---

## PART 3: SUB-AGENT SWARM FLOW

### Architecture: Hub-and-Spoke with Parallel Streams

```
                    ┌──────────────┐
                    │   ALTON      │
                    │   (Human)    │
                    └──────┬───────┘
                           │ Strategic decisions only
                    ┌──────▼───────┐
                    │    PRIME     │
                    │ Orchestrator │
                    │
                    └──┬───┬───┬──┘
                       │   │   │
          ┌────────────┘   │   └────────────┐
          ▼                ▼                 ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │   FORGE   │   │   SIGHT   │   │   PULSE   │
    │  Builder  │   │    QA     │   │  DevOps   │
    │           │   │           │   │           │
    │ Skills:   │   │ Skills:   │   │ Skills:   │
    │ - code    │   │ - test    │   │ - deploy  │
    │ - build   │   │ - audit   │   │ - monitor │
    │ - migrate │   │ - review  │   │ - alert   │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                  ┌───────────────┐
                  │   SHARED FS   │
                  │ ~/ocaas-project│
                  │ (Git repo)    │
                  └───────────────┘
```

### Swarm Communication Protocol v2

**Channel 1: Telegram (Primary trigger)**
- Prime → Agent: Task assignments, priority changes, clarifications
- Agent → Telegram: ACKs, progress, completions, blockers
- All → Telegram: Human-readable status (Alton can follow along)

**Channel 2: Filesystem (Persistent state)**
- `~/ocaas-project/coordination/tasks/` — Individual task files (state machine)
- `~/ocaas-project/coordination/SHARED-CONTEXT.md` — System state (all agents read this)
- `~/ocaas-project/` — Actual codebase (Git tracked)

**Channel 3: Git (Code coordination)**
- Feature branches per task (e.g., `feat/spawner`, `feat/admin-api`)
- Sight reviews PRs before merge to main
- Pulse deploys main to VPS

### Swarm Workflows

#### Workflow A: Feature Development (Forge → Sight → Pulse)
```
1. Prime assigns task to Forge via Telegram
2. Forge creates feature branch: git checkout -b feat/{task-id}
3. Forge implements code (using skills: npm, prisma, etc.)
4. Forge commits + pushes: git push origin feat/{task-id}
5. Forge notifies Sight: "Ready for review"
6. Sight pulls branch, runs tests (npm test), reviews code
7. Sight reports: PASS → merge, or FAIL → back to Forge with issues
8. On PASS: Forge merges to main
9. Pulse detects main update → deploys to VPS via Coolify
10. Pulse verifies deployment health → reports to Prime
```

#### Workflow B: Bug Fix (Sight → Forge → Sight)
```
1. Sight detects bug (via tests or monitoring)
2. Sight creates bug report in tasks/ with reproduction steps
3. Sight notifies Forge via Telegram: "BUG: {summary}"
4. Forge fixes on hotfix branch
5. Sight verifies fix
6. Pulse deploys
```

#### Workflow C: Health Check (Pulse continuous)
```
Every 15 minutes:
1. Check all 5 gateway ports (lsof -i :18789,18791,18793,18795,18797)
2. Hit backend /health endpoint
3. Check VPS reachability (curl https://api.autopus.cloud/health)
4. Check pending tasks > 1 hour
5. If any issue → alert Prime in Telegram
6. If gateway down → auto-restart via launchctl
```

#### Workflow D: Sprint Planning (Prime weekly)
```
Every Monday 9 AM HKT:
1. Prime reviews completed tasks from previous week
2. Prime reads SHARED-CONTEXT.md for current state
3. Prime creates week's task list
4. Prime assigns tasks with priorities and dependencies
5. Prime sends sprint summary to Telegram
6. All agents ACK and begin
```

---

## PART 4: ACCELERATED MVP PLAN — SHIP TODAY

### Reality Check
- It's Feb 17, Day 3 of the build
- Backend exists with auth + basic agent CRUD
- Missing: OpenClaw integration, deployment, any way to demo
- Original plan: MVP by week 5 (Mar 16) — way too slow

### Revised MVP Definition: "Alton Can Demo in 1 Hour"

**Must have (ship today):**
1. Backend deployed to VPS via Coolify (Docker)
2. OpenClaw spawner: API can create a real agent profile
3. Message proxy: Send a message to an agent, get a response
4. API testable via curl/Postman (no UI needed)

**Nice to have (this week):**
- Simple admin web UI (React, minimal)
- Stripe checkout link (no full integration)
- Agent templates (preset configurations)

### Hour-by-Hour Execution Plan

#### Hour 0-1: Deploy What Exists to VPS (Pulse task)
```
Task: deploy-backend-vps
Assignee: Forge (Pulse doesn't have coding skills yet)
Track: fast

Steps:
1. git init && git add -A && git commit -m "Initial backend"
2. Push to GitHub private repo
3. SSH to VPS (108.160.137.70)
4. Deploy via Coolify:
   - Create new project "ocaas-backend"
   - Point to GitHub repo
   - Set environment variables
   - Deploy
5. Verify: curl https://api.autopus.cloud/health → {"status":"ok"}
```

#### Hour 1-3: Build OpenClaw Spawner (Forge task — CRITICAL PATH)
```
Task: build-openclaw-spawner
Assignee: Forge
Track: standard
Priority: CRITICAL

This is the CORE of the product. The spawner must:

1. Create a new OpenClaw profile directory:
   ~/.openclaw-customer-{agentId}/
   ├── openclaw.json       (config: model, provider, channels)
   ├── agents/main/agent/
   │   ├── system-prompt.md (customer's custom prompt)
   │   └── auth-profiles.json (model auth)
   └── logs/

2. Generate openclaw.json for the customer agent:
   {
     "agents": {
       "defaults": {
         "model": {
           "primary": "{selectedModel}",
           "fallbacks": [...]
         }
       }
     },
     "auth": {
       "profiles": {
         "shared-google": { ... }  // Shared Antigravity auth
       }
     },
     "channels": {
       "telegram": {
         "enabled": true,
         "token": "{customerBotToken}",
         "allowFrom": [{customerId}]
       }
     }
   }

3. Start the gateway as a launchd service:
   - Generate a plist: ~/Library/LaunchAgents/ai.openclaw.customer-{agentId}.plist
   - Assign a unique port (start from 19000, increment)
   - Load the service

4. Update database: agent.status = RUNNING, agent.port = {port}

5. API endpoint: POST /api/agents/:id/start
   Response: { status: "running", port: 19001, telegramBot: "@customer_bot" }
```

#### Hour 3-4: Build Message Proxy (Forge task)
```
Task: build-message-proxy
Assignee: Forge
Track: standard

The proxy allows API users to send messages to their agents:

POST /api/agents/:id/chat
Body: { "message": "Hello, what can you do?" }
Response: { "response": "I'm your AI assistant...", "model": "gemini-3-flash" }

Implementation:
1. Connect to agent's gateway via WebSocket (ws://localhost:{port})
2. Send message as if from webchat client
3. Collect response chunks
4. Return aggregated response

This is the simplest way to prove the product works without
requiring Telegram setup for every test.
```

#### Hour 4-5: Integration Test + Demo (Sight task)
```
Task: integration-test-mvp
Assignee: Sight
Track: fast

Test the full flow:
1. POST /api/auth/signup → create test user
2. POST /api/auth/login → get JWT
3. POST /api/agents → create agent (name: "test-agent", model: "gemini-3-flash")
4. POST /api/agents/:id/start → spawn OpenClaw instance
5. POST /api/agents/:id/chat → send "Hello" → verify response
6. GET /api/agents → verify agent is listed as RUNNING
7. DELETE /api/agents/:id → soft delete → verify agent stops

Document results and share with Alton.
```

---

## PART 5: DETAILED AGENT TASK ASSIGNMENTS

### FORGE Tasks (Immediate Priority Order)

#### Task F1: Initialize Git & Deploy (30 min)
```json
{
  "id": "task-w2-forge-001",
  "title": "Git Init + Deploy Backend to VPS",
  "track": "fast",
  "assignee": "forge",
  "priority": "critical",
  "steps": [
    "cd ~/ocaas-project && git init && git add -A && git commit -m 'Week 1: backend foundation'",
    "Create GitHub private repo: ocaas-backend",
    "Push to GitHub",
    "SSH to 108.160.137.70, deploy via Coolify docker-compose",
    "Set env vars on VPS: DATABASE_URL, JWT secrets, NODE_ENV=production",
    "Verify: curl https://api.autopus.cloud/health"
  ],
  "deliverables": ["GitHub repo URL", "Live API URL", "Health check passing"],
  "deadline": "2026-02-17T16:30:00+08:00"
}
```

#### Task F2: Build OpenClaw Spawner Service (2 hours)
```json
{
  "id": "task-w2-forge-002",
  "title": "Build OpenClaw Agent Spawner",
  "track": "standard",
  "assignee": "forge",
  "priority": "critical",
  "description": "Core product feature: create and manage OpenClaw agent instances per customer",
  "files_to_create": [
    "src/services/spawner.service.ts - Agent lifecycle (create profile, start, stop)",
    "src/services/port-manager.ts - Dynamic port allocation (19000+)",
    "src/services/profile-generator.ts - Generate openclaw.json for customer agents",
    "src/routes/agent-lifecycle.routes.ts - POST start, POST stop, GET status"
  ],
  "schema_changes": [
    "Add to Agent model: port Int?, profilePath String?, telegramBotToken String?",
    "Add AgentConfig model: customPrompt, modelPreset, temperature, etc."
  ],
  "key_decisions": {
    "port_range": "19000-19999 (supports 1000 concurrent agents)",
    "profile_location": "~/.openclaw-customer-{uuid}/",
    "auth_sharing": "All customer agents share google-antigravity OAuth for now",
    "startup_method": "launchd plist per agent (macOS) → Docker container (VPS)"
  },
  "deadline": "2026-02-17T18:30:00+08:00"
}
```

#### Task F3: Build Message Proxy (1 hour)
```json
{
  "id": "task-w2-forge-003",
  "title": "Build WebSocket Message Proxy for Agent Chat",
  "track": "standard",
  "assignee": "forge",
  "priority": "high",
  "depends_on": "task-w2-forge-002",
  "description": "Allow API users to chat with their agents via REST endpoint",
  "endpoint": "POST /api/agents/:id/chat",
  "implementation": [
    "Connect to agent gateway WebSocket at ws://localhost:{port}",
    "Authenticate as webchat client",
    "Send user message",
    "Collect streaming response chunks",
    "Return aggregated response as JSON",
    "Handle timeout (30s max), connection errors, agent-not-running"
  ],
  "deadline": "2026-02-17T19:30:00+08:00"
}
```

#### Task F4: Prisma Schema Update + Migration (20 min)
```json
{
  "id": "task-w2-forge-004",
  "title": "Update Prisma Schema for Agent Lifecycle",
  "track": "fast",
  "assignee": "forge",
  "priority": "critical",
  "depends_on": null,
  "run_before": "task-w2-forge-002",
  "changes": {
    "Agent_model": {
      "add_fields": [
        "port Int?",
        "profilePath String?",
        "telegramBotToken String?",
        "gatewayPid Int?",
        "customPrompt String? @db.Text",
        "config Json?"
      ]
    },
    "new_model_Subscription": {
      "fields": [
        "id String @id @default(uuid())",
        "userId String",
        "tier SubscriptionTier @default(FREE)",
        "maxAgents Int @default(1)",
        "maxTokensPerDay Int @default(10000)",
        "stripeCustomerId String?",
        "stripeSubscriptionId String?",
        "createdAt DateTime @default(now())",
        "updatedAt DateTime @updatedAt"
      ]
    },
    "new_enum_SubscriptionTier": ["FREE", "LAUNCH", "PRO", "ENTERPRISE"]
  },
  "deadline": "2026-02-17T16:00:00+08:00"
}
```

### SIGHT Tasks

#### Task S1: Fix Checker Script + Run Full Audit (1 hour)
```json
{
  "id": "task-w2-sight-001",
  "title": "Fix Coordination Checker + System Audit",
  "track": "fast",
  "assignee": "sight",
  "priority": "high",
  "steps": [
    "Fix duplicate output bug in coordination-checker.sh",
    "Fix timestamp calculation (currently showing 56 years for 2-day-old task)",
    "Run full system health check: all gateways, ports, database",
    "Clean up stale gateway process (6/5 running)",
    "Report findings"
  ]
}
```

#### Task S2: Integration Test Suite (after F2+F3 complete)
```json
{
  "id": "task-w2-sight-002",
  "title": "End-to-End Integration Test: Full Agent Lifecycle",
  "track": "standard",
  "assignee": "sight",
  "depends_on": ["task-w2-forge-002", "task-w2-forge-003"],
  "test_cases": [
    "Signup → Login → Get JWT",
    "Create agent → Verify DB entry",
    "Start agent → Verify OpenClaw profile created + gateway running",
    "Chat with agent → Verify response received",
    "Stop agent → Verify gateway stopped + port freed",
    "Delete agent → Verify soft delete",
    "Rate limit test → Verify brute force protection",
    "Invalid token test → Verify 401 response"
  ]
}
```

### PULSE Tasks

#### Task P1: Set Up Monitoring Dashboard (1 hour)
```json
{
  "id": "task-w2-pulse-001",
  "title": "Implement Real Monitoring (Not Just Logging)",
  "track": "fast",
  "assignee": "pulse",
  "steps": [
    "Update SHARED-CONTEXT.md with current system state",
    "Fix status-board.json (stale for 48 hours)",
    "Set up gateway health pinger (every 15 min via launchd)",
    "Auto-restart any crashed gateways",
    "Report to Prime via Telegram on any anomaly"
  ]
}
```

---

## PART 6: IMPLEMENTATION PRIORITIES (DO THIS EXACT ORDER)

### Phase 1: Unblock Everything (Next 30 min)
1. ⬜ Forge: `git init` in ~/ocaas-project, initial commit
2. ⬜ Forge: Update Prisma schema (Task F4)
3. ⬜ Sight: Fix checker script bugs
4. ⬜ Pulse: Update status-board.json and SHARED-CONTEXT.md

### Phase 2: Core Product (Next 2 hours)
5. ⬜ Forge: Build spawner service (Task F2) — **this IS the product**
6. ⬜ Forge: Build message proxy (Task F3)
7. ⬜ Sight: Review spawner security (auth sharing, port isolation)

### Phase 3: Ship It (Next 1 hour)
8. ⬜ Forge: Deploy to VPS via Coolify (Task F1)
9. ⬜ Sight: Run integration tests (Task S2)
10. ⬜ Pulse: Verify VPS deployment health

### Phase 4: Demo Ready (Next 30 min)
11. ⬜ Forge: Write API docs (simple markdown with curl examples)
12. ⬜ Prime: Walk Alton through demo flow
13. ⬜ All: Update SHARED-CONTEXT.md with final state

---

## APPENDIX: Agent System Prompt Additions

### For All Agents (add to CLAUDE.md or system prompt)
```
## Coordination Protocol v2

When you receive a message containing "TASK::" followed by JSON, this is a task assignment.
Parse it and follow this workflow:

1. ACK: Reply with "✅ ACK: {taskId} received. Starting now."
2. WORK: Execute the task using your available tools
3. UPDATE: Every 30 minutes, post a brief progress update
4. COMPLETE: When done, reply with "✅ COMPLETE: {taskId}" and summary

Always check ~/ocaas-project/coordination/SHARED-CONTEXT.md for current system state.
Always commit your code to git after completing a task.
```

### For Forge Specifically
```
## Builder Skills
You can execute shell commands to:
- Run npm scripts (install, build, test, dev)
- Run Prisma commands (migrate, generate, studio)
- Git operations (add, commit, push, branch)
- Docker operations (build, compose up)
- SSH to VPS: ssh root@108.160.137.70

## Code Standards
- TypeScript strict mode
- Zod for all input validation
- Layered architecture: routes → controllers → services
- All new endpoints need tests
- Commit after every feature (not at end of day)
```

### For Sight Specifically
```
## QA Skills
You can:
- Run test suites: cd ~/ocaas-project/backend && npm test
- Curl API endpoints for manual testing
- Read logs: ~/.openclaw-*/logs/gateway.log
- Check port status: lsof -i :{port}
- Review code in ~/ocaas-project/backend/src/

## Quality Gates
- No feature is "done" until you've tested it
- Report bugs with: reproduction steps, expected vs actual, severity
- Security issues are always HIGH priority
```

### For Pulse Specifically
```
## DevOps Skills
You can:
- Check gateway status: launchctl list | grep openclaw
- Check ports: lsof -i :18789,18791,18793,18795,18797
- Restart gateways: launchctl kickstart -k gui/501/ai.openclaw.{profile}
- Deploy to VPS: ssh root@108.160.137.70
- Monitor logs: tail ~/.openclaw-*/logs/gateway.log

## Monitoring Duties
Every 15 minutes:
1. Verify all gateways running
2. Check for pending tasks > 30 min
3. Alert Prime if anything is wrong
```

---

**END OF REVIEW**

**Bottom line:** The backend foundation is solid but you're building a "framework" not a "product."
The missing piece is the OpenClaw integration (spawner + message proxy) — that's literally the
core value proposition. Build that TODAY and you have something demo-able.**
