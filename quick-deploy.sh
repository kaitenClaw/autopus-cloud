#!/bin/bash
# Quick Deploy Script - No Coolify needed!
# Deploy PULSE Cloud directly with Docker Compose

set -e

echo "🚀 Quick Deploy PULSE Cloud (No Coolify)"
echo "=========================================="

# Configuration
REPO_URL="https://github.com/kaitenClaw/autopus-cloud.git"
DEPLOY_DIR="/opt/autopus-cloud"
TELEGRAM_TOKEN="${TELEGRAM_TOKEN:-8597634042:AAGmjoWeYve1PeOmxaQ_BlivjM7C8RKG5fw}"

echo "📦 Step 1: Clone/Update Repository"
if [ -d "$DEPLOY_DIR/.git" ]; then
    cd "$DEPLOY_DIR"
    git pull origin main
else
    git clone "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

echo "🔧 Step 2: Create Environment File"
cat > .env << EOF
TELEGRAM_TOKEN=$TELEGRAM_TOKEN
LITELLM_API_KEY=sk-litellm-proxy-key
EOF

echo "🐳 Step 3: Build and Deploy"
docker-compose -f docker-compose.pulse.yml down 2>/dev/null || true
docker-compose -f docker-compose.pulse.yml build --no-cache
docker-compose -f docker-compose.pulse.yml up -d

echo "⏳ Step 4: Health Check"
sleep 10
for i in {1..10}; do
    if curl -s http://localhost:18797/health | grep -q '"status":"ok"'; then
        echo "✅ Deployment successful!"
        echo ""
        echo "📊 Status:"
        docker-compose -f docker-compose.pulse.yml ps
        echo ""
        echo "🌐 Access:"
        echo "  - Health: http://localhost:18797/health"
        echo "  - API:    http://localhost:18797/api"
        echo ""
        echo "📝 Logs:"
        echo "  docker-compose -f docker-compose.pulse.yml logs -f"
        exit 0
    fi
    echo "Waiting for container to start... ($i/10)"
    sleep 5
done

echo "❌ Health check failed. Checking logs..."
docker-compose -f docker-compose.pulse.yml logs --tail=50
exit 1
