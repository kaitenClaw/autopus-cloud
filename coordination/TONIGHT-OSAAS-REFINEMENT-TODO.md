# OCaaS Tonight Refinement TODO
Date: 2026-02-17
Objective: Move from MVP to production-branded OCaaS with a usable playground for both technical and non-technical users.
Inputs: Code review + 3 focused subagent research turns (platform priorities, UX playground, go-live reliability).

## P0 - Must Ship Tonight
- [ ] Live KAITEN visibility in dashboard
Owner: Forge
Success criteria: Prime/Forge/Sight/Pulse cards show real status, model, profile, local/cloud location from runtime API.

- [ ] Admin bootstrap hardening
Owner: Forge
Success criteria: first real user can become ADMIN safely; configured admin emails supported via `ADMIN_EMAILS`; no test users blocking bootstrap.

- [ ] Production brand shell (non-generic)
Owner: Forge
Success criteria: replace placeholder copy/labels with OCaaS brand voice, value proposition, and tier messaging across login/dashboard panels.

- [ ] Playground Mode Split (Non-technical vs Technical)
Owner: Forge
Success criteria: add a visible toggle with two presets:
  - Guided Mode: template-driven prompts, one-click actions, plain language.
  - Pro Mode: raw config controls (model, temperature, tokens, logs, runtime metadata).

- [ ] Runtime trust indicators
Owner: Forge + Sight
Success criteria: every agent panel shows environment badge (Local/Cloud), heartbeat age, and last error snapshot.

## P1 - High Impact Next
- [ ] Session persistence backend
Owner: Forge
Success criteria: replace frontend placeholder sessions with real backend session CRUD + message threading.

- [ ] Unified model router transparency
Owner: Forge
Success criteria: for each response, show selected model, fallback model (if any), and reason (cost/speed/quality path).

- [ ] Memory lifecycle controls
Owner: Forge
Success criteria: end-users can view memory scope (session/workspace/global), pin important memories, and clear/expire nonessential memory.

- [ ] Team growth / workspace collaboration
Owner: Forge
Success criteria: invite teammates, assign agent ownership, role-based permissions (Admin/Builder/Viewer).

- [ ] Deployment safety gates
Owner: Pulse + Sight
Success criteria: health checks + rollback checklist before deploy; monitors for gateway, API, websocket, and queue lag.

## P2 - Reliability and GTM Stabilizers
- [ ] Observability baseline
Owner: Sight
Success criteria: centralized logs, dashboard alerts, and error-rate SLOs for auth/chat/spawner endpoints.

- [ ] Billing usage confidence
Owner: Forge
Success criteria: token usage pipeline validated end-to-end; exportable usage reports per agent and per workspace.

- [ ] Onboarding for non-technical users
Owner: Prime + Forge
Success criteria: guided first-run flow (create agent -> send first prompt -> interpret output -> save template).

- [ ] Incident response runbook
Owner: Pulse
Success criteria: one-page operational runbook with page/triage/escalation/recovery steps.

## Immediate Execution Sequence (Tonight)
1. Verify live matrix in staging after backend/frontend deploy.
2. Confirm admin bootstrap on real email login and role assignment.
3. Implement guided/pro playground toggle and copy polish.
4. Ship runtime trust indicators and error hints.
5. Smoke test full path: signup -> admin bootstrap -> view KAITEN live status -> start chat.

## Exit Criteria for Tonight
- Dashboard shows real KAITEN status + local/cloud location.
- Admin role is auto-granted to first real account or configured admin email.
- Playground supports both guided and pro use patterns.
- Build/test pass and smoke flow succeeds.
