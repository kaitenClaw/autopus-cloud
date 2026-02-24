#!/bin/bash
# Auto Deploy Script - Run on VPS
# This script checks for new Git commits and auto-redeploys

REPO_DIR="/opt/autopus-cloud"
GITHUB_REPO="https://github.com/kaitenClaw/autopus-cloud.git"
COOLIFY_CONTAINER="pulse-lite"
HEALTH_URL="http://qkwog480cs4gosocogokw8g4.108.160.137.70.sslip.io/health"
TELEGRAM_BOT="8597634042:AAGmjoWeYve1PeOmxaQ_BlivjM7C8RKG5fw"
TELEGRAM_CHAT="851026641"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Send Telegram notification
notify() {
    local message="$1"
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT/sendMessage" \
        -d "chat_id=$TELEGRAM_CHAT" \
        -d "text=$message" \
        -d "parse_mode=Markdown" > /dev/null 2>&1 || true
}

# Check if repo exists
check_repo() {
    if [ ! -d "$REPO_DIR/.git" ]; then
        log "Cloning repository..."
        git clone "$GITHUB_REPO" "$REPO_DIR"
    fi
}

# Check for updates
check_updates() {
    cd "$REPO_DIR"
    
    # Fetch latest changes
    git fetch origin main
    
    # Get current and latest commit
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)
    
    if [ "$LOCAL" != "$REMOTE" ]; then
        log "New commits detected!"
        log "Local:  ${LOCAL:0:7}"
        log "Remote: ${REMOTE:0:7}"
        return 0
    else
        return 1
    fi
}

# Deploy updates
deploy() {
    log "Starting deployment..."
    
    cd "$REPO_DIR"
    
    # Pull latest changes
    git pull origin main
    
    # Check what changed
    CHANGED_FILES=$(git diff --name-only HEAD@{1} HEAD 2>/dev/null || echo "services/agent-runtime/")
    
    # Redeploy based on changes
    if echo "$CHANGED_FILES" | grep -q "services/agent-runtime"; then
        log "Agent runtime changed, redeploying..."
        
        # Stop and remove old container
        docker stop $COOLIFY_CONTAINER 2>/dev/null || true
        docker rm $COOLIFY_CONTAINER 2>/dev/null || true
        
        # Build and run new container
        cd "$REPO_DIR/services/agent-runtime"
        docker build -t autopus-runtime:latest .
        
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
            autopus-runtime:latest
        
        # Wait for startup
        log "Waiting for container to start..."
        sleep 10
        
        # Health check
        for i in {1..10}; do
            if curl -s "$HEALTH_URL" | grep -q '"status":"ok"'; then
                log "✅ Deployment successful!"
                notify "✅ *Autopus Cloud Auto-Deployed*
New commit deployed successfully!
Container: $COOLIFY_CONTAINER
Health: OK
Time: $(date)"
                return 0
            fi
            warn "Health check attempt $i/10 failed, retrying..."
            sleep 5
        done
        
        error "Health check failed after deployment"
        notify "⚠️ *Deployment Failed*
Container started but health check failed.
Please check logs."
        return 1
    fi
    
    log "No relevant changes detected"
    return 0
}

# Main loop
main() {
    log "Auto Deploy Monitor started"
    notify "🤖 *Auto Deploy Monitor* started
Watching: $GITHUB_REPO
Check interval: 5 minutes"
    
    check_repo
    
    while true; do
        if check_updates; then
            deploy
        else
            log "No updates found"
        fi
        
        # Wait 5 minutes before next check
        sleep 300
    done
}

# Handle script termination
trap 'log "Auto Deploy Monitor stopped"; exit 0' SIGTERM SIGINT

# Run main loop
main
