# OCaaS Human Controller README

Operator commands for model updates, runtime checks, and redeploy.

## Model + Agent Control

### Apply model registry to all agents
```bash
bash /Users/altoncheng/.openclaw/scripts/apply-model-registry.sh
```

### Restart all OpenClaw gateways
```bash
bash /Users/altoncheng/.openclaw/scripts/restart-all-gateways.sh
```

### Verify primary/fallbacks quickly
```bash
for f in \
  /Users/altoncheng/.openclaw/openclaw.json \
  /Users/altoncheng/.openclaw-forge/openclaw.json \
  /Users/altoncheng/.openclaw-sight/openclaw.json \
  /Users/altoncheng/.openclaw-pulse/openclaw.json \
  /Users/altoncheng/.openclaw-fion/openclaw.json; do
  echo "== $f"
  jq -r '.agents.defaults.model.primary, (.agents.defaults.model.fallbacks|join(","))' "$f"
done
```

## App Build / Deploy

### Build
```bash
cd /Users/altoncheng/ocaas-project/backend && npm run build
cd /Users/altoncheng/ocaas-project/frontend && npm run build
```

### Pre-deploy checks (required)
```bash
# 1) Env sanity
cd /Users/altoncheng/ocaas-project/backend
node -e 'const req=["DATABASE_URL","JWT_ACCESS_SECRET","JWT_REFRESH_SECRET","ALLOWED_ORIGINS"]; const miss=req.filter(k=>!process.env[k]); if(miss.length){console.error("Missing env:", miss.join(",")); process.exit(1)} console.log("Env OK")'

# 2) Migration status (clean or deployable)
npx prisma migrate status
```

### Deploy (split backend + dashboard containers)
```bash
cd /Users/altoncheng/ocaas-project/backend
docker compose build backend
docker compose up -d backend

cd /Users/altoncheng/ocaas-project/frontend
docker compose -f docker-compose.dashboard.yml build
docker compose -f docker-compose.dashboard.yml up -d
```

### Post-deploy verification
```bash
# API readiness
curl -sS https://api.autopus.cloud/health | jq

# Auth endpoint should return 401 for invalid credentials (not 5xx)
curl -sS -X POST https://api.autopus.cloud/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@example.com","password":"wrongpass"}' | jq

# Optional check only if dashboard /api fallback is intentionally used
curl -sS -X POST https://dashboard.autopus.cloud/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@example.com","password":"wrongpass"}' | jq
```

### Rollback trigger
- Trigger rollback if auth endpoints show sustained `5xx` for more than 5 minutes.
- Trigger rollback if login latency exceeds 2 seconds p95 in release window.
- Roll back by redeploying the previous known-good backend and dashboard images.

### One-click local host mode
```bash
cd /Users/altoncheng/ocaas-project
./scripts/oneclick-host.sh
```

## Health Checks

```bash
curl -s https://api.autopus.cloud/health | jq
curl -s https://api.autopus.cloud/api/system/kaiten/agents -H "Authorization: Bearer <TOKEN>" | jq
```

## Notes
- Starter MVP now targets one active agent per account.
- Dashboard supports model fallback editing and mirrored OpenClaw thread visibility.
- Payment is intentionally not included in this MVP.
- Production dashboard should use direct API host (`https://api.autopus.cloud/api`), not `/api` proxy as primary path.
