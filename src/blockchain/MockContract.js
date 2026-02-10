import crypto from 'crypto';

import { Logger } from '../storage/Logger.js';

const logger = new Logger();

export class MockPoidhContract {
  constructor(wallet, network) {
    this.wallet = wallet;
    this.network = network;
    this.bounties = new Map();
    this.claims = new Map();
    this.eventCallbacks = new Map();

    logger.warn('═══════════════════════════════════════════════════════');
    logger.warn('🎭 MOCK MODE ENABLED');
    logger.warn('No real blockchain transactions will be sent');
    logger.warn('Perfect for testing AI evaluation without gas costs');
    logger.warn('═══════════════════════════════════════════════════════');
  }

  async createBounty(bountyData) {
    const { name, description, imageURI, rewardETH } = bountyData;

    logger.info('🎭 MOCK: Creating bounty (simulated)...', {
      title: name,
      rewardETH,
      network: this.network,
      imageURI: imageURI || ''
    });

    await this.sleep(2000);

    const bountyId = Date.now().toString();
    const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;
    const blockNumber = Math.floor(Date.now() / 1000);

    this.bounties.set(bountyId, {
      issuer: this.wallet.address,
      name,
      description,
      imageURI: imageURI || '',
      amount: rewardETH,
      deadline: Date.now() + 24 * 60 * 60 * 1000,
      completed: false,
      claimCount: 0,
      createdAt: Date.now()
    });

    logger.success('✅ Mock bounty created successfully!', {
      bountyId,
      transactionHash: txHash,
      blockNumber
    });

    return {
      bountyId,
      transactionHash: txHash,
      blockNumber,
      explorerUrl: `https://sepolia.basescan.org/tx/${txHash}`
    };
  }

  async monitorClaims(bountyId, callback) {
    logger.info(`\n🎭 MOCK: Monitoring claims for bounty ${bountyId}...`);
    logger.warn('═══════════════════════════════════════════════════════');
    logger.warn('⚠️  MOCK MODE - TESTING ONLY');
    logger.warn('For bounty submission: Deploy to mainnet, wait for REAL users');
    logger.warn('═══════════════════════════════════════════════════════\n');

    this.eventCallbacks.set(bountyId, callback);

    logger.info('Listening for manual claim submissions via API...');
    logger.info('POST http://localhost:3001/api/mock/add-claim to test\n');
  }

  async addManualClaim(bountyId, claimData) {
    const bounty = this.bounties.get(bountyId);
    if (!bounty) throw new Error(`Bounty ${bountyId} not found`);

    const claimId = bounty.claimCount.toString();
    const { claimer, description, imageURI } = claimData;

    const claim = {
      claimer: claimer || `0x${crypto.randomBytes(20).toString('hex')}`,
      description,
      imageURI,
      createdAt: Date.now(),
      accepted: false
    };

    const claimKey = `${bountyId}_${claimId}`;
    this.claims.set(claimKey, claim);
    bounty.claimCount++;

    const callback = this.eventCallbacks.get(bountyId);
    if (callback) await callback({ bountyId, claimId, ...claim });

    return claimId;
  }

  async getClaim(bountyId, claimId) {
    const claimKey = `${bountyId}_${claimId}`;
    const claim = this.claims.get(claimKey);
    if (!claim) throw new Error(`Mock claim not found: ${claimKey}`);
    return claim;
  }

  async getAllClaims(bountyId) {
    const bounty = this.bounties.get(bountyId);
    if (!bounty) throw new Error(`Mock bounty not found: ${bountyId}`);

    const claims = [];
    for (let i = 0; i < bounty.claimCount; i++) {
      const claim = await this.getClaim(bountyId, i.toString());
      claims.push({ claimId: i.toString(), ...claim });
    }

    return claims;
  }

  async acceptClaim(bountyId, claimId) {
    logger.info('🎭 MOCK: Accepting winning claim...', { bountyId, claimId });

    await this.sleep(2000);

    const claimKey = `${bountyId}_${claimId}`;
    const claim = this.claims.get(claimKey);
    if (!claim) throw new Error(`Mock claim not found: ${claimKey}`);

    claim.accepted = true;

    const bounty = this.bounties.get(bountyId);
    if (bounty) {
      bounty.completed = true;
      bounty.winnerId = claimId;
      bounty.winnerAddress = claim.claimer;
    }

    const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;
    const blockNumber = Math.floor(Date.now() / 1000);

    logger.success('✅ Mock claim accepted successfully!', {
      bountyId,
      claimId,
      winnerAddress: claim.claimer,
      amount: bounty?.amount,
      transactionHash: txHash,
      blockNumber
    });

    return {
      transactionHash: txHash,
      blockNumber,
      explorerUrl: `https://sepolia.basescan.org/tx/${txHash}`
    };
  }

  async getBounty(bountyId) {
    const bounty = this.bounties.get(bountyId);
    if (!bounty) throw new Error(`Mock bounty not found: ${bountyId}`);
    return bounty;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
