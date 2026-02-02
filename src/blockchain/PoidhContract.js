import { PublicKey } from '@solana/web3.js';

export class PoidhContract {
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = process.env.POIDH_PROGRAM_ID ? new PublicKey(process.env.POIDH_PROGRAM_ID) : null;
  }

  async createBounty() {
    throw new Error('PoidhContract.createBounty is not implemented (missing verified on-chain interface)');
  }

  async fetchSubmissions() {
    throw new Error('PoidhContract.fetchSubmissions is not implemented (missing verified on-chain interface)');
  }

  async selectWinner() {
    throw new Error('PoidhContract.selectWinner is not implemented (missing verified on-chain interface)');
  }
}
