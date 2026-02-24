# Enhanced Runtime API Documentation
## v2.0 - Full OpenClaw Compatibility

---

## 🎯 Overview

Enhanced Agent Runtime with full OpenClaw features:
- ✅ SOUL.md management
- ✅ MEMORY.md read/write
- ✅ CRON job scheduling
- ✅ Skills installation (clawhub)
- ✅ CLI command execution
- ✅ LiteLLM integration
- ✅ Telegram bot

---

## 📡 API Endpoints

### Health Check
```
GET /health
```
Response:
```json
{
  "status": "ok",
  "agent": "pulse-cloud",
  "role": "devops",
  "uptime": 1234.56,
  "soul": "Pulse",
  "cron": [{"name": "daily-healthcheck", "running": true}],
  "telegram": "connected"
}
```

---

### SOUL Management

#### Get SOUL
```
GET /api/soul
```

#### Update SOUL
```
POST /api/soul
Content-Type: application/json

{
  "content": "# SOUL.md\n\nYour agent identity..."
}
```

---

### Memory Management

#### List Memories
```
GET /api/memory
```

#### Get Memory by Date
```
GET /api/memory?date=2026-02-24
```

#### Save Memory
```
POST /api/memory
Content-Type: application/json

{
  "content": "Important decision made today...",
  "type": "decision"
}
```

---

### CRON Jobs

#### List Jobs
```
GET /api/cron
```

#### Add Job
```
POST /api/cron
Content-Type: application/json

{
  "name": "daily-backup",
  "schedule": "0 3 * * *",
  "action": "backup"
}
```

#### Remove Job
```
DELETE /api/cron/daily-backup
```

**Schedule Format** (Cron):
- `0 9 * * *` — Daily at 9 AM
- `0 */6 * * *` — Every 6 hours
- `0 0 * * 0` — Weekly on Sunday

---

### Skills Management

#### List Installed Skills
```
GET /api/skills
```

#### Install Skill
```
POST /api/skills/install
Content-Type: application/json

{
  "name": "agent-team-orchestration"
}
```

#### Load Skill Content
```
GET /api/skills/agent-team-orchestration
```

---

### CLI Control

#### Execute Command
```
POST /api/cli
Content-Type: application/json

{
  "command": "clawhub list",
  "sessionId": "default"
}
```

**Allowed Commands**:
- `clawhub` — Skill management
- `git` — Version control
- `ls`, `cat`, `pwd` — File operations
- `mkdir`, `cp`, `mv` — Directory operations

---

### Chat with Memory

```
POST /api/chat
Content-Type: application/json

{
  "message": "Hello! What can you do?",
  "sessionId": "default"
}
```

Response:
```json
{
  "success": true,
  "reply": "I can manage your tasks, remember our conversations..."
}
```

---

## 🗂️ File Structure

```
/app/
├── workspace/
│   ├── SOUL.md              # Agent identity
│   ├── memory/
│   │   ├── 2026-02-24.md   # Daily memory
│   │   └── 2026-02-23.md
│   └── cron.json           # CRON configuration
├── skills/                 # Installed skills
│   └── agent-team-orchestration/
│       └── SKILL.md
├── src/                    # Source code
├── logs/                   # Application logs
└── package.json
```

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_ID` | `pulse-cloud` | Agent identifier |
| `AGENT_ROLE` | `devops` | Agent role |
| `PORT` | `3000` | HTTP port |
| `LITELLM_HOST` | `http://localhost:4000` | LLM proxy URL |
| `LITELLM_API_KEY` | - | API key for LLM |
| `TELEGRAM_TOKEN` | - | Telegram bot token |
| `WORKSPACE_DIR` | `/app/workspace` | Workspace path |
| `SKILLS_DIR` | `/app/skills` | Skills directory |

---

## 🚀 Quick Start

### 1. Deploy to Coolify
```bash
# Repository: kaitenClaw/autopus-cloud
# Root Directory: services/agent-runtime
# Build Pack: Docker
```

### 2. Set Environment Variables
```
AGENT_ID=pulse-cloud
AGENT_ROLE=devops
LITELLM_HOST=http://host.docker.internal:4000
TELEGRAM_TOKEN=your-token
```

### 3. Access APIs
```bash
# Health check
curl http://your-domain/health

# Update SOUL
curl -X POST http://your-domain/api/soul \
  -H "Content-Type: application/json" \
  -d '{"content": "# SOUL\n\nNew identity..."}'

# Install skill
curl -X POST http://your-domain/api/skills/install \
  -H "Content-Type: application/json" \
  -d '{"name": "agent-team-orchestration"}'
```

---

## 📊 Comparison with Full OpenClaw

| Feature | Full OpenClaw | Enhanced Lite Runtime |
|---------|--------------|----------------------|
| SOUL.md | ✅ Auto-read | ✅ API + Auto-read |
| MEMORY.md | ✅ Auto-write | ✅ API + Auto-write |
| CRON | ✅ Built-in | ✅ node-cron |
| Skills | ✅ Full system | ✅ Clawhub CLI |
| CLI | ✅ Native | ✅ REST API |
| Sandboxing | ✅ Docker | ❌ Limited |
| Startup Time | 30+ mins | 10 seconds |
| Resource Use | ~2GB | ~100MB |

---

*Enhanced Runtime v2.0 - Cloud Native*
