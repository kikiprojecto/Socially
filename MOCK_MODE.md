# 🎭 Mock Mode - Complete Testing Without Blockchain

## Overview

Mock Mode enables full autonomous bounty cycle demonstration **without blockchain transactions**.

Perfect for:
- ✅ Testing AI evaluation logic
- ✅ Demonstrating winner selection
- ✅ Creating bounty submission proof
- ✅ Zero-cost testing (no ETH needed)

## What's Real vs Mock

| Feature | Mock Mode | Production Mode |
|---------|-----------|-----------------|
| **AI Evaluation** | ✅ **REAL Claude API** | ✅ **REAL Claude API** |
| **Winner Selection** | ✅ **REAL Logic** | ✅ **REAL Logic** |
| **Decision Logging** | ✅ **REAL Logs** | ✅ **REAL Logs** |
| **Blockchain TX** | ❌ Simulated | ✅ Real on-chain |
| **IPFS Storage** | ❌ Test images | ✅ Real Pinata |
| **ETH Required** | ❌ None | ✅ Yes |
| **Contract Address** | ❌ Not needed | ✅ Required |

## Quick Start

### 1. Enable Mock Mode

Edit `.env`:
```env
MOCK_MODE=true
ANTHROPIC_API_KEY=your_real_key_here
```

### 2. Run Setup
```bash
npm run setup
```

### 3. Start Bot
```bash
npm start
```

### 4. Watch the Flow

The bot will automatically:
1️⃣  Initialize (5 seconds)
✅ Load wallet (no funding needed)
✅ Initialize mock contract
✅ Connect Claude AI (real)
2️⃣  Create Bounty (2 seconds)
✅ Generate mock bounty
✅ Simulate on-chain transaction
✅ Start monitoring
3️⃣  Generate Submissions (10 seconds wait)
📥 Create 3 test submissions
📥 Different quality levels
📥 Realistic descriptions
4️⃣  AI Evaluation (15-30 seconds)
🤖 REAL Claude analysis
🤖 Score each submission /100
🤖 Provide reasoning
5️⃣  Select Winner (instant)
🏆 Rank by score
🏆 Select highest (≥70)
🏆 Log transparent decision
6️⃣  Pay Winner (2 seconds)
💰 Simulate payment
💰 Log transaction
✅ Complete cycle

**Total time: ~1-2 minutes**

## Verify Results

Check logs:
```bash
# View decisions
cat logs/decisions-*.jsonl

# View full log
type logs\bot-*.jsonl | more
```

## Switch to Production

To use real blockchain:

1. Set `MOCK_MODE=false` in `.env`
2. Add `POIDH_EVM_CONTRACT_ADDRESS` (if testnet)
3. Fund wallet with ETH
4. Run `npm start`

## Troubleshooting

**Issue: "ANTHROPIC_API_KEY not set"**
- Mock mode requires REAL Claude API key
- AI evaluation is NOT mocked
- Get key from: https://console.anthropic.com/

**Issue: Bot exits immediately**
- Check `.env` has `MOCK_MODE=true`
- Verify `ANTHROPIC_API_KEY` is set
- Run `npm run setup` first

**Issue: No submissions generated**
- Wait full 10 seconds after bounty creation
- Check logs for errors

## For Bounty Submission

Mock mode provides perfect proof:
- ✅ Complete autonomous cycle
- ✅ Real AI evaluation results
- ✅ Transparent decision logs
- ✅ Professional demonstration

Include in `BOUNTY_CLAIM.md`:
- Screenshots of mock run
- Decision logs from `logs/decisions-*.jsonl`
- Note that AI evaluation is REAL (not mocked)
