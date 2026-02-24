#!/bin/bash
# Agent Task Automation on VPS
# PULSE manages: Monitoring, Health Checks, Backups
# FORGE manages: Deployments, Updates, Scaling
# SIGHT manages: Security Audits, Performance Reports

VULTR_IP="108.160.137.70"
AUTOPUS_DIR="/opt/autopus-cloud"
LOG_FILE="/var/log/agent-automation.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ───────────────────────────────────────────────
# PULSE TASKS (DevOps Automation)
# ───────────────────────────────────────────────

pulse_health_check() {
  log "🔍 PULSE: Running health check..."
  
  # Check if Autopus API is up
  if curl -s "http://$VULTR_IP:18797/health" | grep -q '"status":"ok"'; then
    log "✅ Autopus API: Healthy"
  else
    log "❌ Autopus API: DOWN - Attempting restart..."
    ssh root@$VULTR_IP "cd $AUTOPUS_DIR && docker-compose restart" 2>&1
    
    # Send alert
    curl -s "https://api.telegram.org/bot8597634042:AAGmjoWeYve1PeOmxaQ_BlivjM7C8RKG5fw/sendMessage" \
      -d "chat_id=851026641" \
      -d "text=⚠️ Autopus was down, PULSE restarted it" >/dev/null
  fi
  
  # Check disk space
  DISK_USAGE=$(ssh root@$VULTR_IP "df / | tail -1 | awk '{print \$5}' | sed 's/%//'" 2>/dev/null)
  if [ "$DISK_USAGE" -gt 85 ]; then
    log "⚠️ Disk usage high: ${DISK_USAGE}%"
    curl -s "https://api.telegram.org/bot8597634042:AAGmjoWeYve1PeOmxaQ_BlivjM7C8RKG5fw/sendMessage" \
      -d "chat_id=851026641" \
      -d "text=⚠️ VPS Disk usage: ${DISK_USAGE}%" >/dev/null
  fi
}

pulse_daily_backup() {
  log "📸 PULSE: Creating daily backup..."
  
  # Database backup
  ssh root@$VULTR_IP "cd $AUTOPUS_DIR && docker-compose exec -T postgres pg_dump -U autopus autopus > /tmp/backup-$(date +%Y%m%d).sql" 2>&1
  
  # Upload to cloud storage (optional)
  # rclone copy /tmp/backup-*.sql remote:backups/
  
  log "✅ Backup completed"
}

pulse_metrics_collection() {
  log "📊 PULSE: Collecting metrics..."
  
  # Get system metrics
  CPU=$(ssh root@$VULTR_IP "top -bn1 | grep 'Cpu(s)' | awk '{print \$2}' | cut -d'%' -f1" 2>/dev/null)
  MEM=$(ssh root@$VULTR_IP "free | grep Mem | awk '{printf \"%.0f\", \$3/\$2 * 100}'" 2>/dev/null)
  
  # Store metrics
  echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"cpu\":$CPU,\"memory\":$MEM}" >> /tmp/autopus-metrics.json
  
  # Send to monitoring (optional)
  # curl -X POST https://monitoring.autopus.cloud/metrics -d @/tmp/autopus-metrics.json
}

# ───────────────────────────────────────────────
# FORGE TASKS (Build & Deploy Automation)
# ───────────────────────────────────────────────

forge_auto_deploy() {
  log "🚀 FORGE: Checking for new code..."
  
  cd "$AUTOPUS_DIR" || exit 1
  
  # Check for updates
  git fetch origin main
  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/main)
  
  if [ "$LOCAL" != "$REMOTE" ]; then
    log "🔄 New commits found: ${LOCAL:0:7} → ${REMOTE:0:7}"
    
    # Pull changes
    git pull origin main
    
    # Check what changed
    CHANGED=$(git diff --name-only HEAD@{1} HEAD)
    
    # Deploy if backend changed
    if echo "$CHANGED" | grep -q "backend/"; then
      log "🔧 Backend changes detected, rebuilding..."
      docker-compose -f docker-compose.prod.yml build backend
      docker-compose -f docker-compose.prod.yml up -d backend
    fi
    
    # Deploy if frontend changed
    if echo "$CHANGED" | grep -q "frontend/"; then
      log "🎨 Frontend changes detected, rebuilding..."
      docker-compose -f docker-compose.prod.yml build frontend
      docker-compose -f docker-compose.prod.yml up -d frontend
    fi
    
    # Notify
    curl -s "https://api.telegram.org/bot8597634042:AAGmjoWeYve1PeOmxaQ_BlivjM7C8RKG5fw/sendMessage" \
      -d "chat_id=851026641" \
      -d "text=✅ FORGE auto-deployed: ${REMOTE:0:7}" >/dev/null
    
    log "✅ Auto-deploy completed"
  else
    log "✓ No new commits"
  fi
}

forge_ssl_renewal() {
  log "🔒 FORGE: Checking SSL certificates..."
  
  # Check if cert expires in < 7 days
  EXPIRY=$(ssh root@$VULTR_IP "openssl x509 -in /etc/letsencrypt/live/autopus.cloud/cert.pem -noout -dates | grep notAfter | cut -d= -f2" 2>/dev/null)
  EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || echo 0)
  NOW_EPOCH=$(date +%s)
  DAYS_UNTIL_EXPIRY=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
  
  if [ "$DAYS_UNTIL_EXPIRY" -lt 7 ]; then
    log "🔄 SSL expires in $DAYS_UNTIL_EXPIRY days, renewing..."
    ssh root@$VULTR_IP "certbot renew --nginx" 2>&1
    log "✅ SSL renewed"
  else
    log "✓ SSL valid for $DAYS_UNTIL_EXPIRY days"
  fi
}

# ───────────────────────────────────────────────
# SIGHT TASKS (Security & QA Automation)
# ───────────────────────────────────────────────

sight_security_audit() {
  log "🔐 SIGHT: Running security audit..."
  
  # Check for exposed ports
  EXPOSED=$(nmap -p- --open $VULTR_IP 2>/dev/null | grep "^ *[0-9]*/" | wc -l)
  log "📊 Exposed ports: $EXPOSED"
  
  # Check for vulnerabilities (basic)
  ssh root@$VULTR_IP "apt list --upgradable 2>/dev/null | wc -l" > /tmp/pending-updates.txt
  PENDING=$(cat /tmp/pending-updates.txt)
  
  if [ "$PENDING" -gt 10 ]; then
    log "⚠️ $PENDING packages need updates"
    curl -s "https://api.telegram.org/bot8597634042:AAGmjoWeYve1PeOmxaQ_BlivjM7C8RKG5fw/sendMessage" \
      -d "chat_id=851026641" \
      -d "text=⚠️ SIGHT: $PENDING packages need security updates" >/dev/null
  fi
  
  # Check failed login attempts
  FAILED=$(ssh root@$VULTR_IP "grep 'Failed password' /var/log/auth.log 2>/dev/null | wc -l" 2>/dev/null || echo 0)
  if [ "$FAILED" -gt 50 ]; then
    log "🚨 High failed login attempts: $FAILED"
    curl -s "https://api.telegram.org/bot8597634042:AAGmjoWeYve1PeOmxaQ_BlivjM7C8RKG5fw/sendMessage" \
      -d "chat_id=851026641" \
      -d "text=🚨 SIGHT: $FAILED failed login attempts detected" >/dev/null
  fi
}

sight_performance_report() {
  log "📈 SIGHT: Generating performance report..."
  
  # Get last 24h metrics
  REPORT="📊 Autopus Performance Report (24h)

System:
• Uptime: $(ssh root@$VULTR_IP "uptime -p" 2>/dev/null)
• Load: $(ssh root@$VULTR_IP "uptime | awk -F'load average:' '{print \$2}'" 2>/dev/null)

Containers:
$(ssh root@$VULTR_IP "docker ps --format 'table {{.Names}}\t{{.Status}}'" 2>/dev/null)

API Health:
• Response Time: $(curl -s -w '%{time_total}' -o /dev/null http://$VULTR_IP:18797/health)s
• Status: $(curl -s http://$VULTR_IP:18797/health | jq -r '.status')

Generated: $(date)"
  
  curl -s "https://api.telegram.org/bot8597634042:AAGmjoWeYve1PeOmxaQ_BlivjM7C8RKG5fw/sendMessage" \
    -d "chat_id=851026641" \
    -d "text=$REPORT" \
    -d "parse_mode=Markdown" >/dev/null
  
  log "✅ Performance report sent"
}

# ───────────────────────────────────────────────
# MAIN
# ───────────────────────────────────────────────

TASK=$1

case $TASK in
  pulse-health)
    pulse_health_check
    ;;
  pulse-backup)
    pulse_daily_backup
    ;;
  pulse-metrics)
    pulse_metrics_collection
    ;;
  forge-deploy)
    forge_auto_deploy
    ;;
  forge-ssl)
    forge_ssl_renewal
    ;;
  sight-security)
    sight_security_audit
    ;;
  sight-report)
    sight_performance_report
    ;;
  all)
    pulse_health_check
    pulse_metrics_collection
    forge_auto_deploy
    sight_security_audit
    ;;
  *)
    echo "Usage: $0 {pulse-health|pulse-backup|pulse-metrics|forge-deploy|forge-ssl|sight-security|sight-report|all}"
    exit 1
    ;;
esac
