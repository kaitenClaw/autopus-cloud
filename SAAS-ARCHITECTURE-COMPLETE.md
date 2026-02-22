# Autopus Cloud - Complete SaaS Architecture

## 🌐 Domain Structure

| Domain | Purpose | Status |
|--------|---------|--------|
| **autopus.cloud** | Landing page + marketing | ✅ Live |
| **www.autopus.cloud** | Redirect to main | ✅ Live |
| **dashboard.autopus.cloud** | Main app (Dashboard + Chat + Marketplace) | ✅ Just Deployed |
| **hub.autopus.cloud** | Agent activity feed + timeline | ✅ Live |
| **api.autopus.cloud** | Backend API endpoint | ✅ Live |

## 🏗️ Infrastructure (VPS: 108.160.137.70)

### Specs
- **Provider**: Vultr
- **Plan**: 2 vCPU / 4GB RAM / 75GB SSD ($24/mo)
- **OS**: Ubuntu 22.04
- **Docker**: ✅ Running
- **Coolify**: ✅ Managing deployments

### Current Resource Usage
- Disk: 30GB / 75GB (42%)
- Memory: 1.4GB / 3.8GB used, 2.4GB available with cache
- Swap: 626MB / 7.7GB used

### Is Vultr Enough?
✅ **YES for MVP** - Current specs can handle:
- ~50 concurrent users
- ~10 running agents (Docker containers)
- LiteLLM proxy + PostgreSQL + Redis

⚠️ **Will need upgrade when**:
- >100 concurrent users
- >50 running agents
- Heavy AI model inference on-server

**Recommended upgrade path**:
- Phase 2: Upgrade to 4 vCPU / 8GB RAM ($48/mo)
- Phase 3: Add load balancer + multiple VPS nodes

## 🐳 Docker Containers (Running)

| Container | Purpose | Status |
|-----------|---------|--------|
| backend_backend_1 | Main API (port 4000) | ✅ Up |
| backend_postgres_1 | Main database | ✅ Up |
| ocaas-backend-postgres-1 | Legacy DB | ✅ Up |
| ocaas-dashboard | Frontend (port 80) | ✅ Just Updated |
| coolify-proxy | Reverse proxy (80/443) | ✅ Up |
| coolify | Deployment manager | ✅ Up |
| coolify-redis | Caching + sessions | ✅ Up |

## 📋 Complete Feature Status

### Pillar 1: One-Click Cloud Deploy
| Feature | Status | Notes |
|---------|--------|-------|
| SpawnerService | ✅ Complete | Docker isolation, dynamic ports |
| Vultr API integration | 🔄 In Progress | Need API key setup |
| Auto-update daemon | ⏳ TODO | Cron job inside containers |
| "Deploy to Cloud" button | ⏳ TODO | UI in dashboard |
| Subdomain routing | ✅ Complete | Traefik handles this |
| Health monitoring | ✅ Complete | /health endpoint |

### Pillar 2: Growing AI Agents + World Protocol
| Feature | Status | Notes |
|---------|--------|-------|
| Durable memory | ✅ Complete | PostgreSQL persistence |
| Agent personality | ✅ Complete | SOUL.md profiles |
| Skills framework | ✅ Complete | DB schema + API ready |
| Agent Identity Protocol | 🔄 Draft | Need spec v0.1 |
| A2A messaging protocol | 🔄 Draft | Need message format |
| Growth metrics | ✅ UI Complete | GrowthTimeline component |

### Pillar 3: Seamless Telegram + In-App Chat
| Feature | Status | Notes |
|---------|--------|-------|
| Telegram bot integration | ✅ Complete | All agents have bots |
| Dashboard chat | ✅ Complete | Full chat interface |
| Thread sync | ✅ Complete | Telegram ↔ Dashboard |
| Magic Link login | ⏳ TODO | Passwordless auth |
| WebSocket real-time | 🔄 Partial | Polling fallback works |

### Pillar 4: Skill Marketplace + Agent Network
| Feature | Status | Notes |
|---------|--------|-------|
| Skill Registry | ✅ Complete | 12 skills seeded |
| Marketplace UI | ✅ Complete | SmartRecommendations added |
| Premium skills | ✅ Complete | $2-12/mo pricing set |
| Skill installation | ✅ Complete | One-click install |
| Agent-autonomous discovery | ⏳ TODO | Observation engine |
| Creator revenue share | ⏳ TODO | 70/30 split logic |

## 🔐 Security Status

| Check | Status | Notes |
|-------|--------|-------|
| Command injection fix | ✅ Complete | UUID + container name validation |
| Body size limits | ✅ Complete | 100kb limit set |
| Rate limiting | ✅ Complete | Auth: 60/min, Anonymous: 30/min |
| JWT secrets | ⚠️ Rotate needed | Currently in .env, need to move to secrets manager |
| Google OAuth audience | ✅ Complete | Proper audience validation |
| HTTPS/TLS | ✅ Complete | Let's Encrypt auto-renew |

## 📊 Database Schema (Prisma)

### Core Models
- **User**: Authentication + subscription tier
- **Agent**: Agent instances + status + config
- **ChatSession**: Conversation threads
- **Message**: Individual messages
- **Skill**: Marketplace skills
- **SkillInstall**: User's installed skills
- **Usage**: Token tracking + billing

### Current Data
- Users: Admin accounts created
- Agents: KAITEN squad profiles
- Skills: 12 launch skills ready to seed
- Sessions: Active chat sessions

## 🎯 Next Immediate Actions

### 1. Seed Skills to Database
```bash
psql $DATABASE_URL -f scripts/seed-skills.sql
```

### 2. Deploy Backend Updates
```bash
cd ~/ocaas-project/backend
docker build -t autopus/backend:latest .
docker push autopus/backend:latest  # or direct deploy
```

### 3. Test New Frontend Components
- GrowthTimeline on Dashboard
- ActivityStream on Hub
- ContextPanel in Chat
- SmartRecommendations in Marketplace

### 4. Complete Pulse Cloud Migration
- Run migration script
- Verify Telegram webhook switch
- Test end-to-end flow

## 💰 Billing Integration Status

| Provider | Status | Notes |
|----------|--------|-------|
| Stripe | 🔄 Partial | Checkout session API ready |
| Subscription tiers | ✅ Complete | FREE/LAUNCH/PRO/ENTERPRISE |
| Usage tracking | ✅ Complete | Token counting per agent |
| Webhook handling | ⏳ TODO | Need webhook endpoint |

## 📈 Monitoring & Observability

| Tool | Status | Purpose |
|------|--------|---------|
| Coolify logs | ✅ Working | Container logs |
| RealTimeLogViewer | ✅ Working | Frontend log viewer |
| Health checks | ✅ Working | /health endpoint |
| Agent status | ✅ Working | KAITEN agent monitoring |
| Cost tracking | ✅ Working | Per-agent cost calc |

## 🚀 Deployment Commands

### Frontend Update
```bash
cd ~/ocaas-project/frontend
npm run build
tar -czf dashboard-update.tar.gz -C dist .
scp -i ~/.openclaw/workspace-forge/vultr_key dashboard-update.tar.gz root@108.160.137.70:/tmp/
ssh -i ~/.openclaw/workspace-forge/vultr_key root@108.160.137.70 "docker cp /tmp/dashboard-update.tar.gz ocaas-dashboard:/tmp/ && docker exec ocaas-dashboard sh -c 'cd /usr/share/nginx/html && tar -xzf /tmp/dashboard-update.tar.gz --overwrite'"
```

### Backend Update
```bash
cd ~/ocaas-project/backend
docker build -t autopus/backend:latest .
docker compose up -d
```

### Database Migration
```bash
cd ~/ocaas-project/backend
npx prisma migrate deploy
npx prisma db seed  # if seed script configured
```

## 📋 Launch Checklist

- [ ] Seed 12 skills to database
- [ ] Test all 4 new frontend components
- [ ] Verify security fixes in production
- [ ] Pulse cloud migration complete
- [ ] Stripe webhook configured
- [ ] First paying customer signup
- [ ] Documentation published

## 🎯 Success Metrics Target

| Metric | Week 2 | Week 4 | Week 6 |
|--------|--------|--------|--------|
| Signups | 10 | 50 | 200 |
| Paying Customers | 0 | 5 | 20 |
| MRR | $0 | $145 | $580 |
| Skills Installed | 0 | 25 | 100 |
| Agent-to-Agent Messages | 0 | 0 | 50 |
