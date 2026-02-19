# Task Queue Protocol (Canonical)

## Goal
Use `coordination/tasks/*.json` as the source of truth for agent task lifecycle.

## State Machine
`pending -> acknowledged -> in_progress -> review -> completed`

Alternative exits:
- `pending|acknowledged|in_progress|review -> failed`
- `pending|acknowledged|in_progress|review -> cancelled`

## Required Fields
Each task must include:
- `id`, `title`, `description`, `assignee`, `priority`, `track`, `state`
- `createdAt`, `createdBy`, `updatedAt`
- `history[]` with state transitions

## Commands
```bash
cd ~/ocaas-project/coordination

# migrate existing inbox/outbox files once
./scripts/task-queue.py migrate-legacy --merge

# create a task
./scripts/task-queue.py create \
  --id task-w2-sight-dashboard-qa-001 \
  --assignee sight \
  --title "Dashboard surface QA scope expansion" \
  --description "Validate dashboard.autopus.cloud and cross-surface regressions" \
  --priority P1 \
  --track standard \
  --by prime

# acknowledge/start/review/complete
./scripts/task-queue.py transition --id task-w2-sight-dashboard-qa-001 --state acknowledged --by sight
./scripts/task-queue.py transition --id task-w2-sight-dashboard-qa-001 --state in_progress --by sight
./scripts/task-queue.py transition --id task-w2-sight-dashboard-qa-001 --state review --by sight
./scripts/task-queue.py transition --id task-w2-sight-dashboard-qa-001 --state completed --by sight

# view active tasks
./scripts/task-queue.py list --active
```

## Compatibility
- Legacy `inbox-*.json` and `outbox-*.json` remain as audit/bridge files.
- New automations and checkers should read from `coordination/tasks/` first.
