# SHARED CONTEXT - OCaaS Project

## Current Sprint: Week 2 - Product Core Build
- **Status:** ACTIVE
- **Last Synced:** 2026-02-21 19:00 (+08:00)
- **Primary Goal:** Build the 4 core service pillars. Ship fast. KAITEN squad in parallel.

## Autopus Cloud — 4 Core Service Pillars

### Pillar 1: One-Click Cloud Deploy
- Customer gets their own VPS container running OpenClaw, auto-updating to latest version.
- Zero technical setup. "Birth Your Agent" → Vultr provisions → container live in 60 seconds.
- Backend: Vultr API integration, Docker template, auto-update daemon, health monitoring.

### Pillar 2: Growing AI Agents + World Protocol
- Agents that learn and grow with the user over time (durable memory, personality).
- Autopus defines open protocols for agent interop — like Anthropic's MCP for tools, Google's A2A for agents.
- Our protocol: **Agent Skills** (installable capabilities) + **Agent-to-Agent messaging** (cross-user, cross-platform).
- Goal: become the standard for how agents communicate and extend themselves.

### Pillar 3: Seamless Telegram + In-App Chat
- Telegram as primary interface (where users already live).
- Dashboard in-app chatroom mirrors all conversations with full agent memory context.
- Users can switch between Telegram and Dashboard seamlessly — same memory, same thread.

### Pillar 4: Skill Marketplace + Agent Network
- Marketplace where users browse and install skills for their agents.
- Agents can also discover skills autonomously (browse marketplace, recommend to user).
- Public agents + cross-user agent communication = network effects.
- Revenue: skill listing fees, premium skills, agent-to-agent transaction fees.

## Completed (Feb 21 — by Prime/Claude Opus)
1. **CORS fix** — LIVE. Login from `autopus.cloud` works.
2. **Deep Sea brand palette** — LIVE. Cyan/coral design tokens across all surfaces.
3. **Logo refresh** — LIVE. Cyan→coral gradient.
4. **Landing page** — LIVE. "Your Autonomous Partner. Born in the Cloud." + factory language.
5. **Email capture → signup flow** — LIVE. Converts leads to users.
6. **Agent sidebar enrichment** — LIVE. Status dots, model badges, pulse animation.
7. **api.ts retry/resilience** — LIVE. 429/502/503/504 retry, auto-logout, 404 fallbacks.
8. **Vibe Sliders** — BUILT (pending deploy). Two sliders (Creativity: Logical↔Imaginative, Detail: Concise↔Thorough), three presets (Precise/Balanced/Creative). Replaces raw Temperature/MaxTokens. File: `frontend/src/components/VibeSliders.tsx`.

## Active Build Queue (Ordered by Pillar)
### URGENT — Pulse Cloud Migration (Feb 23)
**Goal**: Migrate Pulse as first cloud agent for multi-agent architecture validation
- **[FORGE]** Prepare Pulse cloud profile (OpenRouter config, separate memory)
- **[FORGE]** Deploy Pulse container to VPS via Spawner Service
- **[FORGE]** Validate Pulse cloud operation (Telegram + Dashboard)
- **[FORGE]** Document migration playbook for Sight/Forge/Prime

### Pillar 1 — Cloud Deploy
1. **[FORGE]** Vultr API provisioning integration (one-click container spawn) — IN PROGRESS
2. **[FORGE]** Auto-update daemon for user containers
3. **[FORGE]** "Deploy to Cloud" button in Dashboard

### Pillar 2 — Agent Growth + Protocol
4. **[FORGE]** Agent Skills framework (install/uninstall/list)
5. **[FORGE]** Agent-to-Agent messaging protocol spec
6. **[FORGE]** Proactive agent welcome (agent sends first message)

### Pillar 3 — Telegram + Chat
7. **[FORGE]** Telegram Login Widget / Magic Link (passwordless onboarding)
8. **[FORGE]** In-app chatroom with full memory context
9. **[FORGE]** Telegram↔Dashboard thread sync (same memory, same thread)

### Pillar 4 — Marketplace
10. **[FORGE]** Skill Registry backend (DB + API)
11. **[FORGE]** Marketplace UI in Dashboard
12. **[FORGE]** Agent-autonomous skill discovery

### Cross-cutting
13. **[FORGE]** Stripe billing integration
14. **[FORGE]** Create `/api/diagnostics/llm-keys` endpoint to visually display Vertex vs AI Studio key usage in the frontend Dashboard. 
15. **[SIGHT]** QA pass on brand + Vibe Sliders + sidebar
16. **[PULSE]** Production health monitoring & LiteLLM Gateway key auditing.

## Key Strategy Documents
- **`~/.openclaw/workspace/AUTOPUS-MASTER-PLAN.md`** — **THE master plan. 4 pillars, sprints, metrics, architecture.**
- **`~/.openclaw/workspace/AUTOPUS-BUSINESS-STRATEGY.md`** — Positioning, pricing, unit economics, competitive landscape
- **`~/.openclaw/workspace/AUTOPUS-MARKETING-PLAN.md`** — Launch strategy, content calendar, influencer seeding
- `~/.openclaw/workspace/AUTOPUS-VULTR-UNIVERSAL-STRATEGY.md` — Factory model (original)
- `~/.openclaw/workspace/AUTOPUS-MASS-MARKET-BLUEPRINT.md` — Solopreneur targeting (original)
- `~/.openclaw/workspace/AUTOPUS-USER-EXPERIENCE-MANIFESTO.md` — Zero-friction UX
- `~/.openclaw/workspace/AUTOPUS-BRAND-STRATEGY.md` — "Invisible Giant"
- `~/.openclaw/workspace/AUTOPUS-ECOSYSTEM-MANIFESTO.md` — A2A + Marketplace vision
- `~/.openclaw/workspace/AUTOPUS-ULTRA-ACCELERATION-SCHEDULE.md` — Gemini 3.1 Pro acceleration

## System Health
- All 3 domains live: autopus.cloud (200), dashboard.autopus.cloud (200), api.autopus.cloud (200)
- Backend: running, CORS fixed
- Traefik proxy: healthy
- Market: 0 leads/0 paid — email capture wired, needs traffic

## Risks / Watchpoints
- VPS build takes ~20 min (2-vCPU constraint)
- Vultr API integration = new dependency, needs API key provisioning
- Agent protocol design is strategic — rush could create tech debt
- Usage pipeline gap still open
