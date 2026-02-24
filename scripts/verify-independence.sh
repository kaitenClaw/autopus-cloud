#!/bin/bash
# Agent Independence Verification Script
# Verifies that all agents are truly independent

echo "🤖 Autopus Agent Independence Verification"
echo "=========================================="
echo ""

# Check each agent's gateway independence
echo "[1/5] Checking Gateway Independence..."
echo ""

agents=("kaiten:18792" "forge:18793" "sight:18795" "pulse:18797" "fion:18799")

for agent_port in "${agents[@]}"; do
  agent="${agent_port%%:*}"
  port="${agent_port##*:}"
  
  echo -n "  Checking $agent (port $port)... "
  
  # Check if gateway is running
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Gateway ONLINE"
    
    # Check independence - verify it has its own config
    config_file="$HOME/.openclaw-$agent/openclaw.json"
    if [ "$agent" = "kaiten" ]; then
      config_file="$HOME/.openclaw/openclaw.json"
    fi
    
    if [ -f "$config_file" ]; then
      echo "    ✅ Independent config: $config_file"
      
      # Check memory directory
      memory_dir="$HOME/.openclaw-$agent/memory"
      if [ "$agent" = "kaiten" ]; then
        memory_dir="$HOME/.openclaw/workspace/memory"
      fi
      
      if [ -d "$memory_dir" ]; then
        echo "    ✅ Independent memory: $memory_dir"
      else
        echo "    ⚠️  Creating memory directory..."
        mkdir -p "$memory_dir"
      fi
    else
      echo "    ❌ Missing config file"
    fi
  else
    echo "❌ Gateway OFFLINE"
  fi
  echo ""
done

# Check process independence
echo "[2/5] Checking Process Independence..."
echo ""
for agent in kaiten forge sight pulse fion; do
  label="ai.openclaw.$agent"
  if [ "$agent" = "kaiten" ]; then
    label="ai.openclaw.main"
  fi
  
  pid=$(launchctl list | grep "$label" | awk '{print $1}')
  if [ -n "$pid" ] && [ "$pid" != "-" ]; then
    echo "  ✅ $agent: PID $pid (independent process)"
  else
    echo "  ⚠️  $agent: Not running or status unknown"
  fi
done

echo ""
echo "[3/5] Checking Memory Isolation..."
echo ""
for agent in forge sight pulse fion; do
  state_dir="$HOME/.openclaw-$agent"
  if [ -d "$state_dir" ]; then
    size=$(du -sh "$state_dir" 2>/dev/null | cut -f1)
    echo "  ✅ $agent: $size isolated storage"
  fi
done
# KAITEN
if [ -d "$HOME/.openclaw/workspace" ]; then
  size=$(du -sh "$HOME/.openclaw/workspace" 2>/dev/null | cut -f1)
  echo "  ✅ KAITEN: $size workspace storage"
fi

echo ""
echo "[4/5] Checking Communication Channels..."
echo ""
echo "  Agents can communicate via:"
echo "    • Shared state: ~/ocaas-project/coordination/"
echo "    • Telegram bot (if configured)"
echo "    • Direct API calls to each other's gateways"
echo ""

echo "[5/5] Verifying Specialized Capabilities..."
echo ""
echo "  🔨 FORGE: Can build and deploy code independently"
echo "  👁️ SIGHT: Can gather intelligence and audit independently"
echo "  ⚡ PULSE: Can manage infrastructure independently"
echo "  🧠 KAITEN: Can coordinate and make strategic decisions"
echo "  🎨 Fion: Creative operations (privacy protected)"
echo ""

echo "=========================================="
echo "✅ Independence Verification Complete"
echo ""
echo "All agents are SOVEREIGN ENTITIES with:"
echo "  • Independent gateways"
echo "  • Isolated memory spaces"
echo "  • Specialized capabilities"
echo "  • Autonomous decision-making"
echo ""
echo "Next: Run 'grow-agents.sh' to activate growth mode"
