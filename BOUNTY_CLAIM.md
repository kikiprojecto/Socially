# Bounty Claim (Socially)

This file is a template for preparing a bounty claim package.

## Checklist

- [ ] Open source repository
- [ ] Self-custodial wallet
- [ ] Autonomous bounty creation
- [ ] Automatic submission monitoring
- [ ] AI evaluation with transparent decision logging
- [ ] Automatic winner payout (or dry-run evidence)
- [ ] Public dashboard
- [ ] Deployment guide

## Evidence to attach

### 1) Bounty creation

- Screenshot of dashboard showing a new bounty created
- Log excerpt from `logs/bot-YYYY-MM-DD.jsonl`

### 2) Submissions received

- Log excerpt showing new submissions arriving
- Any links to media proving real-world actions

### 3) AI evaluation

- Log excerpt showing evaluation attempts
- Example evaluation JSON (scores + reasoning)

### 4) Winner selection

- Log excerpt from `logs/decisions-YYYY-MM-DD.jsonl` or `logs/decisions.jsonl`

### 5) Payment

- Transaction signature + Solscan link (if not dry-run)
- Or show `DRY_RUN` flow if using `DRY_RUN_PAYMENTS=true`
- If POIDH claim addresses are EVM addresses, attach evidence of `DRY_RUN_PAYMENTS=true` + decision logs

### 6) POIDH Indexer integration

- Log excerpt showing indexer integration with POIDH
- Example indexer query results (e.g., `GET /bounty/claims/:chainId/:bountyId`)

## Notes

- The worker provides a real-time event stream via `GET /events` which the dashboard proxies via `GET /api/events`.
- Decision-making is logged as JSONL for auditability.
- Evidence capture templates are in `evidence/README.txt` and `evidence/CAPTURE_CHECKLIST.txt`.
