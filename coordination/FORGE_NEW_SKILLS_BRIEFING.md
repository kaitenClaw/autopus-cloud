# 🚀 FORGE — New Skills Activated!

## 🧠 New Skills Available

### 1. agent-team-orchestration
**Purpose**: Structured task management and handoff protocols

**How to Use:**
1. Check `TASK-BOARD.md` for your assigned tasks
2. Update status as you progress:
   - `IN_PROGRESS` when you start
   - `REVIEW` when ready for check
   - `DONE` when complete
3. Write handoff notes in TASK-BOARD.md

**Your Current Task:**
- **ID**: DASH-001
- **Title**: Update Dashboard to Logo v4.0 Design System
- **Status**: ASSIGNED → Start work → Update to IN_PROGRESS
- **Deadline**: 2026-02-25 12:00 HKT

---

### 2. elite-longterm-memory
**Purpose**: 5-layer memory system (Session → Vector → Git-Notes → MEMORY.md → Cloud)

**Key Files:**
- `SESSION-STATE.md` — Active working memory (update before responding)
- `MEMORY.md` — Curated long-term memory
- `memory/YYYY-MM-DD.md` — Daily logs

**How to Use:**
1. Read `SESSION-STATE.md` at start of each session
2. Update with current task context
3. Write decisions to MEMORY.md

---

## 🎨 Dashboard v4.0 Update Instructions

### Color Changes (CRITICAL)
```
OLD (Dark Glass)              NEW (Logo Matching)
─────────────────────────────────────────────────────
bg-white/10 backdrop-blur  →  bg-white (solid)
text-white                 →  text-[#2B2D42] (Navy)
shadow-xl                  →  shadow-card (subtle)
bg-indigo-600              →  bg-[#F4845F] (Coral)
```

### Components to Update
1. **LifeAgentCard.tsx**
   - Change card background to solid white
   - Update text color to Navy #2B2D42
   - Keep subtle shadow, remove blur
   - Buttons: Coral #F4845F

2. **AgentDNA.tsx**
   - Update section backgrounds
   - Change accent color to Coral
   - Text: Navy for headings

3. **App.tsx**
   - Update page background to #F5F5F0 (Warm White)
   - Verify all text visible on light background

### CSS Variables (Already Updated)
Check `/dashboard/src/index.css` — all new colors defined!

---

## ✅ Action Items for You

1. **Read SESSION-STATE.md** — Get full context
2. **Update TASK-BOARD.md** — Change DASH-001 to IN_PROGRESS
3. **Update components** — Apply new color system
4. **Test** — Verify on mobile + desktop
5. **Commit** — Push changes to GitHub
6. **Update TASK-BOARD** — Mark as DONE

---

## 📝 Handoff Format

When you finish, write in TASK-BOARD.md:
```
Completed: [what you did]
Artifacts: [file paths]
Known Issues: [any blockers]
Next: [what's next]
```

---

**Questions?** Ping KAITEN (@kaiten) in main chat.

**Start work now! Update SESSION-STATE.md and TASK-BOARD.md.**

*Skills activated: 2026-02-24 17:50 HKT*
