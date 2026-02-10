#!/usr/bin/env node

import { Wallet } from 'ethers';

import { MockPoidhContract } from '../src/blockchain/MockContract.js';
import { MockIPFSClient } from '../src/storage/MockIPFS.js';

console.log('\n🧪 Testing Mock Mode Components...\n');

async function testMockContract() {
  console.log('1️⃣  Testing MockPoidhContract...');

  const wallet = Wallet.createRandom();
  const contract = new MockPoidhContract(wallet, 'base-sepolia');

  const result = await contract.createBounty({
    name: 'Test Bounty',
    description: 'Test Description',
    imageURI: '',
    rewardETH: 0.001
  });

  console.log(`   ✅ Bounty created: ${result.bountyId}`);
  console.log(`   ✅ TX Hash: ${result.transactionHash}`);

  const bounty = await contract.getBounty(result.bountyId);
  console.log(`   ✅ Bounty retrieved: ${bounty.name}`);

  console.log('   ✅ MockPoidhContract works!\n');
}

async function testMockIPFS() {
  console.log('2️⃣  Testing MockIPFSClient...');

  const ipfs = new MockIPFSClient();

  const buffer = Buffer.from('test');
  const upload = await ipfs.uploadImage(buffer, 'test.jpg');
  console.log(`   ✅ Upload simulated: ${upload.ipfsHash}`);

  const download = await ipfs.fetchImage(upload.ipfsUrl);
  console.log(`   ✅ Download simulated: ${download.length} bytes`);

  const gatewayUrl = ipfs.toGatewayUrl('ipfs://QmTest123');
  console.log(`   ✅ URL conversion works: ${gatewayUrl}`);

  console.log('   ✅ MockIPFSClient works!\n');
}

async function runTests() {
  try {
    await testMockContract();
    await testMockIPFS();

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ All Mock Mode tests passed!');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Ready to run: npm start (with MOCK_MODE=true)\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error?.message || String(error));
    process.exit(1);
  }
}

runTests();
