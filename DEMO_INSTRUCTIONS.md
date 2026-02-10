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

### Step 4: Verify

Check logs:
```bash
type logs\decisions-*.jsonl
```

You should see:
- Winner selection log entry
- Scores and reasoning from Claude
- Payment simulated tx hash
