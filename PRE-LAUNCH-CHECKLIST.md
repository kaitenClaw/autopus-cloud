# OCaaS / Autopus Pre-Launch Checklist (Execution Version)

**Date:** 2026-02-20  
**Program Status:** NOT READY FOR PUBLIC LAUNCH  
**Decision Rule:** No launch until all P0 blockers are cleared.

---

## 1) Launch Gates (All must pass)

### Product Gate
- [ ] Dashboard v2 deployed to production (`autopus.cloud`, `dashboard.autopus.cloud`)
- [ ] Core journey works end-to-end: Signup/Login -> Create agent -> First message -> Agent status visible
- [ ] No P0/P1 defects in release QA report

### Reliability Gate
- [ ] API health stable for 24h (`https://api.autopus.cloud/health`)
- [ ] Gateway stability verified (no crash/restart loops)
- [ ] 5/5 agent gateways confirmed healthy

### Revenue Gate
- [ ] Stripe checkout + webhook path working in production
- [ ] At least 1 successful paid upgrade test

### Security Gate
- [ ] Secrets/tokens not present in repo/docs
- [ ] Auth rate limiting enabled on critical endpoints
- [ ] Forced password reset path verified for bootstrap users

### Operations Gate
- [ ] Rollback runbook tested for one tenant
- [ ] Incident owner on-call assignment documented
- [ ] Support response process defined (<2h first response)

---

## 2) Current P0 Blockers (from latest logs)

### P0-1: Gateway start conflict (service already running)
**Evidence:** `logs/gateway.err.log` repeatedly shows `gateway already running (pid 80705)` and `Port 18789 is already in use` around 2026-02-20 00:35-00:36 +08:00.  
**Impact:** Operational confusion; restart/start scripts are unreliable during release windows.

**Fix Checklist**
- [ ] Standardize one control path: use only `openclaw gateway stop/start` for local service
- [ ] Remove competing auto-start invocations/scripts during deploy
- [ ] Add preflight check in deploy script: fail fast if port 18789 already bound by unexpected PID
- [ ] Verify clean restart once and record command sequence in runbook

### P0-2: Context overflow in production conversations
**Evidence:** `logs/gateway.err.log` contains repeated `context_length_exceeded` for `openai-codex/gpt-5.2-codex` and truncation warnings (`MEMORY.md is 14284 chars (limit 7192)`).  
**Impact:** Message failures in long-running chats (user-facing reliability issue).

**Fix Checklist**
- [ ] Reduce injected `MEMORY.md` footprint below configured limits
- [ ] Enforce session compaction earlier (before near-window threshold)
- [ ] Add guardrails for oversized tool results (hard cap + summarization fallback)
- [ ] Run regression test on long Telegram group thread and confirm no overflow errors

---

## 3) Week-2 Priority Plan (What to do now)

### Track A: Release Readiness (Prime + Sight + Pulse)
- [ ] Deploy dashboard v2
- [ ] Execute smoke suite (auth, dashboard load, agent list, chat route, hub route)
- [ ] Publish QA verdict (PASS/FAIL with P-severity bugs)
- [ ] Monitor 2h post-deploy (errors, restart events, latency)

### Track B: Monetization Unblock (Forge)
- [ ] Implement Stripe billing path (checkout + webhook + tier update)
- [ ] Validate with test and live-mode dry run
- [ ] Demo one successful upgrade flow to Prime

### Track C: Validation (Prime)
- [ ] Run daily outreach (5 messages/day)
- [ ] Run 2 demos/week
- [ ] Log all outcomes in `coordination/market-validation-events.jsonl`

---

## 4) Daily Operator Cadence (09:00 HKT)

- [ ] Prime updates source-of-truth: `coordination/status-board.json`
- [ ] Pulse posts health snapshot (gateways, API, incidents)
- [ ] Sight runs QA checklist for active release candidate
- [ ] Forge commits next highest-priority deliverable
- [ ] Sync docs if sprint state changed:
  - `coordination/SHARED-CONTEXT.md`
  - `.openclaw/workspace/ACTIVE-TASK.md`

---

## 5) Go / No-Go Criteria

## GO only if:
- [ ] All launch gates in section 1 are complete
- [ ] Both P0 blockers in section 2 are resolved and verified
- [ ] No unresolved P1 bug in QA report

## NO-GO if any of these are true:
- [ ] Gateway conflict/restart instability persists
- [ ] Any context overflow still reproducible in critical chat paths
- [ ] Billing path not proven end-to-end

---

## 6) Owner Map

- **Prime:** release decision, prioritization, validation outcomes
- **Forge:** implementation and fixes
- **Sight:** QA sign-off and bug severity
- **Pulse:** runtime health and incident coordination

