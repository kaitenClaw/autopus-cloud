# VPS Resident Agent Plan (KAITEN Cloud)

## Mission
Move KAITEN agents from local Mac mini to Vultr VPS to ensure 24/7 availability, lower latency, and isolated execution.

## Phase 1: VPS Control Node (Forge)
- [x] Gain SSH access to VPS (108.160.137.70)
- [x] Verify Coolify/Docker environment
- [ ] Set up "Kaiten Station" directory structure on VPS: `/data/kaiten/`
- [ ] Create `.env` store for all agents on VPS

## Phase 2: Dockerized Agents
- Build a lightweight Docker image for OpenClaw agents.
- Deploy **Sight** and **Pulse** as "Resident Containers" on the VPS.
- **Sight (QA)**: Monitor VPS logs, monitor OCaaS Backend containers.
- **Pulse (Coordinator)**: Manage task files directly on the VPS.

## Phase 3: The Spawner (OCaaS Core)
- Implement the Spawner service in the Node.js backend.
- Allow the backend to dynamically create new Docker containers for *user agents*.

## Phase 4: Prime Migration
- Final migration of Prime to the VPS once all subsystems are stable.

---
**Status**: Initializing Phase 1 & 2.
**Target**: Sight running on VPS by end of day.
