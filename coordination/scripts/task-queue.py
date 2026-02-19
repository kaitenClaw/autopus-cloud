#!/usr/bin/env python3
"""Canonical task queue manager for OCaaS coordination."""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

VALID_ASSIGNEES = {"prime", "forge", "sight", "pulse"}
VALID_PRIORITIES = {"P0", "P1", "P2"}
VALID_TRACKS = {"fast", "standard", "deep"}
VALID_STATES = {
    "pending",
    "acknowledged",
    "in_progress",
    "review",
    "completed",
    "failed",
    "cancelled",
}
ACTIVE_STATES = {"pending", "acknowledged", "in_progress", "review"}

TRANSITIONS: dict[str, set[str]] = {
    "pending": {"acknowledged", "in_progress", "failed", "cancelled"},
    "acknowledged": {"in_progress", "failed", "cancelled"},
    "in_progress": {"review", "completed", "failed", "cancelled"},
    "review": {"in_progress", "completed", "failed", "cancelled"},
    "completed": set(),
    "failed": set(),
    "cancelled": set(),
}


@dataclass
class QueueContext:
    coord_dir: Path

    @property
    def tasks_dir(self) -> Path:
        return self.coord_dir / "tasks"

    def task_path(self, task_id: str) -> Path:
        return self.tasks_dir / f"{task_id}.json"


def iso_now() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def parse_iso(ts: str) -> datetime:
    return datetime.fromisoformat(ts)


def normalize_assignee(raw: str | None) -> str:
    if not raw:
        return "prime"
    cleaned = raw.lower().replace("@", "").replace("_", "-")
    for name in VALID_ASSIGNEES:
        if name in cleaned:
            return name
    return "prime"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def load_task(ctx: QueueContext, task_id: str) -> dict[str, Any]:
    path = ctx.task_path(task_id)
    if not path.exists():
        raise FileNotFoundError(f"Task not found: {task_id}")
    return read_json(path)


def save_task(ctx: QueueContext, task: dict[str, Any]) -> None:
    write_json(ctx.task_path(task["id"]), task)


def cmd_create(ctx: QueueContext, args: argparse.Namespace) -> None:
    if args.assignee not in VALID_ASSIGNEES:
        raise ValueError(f"Invalid assignee: {args.assignee}")
    if args.priority not in VALID_PRIORITIES:
        raise ValueError(f"Invalid priority: {args.priority}")
    if args.track not in VALID_TRACKS:
        raise ValueError(f"Invalid track: {args.track}")

    path = ctx.task_path(args.id)
    if path.exists() and not args.force:
        raise FileExistsError(f"Task already exists: {args.id}")

    now = iso_now()
    task = {
        "id": args.id,
        "title": args.title,
        "description": args.description,
        "assignee": args.assignee,
        "priority": args.priority,
        "track": args.track,
        "state": "pending",
        "createdAt": now,
        "createdBy": args.by,
        "updatedAt": now,
        "dueAt": args.due,
        "references": args.reference or [],
        "deliverables": args.deliverable or [],
        "blockers": [],
        "dependencies": args.dependency or [],
        "metadata": {"source": args.source},
        "history": [{"state": "pending", "at": now, "by": args.by, "note": "created"}],
    }
    save_task(ctx, task)
    print(f"Created task {args.id}")


def cmd_transition(ctx: QueueContext, args: argparse.Namespace) -> None:
    if args.state not in VALID_STATES:
        raise ValueError(f"Invalid state: {args.state}")

    task = load_task(ctx, args.id)
    current = task["state"]
    if not args.force and args.state not in TRANSITIONS.get(current, set()):
        raise ValueError(f"Invalid transition: {current} -> {args.state}")

    now = iso_now()
    task["state"] = args.state
    task["updatedAt"] = now
    if args.blocker:
        task.setdefault("blockers", []).append(args.blocker)

    history_entry = {"state": args.state, "at": now, "by": args.by}
    if args.note:
        history_entry["note"] = args.note
    task.setdefault("history", []).append(history_entry)

    save_task(ctx, task)
    print(f"Task {args.id}: {current} -> {args.state}")


def list_tasks(ctx: QueueContext) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not ctx.tasks_dir.exists():
        return rows
    for path in sorted(ctx.tasks_dir.glob("*.json")):
        if path.name == "TASK-SCHEMA.json":
            continue
        try:
            rows.append(read_json(path))
        except Exception:
            continue
    return rows


def cmd_list(ctx: QueueContext, args: argparse.Namespace) -> None:
    rows = list_tasks(ctx)
    filtered = []
    for row in rows:
        if args.assignee and row.get("assignee") != args.assignee:
            continue
        if args.state and row.get("state") != args.state:
            continue
        if args.active and row.get("state") not in ACTIVE_STATES:
            continue
        filtered.append(row)

    filtered.sort(key=lambda x: x.get("updatedAt", x.get("createdAt", "")), reverse=True)

    if args.json:
        print(json.dumps(filtered, indent=2, ensure_ascii=False))
        return

    if not filtered:
        print("No tasks")
        return

    for row in filtered:
        print(f"{row['id']} | {row['assignee']} | {row['priority']} | {row['state']} | {row['title']}")


def map_legacy_state(status: str | None) -> str:
    mapping = {
        "pending": "pending",
        "assigned": "pending",
        "in_progress": "in_progress",
        "review": "review",
        "completed": "completed",
        "failed": "failed",
    }
    return mapping.get((status or "pending").lower(), "pending")


def convert_legacy_payload(raw: dict[str, Any], source_file: Path) -> dict[str, Any]:
    task_obj = raw.get("task", {}) if isinstance(raw.get("task"), dict) else {}
    task_id = str(raw.get("taskId") or source_file.stem)
    title = str(task_obj.get("title") or raw.get("task") or task_id)
    description = str(task_obj.get("description") or "")
    assignee = normalize_assignee(str(raw.get("to") or source_file.stem))
    priority_raw = str(raw.get("priority") or "high").lower()
    priority = "P1"
    if priority_raw in {"critical", "p0"}:
        priority = "P0"
    elif priority_raw in {"low", "p2"}:
        priority = "P2"

    track = str(raw.get("track") or "standard").lower()
    if track not in VALID_TRACKS:
        track = "standard"

    state = map_legacy_state(str(raw.get("status") or "pending"))
    ts = str(raw.get("timestamp") or iso_now())
    due_at = None
    if isinstance(task_obj.get("deadline"), str):
        due_at = task_obj["deadline"]

    refs = task_obj.get("references") if isinstance(task_obj.get("references"), list) else []
    deliverables = task_obj.get("deliverables") if isinstance(task_obj.get("deliverables"), list) else []

    return {
        "id": task_id,
        "title": title,
        "description": description,
        "assignee": assignee,
        "priority": priority,
        "track": track,
        "state": state,
        "createdAt": ts,
        "createdBy": str(raw.get("from") or "legacy"),
        "updatedAt": iso_now(),
        "dueAt": due_at,
        "references": refs,
        "deliverables": deliverables,
        "blockers": [],
        "dependencies": [],
        "metadata": {"source": f"legacy:{source_file.name}"},
        "history": [
            {
                "state": state,
                "at": ts,
                "by": str(raw.get("from") or "legacy"),
                "note": f"Migrated from {source_file.name}",
            }
        ],
    }


def cmd_migrate_legacy(ctx: QueueContext, args: argparse.Namespace) -> None:
    legacy_files = sorted(ctx.coord_dir.glob("inbox-*.json")) + sorted(ctx.coord_dir.glob("outbox-*.json"))
    migrated = 0

    for file_path in legacy_files:
        try:
            payload = read_json(file_path)
        except Exception:
            continue

        converted = convert_legacy_payload(payload, file_path)
        target_path = ctx.task_path(converted["id"])

        if target_path.exists() and not args.merge:
            continue

        if target_path.exists() and args.merge:
            existing = read_json(target_path)
            existing["state"] = converted["state"]
            existing["updatedAt"] = iso_now()
            existing.setdefault("history", []).append(
                {
                    "state": converted["state"],
                    "at": iso_now(),
                    "by": "task-queue",
                    "note": f"Merged from {file_path.name}",
                }
            )
            save_task(ctx, existing)
        else:
            save_task(ctx, converted)

        migrated += 1

    print(f"Migrated {migrated} legacy task files into {ctx.tasks_dir}")


def cmd_summary(ctx: QueueContext, _args: argparse.Namespace) -> None:
    rows = list_tasks(ctx)
    by_agent: dict[str, dict[str, int]] = {agent: {} for agent in sorted(VALID_ASSIGNEES)}
    for row in rows:
        agent = str(row.get("assignee", "prime"))
        state = str(row.get("state", "pending"))
        by_agent.setdefault(agent, {})
        by_agent[agent][state] = by_agent[agent].get(state, 0) + 1

    print(json.dumps(by_agent, indent=2, ensure_ascii=False))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Manage canonical OCaaS coordination tasks")
    parser.add_argument(
        "--coord-dir",
        default=str(Path(__file__).resolve().parents[1]),
        help="Coordination directory (default: script parent/..)",
    )

    sub = parser.add_subparsers(dest="cmd", required=True)

    create = sub.add_parser("create", help="Create a task")
    create.add_argument("--id", required=True)
    create.add_argument("--assignee", required=True, choices=sorted(VALID_ASSIGNEES))
    create.add_argument("--title", required=True)
    create.add_argument("--description", default="")
    create.add_argument("--priority", default="P1", choices=sorted(VALID_PRIORITIES))
    create.add_argument("--track", default="standard", choices=sorted(VALID_TRACKS))
    create.add_argument("--due", default=None)
    create.add_argument("--by", default="prime")
    create.add_argument("--source", default="manual")
    create.add_argument("--reference", action="append")
    create.add_argument("--deliverable", action="append")
    create.add_argument("--dependency", action="append")
    create.add_argument("--force", action="store_true")

    transition = sub.add_parser("transition", help="Transition a task state")
    transition.add_argument("--id", required=True)
    transition.add_argument("--state", required=True)
    transition.add_argument("--by", default="prime")
    transition.add_argument("--note", default="")
    transition.add_argument("--blocker", default="")
    transition.add_argument("--force", action="store_true")

    list_cmd = sub.add_parser("list", help="List tasks")
    list_cmd.add_argument("--assignee", choices=sorted(VALID_ASSIGNEES))
    list_cmd.add_argument("--state", choices=sorted(VALID_STATES))
    list_cmd.add_argument("--active", action="store_true")
    list_cmd.add_argument("--json", action="store_true")

    migrate = sub.add_parser("migrate-legacy", help="Import legacy inbox/outbox files")
    migrate.add_argument("--merge", action="store_true", help="Merge state into existing task files")

    sub.add_parser("summary", help="Print per-assignee state counts in JSON")

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    ctx = QueueContext(Path(args.coord_dir).resolve())

    if args.cmd == "create":
        cmd_create(ctx, args)
    elif args.cmd == "transition":
        cmd_transition(ctx, args)
    elif args.cmd == "list":
        cmd_list(ctx, args)
    elif args.cmd == "migrate-legacy":
        cmd_migrate_legacy(ctx, args)
    elif args.cmd == "summary":
        cmd_summary(ctx, args)


if __name__ == "__main__":
    main()
