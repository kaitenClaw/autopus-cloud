#!/usr/bin/env python3
"""Generate rolling market-validation KPIs and a daily digest report."""

from __future__ import annotations

import argparse
import json
import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


VALID_EVENTS = {
    "lead_captured",
    "lead_qualified",
    "demo_booked",
    "proposal_sent",
    "trial_started",
    "paid_converted",
    "churned",
    "refund",
}

FUNNEL_EVENT_TO_STAGE = {
    "lead_captured": "captured",
    "lead_qualified": "qualified",
    "demo_booked": "demos",
    "proposal_sent": "proposals",
    "trial_started": "trials",
    "paid_converted": "paid",
}

FUNNEL_STAGES = ("captured", "qualified", "demos", "proposals", "trials", "paid")


@dataclass
class EventRow:
    ts: datetime
    source: str
    channel: str
    campaign: str
    event: str
    lead_id: str | None
    value_usd: float
    notes: str


def iso_now() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def parse_iso(value: str) -> datetime:
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def safe_ratio(numerator: int, denominator: int) -> float:
    if denominator <= 0:
        return 0.0
    return round((numerator / denominator) * 100.0, 2)


def load_events(events_file: Path) -> list[EventRow]:
    rows: list[EventRow] = []
    if not events_file.exists():
        return rows

    for line_no, line in enumerate(events_file.read_text(encoding="utf-8").splitlines(), start=1):
        line = line.strip()
        if not line:
            continue
        try:
            raw = json.loads(line)
        except json.JSONDecodeError:
            continue

        event = raw.get("event")
        ts_value = raw.get("ts")
        if event not in VALID_EVENTS or not ts_value:
            continue

        try:
            ts = parse_iso(str(ts_value))
        except ValueError:
            continue

        value_usd_raw = raw.get("valueUsd", 0)
        try:
            value_usd = float(value_usd_raw)
        except (TypeError, ValueError):
            value_usd = 0.0

        rows.append(
            EventRow(
                ts=ts,
                source=str(raw.get("source", "unknown")),
                channel=str(raw.get("channel", "unknown")),
                campaign=str(raw.get("campaign", "default")),
                event=event,
                lead_id=(str(raw.get("leadId")) if raw.get("leadId") else None),
                value_usd=value_usd,
                notes=str(raw.get("notes", "")),
            )
        )

    rows.sort(key=lambda x: x.ts)
    return rows


def aggregate(events: list[EventRow]) -> dict[str, Any]:
    stage_lead_sets: dict[str, set[str]] = {stage: set() for stage in FUNNEL_STAGES}
    stage_counts: dict[str, int] = {stage: 0 for stage in FUNNEL_STAGES}
    paying_leads: set[str] = set()

    new_mrr = 0.0
    churned_mrr = 0.0

    for idx, row in enumerate(events):
        stage = FUNNEL_EVENT_TO_STAGE.get(row.event)
        if stage:
            if row.lead_id:
                if row.lead_id not in stage_lead_sets[stage]:
                    stage_lead_sets[stage].add(row.lead_id)
                    stage_counts[stage] += 1
            else:
                stage_counts[stage] += 1

        if row.event == "paid_converted":
            new_mrr += row.value_usd
            if row.lead_id:
                paying_leads.add(row.lead_id)
            else:
                paying_leads.add(f"anon-paid-{idx}")
        elif row.event in {"churned", "refund"}:
            churned_mrr += row.value_usd
            if row.lead_id and row.lead_id in paying_leads:
                paying_leads.remove(row.lead_id)

    captured = stage_counts["captured"]
    qualified = stage_counts["qualified"]
    demos = stage_counts["demos"]
    proposals = stage_counts["proposals"]
    trials = stage_counts["trials"]
    paid = stage_counts["paid"]

    return {
        "funnel": {
            "captured": captured,
            "qualified": qualified,
            "demos": demos,
            "proposals": proposals,
            "trials": trials,
            "paid": paid,
            "qualificationRatePct": safe_ratio(qualified, captured),
            "demoRatePct": safe_ratio(demos, qualified),
            "trialRatePct": safe_ratio(trials, demos),
            "closeRatePct": safe_ratio(paid, trials),
            "captureToPaidPct": safe_ratio(paid, captured),
        },
        "revenue": {
            "newMrrUsd": round(new_mrr, 2),
            "churnedMrrUsd": round(churned_mrr, 2),
            "netNewMrrUsd": round(new_mrr - churned_mrr, 2),
            "payingCustomers": len(paying_leads),
        },
    }


def build_blockers(funnel: dict[str, Any]) -> list[str]:
    blockers: list[str] = []
    if funnel["captured"] == 0:
        blockers.append("No leads captured in current window.")
    if funnel["qualificationRatePct"] < 30 and funnel["captured"] > 0:
        blockers.append("Lead quality is low (qualification rate < 30%).")
    if funnel["demoRatePct"] < 40 and funnel["qualified"] > 0:
        blockers.append("Qualified leads are not converting to demos fast enough.")
    if funnel["trialRatePct"] < 35 and funnel["demos"] > 0:
        blockers.append("Demo-to-trial conversion is weak.")
    if funnel["closeRatePct"] < 25 and funnel["trials"] > 0:
        blockers.append("Trial-to-paid close rate is below target.")
    return blockers


def build_recommendations(funnel: dict[str, Any], blockers: list[str]) -> list[str]:
    if not blockers:
        return ["Keep current playbook and increase top-of-funnel volume by 20% next week."]

    recs: list[str] = []
    if "No leads captured in current window." in blockers:
        recs.append("Launch 2 outbound campaigns today (X thread + Telegram founder outreach).")
    if "Lead quality is low (qualification rate < 30%)." in blockers:
        recs.append("Tighten ICP and update lead qualification checklist before next outreach batch.")
    if "Qualified leads are not converting to demos fast enough." in blockers:
        recs.append("Add same-day calendar CTA in first reply and track response SLA < 10 minutes.")
    if "Demo-to-trial conversion is weak." in blockers:
        recs.append("Use a fixed demo script with explicit trial activation step at the end.")
    if "Trial-to-paid close rate is below target." in blockers:
        recs.append("Introduce trial success milestone + paid upgrade trigger at day 3.")
    return recs


def recent_events_payload(events: list[EventRow], limit: int = 10) -> list[dict[str, Any]]:
    payload: list[dict[str, Any]] = []
    for row in events[-limit:]:
        payload.append(
            {
                "ts": row.ts.isoformat(timespec="seconds"),
                "event": row.event,
                "leadId": row.lead_id,
                "source": row.source,
                "channel": row.channel,
                "campaign": row.campaign,
                "valueUsd": round(row.value_usd, 2),
                "notes": row.notes,
            }
        )
    return payload


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def update_status_board(status_board_file: Path, snapshot: dict[str, Any]) -> None:
    if not status_board_file.exists():
        return

    try:
        status_board = json.loads(status_board_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return

    status_board["marketValidation"] = snapshot
    write_json(status_board_file, status_board)


def write_markdown_report(report_file: Path, scoreboard: dict[str, Any], events_7d: list[EventRow]) -> None:
    funnel = scoreboard["window"]["funnel"]
    revenue = scoreboard["window"]["revenue"]
    goals = scoreboard["goals"]

    lines = [
        f"# Market Validation Digest - {scoreboard['generatedAt'][:10]}",
        "",
        f"- Window: last {scoreboard['windowDays']} days",
        f"- Generated at: {scoreboard['generatedAt']}",
        "",
        "## Funnel Snapshot (7d)",
        f"- Leads captured: {funnel['captured']}",
        f"- Leads qualified: {funnel['qualified']} ({funnel['qualificationRatePct']}%)",
        f"- Demos booked: {funnel['demos']} ({funnel['demoRatePct']}% of qualified)",
        f"- Proposals sent: {funnel['proposals']}",
        f"- Trials started: {funnel['trials']} ({funnel['trialRatePct']}% of demos)",
        f"- Paid conversions: {funnel['paid']} ({funnel['closeRatePct']}% of trials)",
        "",
        "## Revenue Snapshot",
        f"- Net new MRR (7d): ${revenue['netNewMrrUsd']}",
        f"- New MRR: ${revenue['newMrrUsd']}",
        f"- Churned/Refund MRR: ${revenue['churnedMrrUsd']}",
        f"- Active paying customers: {revenue['payingCustomers']}",
        "",
        "## Goal Progress",
        f"- MRR target: ${goals['mrrTargetUsd']} | Current: ${scoreboard['allTime']['revenue']['netNewMrrUsd']} ({scoreboard['progress']['mrrPct']}%)",
        f"- Paying customer target: {goals['payingCustomersTarget']} | Current: {scoreboard['allTime']['revenue']['payingCustomers']} ({scoreboard['progress']['payingCustomersPct']}%)",
        f"- Signup target: {goals['signupTarget']} | Current: {scoreboard['allTime']['funnel']['captured']} ({scoreboard['progress']['signupsPct']}%)",
        "",
        "## Blockers",
    ]

    blockers = scoreboard["blockers"]
    if blockers:
        lines.extend([f"- {item}" for item in blockers])
    else:
        lines.append("- None detected.")

    lines.extend(["", "## Recommended Actions"])
    lines.extend([f"- {item}" for item in scoreboard["recommendedActions"]])

    lines.extend(["", "## Recent Events"])
    if events_7d:
        for row in events_7d[-10:]:
            lead = row.lead_id if row.lead_id else "n/a"
            value = f" (${round(row.value_usd, 2)})" if row.value_usd else ""
            notes = f" - {row.notes}" if row.notes else ""
            lines.append(
                f"- {row.ts.isoformat(timespec='seconds')} | {row.event} | lead={lead} | {row.channel}/{row.source}{value}{notes}"
            )
    else:
        lines.append("- No events in this window.")

    report_file.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate market validation scoreboard and digest.")
    parser.add_argument("--days", type=int, default=7, help="Rolling window days (default: 7)")
    parser.add_argument(
        "--coord-dir",
        default=str(Path(__file__).resolve().parents[1]),
        help="Coordination directory (default: script parent/..)",
    )
    args = parser.parse_args()

    coord_dir = Path(args.coord_dir).resolve()
    events_file = coord_dir / "market-validation-events.jsonl"
    scoreboard_file = coord_dir / "market-validation-scoreboard.json"
    status_board_file = coord_dir / "status-board.json"
    reports_dir = coord_dir / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    all_events = load_events(events_file)
    now = datetime.now().astimezone()
    cutoff = now - timedelta(days=args.days)
    window_events = [row for row in all_events if row.ts >= cutoff]

    all_time = aggregate(all_events)
    window = aggregate(window_events)
    blockers = build_blockers(window["funnel"])
    recommendations = build_recommendations(window["funnel"], blockers)

    goals = {
        "signupTarget": int(os.getenv("MV_GOAL_SIGNUPS", "50")),
        "payingCustomersTarget": int(os.getenv("MV_GOAL_PAYING_CUSTOMERS", "10")),
        "mrrTargetUsd": float(os.getenv("MV_GOAL_MRR_USD", "290")),
    }

    progress = {
        "signupsPct": safe_ratio(all_time["funnel"]["captured"], goals["signupTarget"]),
        "payingCustomersPct": safe_ratio(
            all_time["revenue"]["payingCustomers"], goals["payingCustomersTarget"]
        ),
        "mrrPct": safe_ratio(int(round(all_time["revenue"]["netNewMrrUsd"])), int(goals["mrrTargetUsd"])),
    }

    scoreboard = {
        "generatedAt": iso_now(),
        "windowDays": args.days,
        "eventCount": {
            "window": len(window_events),
            "allTime": len(all_events),
        },
        "goals": goals,
        "window": window,
        "allTime": all_time,
        "progress": progress,
        "blockers": blockers,
        "recommendedActions": recommendations,
        "recentEvents": recent_events_payload(window_events),
    }

    write_json(scoreboard_file, scoreboard)
    update_status_board(
        status_board_file,
        {
            "lastDigestAt": scoreboard["generatedAt"],
            "windowDays": scoreboard["windowDays"],
            "leadsCaptured7d": window["funnel"]["captured"],
            "demos7d": window["funnel"]["demos"],
            "paid7d": window["funnel"]["paid"],
            "netNewMrr7dUsd": window["revenue"]["netNewMrrUsd"],
            "allTimeMrrUsd": all_time["revenue"]["netNewMrrUsd"],
            "goalProgressPct": progress,
        },
    )

    report_file = reports_dir / f"market-validation-{now.date().isoformat()}.md"
    write_markdown_report(report_file, scoreboard, window_events)

    print(f"Generated scoreboard: {scoreboard_file}")
    print(f"Generated digest: {report_file}")
    print(
        "Summary: "
        f"captured={window['funnel']['captured']}, "
        f"demos={window['funnel']['demos']}, "
        f"paid={window['funnel']['paid']}, "
        f"net_new_mrr=${window['revenue']['netNewMrrUsd']}"
    )


if __name__ == "__main__":
    main()
