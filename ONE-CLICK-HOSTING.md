# One-Click Hosting (MVP)

This packages OCaaS as a one-command self-hosted OpenClaw agents app.

## What this MVP includes
- Auth + admin bootstrap.
- Create and run **one agent** (starter tier behavior).
- Agent config editing (model + fallbacks).
- Runtime matrix + coordination visibility.
- Mirrored OpenClaw/Telegram thread visibility in dashboard.
- No payment integration (intentionally excluded).

## Quick Start
```bash
cd /Users/altoncheng/ocaas-project
./scripts/oneclick-host.sh
```

Open:
- Dashboard: `http://localhost:8080`
- API health: `http://localhost:3000/health`

## First-time setup
`scripts/oneclick-host.sh` creates `.env.oneclick` from `.env.oneclick.example`.

Update these values before production usage:
- `POSTGRES_PASSWORD`
- `ADMIN_EMAILS`
- `ALLOWED_ORIGINS`
- OpenClaw profile paths (`OPENCLAW_*_PATH`)

## Production note
For public domains, place this stack behind your reverse proxy/SSL edge and set:
- `ALLOWED_ORIGINS=https://your-dashboard-domain`

## Stop / restart
```bash
docker compose --env-file .env.oneclick -f docker-compose.oneclick.yml down
docker compose --env-file .env.oneclick -f docker-compose.oneclick.yml up -d --build
```
