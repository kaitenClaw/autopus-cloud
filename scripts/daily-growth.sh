#!/bin/bash
# Daily Growth Script
# Run this every morning to activate daily growth for all agents

echo "🌅 Autopus Daily Growth Activation"
echo "==================================="
echo "Date: $(date)"
echo ""

# Update growth streaks
echo "[1/3] Updating growth metrics..."

for agent in kaiten forge sight pulse; do
  growth_file="$HOME/ocaas-project/growth-tracking/$agent-growth.json"
  
  if [ -f "$growth_file" ]; then
    # Read current values
    level=$(grep -o '"level": [0-9]*' "$growth_file" | grep -o '[0-9]*')
    xp=$(grep -o '"xp": [0-9]*' "$growth_file" | grep -o '[0-9]*')
    streak=$(grep -o '"learning_streak": [0-9]*' "$growth_file" | grep -o '[0-9]*')
    
    # Increment streak
    new_streak=$((streak + 1))
    
    # Add daily XP
    new_xp=$((xp + 10))
    
    # Check for level up (every 1000 XP)
    new_level=$level
    if [ $new_xp -ge $((level * 1000)) ]; then
      new_level=$((level + 1))
      echo "  🎉 $agent LEVELED UP to Level $new_level!"
    fi
    
    # Update file
    sed -i '' "s/\"xp\": $xp/\"xp\": $new_xp/" "$growth_file"
    sed -i '' "s/\"learning_streak\": $streak/\"learning_streak\": $new_streak/" "$growth_file"
    sed -i '' "s/\"level\": $level/\"level\": $new_level/" "$growth_file"
    sed -i '' "s|\"last_updated\": \"[^\"]*\"|\"last_updated\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"|" "$growth_file"
    
    echo "  ✅ $agent: Day $new_streak streak, $new_xp XP, Level $new_level"
  fi
done

echo ""
echo "[2/3] Setting today's growth goals..."

# Set daily goals for each agent
cat > "$HOME/.openclaw-forge/memory/TODAY-GOAL.md" << EOF
# Today's Goal - FORGE
## $(date +"%Y-%m-%d")

### Primary Goal
[ ] Complete assigned building task

### Growth Goal
[ ] Learn one new technical concept

### Collaboration Goal
[ ] Share knowledge with another agent

---
Growth Streak: Check growth-tracking/forge-growth.json
EOF

cat > "$HOME/.openclaw-sight/memory/TODAY-GOAL.md" << EOF
# Today's Goal - SIGHT
## $(date +"%Y-%m-%d")

### Primary Goal
[ ] Monitor intelligence sources
[ ] Compile findings report

### Growth Goal
[ ] Learn one new research technique

### Collaboration Goal
[ ] Alert team to important findings

---
Growth Streak: Check growth-tracking/sight-growth.json
EOF

cat > "$HOME/.openclaw-pulse/memory/TODAY-GOAL.md" << EOF
# Today's Goal - PULSE
## $(date +"%Y-%m-%d")

### Primary Goal
[ ] Ensure system health
[ ] Optimize one process

### Growth Goal
[ ] Learn one new infrastructure pattern

### Collaboration Goal
[ ] Support deployment needs

---
Growth Streak: Check growth-tracking/pulse-growth.json
EOF

cat > "$HOME/.openclaw/workspace/memory/TODAY-GOAL.md" << EOF
# Today's Goal - KAITEN
## $(date +"%Y-%m-%d")

### Primary Goal
[ ] Review all agent progress
[ ] Remove blockers
[ ] Allocate resources

### Growth Goal
[ ] Analyze business metrics

### Collaboration Goal
[ ] Enable agent growth

---
Growth Streak: Check growth-tracking/kaiten-growth.json
EOF

echo "  ✅ Daily goals set for all agents"

echo ""
echo "[3/3] Growth prompts..."

echo ""
echo "🔨 FORGE: Today's growth prompt:"
cat ~/ocaas-project/growth-tracking/prompts/forge-growth.txt | head -3
echo ""

echo "👁️ SIGHT: Today's growth prompt:"
cat ~/ocaas-project/growth-tracking/prompts/sight-growth.txt | head -3
echo ""

echo "⚡ PULSE: Today's growth prompt:"
cat ~/ocaas-project/growth-tracking/prompts/pulse-growth.txt | head -3
echo ""

echo "🧠 KAITEN: Today's growth prompt:"
cat ~/ocaas-project/growth-tracking/prompts/kaiten-growth.txt | head -3
echo ""

echo "==================================="
echo "🚀 All agents are ready to grow today!"
echo ""
echo "To check growth status:"
echo "  cat ~/ocaas-project/growth-tracking/[agent]-growth.json"
echo ""
echo "To view today's goal:"
echo "  cat ~/.openclaw-[agent]/memory/TODAY-GOAL.md"
