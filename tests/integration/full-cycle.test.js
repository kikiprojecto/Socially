import { describe, it, expect } from '@jest/globals';
import dotenv from 'dotenv';
import { AutonomousBountyBot } from '../../src/bot/BountyBot.js';

dotenv.config();

describe('Full Bounty Cycle', () => {
  const run = process.env.RUN_INTEGRATION_TESTS === '1' ? it : it.skip;

  run('should initialize and create a bounty (manual/semi-automated)', async () => {
    const config = {
      network: 'base-sepolia',
      evaluationThreshold: 70,
      pollingInterval: 60000
    };

    const bot = new AutonomousBountyBot(config);

    await bot.initialize();
    expect(bot.wallet).toBeDefined();

    const bounty = await bot.createBounty();
    expect(bounty.bountyId).toBeDefined();
  }, 60000);
});
