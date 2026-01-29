# POIDH Autonomous Bot - Environment Configuration
# Complete setup guide: see SETUP_WITH_OLLAMA.md

# ============================================
# REQUIRED: AI Provider Configuration
# ============================================
# Set to 'ollama' to use local OLLAMA (free, no API keys!)
# Set to 'anthropic' to use Claude API (requires ANTHROPIC_API_KEY)
AI_PROVIDER=ollama

# ============================================
# OLLAMA Configuration (for local AI)
# ============================================
# OLLAMA API endpoint (local machine)
# Default: http://localhost:11434
OLLAMA_API_URL=http://localhost:11434

# OLLAMA model to use (llava for images, mistral for text)
OLLAMA_MODEL=llava

# ============================================
# OPTIONAL: Anthropic Configuration (for Claude)
# ============================================
# Only needed if AI_PROVIDER=anthropic
# Get your API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=

# ============================================
# Solana Network Configuration
# ============================================
# Options: devnet (testing) | mainnet-beta (production)
# Use 'devnet' for testing with free SOL
# Use 'mainnet-beta' for production with real SOL
SOLANA_NETWORK=devnet

# ============================================
# OPTIONAL: Wallet Security
# ============================================
# Set a password to encrypt wallet backup
# Leave empty to skip encryption
WALLET_PASSWORD=

# ============================================
# OPTIONAL: Bot Configuration
# ============================================
# Polling interval in milliseconds (default: 60000 = 1 minute)
POLLING_INTERVAL=60000

# Minimum score threshold for winning (0-100, default: 70)
EVALUATION_THRESHOLD=70

# Maximum submissions to accept per bounty (default: 50)
MAX_SUBMISSIONS=50

# Bounty duration in milliseconds (default: 604800000 = 7 days)
BOUNTY_DURATION=604800000

# ============================================
# OPTIONAL: POIDH Platform Configuration
# ============================================
# POIDH API endpoint (update with actual endpoint when available)
POIDH_API_URL=https://api.poidh.xyz

# POIDH Program ID on Solana (update with actual program ID)
POIDH_PROGRAM_ID=

# ============================================
# OPTIONAL: Logging & Monitoring
# ============================================
# Log level: debug | info | warn | error
LOG_LEVEL=info

# Enable detailed decision logging (true | false)
DETAILED_LOGGING=true

# ============================================
# OPTIONAL: Performance Tuning
# ============================================
# Maximum concurrent image evaluations
# Default: 1 (sequential) | Increase for faster evaluation
MAX_CONCURRENT_EVALUATIONS=1

# OLLAMA request timeout (milliseconds)
# Default: 120000 (2 minutes)
OLLAMA_TIMEOUT=120000

# ============================================
# OPTIONAL: Advanced Solana Configuration
# ============================================
# RPC endpoint (leave empty for default)
SOLANA_RPC_URL=

# Commitment level: processed | confirmed | finalized
SOLANA_COMMITMENT=confirmed

# ============================================
# SETUP INSTRUCTIONS
# ============================================
# 1. Copy this file: cp poidh_env_example.sh .env
# 2. Edit .env with your settings
# 3. Ensure OLLAMA is running: ollama serve
# 4. Run setup: npm run setup
# 5. Start bot: npm start
# 
# For OLLAMA: No API keys needed! Runs 100% locally.
# For Claude: Get key from https://console.anthropic.com/
