#!/bin/bash
# Quality Check Cron - Runs every 30 minutes
# Checks task progress and quality

WORKSPACE="/Users/altoncheng/ocaas-project"
TASK_BOARD="$WORKSPACE/coordination/TASK-BOARD.md"
SPRINT_PLAN="$WORKSPACE/coordination/5-HOUR-SPRINT-PLAN.md"
LOG_FILE="$WORKSPACE/logs/quality-check-$(date +%Y%m%d).log"
REPORT_FILE="$WORKSPACE/logs/quality-report-$(date +%H%M).md"

mkdir -p "$WORKSPACE/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if task files exist
check_deliverables() {
    local issues=()
    
    # Check FORGE deliverables
    if [ ! -f "$WORKSPACE/dashboard/src/components/LifeAgentCard.tsx" ]; then
        issues+=("FORGE: LifeAgentCard.tsx missing")
    fi
    
    # Check SIGHT deliverables
    if [ ! -f "$WORKSPACE/frontend/index.html" ]; then
        issues+=("SIGHT: index.html missing")
    fi
    
    # Check build status
    if ! grep -q "build" "$WORKSPACE/dashboard/package.json" 2>/dev/null; then
        issues+=("FORGE: Build script not configured")
    fi
    
    echo "${issues[@]}"
}

# Generate quality report
generate_report() {
    cat > "$REPORT_FILE" << EOF
# Quality Check Report
**Time**: $(date '+%Y-%m-%d %H:%M:%S')
**Sprint**: 5-Hour Sprint

## Deliverable Status

### FORGE (Builder)
- [ ] Dashboard v4.0 colors
- [ ] Mobile navigation  
- [ ] Agent DNA page
- [ ] Build passing

### SIGHT (Researcher)
- [ ] SEO meta tags deployed
- [ ] First article published
- [ ] Twitter account ready
- [ ] Newsletter page

### PULSE (DevOps)
- [ ] Enhanced Runtime deployed
- [ ] APIs responding
- [ ] Monitoring active

## Issues Found
$(check_deliverables)

## Recommendations
1. Focus on P0 items first
2. Parallel execution where possible
3. Escalate blockers immediately

## Next Check
$(date -v+30M '+%Y-%m-%d %H:%M:%S')
EOF
}

# Main check
log "🔍 Running quality check..."

issues=$(check_deliverables)

if [ -n "$issues" ]; then
    log "⚠️ Issues found: $issues"
    generate_report
    # Could send notification here
else
    log "✅ All deliverables on track"
fi

log "✓ Quality check complete"
