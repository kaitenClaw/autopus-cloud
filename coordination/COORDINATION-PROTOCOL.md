# Coordination Protocol - Backend Task Management

## Problem Solved
**Telegram bots cannot see messages from other bots** - bot-to-bot group messaging doesn't work.

## Solution
**Backend file-based coordination** + **Telegram for human visibility**

```
Prime writes task → Backend file → Agent reads file
                                         ↓
                                   Agent sends ACK in Telegram (Alton sees it)
                                         ↓
                                   Agent works on task
                                         ↓
                                   Agent writes result to backend
                                         ↓
                                   Agent sends report in Telegram (Alton sees it)
```

---

## Directory Structure

```
~/ocaas-project/coordination/
├── inbox-forge.json      # Tasks assigned to Forge
├── inbox-sight.json      # Tasks assigned to Sight
├── inbox-pulse.json      # Tasks assigned to Pulse
├── outbox-forge.json     # Completed work from Forge
├── outbox-sight.json     # Completed work from Sight
├── outbox-pulse.json     # Completed work from Pulse
└── status-board.json     # Current status of all agents
```

---

## Protocol: Assigning Tasks

### When Prime wants to assign a task to Forge:

**Step 1: Prime writes to backend**
```bash
# Prime creates task file
cat > ~/ocaas-project/coordination/inbox-forge.json <<'EOF'
{
  "taskId": "task-001",
  "timestamp": "2026-02-15T00:35:00+08:00",
  "from": "kai_ten_bot",
  "to": "kaiten_forge_bot",
  "priority": "high",
  "task": {
    "title": "Initialize Backend Infrastructure",
    "description": "Set up Node.js + Express + Prisma + PostgreSQL for OCaaS",
    "deliverables": [
      "Backend scaffolding complete",
      "Database schema created",
      "Auth API endpoints functional"
    ],
    "deadline": "2026-02-17",
    "references": [
      "~/.openclaw/workspace-forge/OCAAS-BUILD-PLAN.md",
      "~/ocaas-project/PRE-LAUNCH-CHECKLIST.md"
    ]
  },
  "status": "pending"
}
EOF
```

**Step 2: Prime notifies in Telegram group**
```
📋 Task assigned to @kaiten_forge_bot
Task ID: task-001
Title: Initialize Backend Infrastructure
Deadline: Feb 17

@kaiten_forge_bot - check your inbox and acknowledge.
```

---

## Protocol: Receiving and Acknowledging Tasks

### When Forge receives a task:

**Step 1: Forge checks inbox (every 5-10 min or on any Telegram interaction)**
```bash
# Forge reads inbox
TASK=$(cat ~/ocaas-project/coordination/inbox-forge.json)

# If new task found (status=pending)
if [ "$(echo $TASK | jq -r '.status')" = "pending" ]; then
  # Update status to acknowledged
  jq '.status = "in_progress" | .acknowledgedAt = now | .acknowledgedBy = "kaiten_forge_bot"' \
    ~/ocaas-project/coordination/inbox-forge.json > /tmp/inbox-forge.tmp
  mv /tmp/inbox-forge.tmp ~/ocaas-project/coordination/inbox-forge.json

  # Send ACK to Telegram
  # (Forge will send this message in the group)
fi
```

**Step 2: Forge sends ACK in Telegram group**
```
✅ ACK: task-001 received

📋 Task: Initialize Backend Infrastructure
⏱️ Deadline: Feb 17
📦 Deliverables:
  • Backend scaffolding complete
  • Database schema created
  • Auth API endpoints functional

Starting work now. Will update every 6 hours.
```

---

## Protocol: Working on Tasks

### While Forge works:

**Update status-board.json every few hours**
```bash
# Forge updates status board
cat > ~/ocaas-project/coordination/status-board.json <<'EOF'
{
  "lastUpdated": "2026-02-15T06:30:00+08:00",
  "agents": {
    "forge": {
      "status": "working",
      "currentTask": "task-001",
      "progress": "60%",
      "lastActivity": "Setting up Prisma schema",
      "blockers": [],
      "nextUpdate": "2026-02-15T12:30:00+08:00"
    },
    "sight": {
      "status": "idle",
      "currentTask": null,
      "waiting": "Waiting for Forge to complete backend setup"
    },
    "pulse": {
      "status": "monitoring",
      "currentTask": "heartbeat-monitoring",
      "lastHeartbeat": "2026-02-15T06:15:00+08:00",
      "systemHealth": "all-green"
    }
  }
}
EOF
```

**Optional: Progress updates in Telegram**
```
🔨 Progress Update: task-001 (60% complete)

✅ Completed:
  • Node.js + Express setup
  • PostgreSQL connected
  • Prisma schema designed

⏳ In Progress:
  • Auth API endpoints

📅 On track for Feb 17 deadline
```

---

## Protocol: Completing Tasks

### When Forge completes task:

**Step 1: Forge writes to outbox**
```bash
cat > ~/ocaas-project/coordination/outbox-forge.json <<'EOF'
{
  "taskId": "task-001",
  "completedAt": "2026-02-16T14:30:00+08:00",
  "completedBy": "kaiten_forge_bot",
  "status": "completed",
  "result": {
    "summary": "Backend infrastructure ready",
    "deliverables": {
      "backend_scaffolding": "✅ Complete - /Users/altoncheng/ocaas-project/backend/",
      "database_schema": "✅ Complete - prisma/schema.prisma",
      "auth_endpoints": "✅ Complete - POST /api/auth/login, /api/auth/register"
    },
    "files": [
      "/Users/altoncheng/ocaas-project/backend/server.js",
      "/Users/altoncheng/ocaas-project/backend/prisma/schema.prisma",
      "/Users/altoncheng/ocaas-project/backend/routes/auth.js"
    ],
    "nextSteps": [
      "Sight should test auth endpoints",
      "Need to deploy to Coolify server (108.160.137.70)"
    ]
  },
  "handoff": {
    "to": "kaiten_sight_bot",
    "taskId": "task-002",
    "title": "Test Backend Auth System"
  }
}
EOF
```

**Step 2: Forge sends completion report in Telegram**
```
✅ COMPLETE: task-001

📋 Task: Initialize Backend Infrastructure
⏱️ Completed: Feb 16, 2:30 PM (1 day early!)

📦 Deliverables:
  ✅ Backend scaffolding: /ocaas-project/backend/
  ✅ Database schema: prisma/schema.prisma
  ✅ Auth endpoints: /api/auth/login, /api/auth/register

🔗 Next Steps:
  → Handoff to @kaiten_sight_bot for testing
  → Deploy to Coolify when tests pass

📊 Time: 1.5 days | Model: Gemini 3 Pro | Cost: ~$2.30
```

**Step 3: Forge creates task for Sight**
```bash
# Forge writes to Sight's inbox
cat > ~/ocaas-project/coordination/inbox-sight.json <<'EOF'
{
  "taskId": "task-002",
  "timestamp": "2026-02-16T14:30:00+08:00",
  "from": "kaiten_forge_bot",
  "to": "kaiten_sight_bot",
  "priority": "high",
  "task": {
    "title": "Test Backend Auth System",
    "description": "Validate auth endpoints, security, error handling",
    "deliverables": [
      "Test report for auth endpoints",
      "Security audit results",
      "List of issues found (if any)"
    ],
    "references": [
      "/Users/altoncheng/ocaas-project/backend/",
      "~/ocaas-project/coordination/outbox-forge.json"
    ]
  },
  "status": "pending"
}
EOF
```

**Step 4: Forge notifies in Telegram**
```
📋 Task assigned to @kaiten_sight_bot
Task ID: task-002
From: @kaiten_forge_bot
Title: Test Backend Auth System

@kaiten_sight_bot - backend is ready for your review.
```

---

## Inbox Checking Pattern

### All agents MUST check their inbox:

**Trigger points:**
1. **Every 5-10 minutes** (automatic polling)
2. **On any Telegram message** (user interaction triggers check)
3. **After completing current task**

**Implementation:**
```bash
# Add to each agent's skill/routine
check_inbox() {
  local PROFILE=$1  # forge, sight, pulse
  local INBOX=~/ocaas-project/coordination/inbox-${PROFILE}.json

  if [ -f "$INBOX" ]; then
    STATUS=$(jq -r '.status' "$INBOX")
    if [ "$STATUS" = "pending" ]; then
      # New task found!
      # 1. Update status to in_progress
      # 2. Send ACK in Telegram
      # 3. Start working on task
      return 0
    fi
  fi
  return 1
}

# Run on every interaction
check_inbox "forge"
```

---

## Integration with Pulse Heartbeat

**Pulse checks all inboxes every 15 min:**

```bash
# In HEARTBEAT.md, add:
echo "=== Checking coordination inbox activity ==="
for agent in forge sight pulse; do
  INBOX=~/ocaas-project/coordination/inbox-${agent}.json
  if [ -f "$INBOX" ]; then
    STATUS=$(jq -r '.status' "$INBOX")
    AGE=$(jq -r '.timestamp' "$INBOX")

    # Alert if task pending >30 min
    if [ "$STATUS" = "pending" ]; then
      echo "⚠️ WARNING: $agent has unacknowledged task for >30 min"
      echo "Notifying Prime to check if $agent is responsive"
    fi
  fi
done
```

---

## Benefits

✅ **No reliance on Telegram bot-to-bot messaging**
✅ **Asynchronous coordination** - agents work at their own pace
✅ **Full audit trail** - all tasks logged in JSON files
✅ **Human visibility** - Alton sees all ACKs and reports in Telegram
✅ **Automatic handoffs** - Forge → Sight → Prime workflows
✅ **Scalable** - can add more agents without changing protocol

---

## Example: Full Week 1 Workflow

**Monday 9 AM: Prime assigns task**
```
Prime → inbox-forge.json: "Initialize backend"
Prime → Telegram: "@kaiten_forge_bot check your inbox"
```

**Monday 9:05 AM: Forge acknowledges**
```
Forge checks inbox → finds task
Forge → inbox-forge.json: status = in_progress
Forge → Telegram: "✅ ACK: task-001 received, starting work"
```

**Monday 3 PM: Forge progress update**
```
Forge → status-board.json: "60% complete, no blockers"
Forge → Telegram: "🔨 Progress: 60% complete"
```

**Tuesday 2 PM: Forge completes**
```
Forge → outbox-forge.json: "Backend ready"
Forge → inbox-sight.json: "Test backend auth"
Forge → Telegram: "✅ COMPLETE: task-001, handoff to @kaiten_sight_bot"
```

**Tuesday 2:10 PM: Sight acknowledges**
```
Sight checks inbox → finds task from Forge
Sight → inbox-sight.json: status = in_progress
Sight → Telegram: "✅ ACK: task-002 received, starting tests"
```

**Wednesday 10 AM: Sight completes**
```
Sight → outbox-sight.json: "All tests pass, 2 minor issues"
Sight → Telegram: "✅ COMPLETE: task-002, backend approved with notes"
```

**Result:** Full autonomous workflow with human visibility! 🚀
