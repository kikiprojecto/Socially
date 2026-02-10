# 💰 $5 Budget Deployment on Base

## Budget Breakdown ($5 Total)

| Item | Cost | Notes |
|------|------|-------|
| Bounty Reward | $3.50 | 0.0087 ETH (attractive but affordable) |
| Gas - Create | $0.30 | Base is cheap (~$0.10-0.50) |
| Gas - Accept | $0.30 | Winner payment transaction |
| poidh Fee (2.5%) | $0.09 | Automatically deducted |
| Claude API | $0.20 | ~3-5 evaluations |
| Buffer | $0.61 | Safety margin |
| **TOTAL** | **$5.00** | ✅ Fits budget perfectly |

## Optimal Bounty Design ($3.50 reward)

**Title:** "Show me a creative POIDH moment!"

**Description:**

"Take a photo with a stranger holding a handwritten 'POIDH' sign.
Be creative with the location or pose. Most creative wins!

Requirements:
✅ You + stranger in photo
✅ Clear 'POIDH' sign visible
✅ Public location
✅ Both people visible

Reward: 0.0087 ETH (~$3.50)"

## Deployment Steps

### 1. Get Base ETH (Mainnet)

**Option A: Bridge from Ethereum**
- Use https://bridge.base.org
- Bridge 0.0125 ETH (~$5)
- Takes 10-20 minutes

**Option B: Buy directly on Base**
- Use Coinbase (if available)
- Some DEXs support direct Base purchases

### 2. Configure Bot

Edit `.env`:
```env
MOCK_MODE=false
NETWORK=base
ANTHROPIC_API_KEY=your_key
```

### 3. Deploy

```bash
npm run setup  # Verify wallet
npm start      # Creates bounty
```

### 4. Promote (Free!)

Post in:
- poidh Discord: https://discord.gg/poidh
- poidh Twitter: Tag @poidhxyz
- Farcaster: /poidh channel
- Base ecosystem chats

Template:

"🎯 New bounty on @poidhxyz!
Show me creative POIDH moments → 0.0087 ETH
[bounty link]
#Base #POIDH"

### 5. Timeline

- Deploy: 5 minutes
- Promotion: 10 minutes
- **Waiting: 24-48 hours**
- Evaluation: 5 minutes
- Total: 1-2 days

### 6. What to Expect

**Realistic Outcomes:**
- 🎯 Best case: 5-10 submissions
- 📊 Likely: 3-5 submissions
- ⚠️ Worst case: 1-2 submissions

All outcomes are valid as long as submissions are from real strangers.
