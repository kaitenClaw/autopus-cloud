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

### Deploy (split backend + dashboard containers)
```bash
cd /Users/altoncheng/ocaas-project/backend
docker compose build backend
docker compose up -d backend

cd /Users/altoncheng/ocaas-project/frontend
docker compose -f docker-compose.dashboard.yml build
docker compose -f docker-compose.dashboard.yml up -d
```

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
