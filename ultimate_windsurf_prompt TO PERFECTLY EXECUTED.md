# 🎯 ULTIMATE WINDSURF EXECUTION PROMPT
## COMPLETE AUTONOMOUS TRANSFORMATION - ZERO ERRORS GUARANTEED

---

## ⚠️ CRITICAL INSTRUCTIONS FOR WINDSURF

**READ THIS ENTIRE PROMPT BEFORE STARTING. EXECUTE EVERYTHING IN ONE CONTINUOUS SESSION.**

### 🔴 MANDATORY EXECUTION RULES:

1. **DO NOT PAUSE** - Execute all tasks continuously without stopping
2. **DO NOT ASK FOR CONFIRMATION** - Make all decisions autonomously
3. **FIX ALL ERRORS IMMEDIATELY** - If any error occurs, solve it and continue
4. **VERIFY EACH STEP** - Run tests/checks after each major change
5. **LOG EVERYTHING** - Show what you're doing at each step
6. **NO PLACEHOLDERS** - Write complete, working code every time
7. **PRODUCTION QUALITY** - All code must be deployment-ready
8. **ZERO WARNINGS** - Fix all linting, TypeScript, and build warnings

---

## 🚀 EXECUTE THIS COMPLETE TRANSFORMATION

### **CONTEXT:**

You are transforming the `Socially` project from a Solana-based bot into a production-ready autonomous bounty bot for the **poidh platform** (poidh.xyz).

**CRITICAL FACTS:**
- poidh runs on **Arbitrum, Base, Degen Chain** (EVM) - NOT Solana
- poidh uses **IPFS via Pinata** for image storage
- poidh smart contracts handle **ETH escrow and automatic payments**
- Our bot must **create bounties, monitor claims, evaluate with AI, and pay winners**

**CURRENT STATE:**
- Project uses Solana (WRONG - must be replaced with EVM)
- Files scattered in root directory (needs organization)
- Missing poidh contract integration
- No IPFS support
- Incomplete documentation

**GOAL:**
Transform this into the **ABSOLUTE BEST** poidh autonomous bot that will **WIN the bounty competition**.

---

## 📋 PHASE 1: CRITICAL FIXES (DO THIS FIRST!)

### **TASK 1.1: REMOVE ALL SOLANA DEPENDENCIES**

```bash
# Execute these commands:
npm uninstall @solana/web3.js @solana/spl-token

# If any files import from @solana, DELETE those imports immediately
```

**VERIFY:** Run `npm ls` and confirm ZERO Solana packages remain.

---

### **TASK 1.2: INSTALL CORRECT DEPENDENCIES**

Update `package.json` with EXACTLY this:

```json
{
  "name": "socially-poidh-bot",
  "version": "1.0.0",
  "description": "Autonomous AI-powered bounty bot for poidh platform",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "NODE_OPTIONS=--experimental-vm-modules jest",
    "test:watch": "npm test -- --watch",
    "lint": "eslint src/**/*.js",
    "format": "prettier --write \"src/**/*.{js,json}\"",
    "build:web": "cd web && npm run build",
    "setup": "node scripts/setup.js"
  },
  "dependencies": {
    "ethers": "^6.9.0",
    "@anthropic-ai/sdk": "^0.32.1",
    "axios": "^1.7.9",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ws": "^8.14.2",
    "dotenv": "^16.4.7",
    "ipfs-http-client": "^60.0.0",
    "form-data": "^4.0.0",
    "winston": "^3.11.0",
    "sharp": "^0.33.1"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**EXECUTE:**
```bash
npm install
```

**VERIFY:** Run `npm install` completes with ZERO errors. If any errors occur, fix them immediately by:
- Clearing node_modules: `rm -rf node_modules package-lock.json`
- Running `npm install` again
- If specific package fails, try alternative version

---

### **TASK 1.3: DELETE OLD FILES**

**DELETE these files from root directory:**
- `poidh_main_bot.js`
- `poidh_wallet.js`
- `poidh_bounty_bot.tsx`
- `poidh_package_json.json`
- `poidh_setup_script.js`
- `poidh_env_example.sh`
- `poidh_gitignore.txt`
- Any other `poidh_*` files

**VERIFY:** Run `ls | grep poidh_` returns NOTHING.

---

## 📋 PHASE 2: CREATE PERFECT PROJECT STRUCTURE

### **TASK 2.1: CREATE FOLDER STRUCTURE**

Execute this EXACTLY:

```bash
# Backend structure
mkdir -p src/bot
mkdir -p src/blockchain
mkdir -p src/ai
mkdir -p src/storage
mkdir -p src/api/routes
mkdir -p src/utils

# Config
mkdir -p config

# Scripts
mkdir -p scripts

# Tests
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/fixtures

# Logs (with .gitkeep)
mkdir -p logs
touch logs/.gitkeep

# Evidence
mkdir -p evidence/screenshots
mkdir -p evidence/logs
mkdir -p evidence/transactions
```

**VERIFY:** All directories exist with `ls -R src/`

---

### **TASK 2.2: CREATE .gitignore**

Create `.gitignore` with EXACTLY this content:

```gitignore
# Dependencies
node_modules/
package-lock.json

# Environment
.env
.env.local
.env.*.local

# Wallet files (CRITICAL!)
wallet.json
wallet.enc
*.key
*.pem
private-key.txt

# Logs
logs/*.log
logs/*.jsonl
*.log

# Build
dist/
build/
web/dist/
web/build/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/

# Temp
tmp/
temp/
*.tmp

# Uploads
uploads/
downloads/
```

**VERIFY:** File exists and has proper content.

---

## 📋 PHASE 3: IMPLEMENT BLOCKCHAIN LAYER (CRITICAL!)

### **TASK 3.1: CREATE WALLET MANAGER**

Create `src/blockchain/wallet.js` with COMPLETE implementation:

```javascript
/**
 * EVM Wallet Management for poidh Bot
 * Handles Ethereum wallet creation, loading, and encryption
 */

import { Wallet, JsonRpcProvider } from 'ethers';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WALLET_PATH = path.join(__dirname, '../../wallet.json');

/**
 * Load existing wallet or create new one
 * @returns {Wallet} Ethereum wallet instance
 */
export function loadOrCreateWallet() {
  if (fs.existsSync(WALLET_PATH)) {
    console.log('📂 Loading existing wallet...');
    try {
      const data = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf8'));
      
      // Decrypt if encrypted
      let privateKey;
      if (data.encrypted && process.env.WALLET_PASSWORD) {
        privateKey = decrypt(data.privateKey, process.env.WALLET_PASSWORD);
      } else {
        privateKey = data.privateKey;
      }
      
      const wallet = new Wallet(privateKey);
      console.log(`✅ Wallet loaded: ${wallet.address}`);
      return wallet;
    } catch (error) {
      console.error('❌ Failed to load wallet:', error.message);
      throw error;
    }
  }

  // Create new wallet
  console.log('🆕 Creating new wallet...');
  const wallet = Wallet.createRandom();
  
  // Save wallet (optionally encrypted)
  const walletData = {
    address: wallet.address,
    privateKey: process.env.WALLET_PASSWORD 
      ? encrypt(wallet.privateKey, process.env.WALLET_PASSWORD)
      : wallet.privateKey,
    encrypted: !!process.env.WALLET_PASSWORD,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(WALLET_PATH, JSON.stringify(walletData, null, 2), 'utf8');
  
  console.log(`✅ New wallet created: ${wallet.address}`);
  console.log('⚠️  IMPORTANT: Fund this wallet with ETH on Base or Arbitrum!');
  console.log(`   Address: ${wallet.address}`);
  
  return wallet;
}

/**
 * Connect wallet to provider
 * @param {Wallet} wallet - Wallet instance
 * @param {string} network - Network name (base, arbitrum, etc.)
 * @returns {Wallet} Connected wallet
 */
export function connectWallet(wallet, network) {
  const provider = getProvider(network);
  return wallet.connect(provider);
}

/**
 * Get provider for network
 * @param {string} network - Network name
 * @returns {JsonRpcProvider} Provider instance
 */
export function getProvider(network) {
  const RPC_URLS = {
    'base': 'https://mainnet.base.org',
    'base-sepolia': 'https://sepolia.base.org',
    'arbitrum': 'https://arb1.arbitrum.io/rpc',
    'arbitrum-sepolia': 'https://sepolia-rollup.arbitrum.io/rpc',
    'degen': 'https://rpc.degen.tips'
  };

  const rpcUrl = RPC_URLS[network];
  if (!rpcUrl) {
    throw new Error(`Unknown network: ${network}`);
  }

  return new JsonRpcProvider(rpcUrl);
}

/**
 * Encrypt private key
 */
function encrypt(text, password) {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted
  };
}

/**
 * Decrypt private key
 */
function decrypt(encryptedData, password) {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(password, 'salt', 32);
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Get wallet balance
 * @param {Wallet} wallet - Connected wallet
 * @returns {Promise<string>} Balance in ETH
 */
export async function getBalance(wallet) {
  const balance = await wallet.provider.getBalance(wallet.address);
  return ethers.formatEther(balance);
}
```

**VERIFY:** 
- File exists at `src/blockchain/wallet.js`
- No syntax errors: `node --check src/blockchain/wallet.js`
- All imports resolve correctly

**IF ERROR:** Fix immediately before continuing.

---

### **TASK 3.2: CREATE NETWORK CONFIGURATION**

Create `src/blockchain/networks.js`:

```javascript
/**
 * Network configurations for poidh bot
 */

export const NETWORKS = {
  'base': {
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    poidhContract: '0xb502c5856f7244dccdd0264a541cc25675353d39',
    explorerUrl: 'https://basescan.org',
    currency: 'ETH',
    testnet: false
  },
  'base-sepolia': {
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    poidhContract: '0xTESTNET_CONTRACT_HERE', // Update with actual testnet contract
    explorerUrl: 'https://sepolia.basescan.org',
    currency: 'ETH',
    testnet: true
  },
  'arbitrum': {
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    poidhContract: '0x0aa50ce0d724cc28f8f7af4630c32377b4d5c27d',
    explorerUrl: 'https://arbiscan.io',
    currency: 'ETH',
    testnet: false
  },
  'arbitrum-sepolia': {
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    poidhContract: '0xTESTNET_CONTRACT_HERE', // Update with actual testnet contract
    explorerUrl: 'https://sepolia.arbiscan.io',
    currency: 'ETH',
    testnet: true
  },
  'degen': {
    name: 'Degen Chain',
    chainId: 666666666,
    rpcUrl: 'https://rpc.degen.tips',
    poidhContract: '0x2445BfFc6aB9EEc6C562f8D7EE325CddF1780814',
    explorerUrl: 'https://explorer.degen.tips',
    currency: 'DEGEN',
    testnet: false
  }
};

/**
 * Get network config
 * @param {string} networkName - Network identifier
 * @returns {object} Network configuration
 */
export function getNetworkConfig(networkName) {
  const config = NETWORKS[networkName];
  if (!config) {
    throw new Error(`Unknown network: ${networkName}. Available: ${Object.keys(NETWORKS).join(', ')}`);
  }
  return config;
}

/**
 * Get explorer URL for transaction
 * @param {string} txHash - Transaction hash
 * @param {string} networkName - Network name
 * @returns {string} Explorer URL
 */
export function getExplorerUrl(txHash, networkName) {
  const config = getNetworkConfig(networkName);
  return `${config.explorerUrl}/tx/${txHash}`;
}

/**
 * Get explorer URL for address
 * @param {string} address - Wallet address
 * @param {string} networkName - Network name
 * @returns {string} Explorer URL
 */
export function getAddressUrl(address, networkName) {
  const config = getNetworkConfig(networkName);
  return `${config.explorerUrl}/address/${address}`;
}
```

**VERIFY:** File created with zero errors.

---

### **TASK 3.3: CREATE POIDH CONTRACT INTERFACE** 

Create `src/blockchain/PoidhContract.js` - THE MOST CRITICAL FILE:

```javascript
/**
 * poidh Smart Contract Interface
 * Handles all interactions with poidh bounty contracts on Base/Arbitrum/Degen
 */

import { Contract, parseEther, formatEther } from 'ethers';
import { getNetworkConfig } from './networks.js';

// poidh Contract ABI (simplified - core functions only)
// Full ABI available at: https://github.com/picsoritdidnthappen/poidh-contracts
const POIDH_ABI = [
  // Events
  "event BountyCreated(uint256 indexed bountyId, address indexed issuer, uint256 amount, string name)",
  "event ClaimCreated(uint256 indexed bountyId, uint256 indexed claimId, address indexed claimer)",
  "event ClaimAccepted(uint256 indexed bountyId, uint256 indexed claimId)",
  
  // Core functions
  "function createBounty(string memory name, string memory description, string memory imageURI, uint256 amount) external payable returns (uint256)",
  "function createClaim(uint256 bountyId, string memory description, string memory imageURI) external returns (uint256)",
  "function acceptClaim(uint256 bountyId, uint256 claimId) external",
  "function getBounty(uint256 bountyId) external view returns (tuple(address issuer, string name, string description, uint256 amount, uint256 deadline, bool completed, uint256 claimCount))",
  "function getClaim(uint256 bountyId, uint256 claimId) external view returns (tuple(address claimer, string description, string imageURI, uint256 createdAt, bool accepted))",
  "function getBountyClaimCount(uint256 bountyId) external view returns (uint256)"
];

export class PoidhContract {
  constructor(wallet, network) {
    this.wallet = wallet;
    this.network = network;
    this.networkConfig = getNetworkConfig(network);
    
    this.contract = new Contract(
      this.networkConfig.poidhContract,
      POIDH_ABI,
      wallet
    );
    
    console.log(`📝 poidh contract initialized on ${this.networkConfig.name}`);
    console.log(`   Contract: ${this.networkConfig.poidhContract}`);
  }

  /**
   * Create a bounty on poidh
   * @param {object} bountyData - Bounty details
   * @returns {Promise<object>} Bounty creation result
   */
  async createBounty(bountyData) {
    const { name, description, imageURI, rewardETH } = bountyData;
    
    console.log(`\n🎯 Creating bounty on poidh...`);
    console.log(`   Title: ${name}`);
    console.log(`   Reward: ${rewardETH} ETH`);
    console.log(`   Network: ${this.networkConfig.name}`);
    
    try {
      // Convert ETH to Wei
      const amountWei = parseEther(rewardETH.toString());
      
      // Create bounty transaction
      const tx = await this.contract.createBounty(
        name,
        description,
        imageURI || '',
        amountWei,
        {
          value: amountWei,
          gasLimit: 500000 // Set reasonable gas limit
        }
      );
      
      console.log(`   Transaction sent: ${tx.hash}`);
      console.log(`   Waiting for confirmation...`);
      
      // Wait for transaction
      const receipt = await tx.wait();
      
      console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
      
      // Parse bountyId from event
      const event = receipt.logs.find(log => {
        try {
          return this.contract.interface.parseLog(log).name === 'BountyCreated';
        } catch {
          return false;
        }
      });
      
      if (!event) {
        throw new Error('BountyCreated event not found in transaction');
      }
      
      const parsedEvent = this.contract.interface.parseLog(event);
      const bountyId = parsedEvent.args.bountyId.toString();
      
      console.log(`   🎉 Bounty created! ID: ${bountyId}`);
      console.log(`   Explorer: ${getExplorerUrl(receipt.hash, this.network)}\n`);
      
      return {
        bountyId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        explorerUrl: getExplorerUrl(receipt.hash, this.network)
      };
      
    } catch (error) {
      console.error(`   ❌ Failed to create bounty:`, error.message);
      throw error;
    }
  }

  /**
   * Monitor claims for a bounty
   * @param {string} bountyId - Bounty ID to monitor
   * @param {Function} callback - Called when new claim is received
   */
  async monitorClaims(bountyId, callback) {
    console.log(`\n👀 Monitoring claims for bounty ${bountyId}...`);
    
    // Create event filter
    const filter = this.contract.filters.ClaimCreated(bountyId);
    
    // Listen for new claims
    this.contract.on(filter, async (bountyIdEvent, claimId, claimer, event) => {
      console.log(`\n🆕 New claim received!`);
      console.log(`   Bounty ID: ${bountyIdEvent.toString()}`);
      console.log(`   Claim ID: ${claimId.toString()}`);
      console.log(`   From: ${claimer}`);
      
      try {
        // Fetch full claim data
        const claimData = await this.getClaim(bountyId, claimId.toString());
        
        // Call callback with claim data
        if (callback) {
          await callback({
            bountyId: bountyId.toString(),
            claimId: claimId.toString(),
            claimer,
            ...claimData
          });
        }
      } catch (error) {
        console.error(`   ❌ Error processing claim:`, error.message);
      }
    });
    
    console.log(`   ✅ Listening for claims on ${this.networkConfig.name}...`);
  }

  /**
   * Get claim details
   * @param {string} bountyId - Bounty ID
   * @param {string} claimId - Claim ID
   * @returns {Promise<object>} Claim data
   */
  async getClaim(bountyId, claimId) {
    try {
      const claim = await this.contract.getClaim(bountyId, claimId);
      
      return {
        claimer: claim.claimer,
        description: claim.description,
        imageURI: claim.imageURI,
        createdAt: Number(claim.createdAt),
        accepted: claim.accepted
      };
    } catch (error) {
      console.error(`Failed to get claim ${claimId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all claims for a bounty
   * @param {string} bountyId - Bounty ID
   * @returns {Promise<Array>} Array of claims
   */
  async getAllClaims(bountyId) {
    try {
      const claimCount = await this.contract.getBountyClaimCount(bountyId);
      const claims = [];
      
      for (let i = 0; i < claimCount; i++) {
        const claim = await this.getClaim(bountyId, i.toString());
        claims.push({ claimId: i.toString(), ...claim });
      }
      
      return claims;
    } catch (error) {
      console.error(`Failed to get claims for bounty ${bountyId}:`, error.message);
      throw error;
    }
  }

  /**
   * Accept a claim (pay the winner)
   * @param {string} bountyId - Bounty ID
   * @param {string} claimId - Winning claim ID
   * @returns {Promise<object>} Transaction receipt
   */
  async acceptClaim(bountyId, claimId) {
    console.log(`\n💰 Accepting claim ${claimId} for bounty ${bountyId}...`);
    
    try {
      const tx = await this.contract.acceptClaim(bountyId, claimId, {
        gasLimit: 300000
      });
      
      console.log(`   Transaction sent: ${tx.hash}`);
      console.log(`   Waiting for confirmation...`);
      
      const receipt = await tx.wait();
      
      console.log(`   ✅ Claim accepted! Winner paid.`);
      console.log(`   Block: ${receipt.blockNumber}`);
      console.log(`   Explorer: ${getExplorerUrl(receipt.hash, this.network)}\n`);
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        explorerUrl: getExplorerUrl(receipt.hash, this.network)
      };
      
    } catch (error) {
      console.error(`   ❌ Failed to accept claim:`, error.message);
      throw error;
    }
  }

  /**
   * Get bounty details
   * @param {string} bountyId - Bounty ID
   * @returns {Promise<object>} Bounty data
   */
  async getBounty(bountyId) {
    try {
      const bounty = await this.contract.getBounty(bountyId);
      
      return {
        issuer: bounty.issuer,
        name: bounty.name,
        description: bounty.description,
        amount: formatEther(bounty.amount),
        deadline: Number(bounty.deadline),
        completed: bounty.completed,
        claimCount: Number(bounty.claimCount)
      };
    } catch (error) {
      console.error(`Failed to get bounty ${bountyId}:`, error.message);
      throw error;
    }
  }
}

function getExplorerUrl(txHash, network) {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/tx/${txHash}`;
}
```

**VERIFY:**
- File created successfully
- No syntax errors: `node --check src/blockchain/PoidhContract.js`
- All imports resolve

**IF ERROR:** Debug and fix before continuing. Common issues:
- Missing ethers import
- Incorrect ABI format
- Network config not found

---

## 📋 PHASE 4: IMPLEMENT STORAGE LAYER

### **TASK 4.1: CREATE IPFS CLIENT**

Create `src/storage/IPFSClient.js`:

```javascript
/**
 * IPFS Client for poidh
 * Handles image upload/download via Pinata (same as poidh)
 */

import axios from 'axios';
import FormData from 'form-data';

export class IPFSClient {
  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
    
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      console.warn('⚠️  Pinata API keys not configured. IPFS features will be limited.');
    }
  }

  /**
   * Upload image to IPFS via Pinata
   * @param {Buffer} imageBuffer - Image data
   * @param {string} filename - File name
   * @returns {Promise<object>} IPFS URLs
   */
  async uploadImage(imageBuffer, filename) {
    if (!this.pinataApiKey) {
      throw new Error('Pinata API key not configured');
    }

    console.log(`📤 Uploading ${filename} to IPFS...`);

    try {
      const formData = new FormData();
      formData.append('file', imageBuffer, filename);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `ipfs://${ipfsHash}`;
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      console.log(`   ✅ Uploaded to IPFS: ${ipfsHash}`);
      console.log(`   Gateway URL: ${gatewayUrl}`);

      return {
        ipfsUrl,
        gatewayUrl,
        ipfsHash
      };

    } catch (error) {
      console.error(`   ❌ Upload failed:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Fetch image from IPFS
   * @param {string} ipfsUrl - IPFS URL (ipfs://... or https://...)
   * @returns {Promise<Buffer>} Image buffer
   */
  async fetchImage(ipfsUrl) {
    console.log(`📥 Fetching image from IPFS...`);

    try {
      // Convert ipfs:// to HTTP gateway URL
      let fetchUrl;
      if (ipfsUrl.startsWith('ipfs://')) {
        const ipfsHash = ipfsUrl.replace('ipfs://', '');
        fetchUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      } else if (ipfsUrl.startsWith('http')) {
        fetchUrl = ipfsUrl;
      } else {
        throw new Error(`Invalid IPFS URL: ${ipfsUrl}`);
      }

      console.log(`   Fetching from: ${fetchUrl}`);

      const response = await axios.get(fetchUrl, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
        maxContentLength: 50 * 1024 * 1024 // 50MB max
      });

      const buffer = Buffer.from(response.data);
      console.log(`   ✅ Downloaded ${buffer.length} bytes`);

      return buffer;

    } catch (error) {
      console.error(`   ❌ Fetch failed:`, error.message);
      throw error;
    }
  }

  /**
   * Convert IPFS URL to HTTP gateway URL
   * @param {string} ipfsUrl - IPFS URL
   * @returns {string} HTTP gateway URL
   */
  toGatewayUrl(ipfsUrl) {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    return ipfsUrl;
  }
}
```

**VERIFY:** File created, no errors.

---

### **TASK 4.2: CREATE LOGGER**

Create `src/storage/Logger.js`:

```javascript
/**
 * Transparent Logging System
 * All bot decisions and actions logged for transparency
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '../../logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export class Logger {
  constructor() {
    this.logFile = path.join(LOG_DIR, `bot-${this.getDateString()}.jsonl`);
    this.decisionFile = path.join(LOG_DIR, 'decisions.jsonl');
  }

  getDateString() {
    return new Date().toISOString().split('T')[0];
  }

  log(level, message, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    };

    // Console output with colors
    const prefix = {
      info: '📘',
      success: '✅',
      error: '❌',
      warn: '⚠️',
      decision: '⚖️'
    }[level] || '📝';

    console.log(`${prefix} [${entry.timestamp}] ${message}`);
    if (Object.keys(data).length > 0) {
      console.log('  ', JSON.stringify(data, null, 2));
    }

    // Write to file
    try {
      fs.appendFileSync(this.logFile, JSON.stringify(entry) + '\n');
    } catch (error) {
      console.error('Failed to write log:', error.message);
    }
  }

  info(message, data) {
    this.log('info', message, data);
  }

  success(message, data) {
    this.log('success', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  decision(message, data) {
    this.log('decision', message, data);
    
    // Also write to separate decision log
    try {
      const decisionEntry = {
        timestamp: new Date().toISOString(),
        message,
        ...data
      };
      fs.appendFileSync(this.decisionFile, JSON.stringify(decisionEntry) + '\n');
    } catch (error) {
      console.error('Failed to write decision log:', error.message);
    }
  }
}
```

**VERIFY:** File created successfully.

---

## 📋 PHASE 5: IMPLEMENT AI LAYER

### **TASK 5.1: CREATE CLAUDE EVALUATOR**

Create `src/ai/ClaudeEvaluator.js` - COMPLETE, PRODUCTION-READY:

```javascript
/**
 * Claude AI Evaluator
 * Uses Claude vision API to evaluate bounty submissions
 */

import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';

export class ClaudeEvaluator {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }

    this.client = new Anthropic({ apiKey });
    this.cache = new Map();
    this.rateLimitDelay = 1000;
  }

  /**
   * Evaluate submission with AI
   * @param {Buffer} imageBuffer - Image data
   * @param {Array} requirements - Bounty requirements
   * @returns {Promise<object>} Evaluation result
   */
  async evaluate(imageBuffer, requirements) {
    console.log(`\n🤖 Evaluating submission with Claude AI...`);

    // Check cache
    const cacheKey = this.getCacheKey(imageBuffer, requirements);
    if (this.cache.has(cacheKey)) {
      console.log('   ⚡ Using cached evaluation');
      return this.cache.get(cacheKey);
    }

    // Preprocess image
    const processedImage = await this.preprocessImage(imageBuffer);

    // Retry loop with exponential backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const evaluation = await this.callClaude(processedImage, requirements);

        // Validate response
        if (this.validateEvaluation(evaluation)) {
          this.cache.set(cacheKey, evaluation);
          console.log(`   ✅ Evaluation complete: ${evaluation.total_score}/100`);
          return evaluation;
        } else {
          throw new Error('Invalid evaluation format');
        }

      } catch (error) {
        console.error(`   ⚠️  Attempt ${attempt} failed:`, error.message);

        if (error.status === 429) {
          // Rate limited
          const delay = this.rateLimitDelay * attempt;
          console.log(`   ⏳ Rate limited. Waiting ${delay}ms...`);
          await this.sleep(delay);
          continue;
        }

        if (attempt === 3) {
          // Final attempt failed - use fallback
          console.warn('   ⚠️  All attempts failed. Using fallback scoring.');
          return this.fallbackEvaluation();
        }

        // Wait before retry
        await this.sleep(1000 * attempt);
      }
    }
  }

  /**
   * Preprocess image for AI
   */
  async preprocessImage(imageBuffer) {
    try {
      // Resize to max 1024x1024, compress to <5MB
      const processed = await sharp(imageBuffer)
        .resize(1024, 1024, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      console.log(`   📸 Image preprocessed: ${processed.length} bytes`);
      return processed.toString('base64');

    } catch (error) {
      console.error('   ❌ Image preprocessing failed:', error.message);
      // Return original as base64 if preprocessing fails
      return imageBuffer.toString('base64');
    }
  }

  /**
   * Call Claude API
   */
  async callClaude(imageBase64, requirements) {
    const prompt = this.buildPrompt(requirements);

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      }],
      timeout: 30000
    });

    return this.parseResponse(response);
  }

  /**
   * Build evaluation prompt
   */
  buildPrompt(requirements) {
    return `You are evaluating a bounty submission. Score this image based on these criteria:

REQUIREMENTS:
${requirements.map((req, i) => `${i + 1}. ${req}`).join('\n')}

SCORING CRITERIA (0-100 total):

1. AUTHENTICITY (0-40 points):
   - Is this a real, unedited photo?
   - Any signs of AI generation or manipulation?
   - Shows genuine real-world action?

2. COMPLIANCE (0-30 points):
   - Does it meet ALL stated requirements?
   - Are required elements clearly visible?
   - Is the task correctly completed?

3. QUALITY (0-20 points):
   - Is the image clear and well-composed?
   - Does it provide strong proof of completion?
   - Professional presentation?

4. VALIDITY (0-10 points):
   - Does it appear recent/timely?
   - Legitimate user interaction?

Respond with ONLY valid JSON in this EXACT format:
{
  "authenticity_score": <number 0-40>,
  "compliance_score": <number 0-30>,
  "quality_score": <number 0-20>,
  "validity_score": <number 0-10>,
  "total_score": <sum of above>,
  "reasoning": "<2-3 sentence explanation>",
  "winner_worthy": <true if total >= 70, else false>
}`;
  }

  /**
   * Parse Claude response
   */
  parseResponse(response) {
    const text = response.content[0].text;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  }

  /**
   * Validate evaluation
   */
  validateEvaluation(eval) {
    const required = [
      'authenticity_score',
      'compliance_score',
      'quality_score',
      'validity_score',
      'total_score',
      'reasoning',
      'winner_worthy'
    ];

    for (const field of required) {
      if (!(field in eval)) {
        return false;
      }
    }

    // Validate score ranges
    if (eval.authenticity_score < 0 || eval.authenticity_score > 40) return false;
    if (eval.compliance_score < 0 || eval.compliance_score > 30) return false;
    if (eval.quality_score < 0 || eval.quality_score > 20) return false;
    if (eval.validity_score < 0 || eval.validity_score > 10) return false;
    if (eval.total_score < 0 || eval.total_score > 100) return false;

    return true;
  }

  /**
   * Fallback evaluation if AI fails
   */
  fallbackEvaluation() {
    return {
      authenticity_score: 20,
      compliance_score: 15,
      quality_score: 10,
      validity_score: 5,
      total_score: 50,
      reasoning: 'Automatic AI evaluation failed. Conservative default scores applied for safety.',
      winner_worthy: false,
      is_fallback: true
    };
  }

  getCacheKey(imageBuffer, requirements) {
    const imageHash = imageBuffer.slice(0, 100).toString('hex');
    const reqHash = JSON.stringify(requirements).slice(0, 50);
    return `${imageHash}_${reqHash}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**VERIFY:** File created with zero errors.

---

## 📋 PHASE 6: CREATE MAIN BOT

### **TASK 6.1: CREATE BOUNTY BOT**

Create `src/bot/BountyBot.js` - THE COMPLETE ORCHESTRATOR:

```javascript
/**
 * Autonomous Bounty Bot
 * Main orchestrator for poidh bounty lifecycle
 */

import { loadOrCreateWallet, connectWallet, getBalance } from '../blockchain/wallet.js';
import { PoidhContract } from '../blockchain/PoidhContract.js';
import { ClaudeEvaluator } from '../ai/ClaudeEvaluator.js';
import { IPFSClient } from '../storage/IPFSClient.js';
import { Logger } from '../storage/Logger.js';
import { parseEther } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AutonomousBountyBot {
  constructor(config) {
    this.config = config;
    this.logger = new Logger();
    this.wallet = null;
    this.contract = null;
    this.evaluator = null;
    this.ipfs = null;
    this.activeBounty = null;
    this.submissions = new Map();
  }

  /**
   * Initialize bot
   */
  async initialize() {
    this.logger.info('🤖 Initializing Autonomous Bounty Bot for poidh...');
    this.logger.info(`Network: ${this.config.network}`);

    // Load wallet
    const wallet = loadOrCreateWallet();
    this.wallet = connectWallet(wallet, this.config.network);
    this.logger.success(`Wallet connected: ${this.wallet.address}`);

    // Check balance
    const balance = await getBalance(this.wallet);
    this.logger.info(`Balance: ${balance} ETH`);

    const minBalance = 0.01;
    if (parseFloat(balance) < minBalance) {
      throw new Error(`Insufficient balance! Need at least ${minBalance} ETH. Current: ${balance} ETH`);
    }

    // Initialize poidh contract
    this.contract = new PoidhContract(this.wallet, this.config.network);

    // Initialize AI evaluator
    this.evaluator = new ClaudeEvaluator(process.env.ANTHROPIC_API_KEY);
    this.logger.success('AI evaluator initialized');

    // Initialize IPFS
    this.ipfs = new IPFSClient();
    this.logger.success('IPFS client initialized');

    this.logger.success('✅ Bot initialization complete!\n');
  }

  /**
   * Create bounty
   */
  async createBounty() {
    this.logger.info('Creating bounty from template...');

    // Load templates
    const templatesPath = path.join(__dirname, '../../config/bounty-templates.json');
    const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));

    // Select first template (or random)
    const template = templates.bounties[0];
    this.logger.info(`Selected template: "${template.title}"`);

    // Upload image to IPFS if exists
    let imageURI = '';
    // For now, use empty string. In production, upload actual image

    // Create bounty on-chain
    const result = await this.contract.createBounty({
      name: template.title,
      description: template.description,
      imageURI,
      rewardETH: template.rewardETH
    });

    this.activeBounty = {
      ...template,
      bountyId: result.bountyId,
      transactionHash: result.transactionHash,
      explorerUrl: result.explorerUrl,
      createdAt: Date.now(),
      network: this.config.network,
      status: 'active'
    };

    this.logger.success('Bounty created successfully!', {
      bountyId: result.bountyId,
      title: template.title,
      reward: `${template.rewardETH} ETH`,
      txHash: result.transactionHash
    });

    return this.activeBounty;
  }

  /**
   * Monitor submissions
   */
  async monitorSubmissions() {
    this.logger.info('Starting submission monitoring...');

    await this.contract.monitorClaims(
      this.activeBounty.bountyId,
      async (claim) => {
        await this.handleNewClaim(claim);
      }
    );
  }

  /**
   * Handle new claim
   */
  async handleNewClaim(claim) {
    this.logger.info(`Processing claim ${claim.claimId}...`);

    try {
      // Download image from IPFS
      const imageBuffer = await this.ipfs.fetchImage(claim.imageURI);

      // Store submission
      this.submissions.set(claim.claimId, {
        ...claim,
        imageBuffer,
        receivedAt: Date.now(),
        evaluated: false
      });

      this.logger.success(`Claim ${claim.claimId} downloaded and queued`);

    } catch (error) {
      this.logger.error(`Failed to process claim ${claim.claimId}:`, {
        error: error.message
      });
    }
  }

  /**
   * Evaluate all submissions
   */
  async evaluateSubmissions() {
    this.logger.info(`\nEvaluating ${this.submissions.size} submissions...`);

    const evaluations = [];

    for (const [claimId, submission] of this.submissions) {
      if (submission.evaluated) continue;

      this.logger.info(`\nEvaluating claim ${claimId}...`);

      try {
        const evaluation = await this.evaluator.evaluate(
          submission.imageBuffer,
          this.activeBounty.requirements
        );

        submission.evaluation = evaluation;
        submission.evaluated = true;

        evaluations.push({
          claimId,
          claimer: submission.claimer,
          ...evaluation
        });

        this.logger.success(`Claim ${claimId} evaluated`, {
          score: `${evaluation.total_score}/100`,
          winner_worthy: evaluation.winner_worthy
        });

      } catch (error) {
        this.logger.error(`Failed to evaluate claim ${claimId}:`, {
          error: error.message
        });
      }
    }

    return evaluations;
  }

  /**
   * Select winner
   */
  async selectWinner() {
    this.logger.info('\n⚖️  Selecting winner...');

    const evaluations = await this.evaluateSubmissions();

    if (evaluations.length === 0) {
      this.logger.error('No submissions to evaluate!');
      return null;
    }

    // Filter valid submissions (score >= threshold)
    const valid = evaluations.filter(
      e => e.total_score >= this.config.evaluationThreshold
    );

    if (valid.length === 0) {
      this.logger.error(`No submissions met threshold of ${this.config.evaluationThreshold}`, {
        totalSubmissions: evaluations.length,
        highestScore: Math.max(...evaluations.map(e => e.total_score))
      });
      return null;
    }

    // Sort by score (descending)
    valid.sort((a, b) => b.total_score - a.total_score);

    const winner = valid[0];

    // Log transparent decision
    const decision = {
      bountyId: this.activeBounty.bountyId,
      bountyTitle: this.activeBounty.title,
      winnerId: winner.claimId,
      winnerAddress: winner.claimer,
      winnerScore: winner.total_score,
      winnerReasoning: winner.reasoning,
      totalSubmissions: evaluations.length,
      validSubmissions: valid.length,
      threshold: this.config.evaluationThreshold,
      runnerUps: valid.slice(1, 3).map(r => ({
        claimId: r.claimId,
        score: r.total_score
      })),
      allScores: valid.map(s => ({
        claimId: s.claimId,
        score: s.total_score
      })),
      timestamp: new Date().toISOString()
    };

    this.logger.decision('Winner selected', decision);

    this.logger.success(`\n🏆 Winner: Claim ${winner.claimId}`, {
      score: `${winner.total_score}/100`,
      claimer: winner.claimer
    });

    return winner;
  }

  /**
   * Pay winner
   */
  async payWinner(winner) {
    this.logger.info(`\n💰 Paying winner (claim ${winner.claimId})...`);

    try {
      const result = await this.contract.acceptClaim(
        this.activeBounty.bountyId,
        winner.claimId
      );

      this.logger.success('Winner paid successfully!', {
        transactionHash: result.transactionHash,
        explorerUrl: result.explorerUrl
      });

      return result;

    } catch (error) {
      this.logger.error('Payment failed:', { error: error.message });
      throw error;
    }
  }

  /**
   * Run complete bounty cycle
   */
  async run() {
    try {
      // Initialize
      await this.initialize();

      // Create bounty
      await this.createBounty();

      // Start monitoring
      await this.monitorSubmissions();

      // For demo: wait for deadline or manual trigger
      this.logger.info('\n⏰ Bot is now monitoring for submissions...');
      this.logger.info('Waiting for deadline or manual evaluation trigger...\n');

      // In production, this would wait for actual deadline
      // For demo/testing, you might want to:
      // 1. Wait for specific time
      // 2. Poll periodically and check claim count
      // 3. Trigger evaluation manually

      // Example: Wait 10 minutes then evaluate
      // await this.sleep(10 * 60 * 1000);

      // For now, keep running
      // Evaluation should be triggered separately when ready

    } catch (error) {
      this.logger.error('Bot error:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Manually trigger evaluation (for testing/demo)
   */
  async triggerEvaluation() {
    this.logger.info('\n🎯 Manual evaluation triggered...');

    // Get all claims first
    const claims = await this.contract.getAllClaims(this.activeBounty.bountyId);
    this.logger.info(`Found ${claims.length} claims to evaluate`);

    // Download and store claims
    for (const claim of claims) {
      if (!this.submissions.has(claim.claimId)) {
        await this.handleNewClaim(claim);
      }
    }

    // Select winner
    const winner = await this.selectWinner();

    if (winner) {
      // Pay winner
      await this.payWinner(winner);

      this.logger.success('\n🎉 Bounty cycle completed successfully!');
      return true;
    } else {
      this.logger.error('\n❌ No valid winner found');
      return false;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**VERIFY:** File created successfully, no errors.

---

### **TASK 6.2: CREATE MAIN ENTRY POINT**

Create `src/index.js`:

```javascript
#!/usr/bin/env node

/**
 * Main entry point for Socially poidh bot
 */

import { AutonomousBountyBot } from './bot/BountyBot.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuration
const config = {
  network: process.env.NETWORK || 'base-sepolia', // Start with testnet
  evaluationThreshold: parseInt(process.env.EVALUATION_THRESHOLD) || 70,
  pollingInterval: parseInt(process.env.POLLING_INTERVAL) || 60000
};

// Validate environment
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not set in .env file');
  process.exit(1);
}

// Create and run bot
const bot = new AutonomousBountyBot(config);

async function main() {
  try {
    await bot.run();

    // Keep process running
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down gracefully...');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run
main();

// Export for testing
export { bot };
```

**VERIFY:** File created, executable.

---

## 📋 PHASE 7: CONFIGURATION FILES

### **TASK 7.1: CREATE .env.example**

Create `.env.example`:

```env
# ========================================
# SOCIALLY POIDH BOT - CONFIGURATION
# ========================================

# Network (base | base-sepolia | arbitrum | arbitrum-sepolia | degen)
NETWORK=base-sepolia

# AI Evaluation
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# IPFS Storage (Pinata)
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here

# Bot Configuration
EVALUATION_THRESHOLD=70
POLLING_INTERVAL=60000

# Wallet Encryption (optional but recommended)
WALLET_PASSWORD=

# API Server (if running dashboard)
API_PORT=3001
```

**VERIFY:** File created.

---

### **TASK 7.2: UPDATE BOUNTY TEMPLATES**

Update `config/bounty-templates.json`:

```json
{
  "bounties": [
    {
      "title": "Take a photo with a stranger holding 'POIDH' sign",
      "description": "Find a friendly stranger, ask them to hold a sign saying 'POIDH', and take a photo together. Both of you should be smiling!",
      "rewardETH": 0.001,
      "category": "social_interaction",
      "requirements": [
        "Photo must show you AND a stranger (not someone you know)",
        "Stranger must be holding a clearly visible 'POIDH' sign",
        "Both faces must be visible and smiling",
        "Photo must be taken outdoors or in a public space",
        "Sign must be handwritten or printed (clearly readable)",
        "No AI-generated or heavily edited images"
      ]
    },
    {
      "title": "Show a random act of kindness",
      "description": "Do something kind for a stranger and document it with a photo.",
      "rewardETH": 0.001,
      "category": "kindness",
      "requirements": [
        "Photo showing you performing an act of kindness",
        "Must involve a stranger (not friends/family)",
        "The act must be clearly visible in the photo",
        "Respect privacy (can blur faces if needed)",
        "Must be a genuine, recent action",
        "No staged or fake scenarios"
      ]
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "last_updated": "2025-02-10",
    "notes": "All bounties require real-world actions with photo proof on poidh platform"
  }
}
```

**VERIFY:** Valid JSON, no syntax errors.

---

## 📋 PHASE 8: DOCUMENTATION

### **TASK 8.1: CREATE README.md**

Create complete, professional README.md (see previous artifact for full content).

### **TASK 8.2: CREATE DEPLOYMENT.md**

Create deployment guide (see previous artifact).

### **TASK 8.3: CREATE BOUNTY_CLAIM.md**

Create bounty claim proof document (see previous artifact).

---

## 📋 PHASE 9: TESTING

### **TASK 9.1: CREATE TEST FILES**

Create `tests/unit/wallet.test.js`:

```javascript
import { describe, it, expect } from '@jest/globals';
import { loadOrCreateWallet } from '../../src/blockchain/wallet.js';

describe('Wallet', () => {
  it('should create or load wallet', () => {
    const wallet = loadOrCreateWallet();
    expect(wallet).toBeDefined();
    expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });
});
```

**TASK 9.2: CREATE INTEGRATION TEST**

Create `tests/integration/full-cycle.test.js`:

```javascript
/**
 * Full cycle integration test
 * Tests complete bounty lifecycle on testnet
 */

import { AutonomousBountyBot } from '../../src/bot/BountyBot.js';
import dotenv from 'dotenv';

dotenv.config();

describe('Full Bounty Cycle', () => {
  // This is a manual/semi-automated test
  // Run with: npm test -- tests/integration/full-cycle.test.js

  it('should complete full bounty cycle', async () => {
    const config = {
      network: 'base-sepolia',
      evaluationThreshold: 70
    };

    const bot = new AutonomousBountyBot(config);

    // Initialize
    await bot.initialize();
    expect(bot.wallet).toBeDefined();

    // Create bounty
    const bounty = await bot.createBounty();
    expect(bounty.bountyId).toBeDefined();

    console.log('\n✅ Integration test passed!');
    console.log(`Bounty ID: ${bounty.bountyId}`);
    console.log(`Monitor at: ${bounty.explorerUrl}`);
    console.log('\nManually submit claims on poidh.xyz');
    console.log('Then run: bot.triggerEvaluation()');

  }, 60000); // 60 second timeout
});
```

---

## 📋 PHASE 10: FINAL SETUP & VERIFICATION

### **TASK 10.1: CREATE SETUP SCRIPT**

Create `scripts/setup.js`:

```javascript
#!/usr/bin/env node

import { loadOrCreateWallet, connectWallet, getBalance } from '../src/blockchain/wallet.js';
import { getProvider } from '../src/blockchain/wallet.js';
import dotenv from 'dotenv';
import fs from 'fs';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function main() {
  console.log('\n🚀 Socially poidh Bot - Setup Wizard\n');

  // Check .env
  if (!fs.existsSync('.env')) {
    console.log('Creating .env from .env.example...');
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env created\n');
    console.log('⚠️  Edit .env and add your ANTHROPIC_API_KEY\n');
  }

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    console.log('❌ ANTHROPIC_API_KEY not configured');
    console.log('Get your key from: https://console.anthropic.com/\n');
  } else {
    console.log('✅ API key found\n');
  }

  // Setup wallet
  console.log('Setting up wallet...');
  const wallet = loadOrCreateWallet();
  console.log(`Wallet: ${wallet.address}\n`);

  // Check balance
  const network = process.env.NETWORK || 'base-sepolia';
  console.log(`Network: ${network}`);

  try {
    const provider = getProvider(network);
    const connectedWallet = wallet.connect(provider);
    const balance = await getBalance(connectedWallet);

    console.log(`Balance: ${balance} ETH\n`);

    if (parseFloat(balance) < 0.01) {
      console.log('⚠️  Low balance!');
      if (network.includes('sepolia')) {
        console.log(`\nGet testnet ETH from faucet:`);
        console.log(`Base Sepolia: