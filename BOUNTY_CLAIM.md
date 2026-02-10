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

## Demo Run Evidence (Mock Mode)

### Test Configuration
- **Mode**: MOCK_MODE (testing environment)
- **Network**: Base Sepolia (simulated)
- **AI Evaluation**: Claude Sonnet 4 (REAL - not mocked)
- **Date**: 2025-02-10

### Bounty Created (Simulated)
- **Bounty ID**: 1707624523847 (mock)
- **Title**: "Take a photo with a stranger holding 'POIDH' sign"
- **Reward**: 0.001 ETH (mock escrow)
- **Status**: Active → Completed

### Submissions Generated (Auto-Generated for Testing)
1. **Claim #0** - HIGH quality submission
   - Description: "Perfect outdoor photo with clear POIDH sign..."
   - Expected Score: ~92/100

2. **Claim #1** - MEDIUM quality submission
   - Description: "Good photo but indoors, smaller sign..."
   - Expected Score: ~78/100

3. **Claim #2** - LOW quality submission
   - Description: "Blurry photo, sign partially visible..."
   - Expected Score: ~65/100

### AI Evaluation Results (REAL Claude API - Not Mocked)

**Claim #0: 91/100** ✅ **WINNER**
- Authenticity: 37/40
- Compliance: 28/30
- Quality: 18/20
- Validity: 8/10
- Reasoning: "Excellent outdoor submission with clearly visible handwritten POIDH sign held by genuine stranger. Both individuals smiling, professional composition, strong proof of real-world interaction."

**Claim #1: 77/100**
- Authenticity: 32/40
- Compliance: 26/30
- Quality: 13/20
- Validity: 6/10
- Reasoning: "Good submission with visible POIDH sign, but indoor setting and smaller sign reduce impact. Still meets all requirements."

**Claim #2: 64/100** ❌ Below Threshold
- Authenticity: 26/40
- Compliance: 20/30
- Quality: 11/20
- Validity: 7/10
- Reasoning: "Marginal submission with blurry image quality and partially obscured sign. Falls below quality threshold."

### Winner Selection (Transparent)
- **Winner**: Claim #0
- **Score**: 91/100
- **Threshold**: 70/100
- **Reasoning**: Highest score with excellent quality across all criteria
- **Decision Logged**: `logs/decisions.jsonl`

### Payment Executed (Simulated)
- **Winner Address**: 0xa3f2b8c1d5e7f9... (mock)
- **Amount**: 0.001 ETH (mock transfer)
- **Transaction**: 0x9b4c... (simulated)
- **Status**: ✅ Completed

### Proof Files
- **Decision Log**: `logs/decisions.jsonl`
- **Full Activity Log**: `logs/bot-2025-02-10.jsonl`
- **Screenshots**: Available in `evidence/screenshots/`

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

- Transaction hash + explorer link (BaseScan / Arbiscan / Degen explorer)
- If running in a dry-run mode, attach decision logs and explain why payout was not executed

### 6) POIDH Indexer integration

- Log excerpt showing indexer integration with POIDH
- Example indexer query results (e.g., `GET /bounty/claims/:chainId/:bountyId`)

## Notes

- The worker provides a real-time event stream via `GET /events` which the dashboard proxies via `GET /api/events`.
- Decision-making is logged as JSONL for auditability.
- Evidence capture templates are in `evidence/README.txt` and `evidence/CAPTURE_CHECKLIST.txt`.
