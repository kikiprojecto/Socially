import 'dotenv/config';

import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { loadOrCreateWallet } from '../poidh_wallet.js';

async function main() {
  const network = process.env.SOLANA_NETWORK || 'devnet';
  const wallet = loadOrCreateWallet();
  const connection = new Connection(clusterApiUrl(network), 'confirmed');

  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`Wallet: ${wallet.publicKey.toBase58()}`);
  console.log(`Network: ${network}`);
  console.log(`Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
