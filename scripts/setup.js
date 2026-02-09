import dotenv from 'dotenv';
import fs from 'fs';

import { loadOrCreateWallet, connectWallet, getBalance, getProvider } from '../src/blockchain/wallet.js';

dotenv.config();

async function main() {
  if (!fs.existsSync('.env')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('.env created from .env.example');
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    console.log('ANTHROPIC_API_KEY not configured');
  } else {
    console.log('ANTHROPIC_API_KEY found');
  }

  const wallet = loadOrCreateWallet();
  console.log(`Wallet: ${wallet.address}`);

  const network = process.env.NETWORK || 'base-sepolia';
  const provider = getProvider(network);
  const connected = connectWallet(wallet, network, provider);
  const balance = await getBalance(connected);
  console.log(`Network: ${network}`);
  console.log(`Balance: ${balance} ETH`);
}

main().catch((err) => {
  console.error(err?.message || String(err));
  process.exit(1);
});
