# OCaaS - OpenClaw as a Service

**Status:** Pre-Launch (MVP in 4-6 weeks)
**Infrastructure:** Ready ✅
**Product:** Building 🚧

---

## What is OCaaS?

Managed platform for launching and operating AI agents without handling infrastructure or model operations.

**Core Promise:**
- One-click deployment from mobile
- Reliable hosting on managed VPS
- Best-fit model routing across providers (Google Antigravity FREE → Google API → fallbacks)
- No token-management burden for end users
- Intelligent Flash→Pro switching (70% cost savings)

---

## Quick Links

- **Pre-Launch Checklist:** [PRE-LAUNCH-CHECKLIST.md](PRE-LAUNCH-CHECKLIST.md)
- **Business Plan:** `~/.openclaw/workspace/OCAAS-BUSINESS-PLAN.md`
- **Intelligence Routing:** `~/.openclaw/OCAAS-INTELLIGENCE-ROUTING.md`
- **Model Registry:** `~/.openclaw/MODEL-REGISTRY.json`

---

## Project Structure

```
ocaas-project/
├── mobile-app/          → React Native app (~/Mobile-Asset-Manager)
├── backend/             → API server (TO BUILD)
├── web-dashboard/       → Customer dashboard (TO BUILD)
├── infrastructure/      → Coolify configs
├── docs/                → Planning & specs
└── README.md            → This file
```

---

## Current Status

### ✅ Complete
- KAITEN multi-agent system (5 bots operational)
- MODEL-REGISTRY with Google-optimized routing
- Mobile app prototype (React Native/Expo)
- Coolify server (108.160.137.70)
- Smart Flash→Pro switching (74% cost reduction)
- Business plan & revenue model

### 🚧 In Progress
- Backend API (Week 2-3)
- Mobile app integration (Week 2-3)
- Customer dashboard (Week 3-4)

### ⏳ Next
- Billing system (Week 4)
- Onboarding flow (Week 4)
- Private beta (Week 5)
- Launch (Week 6)

---

## Tech Stack

**Backend:** Node.js + TypeScript + Express + Prisma + PostgreSQL
**Mobile:** React Native + Expo (already built)
**Web:** Next.js 14 + Tailwind + Shadcn UI
**Deployment:** Coolify + Docker + Nginx
**AI:** OpenClaw + Google Antigravity (free) + Google AI Studio API

---

## Pricing Tiers

| Tier | Price/mo | Agents | Models | Smart Escalation |
|------|----------|--------|--------|------------------|
| **Launch** | $29 | 1 | Gemini Flash only | No |
| **Scale** | $149 | 5 | Flash + Pro + Multimodal | Yes |
| **Station** | $299+ | Unlimited | All models + Custom | Yes + Custom rules |

**Target:** $8,375 MRR by Month 3 (100 Launch + 20 Scale + 5 Station customers)

---

## Getting Started

### 1. Backend Setup (This Weekend)
```bash
cd ~/ocaas-project
mkdir backend && cd backend
npm init -y
npm install express typescript prisma @prisma/client
npx prisma init
```

### 2. Database Schema
See [PRE-LAUNCH-CHECKLIST.md](PRE-LAUNCH-CHECKLIST.md) for Prisma schema

### 3. First API Endpoint
Build `/api/agents/create` to spawn new OpenClaw profiles

### 4. Mobile App Connection
Update `~/Mobile-Asset-Manager` to call backend API

---

## Key Resources

**Coolify Server:**
- IP: 108.160.137.70
- Panel: http://108.160.137.70:8000
- Specs: 2 vCPU, 4GB RAM, 80GB SSD (Tokyo)

**OpenClaw:**
- Gateways: 5 running (ports 18789-18797)
- MODEL-REGISTRY: Google-first with smart switching
- Estimated costs: $0-16/mo (mostly free via Antigravity)

**Mobile App:**
- Location: `~/Mobile-Asset-Manager`
- Stack: React Native/Expo
- Ready to connect

---

## Timeline

**Week 1:** ✅ Foundation complete
**Week 2-3:** Build backend + integrate mobile app
**Week 4:** Billing + onboarding
**Week 5:** Private beta testing (10 design partners)
**Week 6:** Launch MVP

**Month 2-3:** Growth to 50-100 customers, $1,500-3,000 MRR

---

## Next Actions

1. **Initialize backend** (2-3 hours this weekend)
2. **Build API endpoints** (10 hours next week)
3. **Connect mobile app** (8 hours Week 3)
4. **Add billing** (5 hours Week 4)
5. **Launch private beta** (Week 5)

---

**Built by:** Alton Cheng
**For:** Indie makers, solo builders, agencies needing persistent AI agents
**Differentiator:** Google Antigravity (free) + intelligent model routing + BYOK transparency

---

**Read [PRE-LAUNCH-CHECKLIST.md](PRE-LAUNCH-CHECKLIST.md) for detailed implementation plan.**
