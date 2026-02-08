import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import { Wallet, JsonRpcProvider } from 'ethers';

function deriveKey(password, salt) {
  return crypto.scryptSync(password, salt, 32);
}

function encryptJson(json, password) {
  const iv = crypto.randomBytes(12);
  const salt = crypto.randomBytes(16);
  const key = deriveKey(password, salt);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(json), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    v: 1,
    alg: 'aes-256-gcm',
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    tag: tag.toString('hex'),
    data: ciphertext.toString('hex')
  };
}

function decryptJson(payload, password) {
  if (!payload || payload.v !== 1 || payload.alg !== 'aes-256-gcm') {
    throw new Error('Unsupported wallet format');
  }

  const iv = Buffer.from(payload.iv, 'hex');
  const salt = Buffer.from(payload.salt, 'hex');
  const tag = Buffer.from(payload.tag, 'hex');
  const data = Buffer.from(payload.data, 'hex');

  const key = deriveKey(password, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}

export function loadOrCreateEvmWallet(opts = {}) {
  const walletPath = opts.walletPath || path.join(process.cwd(), 'wallet.evm.json');
  const password = (opts.password ?? process.env.WALLET_PASSWORD ?? '').trim();

  if (process.env.EVM_PRIVATE_KEY) {
    return new Wallet(process.env.EVM_PRIVATE_KEY.trim());
  }

  if (fs.existsSync(walletPath)) {
    const raw = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
    if (raw && raw.encrypted && password) {
      const decrypted = decryptJson(raw.encrypted, password);
      if (!decrypted?.privateKey) throw new Error('Wallet file missing privateKey');
      return new Wallet(decrypted.privateKey);
    }

    if (raw && raw.privateKey) {
      return new Wallet(raw.privateKey);
    }

    throw new Error('Unsupported wallet file; set WALLET_PASSWORD if encrypted');
  }

  const wallet = Wallet.createRandom();

  const toSave = password
    ? { address: wallet.address, encrypted: encryptJson({ privateKey: wallet.privateKey }, password) }
    : { address: wallet.address, privateKey: wallet.privateKey };

  fs.writeFileSync(walletPath, JSON.stringify(toSave, null, 2), 'utf8');
  return wallet;
}

export function connectEvmProvider() {
  const rpcUrl = (process.env.EVM_RPC_URL || '').trim();
  if (!rpcUrl) throw new Error('EVM_RPC_URL is required for POIDH_MODE=evm');
  return new JsonRpcProvider(rpcUrl);
}
