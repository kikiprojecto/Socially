import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { getNetworkConfig, getExplorerUrl, getAddressUrl } from '../../src/blockchain/networks.js';

describe('networks', () => {
  const prevAddr = process.env.POIDH_EVM_CONTRACT_ADDRESS;

  beforeEach(() => {
    delete process.env.POIDH_EVM_CONTRACT_ADDRESS;
  });

  afterEach(() => {
    if (typeof prevAddr === 'undefined') {
      delete process.env.POIDH_EVM_CONTRACT_ADDRESS;
    } else {
      process.env.POIDH_EVM_CONTRACT_ADDRESS = prevAddr;
    }
  });

  it('throws a helpful error for unknown network', () => {
    expect(() => getNetworkConfig('nope')).toThrow(/Unknown network/);
    expect(() => getNetworkConfig('nope')).toThrow(/Available networks/);
  });

  it('returns mainnet config with built-in contract', () => {
    const cfg = getNetworkConfig('base');
    expect(cfg.testnet).toBe(false);
    expect(cfg.poidhContract).toMatch(/^0x/i);
  });

  it('requires POIDH_EVM_CONTRACT_ADDRESS for testnet placeholder', () => {
    expect(() => getNetworkConfig('base-sepolia')).toThrow(/requires contract address/i);
  });

  it('uses POIDH_EVM_CONTRACT_ADDRESS override for testnet', () => {
    process.env.POIDH_EVM_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';
    const cfg = getNetworkConfig('base-sepolia');
    expect(cfg.testnet).toBe(true);
    expect(cfg.poidhContract).toBe('0x0000000000000000000000000000000000000001');
  });

  it('builds explorer urls', () => {
    const tx = '0x' + '1'.repeat(64);
    const addr = '0x' + '2'.repeat(40);
    expect(getExplorerUrl(tx, 'base')).toContain('/tx/');
    expect(getAddressUrl(addr, 'base')).toContain('/address/');
  });
});
