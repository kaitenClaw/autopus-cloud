#!/bin/bash
# Deploy Autopus Lite Runtime to VPS

set -e

VPS_IP="108.160.137.70"
AGENT_ID="${1:-pulse-cloud}"
AGENT_ROLE="${2:-devops}"
TELEGRAM_TOKEN="$3"

echo "🚀 Deploying Autopus Lite Runtime..."
echo "Agent: $AGENT_ID"
echo "Role: $AGENT_ROLE"

# Build locally
echo "📦 Building Docker image..."
docker build -t autopus-lite:latest .

# Save and transfer
echo "📤 Transferring to VPS..."
docker save autopus-lite:latest | gzip > autopus-lite.tar.gz
scp -o StrictHostKeyChecking=no autopus-lite.tar.gz root@$VPS_IP:/tmp/

# Deploy on VPS
echo "🔧 Deploying on VPS..."
ssh -o StrictHostKeyChecking=no root@$VPS_IP '
  # Load image
  gunzip -c /tmp/autopus-lite.tar.gz | docker load
  
  # Stop existing container
  docker stop pulse-cloud 2>/dev/null || true
  docker rm pulse-cloud 2>/dev/null || true
  
  # Run new container
  docker run -d \
    --name '"$AGENT_ID"' \
    --restart unless-stopped \
    -p 18797:3000 \
    -e AGENT_ID='"$AGENT_ID"' \
    -e AGENT_ROLE='"$AGENT_ROLE"' \
    -e LITELLM_HOST=http://host.docker.internal:4000 \
    -e TELEGRAM_TOKEN='"$TELEGRAM_TOKEN"' \
    autopus-lite:latest
  
  # Cleanup
  rm /tmp/autopus-lite.tar.gz
'

# Cleanup local
rm -f autopus-lite.tar.gz

echo "✅ Deployment complete!"
echo "Health check: http://$VPS_IP:18797/health"
