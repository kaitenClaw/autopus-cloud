#!/bin/bash
# Vultr VPS Automation Script
# Managed by PULSE Agent

VULTR_API_KEY="${VULTR_API_KEY:-YOUR_API_KEY}"
VULTR_API="https://api.vultr.com/v2"

call_vultr() {
  local method=$1
  local endpoint=$2
  local data=$3
  
  if [ -n "$data" ]; then
    curl -s -X "$method" \
      -H "Authorization: Bearer $VULTR_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$VULTR_API$endpoint"
  else
    curl -s -X "$method" \
      -H "Authorization: Bearer $VULTR_API_KEY" \
      "$VULTR_API$endpoint"
  fi
}

# List all instances
list_instances() {
  echo "🔍 Listing all Vultr instances..."
  call_vultr GET "/instances" | jq -r '.instances[] | "\(.label): \(.main_ip) (\(.status))"'
}

# Get instance details
get_instance() {
  local id=$1
  echo "📊 Instance details for $id:"
  call_vultr GET "/instances/$id" | jq '.'
}

# Create Autopus Cloud VPS
create_autopus_vps() {
  echo "🚀 Creating Autopus Cloud VPS..."
  
  local response=$(call_vultr POST "/instances" '{
    "region": "lhr",
    "plan": "vc2-2c-4gb",
    "os_id": 1743,
    "label": "autopus-cloud-prod",
    "tag": "autopus",
    "user_data": "#!/bin/bash\napt-get update\napt-get install -y docker.io docker-compose git\nusermod -aG docker root\nsystemctl enable docker\nsystemctl start docker"
  }')
  
  echo "$response" | jq '.'
  local instance_id=$(echo "$response" | jq -r '.instance.id')
  echo "✅ Instance created: $instance_id"
  echo "⏳ Waiting for IP assignment..."
  
  # Poll for IP
  for i in {1..30}; do
    sleep 10
    local ip=$(call_vultr GET "/instances/$instance_id" | jq -r '.instance.main_ip')
    if [ "$ip" != "0.0.0.0" ]; then
      echo "🌐 IP assigned: $ip"
      echo "$ip" > /tmp/autopus-vps-ip.txt
      return 0
    fi
    echo "  Attempt $i/30..."
  done
  
  echo "❌ Timeout waiting for IP"
  return 1
}

# Create snapshot backup
create_backup() {
  local instance_id=$1
  local description="autopus-backup-$(date +%Y%m%d-%H%M%S)"
  
  echo "📸 Creating backup: $description"
  call_vultr POST "/snapshots" "{\"instance_id\": \"$instance_id\", \"description\": \"$description\"}" | jq '.'
}

# Restore from snapshot
restore_backup() {
  local instance_id=$1
  local snapshot_id=$2
  
  echo "♻️ Restoring $instance_id from snapshot $snapshot_id"
  call_vultr POST "/instances/$instance_id/restore" "{\"snapshot_id\": \"$snapshot_id\"}"
}

# Auto-scale (upgrade/downgrade)
scale_instance() {
  local instance_id=$1
  local new_plan=$2  # e.g., "vc2-4c-8gb"
  
  echo "📈 Scaling instance $instance_id to $new_plan"
  call_vultr PATCH "/instances/$instance_id" "{\"plan\": \"$new_plan\"}"
}

# Destroy instance (DANGER)
destroy_instance() {
  local instance_id=$1
  
  echo "⚠️ WARNING: Destroying instance $instance_id"
  read -p "Type 'DESTROY' to confirm: " confirm
  if [ "$confirm" = "DESTROY" ]; then
    call_vultr DELETE "/instances/$instance_id"
    echo "💥 Instance destroyed"
  else
    echo "❌ Cancelled"
  fi
}

# Check instance health
check_health() {
  local ip=$1
  
  echo "🏥 Health check for $ip:"
  
  # Check SSH
  if nc -z -w5 "$ip" 22; then
    echo "  ✅ SSH (22): Open"
  else
    echo "  ❌ SSH (22): Closed"
  fi
  
  # Check HTTP
  if nc -z -w5 "$ip" 80; then
    echo "  ✅ HTTP (80): Open"
  else
    echo "  ❌ HTTP (80): Closed"
  fi
  
  # Check Autopus API
  if curl -s "http://$ip:18797/health" | grep -q '"status":"ok"'; then
    echo "  ✅ Autopus API: Healthy"
  else
    echo "  ❌ Autopus API: Unhealthy"
  fi
  
  # Disk usage
  echo "  📊 Disk: $(ssh root@$ip "df -h / | tail -1 | awk '{print \$5}'" 2>/dev/null || echo "N/A")"
  
  # Memory
  echo "  📊 Memory: $(ssh root@$ip "free -m | grep Mem | awk '{print \$3"/"\$2}'" 2>/dev/null || echo "N/A")"
}

# Main
command=$1
shift

case $command in
  list)
    list_instances
    ;;
  get)
    get_instance "$1"
    ;;
  create)
    create_autopus_vps
    ;;
  backup)
    create_backup "$1"
    ;;
  restore)
    restore_backup "$1" "$2"
    ;;
  scale)
    scale_instance "$1" "$2"
    ;;
  destroy)
    destroy_instance "$1"
    ;;
  health)
    check_health "$1"
    ;;
  *)
    echo "Usage: $0 {list|get <id>|create|backup <id>|restore <id> <snapshot>|scale <id> <plan>|destroy <id>|health <ip>}"
    exit 1
    ;;
esac
