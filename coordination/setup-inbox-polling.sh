#!/bin/bash
# Setup Inbox Polling for KAITEN Agents
# Creates launchd plist files for automatic inbox checking every 5 minutes
# Run this once: bash setup-inbox-polling.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
POLLING_SCRIPT="$SCRIPT_DIR/inbox-polling-skill.sh"
USER_UID=$(id -u)

# Make polling script executable
chmod +x "$POLLING_SCRIPT"
echo "✅ Made polling script executable: $POLLING_SCRIPT"

# Create launchd plists for each agent
for AGENT in forge sight pulse; do
  PLIST_FILE="$HOME/Library/LaunchAgents/ai.kaiten.${AGENT}.inbox-polling.plist"

  cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>ai.kaiten.${AGENT}.inbox-polling</string>

    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${POLLING_SCRIPT}</string>
        <string>${AGENT}</string>
    </array>

    <key>StartInterval</key>
    <integer>300</integer>

    <key>StandardOutPath</key>
    <string>${SCRIPT_DIR}/.logs/${AGENT}-polling.log</string>

    <key>StandardErrorPath</key>
    <string>${SCRIPT_DIR}/.logs/${AGENT}-polling.err.log</string>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
</dict>
</plist>
EOF

  echo "✅ Created: $PLIST_FILE"
done

# Create log directory
mkdir -p "$SCRIPT_DIR/.logs"
echo "✅ Created log directory: $SCRIPT_DIR/.logs"

# Load the plists
echo ""
echo "🔧 Loading launchd agents..."
for AGENT in forge sight pulse; do
  PLIST_FILE="$HOME/Library/LaunchAgents/ai.kaiten.${AGENT}.inbox-polling.plist"
  launchctl bootstrap gui/$USER_UID "$PLIST_FILE" 2>/dev/null || {
    echo "⚠️  Could not bootstrap $AGENT (may already be loaded)"
    launchctl bootout gui/$USER_UID "ai.kaiten.${AGENT}.inbox-polling" 2>/dev/null
    launchctl bootstrap gui/$USER_UID "$PLIST_FILE"
  }
  echo "✅ Loaded: ai.kaiten.${AGENT}.inbox-polling"
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ INBOX POLLING SYSTEM ACTIVATED"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Agents will now:"
echo "  ✓ Check inbox every 5 minutes"
echo "  ✓ Acknowledge pending tasks automatically"
echo "  ✓ Update status board with progress"
echo ""
echo "View logs:"
echo "  tail -f $SCRIPT_DIR/.logs/forge-polling.log"
echo "  tail -f $SCRIPT_DIR/.logs/sight-polling.log"
echo "  tail -f $SCRIPT_DIR/.logs/pulse-polling.log"
echo ""
echo "Stop polling:"
echo "  launchctl bootout gui/$USER_UID ai.kaiten.forge.inbox-polling"
echo "  launchctl bootout gui/$USER_UID ai.kaiten.sight.inbox-polling"
echo "  launchctl bootout gui/$USER_UID ai.kaiten.pulse.inbox-polling"
echo ""
