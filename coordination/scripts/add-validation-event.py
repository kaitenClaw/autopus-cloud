#!/usr/bin/env python3
"""Append a market-validation event into coordination JSONL log."""

from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path


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


def iso_now() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def main() -> None:
    parser = argparse.ArgumentParser(description="Append one market-validation event.")
    parser.add_argument("--event", required=True, choices=sorted(VALID_EVENTS))
    parser.add_argument("--lead-id", dest="lead_id", default=None)
    parser.add_argument("--source", default="manual")
    parser.add_argument("--channel", default="unknown")
    parser.add_argument("--campaign", default="default")
    parser.add_argument("--value-usd", dest="value_usd", type=float, default=0.0)
    parser.add_argument("--notes", default="")
    parser.add_argument("--ts", default=None, help="ISO timestamp. Defaults to now.")
    parser.add_argument(
        "--coord-dir",
        default=str(Path(__file__).resolve().parents[1]),
        help="Coordination directory (default: script parent/..)",
    )
    args = parser.parse_args()

    coord_dir = Path(args.coord_dir).resolve()
    events_file = coord_dir / "market-validation-events.jsonl"
    events_file.parent.mkdir(parents=True, exist_ok=True)

    event_ts = args.ts or iso_now()
    lead_id = args.lead_id
    if args.event == "lead_captured" and not lead_id:
        lead_id = f"lead-{int(datetime.now().timestamp())}"

    payload = {
        "ts": event_ts,
        "event": args.event,
        "leadId": lead_id,
        "source": args.source,
        "channel": args.channel,
        "campaign": args.campaign,
        "valueUsd": round(args.value_usd, 2),
        "notes": args.notes,
    }

    with events_file.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")

    print(f"Appended event to {events_file}")
    print(json.dumps(payload, ensure_ascii=False))


if __name__ == "__main__":
    main()
