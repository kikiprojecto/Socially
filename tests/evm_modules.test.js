import test from 'node:test';
import assert from 'node:assert/strict';

import { IPFSClient } from '../src/storage/IPFSClient.js';
import { PoidhEvmContract } from '../src/blockchain/PoidhEvmContract.js';

test('IPFSClient converts ipfs:// to gateway url', () => {
  const ipfs = new IPFSClient({ gatewayBaseUrl: 'https://example.com/ipfs' });
  assert.equal(ipfs.ipfsToGatewayUrl('ipfs://Qm123'), 'https://example.com/ipfs/Qm123');
});

test('PoidhEvmContract requires address', () => {
  const prev = process.env.POIDH_EVM_CONTRACT_ADDRESS;
  try {
    process.env.POIDH_EVM_CONTRACT_ADDRESS = '';
    assert.throws(() => new PoidhEvmContract({ signer: {}, network: 'unknown' }));
  } finally {
    if (typeof prev === 'string') process.env.POIDH_EVM_CONTRACT_ADDRESS = prev;
    else delete process.env.POIDH_EVM_CONTRACT_ADDRESS;
  }
});
