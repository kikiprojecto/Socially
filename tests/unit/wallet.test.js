import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { loadOrCreateWallet } from '../../src/blockchain/wallet.js';

describe('Wallet', () => {
  it('should create or load wallet', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'socially-wallet-'));
    process.env.WALLET_PATH = path.join(tmp, 'wallet.json');

    const wallet = loadOrCreateWallet();
    expect(wallet).toBeDefined();
    expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });
});
