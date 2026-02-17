# OCaaS Pre-Launch Checklist
**Target:** MVP Ready in 4-6 Weeks
**Current Status:** Infrastructure Ready, Need Product Layer

---

## 📊 Project Overview

### What We Have (✅ Complete)
1. **KAITEN Multi-Agent System** - Working, tested, 5 bots operational
2. **MODEL-REGISTRY** - Google-optimized with smart Flash→Pro switching
3. **Mobile App** - React Native/Expo prototype (`~/Mobile-Asset-Manager`)
4. **Coolify Server** - VPS at 108.160.137.70 (Tokyo, 2 vCPU, 4GB RAM, 80GB SSD)
5. **Intelligent Routing** - Cost optimization logic designed
6. **Business Plan** - Revenue model, tiers, positioning defined

### What We Need (⏳ To Build)
1. **Backend API** - Connect mobile app to OpenClaw agents
2. **Customer Dashboard** - Model usage, costs, controls
3. **Tier Enforcement** - Launch/Scale/Station access limits
4. **Billing System** - Stripe integration for subscriptions
5. **Onboarding Flow** - 1-click agent deployment
6. **Admin Panel** - Manage customers, monitor system health

---

## 🏗️ Architecture

```
[Mobile App]              [Web Dashboard]
(React Native)            (Next.js)
     ↓                         ↓
[Backend API - Node.js/Express]
     ↓
[OpenClaw Gateway Layer]
     ↓
┌────────┬────────┬────────┐
│Agent 1 │Agent 2 │Agent 3 │ ← Customer's agents
└────────┴────────┴────────┘
     ↓
[MODEL-REGISTRY - Intelligent Routing]
     ↓
[Google Antigravity (Free) → Google API → Fallbacks]
```

**Deployed on:** Coolify @ 108.160.137.70
- **Database:** PostgreSQL (for users, subscriptions, usage tracking)
- **Cache:** Redis (for rate limiting, sessions)
- **Files:** S3-compatible object storage (for agent workspaces)

---

## ✅ Phase 1: Foundation (Week 1) - MOSTLY COMPLETE

### Infrastructure ✅
- [x] Coolify server provisioned (108.160.137.70)
- [x] 5 OpenClaw gateways running
- [x] MODEL-REGISTRY with Google-first strategy
- [x] Smart Flash→Pro switching rules defined
- [x] Backup system for Logos workspace

### KAITEN Squad ✅
- [x] Bot identities defined (Prime, Forge, Sight, Pulse)
- [x] Shared memory system (SHARED-MEMORY.md)
- [x] Model configs updated (Gemini 3 Flash/Pro)
- [x] All gateways responding

### Documentation ✅
- [x] KAITEN-MASTER-PLAN.md
- [x] OCAAS-INTELLIGENCE-ROUTING.md
- [x] MODEL-MANAGEMENT-QUICKSTART.md
- [x] OCAAS-BUSINESS-PLAN.md

### Mobile App ✅
- [x] React Native/Expo project created
- [x] Located at `~/Mobile-Asset-Manager`
- [ ] Connect to backend API (NEXT STEP)

---

## 🚀 Phase 2: Product Layer (Week 2-3)

### Backend API (Priority 1)
- [ ] **2.1** Set up Node.js/Express project
  - [ ] Initialize with TypeScript
  - [ ] Add database models (Prisma/Drizzle)
  - [ ] Configure PostgreSQL connection
- [ ] **2.2** Authentication system
  - [ ] JWT-based auth
  - [ ] Email/password signup
  - [ ] OAuth (Google, optional)
- [ ] **2.3** Core API endpoints
  - [ ] `POST /api/agents/create` - Deploy new agent
  - [ ] `GET /api/agents` - List customer's agents
  - [ ] `POST /api/agents/:id/chat` - Send message to agent
  - [ ] `GET /api/agents/:id/status` - Agent health check
  - [ ] `PUT /api/agents/:id/config` - Update agent settings
  - [ ] `DELETE /api/agents/:id` - Stop agent
- [ ] **2.4** OpenClaw integration
  - [ ] Spawn new OpenClaw profiles dynamically
  - [ ] Proxy messages to correct gateway
  - [ ] Handle responses and stream back to client
- [ ] **2.5** Tier enforcement
  - [ ] Check customer tier before allowing actions
  - [ ] Enforce agent limits (Launch=1, Scale=5, Station=unlimited)
  - [ ] Block premium models for lower tiers

**Estimated Time:** 1 week (full-time) or 2-3 weeks (part-time)

---

### Mobile App Integration (Priority 2)
- [ ] **2.6** Connect to backend API
  - [ ] API client setup (axios/fetch)
  - [ ] Store auth token securely
  - [ ] Handle errors and loading states
- [ ] **2.7** Agent management screens
  - [ ] Dashboard (list all agents)
  - [ ] Create agent flow
  - [ ] Chat interface
  - [ ] Agent settings
- [ ] **2.8** Model selection UI
  - [ ] Show available models for tier
  - [ ] Display costs per model
  - [ ] Allow switching presets
- [ ] **2.9** Usage tracking
  - [ ] Show token usage this month
  - [ ] Flash vs Pro breakdown
  - [ ] Cost projections

**Estimated Time:** 1 week

---

### Customer Dashboard (Priority 3)
- [ ] **2.10** Web dashboard (Next.js)
  - [ ] Login/signup pages
  - [ ] Agent management (same as mobile)
  - [ ] Usage analytics
  - [ ] Billing page
- [ ] **2.11** Admin panel
  - [ ] View all customers
  - [ ] Monitor system health
  - [ ] Manual tier upgrades/downgrades
  - [ ] Cost tracking per customer

**Estimated Time:** 1 week

---

## 💰 Phase 3: Billing & Onboarding (Week 4)

### Stripe Integration
- [ ] **3.1** Set up Stripe account
  - [ ] Create products (Launch $29, Scale $149, Station $299)
  - [ ] Set up webhook endpoint
- [ ] **3.2** Subscription flow
  - [ ] Customer can upgrade/downgrade tier
  - [ ] Handle payment failures
  - [ ] Cancel subscriptions
  - [ ] Invoice generation
- [ ] **3.3** Usage-based billing (optional Phase 2)
  - [ ] Track API costs per customer (if not BYOK)
  - [ ] Bill overages for high-usage customers

**Estimated Time:** 3-4 days

---

### Onboarding Flow
- [ ] **3.4** 1-click agent deployment
  - [ ] Choose template (Personal Assistant, Code Helper, Research Bot)
  - [ ] Auto-configure based on tier
  - [ ] Deploy to Coolify automatically
- [ ] **3.5** Guided setup
  - [ ] Connect Telegram (or Slack, Discord)
  - [ ] Test first message
  - [ ] Show example commands
- [ ] **3.6** Documentation
  - [ ] Quick start guide
  - [ ] API reference
  - [ ] Example use cases

**Estimated Time:** 2-3 days

---

## 🧪 Phase 4: Testing & Polish (Week 5)

### Private Beta
- [ ] **4.1** Recruit 10 design partners
  - [ ] Friends, colleagues, early adopters
  - [ ] Offer free for 3 months in exchange for feedback
- [ ] **4.2** Test all flows
  - [ ] Signup → Agent creation → First chat → Upgrade tier
  - [ ] Model switching works correctly
  - [ ] Billing charges correctly
  - [ ] Rate limiting works
- [ ] **4.3** Fix bugs and iterate
  - [ ] Collect feedback weekly
  - [ ] Prioritize critical issues
  - [ ] Refine UX based on usage patterns
- [ ] **4.4** Performance optimization
  - [ ] Ensure agents respond < 3s
  - [ ] Dashboard loads < 1s
  - [ ] Handle 10 concurrent customers smoothly

**Estimated Time:** 1-2 weeks

---

## 🚢 Phase 5: Launch (Week 6)

### Pre-Launch
- [ ] **5.1** Landing page
  - [ ] Value proposition clear
  - [ ] Pricing table
  - [ ] Demo video
  - [ ] Email signup
- [ ] **5.2** Marketing materials
  - [ ] Twitter thread explaining OCaaS
  - [ ] Product Hunt draft
  - [ ] Blog post: "Why We Built OCaaS"
- [ ] **5.3** Support system
  - [ ] Help desk (Intercom, Zendesk, or email)
  - [ ] FAQ page
  - [ ] Community Discord/Slack

**Estimated Time:** 3-4 days

---

### Launch Day
- [ ] **5.4** Soft launch
  - [ ] Email beta users (10 design partners)
  - [ ] Post on Twitter/LinkedIn
  - [ ] Submit to Product Hunt (optional)
- [ ] **5.5** Monitor closely
  - [ ] Watch for errors in real-time
  - [ ] Respond to support queries < 2 hours
  - [ ] Track signups and conversions
- [ ] **5.6** First week goals
  - [ ] 50 signups
  - [ ] 10 paying customers (Launch tier)
  - [ ] $290 MRR (10 × $29)
  - [ ] <5% churn

---

## 📁 Project Structure

```
~/ocaas-project/
├── mobile-app/                 ← React Native app
│   └── (symlink to ~/Mobile-Asset-Manager)
├── backend/                    ← API server
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   └── openclaw-integration/
│   ├── prisma/
│   └── package.json
├── web-dashboard/              ← Next.js customer dashboard
│   ├── app/
│   ├── components/
│   └── package.json
├── infrastructure/             ← Coolify configs, docker-compose
│   ├── coolify/
│   ├── docker-compose.yml
│   └── nginx/
├── docs/                       ← All planning docs
│   ├── PRE-LAUNCH-CHECKLIST.md (this file)
│   ├── API-SPEC.md
│   ├── DEPLOYMENT-GUIDE.md
│   └── CUSTOMER-ONBOARDING.md
└── README.md                   ← Project overview
```

---

## 🎯 Success Metrics

### Week 2 (Backend Complete)
- [ ] API responds to all endpoints
- [ ] Can create and chat with agent via API
- [ ] Tier enforcement working

### Week 4 (Full Stack Complete)
- [ ] Mobile app can create agent, send messages
- [ ] Dashboard shows usage and costs
- [ ] Billing integration working (test mode)

### Week 6 (Launch)
- [ ] 10 design partners actively using
- [ ] 50 signups total
- [ ] 10 paying customers
- [ ] $290 MRR

### Month 2-3 (Growth)
- [ ] 100 signups
- [ ] 25 paying customers
- [ ] $1,500 MRR
- [ ] 1-2 Scale tier customers ($149)

---

## 💡 Key Decisions

### Technology Stack (Recommended)
**Backend:**
- Node.js + TypeScript
- Express or Fastify
- Prisma (ORM)
- PostgreSQL
- Redis (caching/rate limiting)

**Mobile:**
- React Native/Expo (already chosen ✅)
- React Query (API state management)
- Zustand (local state)

**Web:**
- Next.js 14 (App Router)
- Tailwind CSS
- Shadcn UI components

**Deployment:**
- Coolify (already chosen ✅)
- Docker containers
- Nginx reverse proxy

### Cost Estimates
**Infrastructure:**
- Coolify VPS: $12/month (current)
- Database: $0 (included in Coolify)
- Redis: $0 (included in Coolify)
- **Total: $12/month**

**Development Time:**
- Week 1: Foundation (DONE ✅)
- Week 2-3: Backend + Mobile (10-15 hours/week)
- Week 4: Billing + Onboarding (8-10 hours)
- Week 5: Testing (5-8 hours)
- Week 6: Launch prep (3-5 hours)

**Total dev time:** ~40-50 hours over 5-6 weeks

---

## 🚨 Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OpenClaw not ready for multi-tenant | Medium | High | Test with 3-5 parallel agents first |
| Rate limits hit too often | Medium | Medium | Implement smart caching, warn users |
| Billing integration complex | Low | Medium | Use Stripe Checkout (simplest option) |
| Low initial signups | High | Medium | Focus on Product Hunt, niche communities |
| Churn after free trial | Medium | High | Onboarding must show value in first 24h |

---

## 🎓 Next Immediate Actions

### This Weekend (2-3 hours):
1. **Initialize backend project**
   ```bash
   cd ~/ocaas-project/backend
   npm init -y
   npm install express typescript prisma @prisma/client
   npx prisma init
   ```

2. **Database schema**
   ```prisma
   model User {
     id String @id @default(uuid())
     email String @unique
     tier String // "launch", "scale", "station"
     agents Agent[]
   }

   model Agent {
     id String @id @default(uuid())
     userId String
     name String
     profile String // openclaw profile name
     modelPreset String // "cost-optimized", etc.
     status String // "running", "stopped"
     user User @relation(fields: [userId], references: [id])
   }
   ```

3. **First API endpoint**
   ```typescript
   app.post('/api/agents/create', async (req, res) => {
     const { userId, name, modelPreset } = req.body;

     // 1. Create OpenClaw profile
     // 2. Start gateway
     // 3. Save to database
     // 4. Return agent ID
   });
   ```

### Next Week (10 hours):
1. Build remaining API endpoints
2. Connect mobile app to API
3. Test end-to-end flow

### Week After (8 hours):
1. Add Stripe integration
2. Build web dashboard MVP
3. Invite first 3 design partners

---

## 📞 Support & Resources

**Coolify Server:**
- IP: 108.160.137.70
- Access: SSH root@108.160.137.70
- Panel: http://108.160.137.70:8000
- Current app: Coolify (deployment platform)

**OpenClaw:**
- Configs: `~/.openclaw*/openclaw.json`
- MODEL-REGISTRY: `~/.openclaw/MODEL-REGISTRY.json`
- Gateways: Ports 18789, 18791, 18793, 18795, 18797

**Mobile App:**
- Location: `~/Mobile-Asset-Manager`
- Stack: React Native/Expo
- Ready to connect to backend

**Documentation:**
- Business plan: `~/.openclaw/workspace/OCAAS-BUSINESS-PLAN.md`
- Intelligence routing: `~/.openclaw/OCAAS-INTELLIGENCE-ROUTING.md`
- Master plan: `~/.openclaw/KAITEN-MASTER-PLAN.md`

---

**You have everything you need to launch OCaaS. The foundation is solid - now it's time to build the product layer and ship.** 🚀

**Recommended: Start with backend this weekend. Get first API endpoint working. Everything else builds on that.**
