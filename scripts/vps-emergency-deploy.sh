#!/bin/bash
# VPS Emergency Deployment Script
# Run this on the VPS to fix Autopus deployment

set -e

echo "🚀 AUTOPUS VPS EMERGENCY DEPLOYMENT"
echo "===================================="
echo "Time: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Navigate to project
echo -e "${YELLOW}1. Locating project...${NC}"
if [ -d "/opt/autopus" ]; then
    cd /opt/autopus
    echo -e "${GREEN}✓ Found at /opt/autopus${NC}"
elif [ -d "/root/ocaas-project" ]; then
    cd /root/ocaas-project
    echo -e "${GREEN}✓ Found at /root/ocaas-project${NC}"
elif [ -d "/home/autopus" ]; then
    cd /home/autopus
    echo -e "${GREEN}✓ Found at /home/autopus${NC}"
else
    echo -e "${RED}✗ Project not found!${NC}"
    echo "Searching..."
    find / -name "docker-compose*.yml" -type f 2>/dev/null | head -5
    exit 1
fi

# 2. Backup current state
echo ""
echo -e "${YELLOW}2. Creating backup...${NC}"
docker-compose ps > /tmp/autopus-backup-$(date +%Y%m%d-%H%M).txt 2>/dev/null || true
echo -e "${GREEN}✓ Backup saved${NC}"

# 3. Check current status
echo ""
echo -e "${YELLOW}3. Current container status:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "backend|autopus|ocaas" || echo "No matching containers"

# 4. Pull latest code (if git repo)
if [ -d ".git" ]; then
    echo ""
    echo -e "${YELLOW}4. Pulling latest code...${NC}"
    git pull origin main 2>/dev/null || echo "Could not pull, using local code"
fi

# 5. Check/fix environment file
echo ""
echo -e "${YELLOW}5. Checking environment file...${NC}"
if [ ! -f ".env.oneclick" ]; then
    echo -e "${RED}✗ .env.oneclick not found!${NC}"
    echo "Creating from template..."
    cat > .env.oneclick << 'EOF'
POSTGRES_USER=ocaas
POSTGRES_PASSWORD=change_me_secure_password
POSTGRES_DB=ocaas
JWT_ACCESS_SECRET=change_me_random_64_chars
JWT_REFRESH_SECRET=change_me_different_64_chars
ALLOWED_ORIGINS=https://dashboard.autopus.cloud,https://api.autopus.cloud
ADMIN_EMAILS=altoncheng.research@gmail.com
LITELLM_HOST=localhost
LITELLM_PORT=4000
NODE_ENV=production
EOF
    echo -e "${YELLOW}⚠ Please edit .env.oneclick with secure values!${NC}"
else
    echo -e "${GREEN}✓ .env.oneclick exists${NC}"
    # Check if LITELLM_HOST is set
    if ! grep -q "LITELLM_HOST" .env.oneclick; then
        echo "Adding LITELLM_HOST..."
        echo "LITELLM_HOST=localhost" >> .env.oneclick
        echo "LITELLM_PORT=4000" >> .env.oneclick
    fi
fi

# 6. Stop and remove old containers
echo ""
echo -e "${YELLOW}6. Stopping old containers...${NC}"
docker-compose -f docker-compose.oneclick.yml down 2>/dev/null || docker-compose down 2>/dev/null || echo "No containers to stop"

# 7. Build and start new containers
echo ""
echo -e "${YELLOW}7. Building and starting containers...${NC}"
if [ -f "docker-compose.oneclick.yml" ]; then
    docker-compose -f docker-compose.oneclick.yml --env-file .env.oneclick up -d --build
else
    docker-compose up -d --build
fi

# 8. Wait for startup
echo ""
echo -e "${YELLOW}8. Waiting for startup (30s)...${NC}"
sleep 30

# 9. Check health
echo ""
echo -e "${YELLOW}9. Health check:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "backend|autopus|ocaas" || echo "No containers running"

# 10. Test API
echo ""
echo -e "${YELLOW}10. Testing API...${NC}"
sleep 5
curl -s http://localhost:3000/health 2>/dev/null | jq . 2>/dev/null || curl -s http://localhost:3000/health || echo "API not responding yet"

echo ""
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify: curl http://localhost:3000/health"
echo "2. Check logs: docker-compose logs -f backend"
echo "3. Update DNS if needed"
echo ""
echo -e "${YELLOW}If issues persist, check:${NC}"
echo "- Environment variables in .env.oneclick"
echo "- Database connection"
echo "- LiteLLM service status"
