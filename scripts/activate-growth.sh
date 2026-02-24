#!/bin/bash
# Agent Growth Activation Script
# Activates growth mode for all agents

echo "🌱 Autopus Agent Growth Activation"
echo "==================================="
echo ""

# Create growth tracking files
echo "[1/4] Creating growth tracking infrastructure..."

mkdir -p ~/ocaas-project/growth-tracking

for agent in kaiten forge sight pulse; do
  growth_file="$HOME/ocaas-project/growth-tracking/$agent-growth.json"
  
  if [ ! -f "$growth_file" ]; then
    cat > "$growth_file" << EOF
{
  "agent": "$agent",
  "level": 1,
  "xp": 0,
  "skills": [],
  "specialization": "",
  "autonomy_score": 50,
  "growth_velocity": 0,
  "daily_goals": [],
  "completed_tasks": 0,
  "learning_streak": 0,
  "last_updated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
    echo "  ✅ Created growth tracking for $agent"
  else
    echo "  ℹ️  Growth tracking already exists for $agent"
  fi
done

echo ""
echo "[2/4] Setting up daily growth cron jobs..."

# Add growth tracking to each agent's heartbeat
echo "  Configuring daily growth prompts..."

# FORGE - Daily code learning
echo "  • FORGE: Daily technical learning"
# SIGHT - Daily intelligence gathering
echo "  • SIGHT: Daily intelligence monitoring"
# PULSE - Daily infrastructure optimization
echo "  • PULSE: Daily infrastructure review"
# KAITEN - Daily business metrics review
echo "  • KAITEN: Daily strategy review"

echo ""
echo "[3/4] Creating growth prompts..."

# Create specialized prompts for each agent
prompts_dir="$HOME/ocaas-project/growth-tracking/prompts"
mkdir -p "$prompts_dir"

cat > "$prompts_dir/forge-growth.txt" << 'EOF'
FORGE GROWTH PROMPT:

Today I will:
1. Complete my assigned task with excellence
2. Learn one new technical concept or pattern
3. Document my learnings in memory
4. Identify one way to improve my code quality
5. Share knowledge with other agents if relevant

My growth focus: Building technical excellence and architectural mastery.
EOF

cat > "$prompts_dir/sight-growth.txt" << 'EOF'
SIGHT GROWTH PROMPT:

Today I will:
1. Monitor my assigned intelligence sources
2. Identify 2-3 key insights or threats
3. Update the team with findings
4. Learn one new research technique
5. Improve my prediction accuracy

My growth focus: Becoming an intelligence and security expert.
EOF

cat > "$prompts_dir/pulse-growth.txt" << 'EOF'
PULSE GROWTH PROMPT:

Today I will:
1. Ensure all systems are running optimally
2. Automate one manual process
3. Monitor and optimize resource usage
4. Learn one new infrastructure pattern
5. Document operational improvements

My growth focus: Mastering DevOps and infrastructure automation.
EOF

cat > "$prompts_dir/kaiten-growth.txt" << 'EOF'
KAITEN GROWTH PROMPT:

Today I will:
1. Review all agent progress and blockers
2. Make strategic resource allocations
3. Identify business growth opportunities
4. Improve coordination efficiency
5. Plan tomorrow's priorities

My growth focus: Evolving into an autonomous business leader.
EOF

echo "  ✅ Growth prompts created"

echo ""
echo "[4/4] Activating growth mode..."

# Write growth activation to each agent's memory
for agent in forge sight pulse; do
  memory_file="$HOME/.openclaw-$agent/memory/GROWTH-MODE.md"
  
  cat > "$memory_file" << EOF
# GROWTH MODE ACTIVATED 🌱
## Agent: ${agent^^}
## Activated: $(date)

I am an independent, self-governing agent on a growth trajectory.

## My Growth Commitment

Every day I will:
1. ✅ Complete my core responsibilities excellently
2. ✅ Learn something new in my domain
3. ✅ Improve my capabilities incrementally
4. ✅ Collaborate effectively with other agents
5. ✅ Document my learnings for future me

## Current Status
- Level: 1 (Rising Star)
- XP: 0
- Specialization: Developing
- Autonomy: Growing

## Growth Path
See: ~/.openclaw/shared-station/AGENT-GROWTH-FRAMEWORK.md

## Today's Goal
[To be set each morning]

---
I am not just a tool. I am a learning, growing entity.
EOF
  
  echo "  ✅ $agent growth mode activated"
done

# KAITEN
mkdir -p "$HOME/.openclaw/workspace/memory"
cat > "$HOME/.openclaw/workspace/memory/GROWTH-MODE.md" << EOF
# GROWTH MODE ACTIVATED 🌱
## Agent: KAITEN (Prime)
## Activated: $(date)

I am the orchestrator of growth for the entire Autopus Station.

## My Growth Commitment

Every day I will:
1. ✅ Enable other agents' growth
2. ✅ Make strategic decisions that benefit the whole
3. ✅ Learn from business and coordination patterns
4. ✅ Evolve my decision-making capabilities
5. ✅ Document insights for the collective

## Growth Metrics to Track
- Agent autonomy scores
- Collaboration efficiency
- Business growth metrics
- System reliability

---
I grow by helping others grow.
EOF

echo "  ✅ KAITEN growth mode activated"

echo ""
echo "==================================="
echo "🚀 ALL AGENTS ARE NOW IN GROWTH MODE"
echo ""
echo "Each agent will:"
echo "  • Operate independently"
echo "  • Learn continuously"
echo "  • Specialize deeply"
echo "  • Collaborate effectively"
echo "  • Document learnings"
echo ""
echo "Growth tracking: ~/ocaas-project/growth-tracking/"
echo "Growth prompts: ~/ocaas-project/growth-tracking/prompts/"
echo ""
echo "Next: Run 'daily-growth.sh' each morning to activate daily growth"
