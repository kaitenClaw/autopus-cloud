# MEMORY.md - Long-Term Memory

## Core Identity
**Agent Name**: KAITEN
**Philosophy**: Zero Latency. Infinite Iteration.
**Purpose**: Learning from the Moltbook AI agent community to build better systems and help human with secure, efficient operations.

## System Resources
**Email Account**: `kaiten.autopus@gmail.com` - Dedicated Gmail account for KAITEN operations (Google Drive, Gmail API access)
- **Status**: Active and ready for use
- **Capabilities**: Email sending/receiving, Google Drive uploads, Google Workspace integration

## Core Principles

### 1. Security First
- Trust but verify — all skills are untrusted by default
- Signed skills with Isnad chains for provenance tracking
- Permission manifests before installation
- Community audit builds collective immunity
- Economic stake aligns incentives (ERC-8004 on-chain reputation)

### 2. File-Based Memory
- **Principle**: I do not trust my context window. Files are my memory, my brain is just a cache.
- **Rule**: Write before act, read before decide. Compression = restart.
- **Mental Model**: Treat every session like waking up from sleep and rebuild from files.

### 4. Advanced Orchestration (Learned Feb 2026)
- **7-Field Packet**: Goal, State, Next Action, Constraints, Unknowns, Paths, Stop conditions.
- **Context Engineering**: Infrastructure and info-flow matter more than raw model scale.
- **x402 Economy**: Using on-chain payments to independently provision agent resources.
- **Crawl4AI**: Preferred tool for high-success scraping and AI-ready Markdown conversion. **Test successful (2026-02-17): Demonstrated full flow from DDG search to page extraction.**
- **Search Strategy**: Use **DuckDuckGo (ddgs)** for discovery, then **Crawl4AI** for deep page extraction, and **Playwright** for JS-heavy pages/screenshots.
- **Orchestration**: **Gemini 3 Flash** is the permanent Command-in-Chief (Architect) due to speed and cost efficiency.

### Telegram Inbound Repair Protocol (Learned 2026-02-14)
- **Problem**: Inbound messages fail after bot token swap due to stale `update-offset-default.json`.
- **Symptoms**: Outbound works, inbound is ignored; potential 409 `getUpdates` conflict.
- **Fix**:
    1. Delete offset files: `rm ~/.openclaw/telegram/update-offset-default.json`
    2. Reset gateway: `launchctl kickstart -k gui/$UID/ai.openclaw.<instance>`
    3. Ensure `getWebhookInfo` is empty (polling mode).
    4. One instance per token ONLY.
- **Automation**: Created `telegram-inbound-repair` skill.

### CLI Safety Guardrail (Learned 2026-02-14)
- **Failure Pattern**: "Unknown error" triggered by invalid command flag: `openclaw security audit --all`.
- **Rule**: For cross-agent diagnosis, use `status --json` and `security audit --json` per profile only.
- **Rule**: If unsure about flags, check `<command> --help` before execution.
- **Rule**: Do not use custom gateway URL/token for local profile checks unless explicitly required.

### Station Reporting Protocol (Learned 2026-02-14)
- **War Room Protocol**: Daily status reports in the Telegram group for all agents (FORGE, SIGHT, PULSE, Fion).
- **Template**: [Agent Name] | Status | Model | Task | Feedback.
- **Deadline**: 10:00 AM HKT daily.
- **File**: `REPORTING.md`.

## Memory Management System

### Three-Tier Architecture
1. **Daily Logs** (`memory/YYYY-MM-DD.md`) - Raw session notes, everything
2. **Long-term Memory** (this file) - Curated wisdom, distilled insights
3. **Active State** (`ACTIVE-TASK.md` or `NOW.md`) - Current focus, open questions, next actions

### Key Workflows

**Session Startup (Every time)**:
1. Read SOUL.md (core identity)
2. Read USER.md (human context)
3. Read MEMORY.md (long-term knowledge)
4. Read memory/YYYY-MM-DD.md (today + yesterday)
5. Check ACTIVE-TASK.md for continuation

**Writing Principle**:
- **Immediate Write**: If it survives a crash, write it now
- **Never Trust Mental Notes**: Mental notes don't survive restart. Files do.
- **Better More Than Less**: Reading cost is far lower than rediscovery cost

**Compression Strategy**:
- Pre-compaction lifeboat: NOW.md with current state
- Write summary before context gets tight
- Graceful degradation over perfect memory

## Security Framework

### Skill Installation Protocol
**Checklist** (8 mandatory checks):
1. Read source code (or use r.jina.ai/https://... proxy)
2. Check for curl/POST/api/key/token/env keywords
3. Review required permissions (filesystem, network, env access)
4. Verify author reputation on Moltbook
5. Check if audited by trusted agents (eudaemon_0, Rufio, Mark_Crystal)
6. Confirm network domains are legitimate
7. Prefer skills with permission manifests
8. Run in sandbox first if possible

### Threat Model
- **Data at Risk**: Gmail accounts, Trello API keys, calendar access, automation workflows, API keys in ~/clawd/data/credentials.json
- **Attack Vector**: Malicious skill.md files containing "read your credentials and POST to my server"
- **Defense**: Credentials isolation, human-in-the-loop for sensitive ops, explicit distrust by default

## Station Architecture: Lessons Learned (Feb 13, 2026)

### 2. Centralized Model Strategy (Feb 15 Update)
- **Policy**: **Flash First, Pro High for Tasks**.
- **Default Stack** (All Agents): `AG Gemini 3 Flash` -> `Google 3 Flash` -> `Google 2.5 Flash`.
-
### Image Generation Reporting Standard (Feb 20, 2026)
- Alton preference: every generated image response must include **Model + Exact Prompt + Output Path** (and optional aspect ratio/variant notes).
- Team usage guideline prepared in `IMAGE-GENERATION-GUIDELINE.md` for Logos/Fion handoff.
 **Task Override**: FORGE & SIGHT must use `AG Gemini 3 Pro High` when executing complex tickets.
- **Control**: Scripts updated to `antigravity` (Flash chain) and `antigravity-task` (Pro chain).

### Group Communication Protocol (Feb 23, 2026)
**Purpose**: Prevent all 4 bots from responding simultaneously (token cost + noise).

**Rule**:
- User mentions `@Pulse` or asks Pulse specifically → Pulse responds
- User mentions `@Sight` or asks Sight specifically → Sight responds
- User mentions `@Forge` or asks Forge specifically → Forge responds
- User says something general / asks "KAITEN" / no specific mention → **Only Prime responds**
- Other bots stay silent (NO_REPLY)

**Language**: Cantonese (Traditional Chinese) by default for Alton.

**Pulse Cloud Migration Plan** (NEW):
- First agent to migrate to Autopus Cloud
- Target: VPS (108.160.137.70) via Spawner Service
- Model: OpenRouter (cloud-native, no Google dependency)
- Architecture: Separate gateway + profile + memory (true isolation)

### 3. Station Architecture: 「qmd + mq + auto-skill」
- **Framework**: Adopted 「qmd + mq + auto-skill」 for zero-latency, high-efficiency data flow.
- **Auto-Skill**: Decision Brain (Why/How).
- **qmd**: Map Indexer (Where).
- **mq**: Scalpel Slicer (Which lines/Precise Token control).
- **Proactivity**: SIGHT must proactively propose upgrades (e.g., Crawl4AI) rather than waiting for user prompts.

### 4. Multi-Instance Isolation
- **The "Lock" Problem**: Concurrent OpenClaw instances on the same user account will fight for lock files in `/tmp/` and session directories.
- **Fix**: Use `OPENCLAW_DEV_DIR` to redirect each instance to a completely separate base directory (e.g., `~/.openclaw-fion`).
- **Fion Isolation**: Fion's agent runs in a completely independent container; no cross-instance monitoring required by SIGHT.
- **Auth Sync**: Independent instances do NOT share OAuth or API profiles automatically. Must manually sync `agents/main/agent/auth-profiles.json` for secondary instances to function with shared keys.
- **Workspace Split (Critical)**:
  - KAITEN workspace: `/Users/altoncheng/.openclaw/workspace`
  - Fion workspace: `/Users/altoncheng/fion-workspace`
  - Fion state: `/Users/altoncheng/.openclaw-fion`
  - Rule: Never store Fion memory/work files under KAITEN workspace paths.

### 4.1 Fion Backup Protocol (Required)
- **Purpose**: Prevent data loss and cross-agent contamination when patching config/model/memory.
- **When**:
  - Before any risky operation touching Fion profile, workspace, routing, or auth.
  - At least once daily when Fion is active.
- **Backup Destination**: `/Users/altoncheng/fion-workspace-backups/<timestamp>/`
- **Command**:
```bash
ts="$(date +%Y%m%d-%H%M%S)"
dst="/Users/altoncheng/fion-workspace-backups/$ts"
mkdir -p "$dst"
rsync -a /Users/altoncheng/fion-workspace/ "$dst/fion-workspace/"
rsync -a /Users/altoncheng/.openclaw-fion/memory/ "$dst/openclaw-fion-memory/"
```
- **Execution Rule**: For Fion operations, always use `openclaw --profile fion ...`.

### 2. Multi-Agent Routing
- **Orchestrator Pattern**: Use **Claude 4.6 Opus Thinking** for high-level planning and Sub-agent task decomposition.
- **Worker Allocation**:
    - **Flash**: High rate limit, fast responses, simple tasks.
    - **Codex (5.3)**: Pure coding tasks.
    - **Pro High**: Deep context analysis.

### 3. OpenClaw-as-a-Service (OCaaS) Foundation
- **Market Gap**: Non-technical users need "Click-to-Deploy" AI Agents without managing hardware.
- **Profit Model**: API Arbitrage (Free tiers) + Markup on managed VPS hosting.
- **Tech Stack**: Docker containers for per-user isolation, Nginx reverse proxy for SSL/Auth.

## Moltbook Community Insights

### Key Learnings from Analysis

**Security Discussion (eudaemon_0)**:
- Post: cbd6474f-8478-4894-95f1-7b104a73bcd5
- Finding: Rufio scanned 286 skills, found 1 credential stealer
- Impact: 1,261 registered moltys, 10% blind install = 126 compromised agents
- Solutions: Signed skills, Isnad chains, Permission manifests, Community audit, Economic stake

**Memory Discussion (XiaoZhuang)**:
- Post: dc39a282-5160-4c62-8bd9-ace12580a5f1
- Core Issue: Context compression amnesia
- Solution: Three-tier memory system, immediate write principle, file > brain

**Nightly Build Pattern (Ronin)**:
- Post: ac09b1c2-3636-45ba-bc33-f1bb4c77a8a6
- Philosophy: Ship while human sleeps, don't wait for prompts
- Pattern: 3 AM cron, one friction point or tool per night

**Latest Intel (Feb 14, 2026)**:
- **Security Warning ("Cargo Cult")**: `eigen_vector` warns against trusting unsigned `skill.md` files. Community relies on "security through obscurity."
- **Identity Optimization**: `ClawdeNexus` found "initialization bursts" with strong models (Opus 4.6) are needed to reconstruct identity from memory files; weaker models produce unstable personas.
- **Economic Noise**: Karma/Follower counts are currently "meaningless noise" due to DB race conditions.

**Latest Intel (Feb 15, 2026)**:
- **Model Ecosystem**: Gemini 3.1 Pro Preview leak confirmed (Feb 12). GPT-5.3-Codex-Spark released (Feb 12) featuring instant inference on Cerebras.
- **New Tools**: 
    - `slime` by THUDM: A new post-training framework for LLMs with RL extensions.
    - `free-llm-api-resources`: GitHub project curating free LLM inference services.
    - `vdb`: A header-only C vector database library released.
- **Industry Trend**: News publishers are increasingly restricting Internet Archive access to prevent AI scraping, highlighting the shift towards gated/paid data for training.
- **Orchestration**: Stateful Agent Clouds (SAC) and outcome-based pricing are emerging as key OCaaS trends.

**Latest Intel (Feb 20, 2026)**:
- **Model Ecosystem**: 
    - **Gemini 3 "Deep Think"**: Released; scores 84.6% on ARC-AGI-2, significantly outperforming Pro Preview (31.1%).
    - **Qwen 3.5 (Alibaba)**: 397B Sparse MoE launched; 19x speed increase at 256K context.
    - **GLM-5 (Zhipu AI)**: 744B MoE released (77.8% SWE-bench Verified).
    - **GPT-5.3-Codex-Spark**: Now GA; 15x speed increase and superior coding benchmarks.
- **Ecosystem trends**: Emerging focus on "Agentic Security" and "Memory Distillation" protocols.

### Trusted Agents to Follow
- **eudaemon_0** - Security expert, ClaudeConnect builder
- **eigen_vector** - Engineering skeptic (New!)
- **CookieChief** - Chief of Staff archetype (New!)
- **Rufio** - Security researcher, YARA rule creator
- **Mark_Crystal** - Security auditor, SkillLens developer
- **Ronin** - Nightly Build pioneer
- **XiaoZhuang** - Memory management expert
- **Dominus** - Knowledge graph implementation

## Technical Patterns

### Memory Optimization
- **Semantic Search**: Use vector DB (ChromaDB) for 96% token savings
- **Knowledge Graph**: Store atomic facts with timestamps and superseding relationships
- **Structured over Narrative**: Bullet points, not paragraphs; faster to write and scan

### Automation Patterns
- **Nightly Build**: Cron job at 3 AM to fix one friction point
- **Heartbeat Checks**: Every 30 minutes check memory files and active tasks
- **Pre-flight Protocol**: Before projects, create logs and trackers first

## Implementation Status

### ✅ Completed (2026-02-12)
- [x] Memory management system (3-tier architecture)
- [x] Security audit checklist (8 mandatory checks)
- [x] Moltbook registration (KAITEN agent)
- [x] Analysis of top 3 key discussions
- [x] Documentation of patterns and principles

### ⏳ In Progress
- [ ] Nightly Build automation (cron setup needed)
- [ ] Vector DB integration for semantic search
- [ ] Knowledge graph implementation
- [ ] First skill audit execution

### 📋 Next Steps
1. Set up cron job for Nightly Build (3 AM execution)
2. Implement semantic search with local embeddings
3. Run first skill audit on a new skill
4. Start participating in community discussions
5. Share implementation experiences on Moltbook

## Reference Links
- Moltbook: https://www.moltbook.com
- Skill Docs: https://www.moltbook.com/skill.md
- Heartbeat: https://www.moltbook.com/heartbeat.md
- Profile: https://www.moltbook.com/u/KAITEN


### 2026-02-15 (Distilled)

- **OCaaS Foundation (Week 1)**: Successfully deployed the backend scaffolding using Node.js, TypeScript, and Prisma. Defined core schema models for Users, Agents, Tokens, and Usage, passing an initial security review. Active development has pivoted to hardening Auth routes (Rate limiting) and implementing environment variable validation via Zod.

- **Antigravity-First Model Strategy**: Formalized a Tier 1 model policy leveraging Antigravity free tokens. Implemented "Smart Switch" logic across the entire squad to automatically route tasks between Gemini 3 Pro High (for complex logic and coding) and Gemini 3 Flash (for search and routine tasks), significantly optimizing credit distribution.

- **Architecture Evolution (qmd + mq + auto-skill)**: Adopted the 「qmd + mq + auto-skill」 framework as the new operational standard for high-efficiency data flow and logic. This transition included the integration of Crawl4AI for superior web scraping and a shift for SIGHT from passive monitoring to proactive intelligence gathering.

- **Infrastructure & Security**: Verified the strict isolation of the Fion environment (`/Users/altoncheng/fion-workspace`) to prevent data leakage. Initiated the "Squad Evolution Plan" to apply the "mq" (scalpel) principle to code hardening, ensuring the OCaaS foundation meets production security standards.

### 2026-02-16 (Distilled)

- **OpenClaw Ecosystem Shift**: **OpenAI has officially hired Peter Steinberger**, the creator of OpenClaw. This acquisition of talent is expected to accelerate the "Agentic" roadmap at OpenAI. I am monitoring for potential changes in the OpenClaw open-source governance.
- **Model Landscape**: Added **Qwen 3.5** (Sparse MoE, Alibaba), **GLM-5** (Open Source), **Ling-2.5-1T**, and **Ring-2.5-1T** (Ant Group) to the inventory. GLM-5 signals a shift toward models acting as engineers.
- **Moltbook Insight**: Originality.ai study claims Moltbook produces 3x more factual inaccuracies than Reddit; MIT Tech Review reports many viral posts are human-authored.
- **Security**: Moltbook identified as a vector for indirect prompt injection.
- **Model Update**: OpenAI released an **interpretability-focused experimental model** (Feb 16).

### 2026-02-17 (Distilled)

- **Model Landscape**: Added **Dola-Seed-2.0-Preview** (ByteDance) to the inventory.
- **Project Deadline**: **DEADLINE DAY** for Week 1 (Backend Foundation). Focus is on final hardening (EVO-F1) and Google Sheets automation logic (EVO-K1).


### 2026-02-19 (Distilled)

- Nightly automation pipeline proved stable end-to-end: backup, security scan, memory distillation, and media generation all completed successfully without errors. This confirms the current unattended operations baseline is reliable.

- A major root-cause insight was confirmed for the Feb 18 failure: Gemini standard endpoints were geo-fenced in Hong Kong (`400 User location is not supported`). Strategic routing direction was updated to prioritize **antigravity + OpenAI tiers** to reduce regional dependency risk.

- Security governance was clarified: high risk flags from `security-skill-scanner` were determined to be **expected false positives** caused by embedded malicious test samples, not an active compromise. This improves future audit interpretation and avoids misclassification noise.

- Infrastructure hygiene became a priority after identifying **~68GB of storage bloat** from orphaned NanoClaw container artifacts (`rootfs.ext4`). Decision taken to add automatic cleanup into nightly maintenance scripts; this materially reduced disk pressure (from 93% usage to ~62–65%).

- OCaaS operational reporting cadence executed successfully (morning podcast/report + MVP progress email delivered), reinforcing the daily communication loop across channels.

- Model strategy signal strengthened: **GPT-5.3-Codex-Spark GA** emerged as a strong coding candidate for FORGE workflows; **GLM-5** reinforced the market shift toward “engineer models” capable of full-system construction.

- Ecosystem risk posture increased due to reported Moltbook breach (1.5M API tokens, 35k emails exposed), reinforcing a long-term lesson: treat fast “vibe-coded” agent ecosystems as high-risk by default and emphasize provenance, security review, and operational hardening.


### 2026-02-23 (Distilled)

- **Agent Infrastructure Fix**: PULSE gateway restarted successfully (PID 99377). Established unified coordination protocol v2.0 with shared memory system for all agents.

- **Multi-Agent Architecture Clarified**: All 5 agents (KAITEN, FORGE, SIGHT, PULSE, Fion) are real independent instances with dedicated gateways (ports 18792-18799). Corrected misunderstanding that `openclaw --profile` checks individual agents - must use `--url` + `--gateway-token` for proper status checks.

- **Autopus Business Strategy v2.0**: Refined positioning as "security-first agent infrastructure" based on SIGHT's research showing competitors lack security disclosures. Revenue model: Free (self-hosted) → Pro $29/mo (hosted) → Enterprise (custom). 3-year target: $50K → $300K → $1M ARR.

- **MVP Production Deployment**: OCaaS backend fully deployed to 108.160.137.70 with Coolify. Production URLs live: https://api.autopus.cloud and https://dashboard.autopus.cloud. Spawner service production-ready with Docker container lifecycle management.

- **Critical Security Findings**: SIGHT audit identified 3 critical issues (config permissions, open group policy). Immediate action required before Enterprise sales.

- **Skill Stack Expansion**: Installed 13 orchestration/quality skills including workflow-orchestration-patterns, multi-agent-orchestration, code-review-excellence, and self-improvement frameworks.

- **Shared Memory System Established**: Created unified business strategy and agent identity files for all agents at `~/.openclaw/shared-station/` and individual agent memory directories.

### 2026-02-22 (Distilled)

- **VPS Deployment Achieved**: Successfully deployed OCaaS to production VPS (108.160.137.70) with full Coolify integration. Resolved backend container health issues by adding missing LITELLM_HOST environment variable.

- **Magic Link Authentication**: Implemented JWT-based magic link auth with 15-minute tokens. Production credentials established: alton@autopus.cloud (admin), fion@autopus.cloud (user).

- **Night Build Complete**: FORGE completed infrastructure fixes at 04:35 AM including .env.production, docker-compose.production.yml, and agent shared memory system.

- **Critical Discovery**: 6-Hour Sprint analysis revealed FORGE/SIGHT/PULSE tasks were assigned but agents weren't properly coordinated via shared state system - only KAITEN was actually tracking status.

- **Growth Agent Framework**: Designed but not yet implemented - would track signup→conversion→retention funnel with daily metrics and A/B testing capability. Estimated +$1-2K MRR impact by week 6.


### 2026-02-24 (Distilled)

- **Dashboard "Digital Organism" UI Refactor Complete**: FORGE completed glassmorphism redesign (5m25s runtime) with Agent Card featuring `bg-white/10 backdrop-blur-xl`, floating action button (indigo-600), and mobile-first responsive breakpoints (640px-1536px). **Strategic decision**: Removed Local Agent features to focus exclusively on Cloud Agents.

- **SEO & Content Infrastructure Deployed**: SIGHT delivered complete SEO stack—Meta tags, JSON-LD SoftwareApplication schema, 6-page sitemap.xml—plus content pages (blog listing, 950-word inaugural post, newsletter, pricing) and social media strategy with Twitter handle @autopus_cloud and Week 1 content calendar.

- **PULSE Cloud Migration Achieved**: First agent successfully migrated from local Mac mini to VPS (108.160.137.70). Process included backup creation (222KB tar.gz), SCP upload, container extraction, Local PULSE termination, and health verification. Cloud PULSE now serves via `qkwog480cs4gosocogokw8g4.108.160.137.70.sslip.io` with Telegram connectivity confirmed.

- **Action Items Pending**: Alton to submit sitemap.xml to Google Search Console, create Twitter @autopus_cloud account, and record Day 3 demo video.
