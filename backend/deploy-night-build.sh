#!/bin/bash
# Autopus Night Build Deployment Script
# Fixes database connection, API routing, and seeds skills
# Run on VPS: root@108.160.137.70

set -e

echo "🚀 Starting Autopus Night Build Deployment..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd ~/ocaas-project/backend

echo -e "${YELLOW}Step 1: Stopping existing containers...${NC}"
docker compose -f docker-compose.yml down 2>/dev/null || true
docker compose -f docker-compose.production.yml down 2>/dev/null || true
sleep 2

echo -e "${YELLOW}Step 2: Pruning old containers...${NC}"
docker container prune -f

echo -e "${YELLOW}Step 3: Copying production environment...${NC}"
cp .env.production .env
cp docker-compose.production.yml docker-compose.yml

echo -e "${YELLOW}Step 4: Starting database...${NC}"
docker compose up -d postgres
sleep 10

echo -e "${YELLOW}Step 5: Waiting for database to be ready...${NC}"
until docker exec ocaas-postgres pg_isready -U ocaas -d ocaas; do
  echo "Waiting for postgres..."
  sleep 2
done
echo -e "${GREEN}Database is ready!${NC}"

echo -e "${YELLOW}Step 6: Running database migrations...${NC}"
npx prisma migrate deploy

echo -e "${YELLOW}Step 7: Seeding skills to database...${NC}"
docker exec -i ocaas-postgres psql -U ocaas -d ocaas < skills-seed.sql
echo -e "${GREEN}Skills seeded!${NC}"

echo -e "${YELLOW}Step 8: Building and starting backend...${NC}"
docker compose up -d --build backend

echo -e "${YELLOW}Step 9: Waiting for backend health check...${NC}"
sleep 15
if curl -f http://localhost:4000/health; then
  echo -e "${GREEN}Backend is healthy!${NC}"
else
  echo -e "${RED}Backend health check failed - checking logs...${NC}"
  docker compose logs backend --tail 50
  exit 1
fi

echo -e "${YELLOW}Step 10: Verifying API endpoint...${NC}"
if curl -f https://api.autopus.cloud/health; then
  echo -e "${GREEN}API endpoint is live!${NC}"
else
  echo -e "${YELLOW}API endpoint may need a moment - check Traefik...${NC}"
fi

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ Autopus Deployment Complete!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "📊 Services:"
docker compose ps
echo ""
echo "🔗 URLs:"
echo "  Dashboard: https://dashboard.autopus.cloud"
echo "  API:       https://api.autopus.cloud"
echo "  Hub:       https://hub.autopus.cloud"
echo ""
echo "📝 Next Steps:"
echo "  1. Test login flow"
echo "  2. Check marketplace shows skills"
echo "  3. Create first agent"
echo ""
