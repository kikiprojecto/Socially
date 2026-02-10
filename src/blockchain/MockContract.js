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
    logger.info('🎭 MOCK: Starting claim monitoring...', {
      bountyId,
      note: 'Will auto-generate 3 realistic test submissions in 10 seconds'
    });

    this.eventCallbacks.set(bountyId, callback);

    setTimeout(async () => {
      await this.generateTestSubmissions(bountyId, callback);
    }, 10000);
  }

  async generateTestSubmissions(bountyId, callback) {
    logger.info('🎭 MOCK: Generating test submissions...', { bountyId });

    const now = Date.now();
    const testSubmissions = [
      {
        description:
          'Perfect submission: Clear outdoor photo with stranger holding large handwritten "POIDH" sign. Both people smiling, excellent lighting, professional quality. Taken in public park with visible background.',
        imageURI: `ipfs://QmMockHighQuality${now}`,
        expectedScore: 92,
        quality: 'HIGH'
      },
      {
        description:
          'Good submission: Photo with POIDH sign visible but taken indoors. Lighting is acceptable, sign is readable but smaller. Both people present but casual setting.',
        imageURI: `ipfs://QmMockMediumQuality${now}`,
        expectedScore: 78,
        quality: 'MEDIUM'
      },
      {
        description:
          'Marginal submission: Blurry photo, sign partially visible, poor lighting. Taken indoors with cluttered background. Sign text barely readable.',
        imageURI: `ipfs://QmMockLowQuality${now}`,
        expectedScore: 65,
        quality: 'LOW'
      }
    ];

    for (let i = 0; i < testSubmissions.length; i++) {
      const sub = testSubmissions[i];
      const claimId = i.toString();
      const claimer = `0x${crypto.randomBytes(20).toString('hex')}`;

      const claim = {
        claimer,
        description: sub.description,
        imageURI: sub.imageURI,
        createdAt: Date.now(),
        accepted: false,
        _mockQuality: sub.quality,
        _mockExpectedScore: sub.expectedScore
      };

      const claimKey = `${bountyId}_${claimId}`;
      this.claims.set(claimKey, claim);

      const bounty = this.bounties.get(bountyId);
      if (bounty) bounty.claimCount++;

      logger.success('✅ Mock claim created', {
        bountyId,
        claimId,
        claimer,
        quality: sub.quality,
        expectedScore: sub.expectedScore
      });

      if (callback) {
        await callback({ bountyId, claimId, claimer, ...claim });
      }

      if (i < testSubmissions.length - 1) {
        await this.sleep(3000);
      }
    }

    logger.success('✅ All 3 mock submissions generated successfully!', { bountyId });
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
