#!/bin/bash
# Inbox Polling Skill for KAITEN Agents
# Checks for pending tasks and acknowledges them
# Usage: ./inbox-polling-skill.sh forge|sight|pulse
# Schedule: Run every 5 minutes via launchd or cron

set -e

AGENT=$1
INBOX_DIR="/Users/altoncheng/ocaas-project/coordination"
INBOX_FILE="$INBOX_DIR/inbox-${AGENT}.json"
STATUS_FILE="$INBOX_DIR/status-board.json"

if [ -z "$AGENT" ]; then
  echo "Usage: $0 [forge|sight|pulse]"
  exit 1
fi

# Function: Check if task is pending and ACK it
check_and_ack_task() {
  local agent=$1
  local inbox="$INBOX_DIR/inbox-${agent}.json"

  # If inbox doesn't exist, nothing to do
  if [ ! -f "$inbox" ]; then
    return 0
  fi

  # Check status
  local status=$(jq -r '.status // "pending"' "$inbox" 2>/dev/null || echo "error")
  local task_id=$(jq -r '.taskId // "unknown"' "$inbox" 2>/dev/null || echo "unknown")

  if [ "$status" = "pending" ]; then
    # Task is pending — mark as in_progress
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $agent: Found pending task: $task_id"

    # Update status to in_progress
    jq ".status = \"in_progress\" | .acknowledgedAt = \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\" | .acknowledgedBy = \"kaiten_${agent}_bot\"" \
      "$inbox" > "${inbox}.tmp"
    mv "${inbox}.tmp" "$inbox"

    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $agent: ✅ ACK task $task_id - now in_progress"

    # Update status board
    update_status_board "$agent" "in_progress" "$task_id"

    return 0
  fi
}

# Function: Update status board
update_status_board() {
  local agent=$1
  local agent_status=$2
  local task_id=$3

  if [ -f "$STATUS_FILE" ]; then
    jq ".agents.${agent}.status = \"${agent_status}\" | .agents.${agent}.currentTask = \"${task_id}\" | .lastUpdated = \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\"" \
      "$STATUS_FILE" > "${STATUS_FILE}.tmp"
    mv "${STATUS_FILE}.tmp" "$STATUS_FILE"
  fi
}

# Function: Send Telegram ACK notification
send_telegram_ack() {
  local agent=$1
  local task_id=$2
  local title=$3

  # This would normally send to Telegram, but without bot token we just log
  # In production, you'd curl to Telegram API here
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] TELEGRAM_ACK: $agent acknowledged $task_id: $title"
}

# Main execution
check_and_ack_task "$AGENT"

echo "✅ Inbox polling complete for $AGENT at $(date +'%Y-%m-%d %H:%M:%S')"
