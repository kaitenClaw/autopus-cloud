# Autopus Cloud

AI Agent Orchestration Platform - Deploy, manage, and coordinate autonomous AI agents in the cloud.

## 🌐 Live URLs

- **Landing Page**: https://autopus.cloud
- **Dashboard**: https://dashboard.autopus.cloud
- **API**: https://api.autopus.cloud

## 🏗️ Architecture

```
autopus-cloud/
├── apps/
│   ├── dashboard/          # React + Tailwind frontend (User dashboard)
│   ├── landing/            # Marketing website (Glassmorphism design)
│   └── admin/              # Owner admin panel
├── packages/
│   ├── shared/             # Shared types & utilities
│   └── ui/                 # shadcn/ui components
├── services/
│   ├── backend/            # API server (Node.js + Express + Prisma)
│   ├── agent-runtime/      # Docker agent templates
│   └── marketplace/        # Agent template registry
└── docs/
    ├── architecture/       # System design docs
    ├── api/                # API documentation
    └── deployment/         # Deployment guides
```

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- PostgreSQL 15

### Local Development

```bash
# Clone repository
git clone https://github.com/kaitenClaw/autopus-cloud.git
cd autopus-cloud

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Start services
docker-compose up -d

# Run migrations
npm run db:migrate

# Start development
npm run dev
```

## 🤖 Agent Architecture

| Agent | Location | Role | Status |
|-------|----------|------|--------|
| **KAITEN** | Local (Mac Mini) | Orchestrator + Skill Learning | 🟢 Active |
| **PULSE** | VPS Cloud | DevOps + Monitoring | 🟡 Deploying |
| **FORGE** | Local (Mac Mini) | Builder/UI Developer | ⏳ Pending |
| **SIGHT** | Local (Mac Mini) | SEO + Content | ⏳ Pending |

> **Note**: FION (Creative) is a separate client instance, not part of Autopus Cloud infrastructure.

## 🎨 Design System

- **Style**: Glassmorphism (frosted glass, depth)
- **Colors**: Indigo (#6366F1) + Emerald (#10B981)
- **Typography**: Fira Code + Fira Sans
- **Stack**: React + TypeScript + Tailwind CSS + shadcn/ui

## 📊 Features

- 🤖 **Cloud Agents**: Deploy AI agents with one click
- 💬 **Telegram Integration**: Chat with agents via Telegram
- 📈 **Real-time Monitoring**: Track agent performance
- 💰 **Usage Tracking**: Monitor tokens and costs
- 🛒 **Marketplace**: Pre-built agent templates

## 🛣️ Roadmap

### Phase 1: Core (This Week)
- [x] VPS infrastructure
- [x] Landing page + Dashboard
- [ ] Dashboard UI redesign (Glassmorphism)
- [ ] Mobile optimization

### Phase 2: Growth (Next Week)
- [ ] SEO optimization
- [ ] Social media integration
- [ ] Blog + Newsletter
- [ ] Dark mode

### Phase 3: Scale (Following Weeks)
- [ ] Owner admin panel
- [ ] Marketplace feature
- [ ] Billing integration (Stripe)
- [ ] Usage analytics

## 📝 License

Private - All rights reserved.

## 👥 Team

Built by the Autopus Agent Squad:
- **KAITEN**: Orchestrator
- **FORGE**: Builder
- **SIGHT**: Researcher
- **PULSE**: DevOps

> **Note**: FION (Creative) operates as a separate client instance with complete isolation from the Autopus Cloud platform.
