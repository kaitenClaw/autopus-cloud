#!/bin/bash
# VPS Deployment Script - One Command Setup
# Run on VPS as root

set -e

echo "🚀 Autopus Cloud VPS Deployment"
echo "================================"

# Config
DEPLOY_DIR="/opt/autopus-cloud"
REPO_URL="https://github.com/kaitenClaw/autopus-cloud.git"

# Step 1: Clone/Update
echo "📦 Step 1: Repository Setup"
if [ -d "$DEPLOY_DIR/.git" ]; then
    cd "$DEPLOY_DIR"
    git pull origin main
else
    git clone "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# Step 2: Environment
echo "🔧 Step 2: Environment Setup"
cat > .env << EOF
TELEGRAM_TOKEN=8597634042:AAGmjoWeYve1PeOmxaQ_BlivjM7C8RKG5fw
LITELLM_API_KEY=${LITELLM_API_KEY:-sk-litellm-demo}
LITELLM_HOST=http://host.docker.internal:4000
PORT=3000
EOF

# Step 3: Create data directories
echo "📁 Step 3: Data Directories"
mkdir -p /opt/autopus-data/{memory,skills,logs}

# Step 4: Deploy
echo "🐳 Step 4: Docker Deploy"
docker-compose -f docker-compose.pulse.yml down 2>/dev/null || true
docker-compose -f docker-compose.pulse.yml pull
docker-compose -f docker-compose.pulse.yml up -d --build

# Step 5: Health Check
echo "⏳ Step 5: Health Check"
sleep 10
for i in {1..10}; do
    if curl -s http://localhost:18797/health | grep -q '"status":"ok"'; then
        echo "✅ Deployment Successful!"
        echo ""
        echo "🌐 Access URLs:"
        echo "  Health: http://$(curl -s ifconfig.me):18797/health"
        echo "  API:    http://$(curl -s ifconfig.me):18797/api"
        echo ""
        echo "📊 Status:"
        docker-compose -f docker-compose.pulse.yml ps
        exit 0
    fi
    echo "  Check $i/10..."
    sleep 5
done

echo "❌ Deployment may have issues. Check logs:"
docker-compose -f docker-compose.pulse.yml logs --tail=50
exit 1
