#!/bin/bash
# VPS Deployment Script
# Run this on the VPS after SSH access is available

set -e

echo "🚀 AUTOPUS VPS DEPLOYMENT"
echo "========================="
echo "Time: $(date)"
echo ""

# 1. Check prerequisites
echo "1. Checking prerequisites..."
docker --version
docker-compose --version
git --version

# 2. Clone/update repository
echo ""
echo "2. Setting up code..."
if [ -d "/opt/autopus" ]; then
    cd /opt/autopus
    git pull origin main
else
    git clone https://github.com/altoncheng/ocaas-project.git /opt/autopus
    cd /opt/autopus
fi

# 3. Environment setup
echo ""
echo "3. Setting up environment..."
if [ ! -f ".env.oneclick" ]; then
    cat > .env.oneclick << 'EOF'
POSTGRES_USER=ocaas
POSTGRES_PASSWORD=change_me_strong_password
POSTGRES_DB=ocaas
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
ALLOWED_ORIGINS=https://dashboard.autopus.cloud,https://api.autopus.cloud
ADMIN_EMAILS=altoncheng.research@gmail.com
LITELLM_HOST=host.docker.internal
LITELLM_PORT=4000
EOF
    echo "⚠️  Please update .env.oneclick with secure values!"
fi

# 4. Build and deploy
echo ""
echo "4. Building and deploying..."
docker-compose -f docker-compose.oneclick.yml down 2>/dev/null || true
docker-compose -f docker-compose.oneclick.yml --env-file .env.oneclick up -d --build

# 5. Run migrations
echo ""
echo "5. Running database migrations..."
docker-compose -f docker-compose.oneclick.yml exec -T backend npx prisma migrate deploy

# 6. Health check
echo ""
echo "6. Health check..."
sleep 10
curl -s http://localhost:3000/health | jq .

echo ""
echo "✅ Deployment complete!"
echo "API: http://localhost:3000"
echo "Frontend: http://localhost:8080"
