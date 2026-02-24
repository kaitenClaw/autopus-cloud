#!/bin/bash
# VPS Auto-Deploy Setup Script
# Run this on VPS to enable automatic deployment

set -e

echo "🚀 Setting up Autopus Auto-Deploy on VPS..."

# Configuration
REPO_DIR="/opt/autopus-cloud"
SCRIPT_DIR="/opt/autopus-scripts"
LOG_DIR="/var/log/autopus"
GITHUB_REPO="https://github.com/kaitenClaw/autopus-cloud.git"

# Create directories
mkdir -p $REPO_DIR
mkdir -p $SCRIPT_DIR
mkdir -p $LOG_DIR

# Clone or update repo
if [ ! -d "$REPO_DIR/.git" ]; then
    echo "📦 Cloning repository..."
    git clone $GITHUB_REPO $REPO_DIR
else
    echo "📦 Repository exists, updating..."
    cd $REPO_DIR && git pull origin main
fi

# Create auto-deploy script
cat > $SCRIPT_DIR/auto-deploy.sh << 'EOF'
#!/bin/bash
REPO_DIR="/opt/autopus-cloud"
COOLIFY_CONTAINER="pulse-lite"
HEALTH_URL="http://qkwog480cs4gosocogokw8g4.108.160.137.70.sslip.io/health"
TELEGRAM_BOT="8597634042:AAGmjoWeYve1PeOmxaQ_BlivjM7C8RKG5fw"
TELEGRAM_CHAT="851026641"
LOG_FILE="/var/log/autopus/auto-deploy.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

notify() {
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT/sendMessage" \
        -d "chat_id=$TELEGRAM_CHAT" \
        -d "text=$1" > /dev/null 2>&1 || true
}

cd $REPO_DIR

# Fetch latest changes
git fetch origin main

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
    log "🔄 New commits detected! Deploying..."
    log "Local: ${LOCAL:0:7} -> Remote: ${REMOTE:0:7}"
    
    # Pull changes
    git pull origin main
    
    # Check what changed
    CHANGED_FILES=$(git diff --name-only HEAD@{1} HEAD 2>/dev/null || echo "services/agent-runtime/")
    
    if echo "$CHANGED_FILES" | grep -q "services/agent-runtime"; then
        log "🐳 Rebuilding agent-runtime..."
        
        # Build new image
        cd "$REPO_DIR/services/agent-runtime"
        docker build -t autopus-runtime:latest . 2>&1 | tee -a $LOG_FILE
        
        # Stop and remove old container
        docker stop $COOLIFY_CONTAINER 2>/dev/null || true
        docker rm $COOLIFY_CONTAINER 2>/dev/null || true
        
        # Start new container
        docker run -d \
            --name $COOLIFY_CONTAINER \
            --restart unless-stopped \
            -p 18797:3000 \
            -e AGENT_ID=pulse-cloud \
            -e AGENT_ROLE=devops \
            -e LITELLM_HOST=http://host.docker.internal:4000 \
            -e TELEGRAM_TOKEN="$TELEGRAM_BOT" \
            -e PORT=3000 \
            -v /opt/autopus-data:/app/workspace \
            autopus-runtime:latest 2>&1 | tee -a $LOG_FILE
        
        # Health check
        sleep 15
        for i in {1..12}; do
            if curl -s "$HEALTH_URL" | grep -q '"status":"ok"'; then
                log "✅ Deployment successful!"
                notify "✅ Autopus Cloud Auto-Deployed

New commit: ${REMOTE:0:7}
Container: $COOLIFY_CONTAINER
Health: OK
Time: $(date)"
                exit 0
            fi
            sleep 5
        done
        
        log "❌ Health check failed!"
        notify "⚠️ Autopus Deployment Failed

Health check failed after deployment.
Check logs: $LOG_FILE"
    else
        log "ℹ️ No runtime changes, skipping deploy"
    fi
else
    log "✓ No updates found"
fi
EOF

chmod +x $SCRIPT_DIR/auto-deploy.sh

# Add to crontab (run every 5 minutes)
echo "*/5 * * * * $SCRIPT_DIR/auto-deploy.sh >> /var/log/autopus/cron.log 2>&1" | crontab -

echo "✅ Auto-deploy setup complete!"
echo "📍 Repository: $REPO_DIR"
echo "📍 Scripts: $SCRIPT_DIR"
echo "📍 Logs: $LOG_DIR"
echo "⏰ Cron: Every 5 minutes"
echo ""
echo "To monitor: tail -f /var/log/autopus/auto-deploy.log"
