import { SystemProgram, Transaction, PublicKey } from '@solana/web3.js';

export class PaymentProcessor {
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;
  }

  async transferLamports({ to, lamports }) {
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.wallet.publicKey,
        toPubkey: new PublicKey(to),
        lamports
      })
    );

    const signature = await this.connection.sendTransaction(tx, [this.wallet]);
    await this.connection.confirmTransaction(signature);
    return signature;
  }
}
