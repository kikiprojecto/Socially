import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { loadOrCreateWallet, connectWallet, getBalance } from '../blockchain/wallet.js';
import { PoidhContract } from '../blockchain/PoidhContract.js';
import { ClaudeEvaluator } from '../ai/ClaudeEvaluator.js';
import { IPFSClient } from '../storage/IPFSClient.js';
import { Logger } from '../storage/Logger.js';

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

  async initialize() {
    this.logger.info('Initializing bot', { network: this.config.network });

    const wallet = loadOrCreateWallet();
    this.wallet = connectWallet(wallet, this.config.network);

    const balance = await getBalance(this.wallet);
    this.logger.info('Wallet balance', { address: this.wallet.address, balanceEth: balance });

    const minBalance = 0.01;
    if (Number.parseFloat(balance) < minBalance) {
      throw new Error(`Insufficient balance. Need at least ${minBalance} ETH`);
    }

    this.contract = new PoidhContract(this.wallet, this.config.network);
    this.evaluator = new ClaudeEvaluator(process.env.ANTHROPIC_API_KEY);
    this.ipfs = new IPFSClient();

    this.logger.info('Initialization complete');
  }

  async createBounty() {
    const templatesPath = path.join(__dirname, '../../config/bounty-templates.json');
    const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
    const template = templates.bounties[0];

    let imageURI = '';

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

    this.logger.info('Bounty created', { bountyId: result.bountyId, tx: result.transactionHash });
    return this.activeBounty;
  }

  async monitorSubmissions() {
    await this.contract.monitorClaims(this.activeBounty.bountyId, async (claim) => {
      await this.handleNewClaim(claim);
    });
  }

  async handleNewClaim(claim) {
    this.logger.info('New claim received', { claimId: claim.claimId, claimer: claim.claimer });

    try {
      const imageBuffer = await this.ipfs.fetchImage(claim.imageURI);
      this.submissions.set(claim.claimId, {
        ...claim,
        imageBuffer,
        receivedAt: Date.now(),
        evaluated: false
      });
      this.logger.info('Claim stored', { claimId: claim.claimId });
    } catch (error) {
      this.logger.error('Failed to process claim', { claimId: claim.claimId, error: error?.message || String(error) });
    }
  }

  async evaluateSubmissions() {
    const evaluations = [];

    for (const [claimId, submission] of this.submissions) {
      if (submission.evaluated) continue;

      try {
        const evaluation = await this.evaluator.evaluate(submission.imageBuffer, this.activeBounty.requirements);
        submission.evaluation = evaluation;
        submission.evaluated = true;

        evaluations.push({
          claimId,
          claimer: submission.claimer,
          ...evaluation
        });

        this.logger.info('Claim evaluated', { claimId, score: evaluation.total_score });
      } catch (error) {
        this.logger.error('Evaluation failed', { claimId, error: error?.message || String(error) });
      }
    }

    return evaluations;
  }

  async selectWinner() {
    const evaluations = await this.evaluateSubmissions();
    if (evaluations.length === 0) return null;

    const valid = evaluations
      .filter((e) => e.total_score >= this.config.evaluationThreshold)
      .sort((a, b) => b.total_score - a.total_score);

    if (valid.length === 0) return null;

    const winner = valid[0];
    this.logger.decision('Winner selected', {
      bountyId: this.activeBounty.bountyId,
      bountyTitle: this.activeBounty.title,
      winnerId: winner.claimId,
      winnerAddress: winner.claimer,
      winnerScore: winner.total_score,
      winnerReasoning: winner.reasoning,
      totalSubmissions: evaluations.length,
      validSubmissions: valid.length,
      threshold: this.config.evaluationThreshold,
      timestamp: new Date().toISOString()
    });

    return winner;
  }

  async payWinner(winner) {
    const result = await this.contract.acceptClaim(this.activeBounty.bountyId, winner.claimId);
    this.logger.info('Winner paid', { tx: result.transactionHash, explorerUrl: result.explorerUrl });
    return result;
  }

  async run() {
    await this.initialize();
    await this.createBounty();
    await this.monitorSubmissions();
    this.logger.info('Monitoring for submissions');
  }

  async triggerEvaluation() {
    const claims = await this.contract.getAllClaims(this.activeBounty.bountyId);
    for (const claim of claims) {
      if (!this.submissions.has(claim.claimId)) {
        await this.handleNewClaim(claim);
      }
    }

    const winner = await this.selectWinner();
    if (!winner) return false;
    await this.payWinner(winner);
    this.logger.info('Cycle complete');
    return true;
  }
}
