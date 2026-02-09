import { Wallet, JsonRpcProvider, ethers } from 'ethers';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WALLET_PATH = (process.env.WALLET_PATH && process.env.WALLET_PATH.trim())
  ? process.env.WALLET_PATH.trim()
  : path.join(__dirname, '../../wallet.json');

export function loadOrCreateWallet() {
  if (fs.existsSync(WALLET_PATH)) {
    const data = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf8'));

    let privateKey;
    if (data.encrypted && process.env.WALLET_PASSWORD) {
      privateKey = decrypt(data.privateKey, process.env.WALLET_PASSWORD);
    } else {
      privateKey = data.privateKey;
    }

    try {
      const wallet = new Wallet(privateKey);
      return wallet;
    } catch {
      const wallet = Wallet.createRandom();
      const walletData = {
        address: wallet.address,
        privateKey: process.env.WALLET_PASSWORD
          ? encrypt(wallet.privateKey, process.env.WALLET_PASSWORD)
          : wallet.privateKey,
        encrypted: !!process.env.WALLET_PASSWORD,
        createdAt: new Date().toISOString()
      };
      fs.writeFileSync(WALLET_PATH, JSON.stringify(walletData, null, 2), 'utf8');
      return wallet;
    }
  }

  const wallet = Wallet.createRandom();

  const walletData = {
    address: wallet.address,
    privateKey: process.env.WALLET_PASSWORD
      ? encrypt(wallet.privateKey, process.env.WALLET_PASSWORD)
      : wallet.privateKey,
    encrypted: !!process.env.WALLET_PASSWORD,
    createdAt: new Date().toISOString()
  };

  fs.writeFileSync(WALLET_PATH, JSON.stringify(walletData, null, 2), 'utf8');
  return wallet;
}

export function connectWallet(wallet, network, provider) {
  const p = provider || getProvider(network);
  return wallet.connect(p);
}

export function getProvider(network) {
  const RPC_URLS = {
    base: 'https://mainnet.base.org',
    'base-sepolia': 'https://sepolia.base.org',
    arbitrum: 'https://arb1.arbitrum.io/rpc',
    'arbitrum-sepolia': 'https://sepolia-rollup.arbitrum.io/rpc',
    degen: 'https://rpc.degen.tips'
  };

  const rpcUrl = RPC_URLS[network];
  if (!rpcUrl) {
    throw new Error(`Unknown network: ${network}`);
  }

  return new JsonRpcProvider(rpcUrl);
}

function encrypt(text, password) {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted
  };
}

function decrypt(encryptedData, password) {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(password, 'salt', 32);
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

  let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export async function getBalance(wallet) {
  const balance = await wallet.provider.getBalance(wallet.address);
  return ethers.formatEther(balance);
}
