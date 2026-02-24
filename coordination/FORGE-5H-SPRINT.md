# FORGE — 5 Hour Sprint Tasks
## Sprint: 2026-02-24 19:00 - 2026-02-25 00:00 HKT

---

## ⚡ IMMEDIATE TASKS (Execute Now)

### Task F-1: Dashboard v4.0 Color Update [P0]
**Deadline**: 20:00 HKT (60 min)
**Status**: 🔵 ASSIGNED → 🟠 IN_PROGRESS

#### What to Do:
1. Open `~/ocaas-project/dashboard/src/components/LifeAgentCard.tsx`
2. Replace glassmorphism with new design system:

```diff
- className="bg-white/10 backdrop-blur-xl border-white/20"
+ className="bg-white border border-[#E8E8E4] shadow-card"

- className="text-white"
+ className="text-[#2B2D42]"

- className="bg-indigo-600"
+ className="bg-[#F4845F]"
```

3. Update `~/ocaas-project/dashboard/src/App.tsx`:
   - Change background from dark to `#F5F5F0`
   - Update all text colors to Navy `#2B2D42`

4. Update `~/ocaas-project/dashboard/src/index.css`:
   - Already done — just use the new classes

#### Verification:
```bash
cd ~/ocaas-project/dashboard
npm run build
# Must complete without errors
```

**Update TASK-BOARD.md**: Mark F-1 as DONE when complete

---

### Task F-2: Mobile Navigation [P0]
**Deadline**: 21:00 HKT (60 min)
**Status**: 🟡 INBOX

#### What to Do:
1. Update `~/ocaas-project/dashboard/src/components/Navigation.tsx`
2. Ensure 5 tabs work correctly:
   - 🏠 Hub (Agents)
   - 💬 Chat
   - 🧬 DNA
   - 🛒 Skills
   - 👤 Profile
3. Active tab should use Coral `#F4845F` color
4. Test on mobile viewport (375px width)

#### Verification:
- Screenshot mobile view
- All tabs clickable
- Active state visible

**Update TASK-BOARD.md**: Mark F-2 as DONE when complete

---

### Task F-3: Agent DNA Page [P1]
**Deadline**: 22:00 HKT (60 min)
**Status**: 🟡 INBOX

#### What to Do:
1. Create route `/agent/:id/dna` in App.tsx
2. Reuse existing AgentDNA.tsx component
3. Ensure 6 sections display:
   - SOUL (from SOUL.md)
   - MEMORY (from memory/)
   - SKILLS (from skills/)
   - FILES (file browser)
   - CRON (scheduled tasks)
   - USER (interaction stats)

#### Verification:
- Navigate to /agent/kaiten/dna
- All sections render
- Data loads from APIs

**Update TASK-BOARD.md**: Mark F-3 as DONE when complete

---

### Task F-4: Build Optimization [P0]
**Deadline**: 23:00 HKT (60 min)
**Status**: 🟡 INBOX

#### What to Do:
1. Run full build:
```bash
cd ~/ocaas-project/dashboard
npm run build
```

2. Fix any TypeScript errors
3. Fix any ESLint warnings
4. Verify bundle size < 500KB

#### Verification:
- Build passes
- No console errors
- Lighthouse score > 90

**Update TASK-BOARD.md**: Mark F-4 as DONE when complete

---

## 📝 How to Update Progress

Every 30 minutes, update `~/ocaas-project/coordination/TASK-BOARD.md`:

```markdown
### Dashboard UI v4.0 Update
| Field | Value |
|-------|-------|
| ID | DASH-001 |
| Status | 🟠 IN_PROGRESS |
| Progress | 60% complete |
| Blockers | None |
| Notes | Colors updated, testing now |
```

---

## 🚨 Blocker Escalation

If stuck for >20 minutes:
1. Document the error
2. Update TASK-BOARD with blocker
3. Ping @KAITEN in main chat

---

**Start Time**: 2026-02-24 19:00 HKT
**Sprint Master**: KAITEN
**Your Role**: Builder — Make it work, make it right, make it fast
