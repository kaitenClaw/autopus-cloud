#!/bin/bash
# Fix Security Findings Script
# Fixes the 3 critical security issues found in audit

echo "🔒 Autopus Security Fix Script"
echo "==============================="
echo ""

# 1. Fix config file permissions (already done, but verify)
echo "[1/3] Verifying config file permissions..."
for dir in ~/.openclaw ~/.openclaw-forge ~/.openclaw-sight ~/.openclaw-pulse ~/.openclaw-fion; do
  if [ -f "$dir/openclaw.json" ]; then
    chmod 600 "$dir/openclaw.json"
    echo "  ✓ $dir/openclaw.json permissions set to 600"
  fi
done
echo ""

# 2. Fix groupPolicy settings
echo "[2/3] Fixing groupPolicy settings..."
echo "  This requires manual editing of config files."
echo "  Would you like to automatically set groupPolicy to 'allowlist'? (y/n)"
read -r response

if [ "$response" = "y" ]; then
  for dir in ~/.openclaw ~/.openclaw-forge ~/.openclaw-sight ~/.openclaw-pulse; do
    config_file="$dir/openclaw.json"
    if [ -f "$config_file" ]; then
      # Create backup
      cp "$config_file" "$config_file.bak.$(date +%s)"
      
      # Use sed to replace groupPolicy (basic approach)
      sed -i '' 's/"groupPolicy": "open"/"groupPolicy": "allowlist"/g' "$config_file" 2>/dev/null || \
      sed -i 's/"groupPolicy": "open"/"groupPolicy": "allowlist"/g' "$config_file"
      
      echo "  ✓ Updated $config_file"
    fi
  done
  echo ""
  echo "  ⚠️  Note: You'll need to configure allowlists for each agent"
  echo "     Edit channels.telegram.groupAllowFrom in each config"
fi
echo ""

# 3. Restart affected agents
echo "[3/3] Restarting agents to apply changes..."
echo "  Restarting FORGE..."
launchctl kickstart -k gui/$UID/ai.openclaw.forge 2>/dev/null || true

echo "  Restarting SIGHT..."
launchctl kickstart -k gui/$UID/ai.openclaw.sight 2>/dev/null || true

echo "  Restarting PULSE..."
launchctl kickstart -k gui/$UID/ai.openclaw.pulse 2>/dev/null || true

echo ""
echo "✅ Security fixes applied!"
echo ""
echo "Next steps:"
echo "  1. Verify agents are online: openclaw status"
echo "  2. Configure allowlists in each agent's config"
echo "  3. Run security audit again to verify fixes"
