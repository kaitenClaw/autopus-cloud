#!/bin/bash

# Prevents duplicate execution using a lockfile
LOCKFILE="/tmp/ocaas-checker.lock"
if [ -e "${LOCKFILE}" ] && kill -0 `cat ${LOCKFILE}`; then
    echo "Checker already running"
    exit
fi

trap "rm -f ${LOCKFILE}; exit" INT TERM EXIT
echo $$ > ${LOCKFILE}

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
LOGFILE="${BASE_DIR}/checker.log"
ERRFILE="${BASE_DIR}/checker.err.log"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOGFILE"
}

log "=== Coordination Check Started ==="

# Check Agents
AGENTS=("forge" "sight" "pulse")

for agent in "${AGENTS[@]}"; do
    INBOX="${BASE_DIR}/inbox-${agent}.json"
    if [ -f "$INBOX" ]; then
        # Use Python for reliable JSON parsing and date math
        STATUS=$(python3 -c "import sys, json; print(json.load(open('$INBOX'))['status'])" 2>>"$ERRFILE")
        
        if [ "$STATUS" == "pending" ] || [ "$STATUS" == "in_progress" ]; then
             PENDING_INFO=$(python3 -c "
import sys, json, datetime
from datetime import timezone

try:
    data = json.load(open('$INBOX'))
    ts_str = data.get('timestamp')
    if ts_str:
        # Handle simple ISO format
        ts = datetime.datetime.fromisoformat(ts_str)
        now = datetime.datetime.now(ts.tzinfo) if ts.tzinfo else datetime.datetime.now()
        diff = now - ts
        minutes = int(diff.total_seconds() / 60)
        print(f'{minutes}')
    else:
        print('NOTIMESTAMP')
except Exception as e:
    print('ERROR')
" 2>>"$ERRFILE")
            
            if [ "$PENDING_INFO" == "ERROR" ]; then
                 log "⚠️  $agent: Status = $STATUS (Timestamp parse error)"
            elif [ "$PENDING_INFO" == "NOTIMESTAMP" ]; then
                 log "ℹ️  $agent: Status = $STATUS (No timestamp)"
            else
                 log "ℹ️  $agent: Status = $STATUS (Pending for ${PENDING_INFO} min)"
                 if [ "$PENDING_INFO" -gt 60 ]; then
                      log "⚠️  ALERT: $agent task pending for > 1 hour!"
                 fi
            fi
        else
            log "✅ $agent: Status = $STATUS"
        fi
    else
        log "❌ $agent: Inbox file not found"
    fi
done

# Check System Health (Gateways)
# Count only stable gateways listening on target ports (IPv4 only to avoid double counting)
GATEWAYS=$(/usr/sbin/lsof -nP -i4TCP -sTCP:LISTEN | grep ":18789\|:18791\|:18793\|:18795\|:18797" | wc -l | xargs)
log "System Health: Gateways running: $GATEWAYS / 5 (Target)"

log "=== Check Complete ==="
