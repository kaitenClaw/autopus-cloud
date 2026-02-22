#!/bin/bash
# Autopus Health Monitor
# Run this to check system status across all services
# Usage: ./health-check.sh [--json]

set -e

OUTPUT_FORMAT="${1:-text}"
API_URL="https://api.autopus.cloud"
DASHBOARD_URL="https://dashboard.autopus.cloud"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

declare -A RESULTS

check_service() {
  local name=$1
  local url=$2
  local timeout=${3:-10}
  
  if curl -sf --max-time "$timeout" "$url" > /dev/null 2>&1; then
    RESULTS[$name]="✅ UP"
    return 0
  else
    RESULTS[$name]="❌ DOWN"
    return 1
  fi
}

print_header() {
  echo ""
  echo "=========================================="
  echo "🚀 Autopus Health Check"
  echo "Time: $(date)"
  echo "=========================================="
}

print_text_report() {
  print_header
  
  echo ""
  echo "📊 Service Status:"
  echo "------------------"
  
  for service in "${!RESULTS[@]}"; do
    echo "  ${service}: ${RESULTS[$service]}"
  done
  
  echo ""
  echo "🗄️  Database:"
  echo "-------------"
  
  # Check if we can SSH and check DB
  if ssh -q root@108.160.137.70 "docker exec ocaas-postgres pg_isready -U ocaas" 2>/dev/null; then
    echo "  PostgreSQL: ✅ Healthy"
    
    # Get skill count
    skill_count=$(ssh -q root@108.160.137.70 "docker exec ocaas-postgres psql -U ocaas -d ocaas -t -c 'SELECT COUNT(*) FROM Skill;'" 2>/dev/null || echo "0")
    echo "  Skills in DB: $skill_count"
  else
    echo "  PostgreSQL: ❌ Unreachable"
  fi
  
  echo ""
  echo "🐳 Containers:"
  echo "--------------"
  ssh -q root@108.160.137.70 "docker ps --format 'table {{.Names}}\t{{.Status}}'" 2>/dev/null || echo "  ❌ Cannot connect to Docker"
  
  echo ""
  echo "📈 API Endpoints:"
  echo "-----------------"
  
  # Test specific endpoints
  if curl -sf "$API_URL/health" > /dev/null 2>&1; then
    echo "  /health: ✅"
  else
    echo "  /health: ❌"
  fi
  
  if curl -sf "$API_URL/api/agents" > /dev/null 2>&1; then
    echo "  /api/agents: ✅"
  else
    echo "  /api/agents: ❌ (may need auth)"
  fi
  
  echo ""
  echo "=========================================="
  
  # Overall status
  failed=0
  for status in "${RESULTS[@]}"; do
    if [[ "$status" == *"DOWN"* ]]; then
      failed=$((failed + 1))
    fi
  done
  
  if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ All systems operational${NC}"
  else
    echo -e "${RED}⚠️  $failed service(s) down${NC}"
  fi
  echo "=========================================="
}

print_json_report() {
  cat <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "services": {
    "api": "${RESULTS[API]}",
    "dashboard": "${RESULTS[Dashboard]}",
    "hub": "${RESULTS[Hub]}",
    "landing": "${RESULTS[Landing]}"
  }
}
EOF
}

# Main execution
main() {
  # Check services
  check_service "API" "$API_URL/health" 10
  check_service "Dashboard" "$DASHBOARD_URL" 10
  check_service "Hub" "https://hub.autopus.cloud" 10
  check_service "Landing" "https://autopus.cloud" 10
  
  # Output report
  if [ "$OUTPUT_FORMAT" == "--json" ]; then
    print_json_report
  else
    print_text_report
  fi
}

main
