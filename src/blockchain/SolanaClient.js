import { Connection, clusterApiUrl } from '@solana/web3.js';

export class SolanaClient {
  constructor(network = process.env.SOLANA_NETWORK || 'devnet') {
    this.network = network;
    this.connection = new Connection(clusterApiUrl(network), 'confirmed');
  }
}
