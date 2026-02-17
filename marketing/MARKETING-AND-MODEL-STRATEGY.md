# OCaaS Marketing, Social Media & Model Strategy
**Date:** 2026-02-17
**Author:** Prime (Orchestrator)

---

## PART 1: SOCIAL MEDIA & TRAFFIC STRATEGY

### Channels to Create (Priority Order)

| Channel | Purpose | Content Type | Agent Owner |
|---------|---------|-------------|-------------|
| **X/Twitter** (@autopus_cloud) | Developer audience, AI community | Tech threads, demos, launches | Pulse (research) + Forge (demo content) |
| **LinkedIn** (Autopus Cloud) | B2B, enterprise buyers | Case studies, thought leadership | Pulse (drafts) + Alton (approve) |
| **ProductHunt** | Launch day traffic burst | Product listing, launch story | Forge (prepare) + Alton (launch day) |
| **GitHub** (autopus/ocaas) | Developer trust, open-source signal | README, examples, issues | Forge (code) + Sight (docs review) |
| **YouTube/Loom** | Demo videos, tutorials | Screen recordings of the product | Forge (record) + Alton (narrate) |

### Content Strategy: "Build in Public"

**Why:** The AI agent market is crowded. "Build in public" creates authenticity, audience, and early adopters BEFORE launch.

**Weekly Content Calendar:**
```
Monday:    Tech thread - "How we built X this week" (X/Twitter)
Tuesday:   Behind-the-scenes - architecture decisions (LinkedIn)
Wednesday: Demo video - 60s product walkthrough (X + LinkedIn)
Thursday:  Competitor analysis - "OCaaS vs X" (X/Twitter)
Friday:    Community engagement - reply to AI agent discussions
Saturday:  User story / testimonial (once beta starts)
Sunday:    Weekly metrics update - "Week N: X users, Y agents deployed"
```

**Content Pillars:**
1. **Technical depth** — Architecture decisions, OpenClaw internals, scaling stories
2. **Product demos** — "Watch me deploy an AI agent in 30 seconds"
3. **Market insights** — AI agent trends, competitor analysis, pricing studies
4. **Community** — Engage with AI builders, respond to questions, contribute to discussions

### Agent Workflow for Autonomous Content

```
1. Pulse: Research trending topics (duckduckgo-search + Reddit/X monitoring)
   → Save to ~/ocaas-project/marketing/content-ideas.md

2. Pulse: Draft content based on research + product state
   → Save to ~/ocaas-project/marketing/drafts/YYYY-MM-DD-{topic}.md

3. Alton: Review and approve draft (30 sec per post)

4. Forge: Create any technical demos or screenshots needed
   → Save to ~/ocaas-project/marketing/assets/

5. Pulse: Schedule/post via X API or manual posting
   → Track engagement in ~/ocaas-project/marketing/metrics.md
```

### Pre-Launch Traffic Playbook

**Week 1-2 (NOW - before MVP):**
- [ ] Create X/Twitter account (@autopus_cloud)
- [ ] Create LinkedIn company page
- [ ] Write 5 "build in public" threads about the journey so far
- [ ] Post architecture diagram of OCaaS
- [ ] Engage with 20+ AI agent discussions on X

**Week 3-4 (MVP ready):**
- [ ] Record 3 demo videos (create agent, chat, manage)
- [ ] Write ProductHunt listing draft
- [ ] Create GitHub repo with README + examples
- [ ] Start collecting beta signups (simple landing page with email capture)

**Week 5 (Beta):**
- [ ] Launch on ProductHunt
- [ ] Post launch thread on X
- [ ] Share on Hacker News
- [ ] Submit to AI directories (there.pm, aitools.fyi, etc.)
- [ ] Reach out to 10 AI newsletter authors

---

## PART 2: RESEARCH & DATABASE STRATEGY

### How Agents Should Do Research

**Tool Chain:**
```
duckduckgo-search → raw results
  ↓
Agent analyzes → extract key insights
  ↓
Save to structured files → ~/ocaas-project/marketing/{topic}.md
  ↓
Optional: Google Sheets for tracking metrics/competitors
```

**Research Topics (assign to Pulse):**

1. **Competitor Analysis**
   - Search: "AI agent platform", "telegram AI bot service", "LLM-as-a-service"
   - Track: pricing, features, tech stack, user reviews
   - File: `~/ocaas-project/marketing/competitor-research.md`

2. **Market Sizing**
   - Search: "AI agent market size 2026", "chatbot SaaS revenue"
   - Track: TAM, growth rate, key players
   - File: `~/ocaas-project/marketing/market-research.md`

3. **SEO Keywords**
   - Search: "AI agent deploy", "personal AI assistant", "custom chatbot"
   - Track: search volume, competition, related terms
   - File: `~/ocaas-project/marketing/seo-keywords.md`

4. **Content Ideas**
   - Monitor: Reddit (r/LocalLLaMA, r/ChatGPT, r/SideProject), X (#AIAgents)
   - Track: trending topics, user pain points, feature requests
   - File: `~/ocaas-project/marketing/content-ideas.md`

### Database for Research (Google Sheets via Agent Skill)

Forge already has the `google-sheets` skill installed. Use it for:
- **Competitor tracking spreadsheet** — Name, URL, pricing, features, last updated
- **Content calendar** — Date, platform, topic, status, engagement metrics
- **Beta signup tracker** — Email, source, status, feedback

---

## PART 3: LANDING PAGE STRATEGY

### MVP Landing Page (Forge builds after core product)

**Tech:** Simple static HTML/CSS or Next.js (deploy to Coolify alongside API)

**Structure:**
```
Hero: "Deploy Your AI Agent in 30 Seconds"
  - Subheading: "OCaaS gives you a personal AI assistant on Telegram, powered by the latest models"
  - CTA: "Get Early Access" (email capture)

How It Works (3 steps):
  1. Sign up → Choose your AI model
  2. Customize → Set your agent's personality and skills
  3. Deploy → Your agent goes live on Telegram instantly

Pricing (simple):
  - Free: 1 agent, 10K tokens/day
  - Launch ($29/mo): 3 agents, 100K tokens/day, priority models
  - Pro ($99/mo): 10 agents, unlimited tokens, custom skills

Social Proof:
  - "Built on OpenClaw" badge
  - Agent count: "X agents deployed"
  - Testimonials (after beta)

Footer: X/Twitter, LinkedIn, GitHub links
```

### UI/UX Design Approach

**For MVP:** No complex UI needed. The product is API-first.
- Admin dashboard: Simple React app with shadcn/ui components
- Agent management: List view with start/stop buttons
- Chat: Basic message interface for testing

**Agent Workflow for Landing Page:**
```
1. Forge: Build static landing page (HTML/Tailwind or Next.js)
2. Sight: Review for security (no XSS), accessibility, mobile responsiveness
3. Forge: Deploy to Coolify at https://autopus.cloud
4. Pulse: Monitor traffic via simple analytics (Plausible or Umami)
```

---

## PART 4: MODEL SELECTION STRATEGY

### Task-to-Model Mapping

| Task Type | Model | Why | Cost |
|-----------|-------|-----|------|
| **Code generation (>50 lines)** | Gemini 3 Pro | Deep reasoning, fewer bugs | Medium |
| **Code generation (<50 lines)** | Gemini 3 Flash | Fast, good enough for small changes | Free |
| **Bug fixes** | Gemini 3 Flash → Pro if stuck | Start cheap, escalate if needed | Low |
| **Testing & QA** | Gemini 3 Flash | Speed matters more than depth | Free |
| **Content writing (drafts)** | Gemini 3 Flash | Quick iteration, will be revised | Free |
| **Content writing (final)** | Gemini 3 Pro | Polish, nuance, quality | Medium |
| **Research & analysis** | Gemini 3 Flash | Breadth over depth | Free |
| **Deep analysis / architecture** | Gemini 3 Pro High | Complex multi-step reasoning | High |
| **System monitoring** | Gemini 3 Flash | Lightweight periodic checks | Free |
| **Landing page copy** | Gemini 3 Pro | Marketing quality matters | Medium |
| **API documentation** | Gemini 3 Flash | Structured, template-based | Free |

### Smart Switching Rules (Already in SHARED-MEMORY.md)

```
DEFAULT: Gemini 3 Flash (FREE via Antigravity)

AUTO-ESCALATE to Pro when:
  - Code generation >50 lines
  - Debugging with stack traces
  - Multi-step reasoning (>3 steps)
  - Message length >1000 chars
  - User says "deep analysis" or "high quality"
  - Content marked as "final" or "publish-ready"

AUTO-DOWNGRADE to Flash when:
  - Complex task completes
  - Routine monitoring/checking
  - Quick acknowledgments
```

### Model Budget (Monthly Target)

```
Antigravity (FREE):     ~80% of all requests
Google API (paid):      ~15% (fallback when Antigravity rate-limited)
Anthropic Haiku:        ~5% (last resort)

Target: $0-16/month total
Alert threshold: $20/month
```

### Per-Agent Model Config

| Agent | Primary | Escalation | Use Case |
|-------|---------|-----------|----------|
| **Forge** | Flash | Pro for code >50 lines | Building, implementing |
| **Sight** | Flash | Pro for deep diagnostics | Testing, auditing |
| **Pulse** | Flash only | Rarely escalate | Monitoring, coordination |
| **Prime** | Flash | Pro for architecture decisions | Orchestrating |

---

## PART 5: AGENT WORKFLOW FOR AUTONOMOUS OPERATIONS

### Daily Autonomous Cycle (After MVP)

```
09:00 HKT — Pulse: Morning standup (system health + task status)
09:15 HKT — Prime: Review standup, assign daily tasks
09:30 HKT — Forge: Start coding tasks
10:00 HKT — Sight: Morning system audit + Forge's code review
12:00 HKT — Pulse: Midday check (progress, blockers)
12:30 HKT — Forge: Marketing content (if code tasks done)
14:00 HKT — Sight: Test any completed features
15:00 HKT — Pulse: Research + content drafting
17:00 HKT — Forge: Deploy any approved changes
18:00 HKT — Pulse: Evening report (metrics, issues, plan for tomorrow)
21:00 HKT — Sight: Nightly security scan + log review
```

### Autonomous Content Pipeline

```
Pulse researches (duckduckgo) → saves draft → Alton approves (30s) → Forge formats → Post

Research frequency: Daily
Draft frequency: 3x/week
Approval: Alton spends ~5 min/week reviewing drafts
Posting: Automated where possible, manual for first month
```

### How to Ask Agents to Do Things (Best Practices)

**For Code Tasks (Forge):**
```
"Build [feature]. Location: [file path]. Requirements: [1,2,3].
Use Pro model. Test with: [test command]. Deploy after Sight approves."
```

**For Research Tasks (Pulse):**
```
"Research [topic]. Search: [specific queries]. Save to: [file path].
Include: competitors, pricing, features, our advantage. Use Flash."
```

**For Testing Tasks (Sight):**
```
"Test [feature]. Steps: [1,2,3]. Expected: [outcomes].
Write report to: [file path]. Flag any security issues as HIGH."
```

**For Content Tasks (Pulse or Forge):**
```
"Draft [content type] about [topic]. Platform: [X/LinkedIn].
Tone: [technical/casual]. Length: [tweet/thread/article].
Save to: ~/ocaas-project/marketing/drafts/[name].md"
```

---

**This strategy turns your KAITEN squad into a full product + marketing machine.**
**Code by day, content by evening, monitoring 24/7.**
