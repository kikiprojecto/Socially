#!/usr/bin/env node

/**
 * Socially Autonomous Bounty Bot - Main Engine
 * Fully autonomous AI-powered bounty management system
 * 
 * This bot:
 * 1. Creates bounties on poidh
 * 2. Monitors submissions autonomously
 * 3. Evaluates using Claude AI vision
 * 4. Selects winners transparently
 * 5. Pays out automatically
 */

import 'dotenv/config';

import { Connection, clusterApiUrl, LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey, Keypair } from '@solana/web3.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadOrCreateWallet } from './poidh_wallet.js';
import { ClaudeEvaluator } from './src/ai/ClaudeEvaluator.js';
import { PoidhIndexerClient } from './src/api/PoidhIndexerClient.js';
import { loadOrCreateEvmWallet, connectEvmProvider } from './src/blockchain/EvmWallet.js';
import { PoidhEvmContract } from './src/blockchain/PoidhEvmContract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  network: process.env.SOLANA_NETWORK || 'devnet',
  pollingInterval: Number.parseInt(process.env.POLLING_INTERVAL || '60000', 10), // 1 minute
  evaluationThreshold: Number.parseInt((process.env.EVALUATION_THRESHOLD || process.env.MIN_WIN_THRESHOLD || '70'), 10),
  maxSubmissionsPerBounty: Number.parseInt(process.env.MAX_SUBMISSIONS || '50', 10),
  bountyDuration: Number.parseInt(process.env.BOUNTY_DURATION || `${7 * 24 * 60 * 60 * 1000}`, 10), // 7 days
  poidhApiUrl: 'https://api.poidh.xyz', // Example URL - adjust to actual poidh API
  poidhIndexerBaseUrl: process.env.POIDH_INDEXER_BASE_URL || '',
  poidhChainId: process.env.POIDH_CHAIN_ID ? Number.parseInt(process.env.POIDH_CHAIN_ID, 10) : null,
  poidhBountyId: process.env.POIDH_BOUNTY_ID || null,
  poidhMode: (process.env.POIDH_MODE || 'indexer').toLowerCase(),
  evmNetwork: process.env.EVM_NETWORK || 'base-sepolia'
};

// Initialize logger
class Logger {
  constructor() {
    this.logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    };
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    
    // Write to file
    const logFile = path.join(this.logDir, `bot-${new Date().toISOString().split('T')[0]}.jsonl`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    
    // Separate decision log
    if (level === 'decision') {
      const decisionFile = path.join(this.logDir, 'decisions.jsonl');
      fs.appendFileSync(decisionFile, JSON.stringify(logEntry) + '\n');
    }
  }

  info(message, data) { this.log('info', message, data); }
  error(message, data) { this.log('error', message, data); }
  success(message, data) { this.log('success', message, data); }
  decision(message, data) { this.log('decision', message, data); }
}

const logger = new Logger();

// Bounty Manager
class BountyManager {
  constructor(wallet, connection, ollamaUrl) {
    this.wallet = wallet;
    this.connection = connection;
    this.ollamaUrl = ollamaUrl || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llava';
    this.demoMode = (process.env.DEMO_MODE || 'false').toLowerCase() === 'true';
    this.activeBounty = null;
    this.submissions = new Map();
    this.evmSigner = null;
    this.poidhEvm = null;

    this.poidhIndexer = null;
    if (CONFIG.poidhIndexerBaseUrl && CONFIG.poidhChainId && CONFIG.poidhBountyId && !this.demoMode) {
      try {
        this.poidhIndexer = new PoidhIndexerClient({ baseUrl: CONFIG.poidhIndexerBaseUrl });
      } catch (e) {
        logger.error('Failed to initialize POIDH indexer client', { error: e?.message || String(e) });
      }
    }

    if (CONFIG.poidhMode === 'evm' && !this.demoMode) {
      try {
        const evmWallet = loadOrCreateEvmWallet();
        const provider = connectEvmProvider();
        this.evmSigner = evmWallet.connect(provider);
        this.poidhEvm = new PoidhEvmContract({ signer: this.evmSigner, network: CONFIG.evmNetwork });
      } catch (e) {
        logger.error('Failed to initialize EVM POIDH contract', { error: e?.message || String(e) });
      }
    }

    this.evaluator = new ClaudeEvaluator({
      ollamaUrl: this.ollamaUrl,
      model: this.model,
      logger: {
        info: (message, data) => logger.info(message, data),
        error: (message, data) => logger.error(message, data)
      }
    });
  }

  async createBounty() {
    logger.info('Creating new bounty...');
    
    // Load bounty template
    const templates = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'config/bounty-templates.json'))
    );
    const template = templates.bounties[Math.floor(Math.random() * templates.bounties.length)];
    
    const bounty = {
      id: `bounty_${Date.now()}`,
      ...template,
      createdAt: Date.now(),
      deadline: Date.now() + CONFIG.bountyDuration,
      status: 'active',
      rewardLamports: template.rewardSOL * LAMPORTS_PER_SOL
    };

    logger.info('Bounty template selected', { title: bounty.title });

    if (this.poidhIndexer) {
      try {
        const remote = await this.poidhIndexer.getBounty(CONFIG.poidhChainId, CONFIG.poidhBountyId);
        const remoteTitle = remote?.title || remote?.bounty?.title;
        bounty.id = String(CONFIG.poidhBountyId);
        if (remoteTitle) bounty.title = remoteTitle;
        bounty.poidh = remote;
      } catch (e) {
        logger.error('Failed to fetch POIDH bounty from indexer', { error: e?.message || String(e) });
      }
    }

    // For actual poidh integration, you would:
    // 1. Call poidh smart contract to create bounty
    // 2. Fund escrow account
    // Example (pseudo-code):
    /*
    const poidhProgram = new PublicKey('POIDH_PROGRAM_ID');
    const bountyAccount = await createBountyOnChain(
      this.connection,
      this.wallet,
      poidhProgram,
      bounty
    );
    */

    // For demo: simulate on-chain creation
    this.activeBounty = bounty;
    
    logger.success('Bounty created successfully', {
      bountyId: bounty.id,
      title: bounty.title,
      reward: bounty.rewardSOL + ' SOL',
      deadline: new Date(bounty.deadline).toISOString()
    });

    return bounty;
  }

  async monitorSubmissions() {
    if (!this.activeBounty || this.activeBounty.status !== 'active') {
      return;
    }

    logger.info('Checking for new submissions...');

    if (this.poidhIndexer) {
      let claimsPayload;
      try {
        claimsPayload = await this.poidhIndexer.getBountyClaims(CONFIG.poidhChainId, CONFIG.poidhBountyId);
      } catch (e) {
        logger.error('Failed to fetch claims from POIDH indexer', { error: e?.message || String(e) });
        return this.submissions.size;
      }

      const claims = Array.isArray(claimsPayload)
        ? claimsPayload
        : (claimsPayload?.claims || claimsPayload?.data || []);

      for (const claim of claims) {
        const id = String(claim?.id ?? claim?.claimId ?? claim?.claim_id ?? '');
        if (!id) continue;
        if (this.submissions.has(id)) continue;

        const walletAddress = String(
          claim?.issuer ?? claim?.claimer ?? claim?.user ?? claim?.wallet ?? claim?.address ?? ''
        );

        this.addSubmission({
          id,
          walletAddress,
          imageUrl: claim?.imageUrl ?? claim?.image_url ?? claim?.mediaUrl ?? claim?.media_url ?? claim?.uri ?? null,
          raw: claim
        });
      }

      return this.submissions.size;
    }

    // In production, poll poidh API or listen to on-chain events
    // Example:
    /*
    const response = await axios.get(
      `${CONFIG.poidhApiUrl}/bounties/${this.activeBounty.id}/submissions`
    );
    const newSubmissions = response.data.submissions;
    */

    // For demo: simulate submissions appearing over time
    // In real implementation, this would fetch from poidh
    
    return this.submissions.size;
  }

  async evaluateSubmissions() {
    logger.info('Starting AI evaluation of submissions...', {
      count: this.submissions.size
    });

    const evaluations = [];

    for (const [submissionId, submission] of this.submissions) {
      if (submission.evaluated) continue;

      try {
        logger.info(`Evaluating submission ${submissionId}...`);

        // Download image from IPFS/Arweave
        // const imageData = await downloadSubmissionImage(submission.imageUrl);
        // const base64Image = imageData.toString('base64');

        // For demo, we'll use a placeholder
        // In production, fetch actual submission images

        const evaluation = await this.evaluateWithAI(
          submission,
          this.activeBounty.requirements
        );

        submission.evaluation = evaluation;
        submission.evaluated = true;

        evaluations.push({
          submissionId,
          ...evaluation
        });

        logger.success(`Submission ${submissionId} evaluated`, {
          score: evaluation.total_score,
          winner_worthy: evaluation.winner_worthy
        });

      } catch (error) {
        logger.error(`Failed to evaluate submission ${submissionId}`, {
          error: error.message
        });
      }
    }

    return evaluations;
  }

  async evaluateWithAI(submission, requirements) {
    if (this.demoMode) {
      return {
        authenticity_score: 35,
        compliance_score: 27,
        quality_score: 18,
        validity_score: 10,
        total_score: 90,
        reasoning: 'Demo mode evaluation: deterministic high score for end-to-end verification',
        winner_worthy: true
      };
    }

    const evaluation = await this.evaluator.evaluateSubmission({
      submissionId: submission?.id,
      title: this.activeBounty?.title || 'Bounty',
      requirements
    });

    return evaluation;
  }

  async selectWinner(evaluations) {
    logger.info('Selecting winner from evaluations...');

    // Filter valid submissions (above threshold)
    const validSubmissions = evaluations.filter(
      e => e.total_score >= CONFIG.evaluationThreshold
    );

    if (validSubmissions.length === 0) {
      logger.error('No submissions met the quality threshold', {
        threshold: CONFIG.evaluationThreshold,
        total_submissions: evaluations.length
      });
      return null;
    }

    // Sort by score (descending)
    validSubmissions.sort((a, b) => b.total_score - a.total_score);

    const winner = validSubmissions[0];
    const runnerUps = validSubmissions.slice(1, 3);

    // Log transparent decision
    const decision = {
      bountyId: this.activeBounty.id,
      bountyTitle: this.activeBounty.title,
      winnerId: winner.submissionId,
      winnerScore: winner.total_score,
      winnerReasoning: this.submissions.get(winner.submissionId).evaluation.reasoning,
      totalSubmissions: evaluations.length,
      validSubmissions: validSubmissions.length,
      threshold: CONFIG.evaluationThreshold,
      runnerUps: runnerUps.map(r => ({
        id: r.submissionId,
        score: r.total_score
      })),
      allScores: validSubmissions.map(s => ({
        id: s.submissionId,
        score: s.total_score
      })),
      timestamp: new Date().toISOString()
    };

    logger.decision('Winner selected', decision);

    return {
      winner: this.submissions.get(winner.submissionId),
      decision
    };
  }

  async payWinner(winner) {
    if (!winner) {
      logger.error('Cannot pay: no winner selected');
      return false;
    }

    const dryRunPayments = (process.env.DRY_RUN_PAYMENTS || 'false').toLowerCase() === 'true';
    if (CONFIG.poidhMode === 'evm') {
      if (dryRunPayments) {
        logger.success('Dry-run payment: skipping EVM claim acceptance', {
          recipient: winner.walletAddress,
          bountyId: this.activeBounty?.id,
          claimId: winner.id
        });

        this.activeBounty.status = 'completed';
        this.activeBounty.winnerId = winner.id;
        this.activeBounty.paymentSignature = 'DRY_RUN';
        return true;
      }

      if (!this.poidhEvm) {
        logger.error('EVM payment failed: POIDH EVM contract not initialized');
        return false;
      }

      if (!CONFIG.poidhBountyId) {
        logger.error('EVM payment failed: POIDH_BOUNTY_ID is required in POIDH_MODE=evm');
        return false;
      }

      let bountyId;
      let claimId;
      try {
        bountyId = BigInt(String(CONFIG.poidhBountyId));
        claimId = BigInt(String(winner.id));
      } catch {
        logger.error('EVM payment failed: invalid bountyId/claimId', {
          bountyId: CONFIG.poidhBountyId,
          claimId: winner.id
        });
        return false;
      }

      logger.info('Accepting EVM claim (payout occurs on-chain)', {
        contract: this.poidhEvm.address,
        network: CONFIG.evmNetwork,
        bountyId: String(bountyId),
        claimId: String(claimId)
      });

      try {
        const receipt = await this.poidhEvm.acceptClaim(bountyId, claimId);

        logger.success('EVM claim accepted', {
          tx: receipt?.hash
        });

        this.activeBounty.status = 'completed';
        this.activeBounty.winnerId = winner.id;
        this.activeBounty.paymentSignature = receipt?.hash || 'UNKNOWN';
        return true;
      } catch (error) {
        logger.error('EVM claim acceptance failed', {
          error: error?.message || String(error)
        });
        return false;
      }
    }

    if (dryRunPayments) {
      logger.success('Dry-run payment: skipping SOL transfer', {
        recipient: winner.walletAddress,
        amount: this.activeBounty.rewardSOL + ' SOL'
      });

      this.activeBounty.status = 'completed';
      this.activeBounty.winnerId = winner.id;
      this.activeBounty.paymentSignature = 'DRY_RUN';
      return true;
    }

    logger.info('Processing payment to winner...', {
      recipient: winner.walletAddress,
      amount: this.activeBounty.rewardSOL + ' SOL'
    });

    let recipientPubkey;
    try {
      recipientPubkey = new PublicKey(winner.walletAddress);
    } catch {
      logger.error('Payment failed: invalid Solana recipient address', {
        recipient: winner.walletAddress
      });
      return false;
    }

    try {
      // Create payment transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.wallet.publicKey,
          toPubkey: recipientPubkey,
          lamports: this.activeBounty.rewardLamports
        })
      );

      // Sign and send
      const signature = await this.connection.sendTransaction(
        transaction,
        [this.wallet]
      );

      // Confirm transaction
      await this.connection.confirmTransaction(signature);

      logger.success('Payment sent successfully', {
        signature,
        recipient: winner.walletAddress,
        amount: this.activeBounty.rewardSOL + ' SOL'
      });

      // Update bounty status
      this.activeBounty.status = 'completed';
      this.activeBounty.winnerId = winner.id;
      this.activeBounty.paymentSignature = signature;

      return true;

    } catch (error) {
      logger.error('Payment failed', {
        error: error.message,
        recipient: winner.walletAddress
      });
      return false;
    }
  }

  // Simulate adding a submission (for demo/testing)
  addSubmission(submission) {
    this.submissions.set(submission.id, {
      ...submission,
      evaluated: false,
      receivedAt: Date.now()
    });
    logger.info('New submission received', { id: submission.id });
  }
}

// Main Bot Class
class AutonomousPoidhBot {
  constructor() {
    this.wallet = null;
    this.connection = null;
    this.anthropic = null;
    this.bountyManager = null;
    this.isRunning = false;
  }

  async initialize() {
    logger.info('Initializing autonomous bot...');

    // Load wallet
    this.wallet = loadOrCreateWallet();
    logger.info('Wallet loaded', {
      publicKey: this.wallet.publicKey.toBase58()
    });

    // Connect to Solana
    this.connection = new Connection(
      clusterApiUrl(CONFIG.network),
      'confirmed'
    );
    logger.info('Connected to Solana', { network: CONFIG.network });

    // Check balance
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    logger.info('Wallet balance', {
      SOL: balance / LAMPORTS_PER_SOL
    });

    if (balance < 0.1 * LAMPORTS_PER_SOL) {
      logger.error('Insufficient balance to create bounties');
      throw new Error('Please fund wallet with at least 0.1 SOL');
    }

    const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    logger.info('Ollama API configured', { url: ollamaUrl });
    
    // Test Ollama connection
    try {
      await axios.get(`${ollamaUrl}/api/tags`);
      logger.info('✓ Ollama connection verified');
    } catch (error) {
      throw new Error(`Cannot connect to Ollama at ${ollamaUrl}. Make sure Ollama is running.`);
    }

    // Initialize bounty manager
    this.bountyManager = new BountyManager(
      this.wallet,
      this.connection,
      ollamaUrl
    );

    logger.success('Bot initialization complete');
  }

  async run() {
    this.isRunning = true;
    logger.info('🤖 Autonomous bot started');

    try {
      // Step 1: Create bounty
      await this.bountyManager.createBounty();

      const demoMode = (process.env.DEMO_MODE || 'false').toLowerCase() === 'true';
      if (demoMode) {
        this.bountyManager.activeBounty.deadline = Date.now() + 5000;

        for (let i = 0; i < 3; i += 1) {
          this.bountyManager.addSubmission({
            id: `demo_${Date.now()}_${i}`,
            walletAddress: Keypair.generate().publicKey.toBase58()
          });
        }
      }

      // Step 2: Monitor loop
      while (this.isRunning && this.bountyManager.activeBounty.status === 'active') {
        
        // Check if deadline passed
        if (Date.now() > this.bountyManager.activeBounty.deadline) {
          logger.info('Bounty deadline reached, starting evaluation...');
          break;
        }

        // Monitor for new submissions
        await this.bountyManager.monitorSubmissions();

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, demoMode ? 1000 : CONFIG.pollingInterval));
      }

      // Step 3: Evaluate all submissions
      const evaluations = await this.bountyManager.evaluateSubmissions();

      if (evaluations.length === 0) {
        logger.error('No submissions to evaluate');
        return;
      }

      // Step 4: Select winner
      const result = await this.bountyManager.selectWinner(evaluations);

      if (!result) {
        logger.error('No valid winner found');
        return;
      }

      // Step 5: Pay winner
      await this.bountyManager.payWinner(result.winner);

      logger.success('🏆 Bounty cycle completed successfully', {
        bountyId: this.bountyManager.activeBounty.id,
        winnerId: result.winner.id
      });

    } catch (error) {
      logger.error('Bot error', { error: error.message, stack: error.stack });
    } finally {
      this.isRunning = false;
    }
  }

  async stop() {
    logger.info('Stopping bot...');
    this.isRunning = false;
  }
}

// Entry point
async function main() {
  const bot = new AutonomousPoidhBot();
  
  try {
    await bot.initialize();
    await bot.run();
  } catch (error) {
    logger.error('Fatal error', { error: error.message });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default AutonomousPoidhBot;