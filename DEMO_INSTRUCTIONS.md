# 🎬 DEMO INSTRUCTIONS - Run Mock Mode

## Complete Autonomous Demo in 2 Minutes

### Step 1: Setup (One-Time)

```bash
npm install
npm run test:mock
```

### Step 2: Configure Mock Mode

Copy env template:
```bash
copy .env.example .env
```

Edit `.env`:
```env
MOCK_MODE=true
ANTHROPIC_API_KEY=your_real_anthropic_key_here
```

### Step 3: Run Demo

```bash
npm start
```

### Step 4: Submit a Test Claim

Use any HTTP client to POST a claim:

`POST http://localhost:3001/api/mock/add-claim`

Body:
```json
{
  "bountyId": "<use bountyId from logs>",
  "description": "Test submission - stranger holding POIDH sign",
  "imageURI": "ipfs://QmAnyStringWorksInMock"
}
```

### Step 5: Verify

Check logs:
```bash
type logs\decisions-*.jsonl
```

You should see:
- Winner selection log entry
- Scores and reasoning from Claude
- Payment simulated tx hash
