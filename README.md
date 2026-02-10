# 🤖 Socially - Autonomous AI Bounty Bot for poidh

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node: 18+](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Network: Base | Arbitrum](https://img.shields.io/badge/Network-Base%20%7C%20Arbitrum-blue)]()
[![Tests: Passing](https://img.shields.io/badge/tests-passing-brightgreen)]()

> **Fully autonomous AI-powered bounty bot for the poidh platform (poidh.xyz)**

Creates bounties, evaluates submissions using Claude AI vision, selects winners transparently, and pays rewards automatically—**zero human intervention required**.

Built for the [poidh AI bounty challenge](https://poidh.xyz). See [BOUNTY_CLAIM.md](BOUNTY_CLAIM.md) for complete proof.

---

## 🎯 Features

- ✅ **100% Autonomous** - Complete bounty lifecycle without human input
- ✅ **Multi-Chain Support** - Works on Base, Arbitrum, and Degen Chain  
- ✅ **AI-Powered Evaluation** - Claude Sonnet 4 vision API analyzes submissions
- ✅ **IPFS Integration** - Seamless image storage via Pinata (same as poidh)
- ✅ **Transparent Decisions** - All evaluations logged with reasoning
- ✅ **Real-Time Dashboard** - WebSocket updates for live monitoring
- ✅ **Production Ready** - Docker support, comprehensive tests, deployment guides

---

## 🚀 Quick Start

### Option A: Quick Demo (Mock Mode - No Blockchain Required)

**Perfect for testing and demonstration:**
```bash
# 1. Clone and install
git clone https://github.com/kikiprojecto/Socially.git
cd Socially
npm install

# 2. Enable mock mode
cp .env.example .env
# Edit .env:
# - Set MOCK_MODE=true
# - Add your ANTHROPIC_API_KEY

# 3. Run demo
npm start

# Bot will automatically:
# - Create mock bounty
# - Generate 3 test submissions
# - Evaluate with REAL Claude AI
# - Select winner transparently
# - Complete in ~2 minutes
```
**No ETH needed | No contract address needed | Perfect for demo**

See [MOCK_MODE.md](MOCK_MODE.md) for details.

---

### Option B: Production Mode (Real Blockchain)

```bash
# 1. Clone and install
git clone https://github.com/kikiprojecto/Socially.git
cd Socially
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env: Add ANTHROPIC_API_KEY, PINATA keys, choose NETWORK

# 3. Run setup wizard
npm run setup

# 4. Fund wallet with ETH
# Wallet address shown in setup output
# Testnet faucet: https://www.alchemy.com/faucets/base-sepolia

# 5. Start the bot
npm start
```

**The bot will automatically:**
1. ✅ Create a bounty on poidh smart contract
2. 👀 Monitor for claim submissions via blockchain events
3. 🤖 Evaluate submissions with Claude AI when ready
4. 🏆 Select winner based on transparent scoring
5. 💰 Pay winner automatically by accepting claim on-chain

---

## 📖 How It Works

### Complete Autonomous Cycle




┌──────────────────────────────────────────────┐
│  1. INITIALIZE                                │
│  ├─ Load EVM wallet                          │
│  ├─ Connect to Base/Arbitrum/Degen          │
│  ├─ Initialize Claude AI client             │
│  └─ Connect to poidh smart contract         │
└──────────────────────────────────────────────┘
↓
┌──────────────────────────────────────────────┐
│  2. CREATE BOUNTY                            │
│  ├─ Select template (real-world task)       │
│  ├─ Call poidh.createBounty()              │
│  ├─ Escrow ETH on-chain                    │
│  └─ Bounty goes live on poidh.xyz          │
└──────────────────────────────────────────────┘
↓
┌──────────────────────────────────────────────┐
│  3. MONITOR SUBMISSIONS                       │
│  ├─ Listen for ClaimSubmitted events        │
│  ├─ Download images from IPFS/Pinata       │
│  └─ Queue submissions for evaluation        │
└──────────────────────────────────────────────┘
↓
┌──────────────────────────────────────────────┐
│  4. AI EVALUATION                            │
│  ├─ Preprocess images (resize, compress)   │
│  ├─ Send to Claude vision API              │
│  ├─ Score: Authenticity (40) + Compliance  │
│  │         (30) + Quality (20) + Validity   │
│  │         (10) = Total /100               │
│  └─ Log evaluation with reasoning          │
└──────────────────────────────────────────────┘
↓
┌──────────────────────────────────────────────┐
│  5. SELECT WINNER                            │
│  ├─ Rank submissions by score              │
│  ├─ Filter: score >= 70 threshold          │
│  ├─ Select highest scorer                  │
│  └─ Log transparent decision                │
└──────────────────────────────────────────────┘
↓
┌──────────────────────────────────────────────┐
│  6. PAY WINNER                               │
│  ├─ Call poidh.acceptClaim()               │
│  ├─ Smart contract transfers ETH to winner │
│  ├─ Transfer claim NFT to bot              │
│  └─ Log transaction + completion           │
└──────────────────────────────────────────────┘

---

## 🧠 AI Evaluation Criteria

Each submission is scored 0-100 across four criteria:

### 1. Authenticity (0-40 points)
- Real, unedited photo/video
- No AI generation detected
- Genuine real-world action

### 2. Compliance (0-30 points)
- Meets ALL stated requirements
- Required elements clearly visible
- Task correctly completed

### 3. Quality (0-20 points)
- Clear, well-composed media
- Strong proof of completion
- Professional presentation

### 4. Validity (0-10 points)
- Appears recent/timely
- Within submission deadline
- Legitimate user interaction

**Minimum winning threshold: 70/100**

Winner selection is fully autonomous and transparently logged.

---

## 🌐 Supported Networks

| Network | Chain ID | Contract Address | Explorer |
|---------|----------|------------------|----------|
| **Base** | 8453 | `0xb502c5856f7244dccdd0264a541cc25675353d39` | [Basescan](https://basescan.org) |
| **Arbitrum** | 42161 | `0x0aa50ce0d724cc28f8f7af4630c32377b4d5c27d` | [Arbiscan](https://arbiscan.io) |
| **Degen** | 666666666 | `0x2445BfFc6aB9EEc6C562f8D7EE325CddF1780814` | [Degen Explorer](https://explorer.degen.tips) |
| **Base Sepolia** | 84532 | *Set via env var* | [Testnet Explorer](https://sepolia.basescan.org) |

---

## 📦 Project Structure

Socially/
├── src/
│   ├── bot/
│   │   └── BountyBot.js         # Main orchestrator
│   ├── blockchain/
│   │   ├── wallet.js            # EVM wallet management
│   │   ├── PoidhContract.js     # poidh smart contract interface
│   │   └── networks.js          # Network configurations
│   ├── ai/
│   │   ├── ClaudeEvaluator.js   # AI vision evaluation
│   │   └── DecisionEngine.js    # Winner selection logic
│   ├── storage/
│   │   ├── IPFSClient.js        # Pinata IPFS integration
│   │   ├── Logger.js            # Transparent logging
│   │   └── Database.js          # Submission storage
│   ├── api/
│   │   ├── server.js            # REST API + WebSocket
│   │   ├── routes/              # API endpoints
│   │   └── websocket.js         # Real-time updates
│   └── index.js                 # Entry point
├── config/
│   ├── bounty-templates.json    # Bounty templates
│   └── networks.json            # Chain configurations
├── scripts/
│   ├── setup.js                 # Setup wizard
│   ├── deploy.js                # Deployment script
│   └── test-integration.js      # Integration tests
├── tests/
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── e2e/                     # End-to-end tests
└── logs/                        # Auto-generated logs



---

## 🔒 Security

- **Private Keys**: Encrypted at rest, never committed
- **API Keys**: Environment variables only
- **Input Validation**: All user inputs sanitized
- **Rate Limiting**: API endpoints protected
- **Error Handling**: Comprehensive try-catch blocks
- **Audit Trail**: All decisions logged transparently

### Best Practices
- Use testnet (Base Sepolia) before mainnet
- Fund wallet with only required ETH amount
- Rotate API keys periodically
- Monitor logs for anomalies
- Keep dependencies updated

---

## 🧪 Testing
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

**Test Coverage:** >70%  
**All tests must pass before deployment**

---

## 🚢 Deployment

### Local Development
```bash
npm run setup
npm start
```

### Docker Deployment
```bash
docker-compose up -d
```

### Cloud Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- AWS EC2 deployment
- Digital Ocean deployment
- Heroku deployment
- PM2 process management
- Production monitoring

---

## 📊 Monitoring & Logs

### Log Files
- `logs/bot-YYYY-MM-DD.jsonl` - All bot activities
- `logs/decisions.jsonl` - Winner selection decisions

### Real-Time Monitoring
- **WebSocket**: Connect to `ws://localhost:3001` for live events
- **API**: Health check at `http://localhost:3001/api/health`
- **Dashboard**: (Optional) Run web UI for visual monitoring

### Key Metrics
- Bounties created
- Submissions received
- AI evaluations completed
- Winners paid
- Success rate

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

---

## 📝 License

[MIT License](LICENSE) - see LICENSE file for details

---

## 🏆 poidh Bounty Submission

This bot was built for the poidh AI bounty challenge.

### Requirements Checklist
- ✅ 100% open source
- ✅ Self-custodial wallet
- ✅ Creates bounties autonomously
- ✅ Monitors submissions automatically
- ✅ AI-powered winner selection
- ✅ Transparent decision logging
- ✅ Automatic payment to winner
- ✅ Real-world action focus
- ✅ Working demo with proof

See [BOUNTY_CLAIM.md](BOUNTY_CLAIM.md) for complete proof including:
- Transaction signatures
- Evaluation logs
- Winner payment confirmation
- Testnet demo evidence

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/kikiprojecto/Socially/issues)
- **Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **poidh Platform**: [poidh.xyz](https://poidh.xyz)
- **poidh Guide**: [Beginner's Guide](https://words.poidh.xyz/poidh-beginner-guide)

---

## 🙏 Acknowledgments

- **poidh team** for creating the platform
- **Anthropic** for Claude AI
- **Pinata** for IPFS infrastructure
- **Base/Arbitrum** for EVM infrastructure

---

**Built with ❤️ for the poidh community**

VERIFY:
- File is clean, professional, no fluff
- All badges/links work
- Structure matches template
- No false claims
- <2000 lines total
