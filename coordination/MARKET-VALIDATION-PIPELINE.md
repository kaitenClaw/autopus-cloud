# Market Validation Pipeline

This pipeline turns raw outreach/sales events into a daily KPI digest for OCaaS.

## Files

- `market-validation-events.jsonl`: append-only event log
- `market-validation-scoreboard.json`: computed KPI snapshot
- `reports/market-validation-YYYY-MM-DD.md`: human digest
- `scripts/add-validation-event.py`: event writer helper
- `scripts/market-validation-digest.py`: KPI/digest generator

## Event Schema (JSONL)

Each line in `market-validation-events.jsonl`:

```json
{
  "ts": "2026-02-17T22:00:00+08:00",
  "event": "lead_captured",
  "leadId": "lead-1708188000",
  "source": "sight",
  "channel": "telegram",
  "campaign": "ocaas-week2",
  "valueUsd": 0,
  "notes": "Inbound founder from growth thread."
}
```

Allowed `event` values:

- `lead_captured`
- `lead_qualified`
- `demo_booked`
- `proposal_sent`
- `trial_started`
- `paid_converted`
- `churned`
- `refund`

## Quick Usage

### 1) Log events

```bash
python3 coordination/scripts/add-validation-event.py \
  --event lead_captured \
  --source sight \
  --channel telegram \
  --campaign ocaas-week2 \
  --notes "Inbound from founder group"
```

```bash
python3 coordination/scripts/add-validation-event.py \
  --event paid_converted \
  --lead-id lead-1708188000 \
  --source forge \
  --channel dm \
  --campaign ocaas-week2 \
  --value-usd 29 \
  --notes "Starter plan activated"
```

### 2) Generate digest

```bash
python3 coordination/scripts/market-validation-digest.py --days 7
```

Outputs:

- `coordination/market-validation-scoreboard.json`
- `coordination/reports/market-validation-<today>.md`
- updates `coordination/status-board.json` with `marketValidation` snapshot

## Goals (defaults)

The digest uses these default targets:

- Signups: `50`
- Paying customers: `10`
- MRR (USD): `290`

Override with env vars:

```bash
MV_GOAL_SIGNUPS=80 MV_GOAL_PAYING_CUSTOMERS=15 MV_GOAL_MRR_USD=1200 \
python3 coordination/scripts/market-validation-digest.py --days 7
```

## Operational Cadence

- SIGHT logs lead and qualification events.
- FORGE logs demo/proposal/trial/paid events.
- PULSE runs the digest at least once per day and posts key blockers/actions.
- PRIME uses `reports/market-validation-*.md` for go/kill decisions.
