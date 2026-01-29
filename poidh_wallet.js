/**
 * Autonomous Wallet Management
 * Handles Solana wallet creation, loading, and security
 */

import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WALLET_PATH = path.join(__dirname, 'wallet.json');
const ENCRYPTED_WALLET_PATH = path.join(__dirname, 'wallet.enc');

/**
 * Load existing wallet or create new one
 * @returns {Keypair} Solana keypair
 */
export function loadOrCreateWallet() {
  // Try to load existing wallet
  if (fs.existsSync(WALLET_PATH)) {
    console.log('Loading existing wallet...');
    try {
      const secretKeyString = fs.readFileSync(WALLET_PATH, 'utf8');
      const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
      const keypair = Keypair.fromSecretKey(secretKey);
      console.log(`Wallet loaded: ${keypair.publicKey.toBase58()}`);
      return keypair;
    } catch (error) {
      console.error('Failed to load wallet:', error.message);
      throw error;
    }
  }

  // Create new wallet
  console.log('Creating new wallet...');
  const keypair = Keypair.generate();
  
  // Save to file
  const secretKeyArray = Array.from(keypair.secretKey);
  fs.writeFileSync(WALLET_PATH, JSON.stringify(secretKeyArray), 'utf8');
  
  // Also save encrypted version with password
  if (process.env.WALLET_PASSWORD) {
    saveEncryptedWallet(keypair, process.env.WALLET_PASSWORD);
  }

  console.log(`New wallet created: ${keypair.publicKey.toBase58()}`);
  console.log('⚠️  IMPORTANT: Fund this wallet with SOL before running bounties');
  console.log(`   Address: ${keypair.publicKey.toBase58()}`);
  
  return keypair;
}

/**
 * Save encrypted wallet with password
 * @param {Keypair} keypair 
 * @param {string} password 
 */
function saveEncryptedWallet(keypair, password) {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const secretKeyArray = Array.from(keypair.secretKey);
  let encrypted = cipher.update(JSON.stringify(secretKeyArray), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  const encryptedData = {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted
  };

  fs.writeFileSync(ENCRYPTED_WALLET_PATH, JSON.stringify(encryptedData), 'utf8');
  console.log('Encrypted wallet backup saved');
}

/**
 * Load encrypted wallet with password
 * @param {string} password 
 * @returns {Keypair}
 */
export function loadEncryptedWallet(password) {
  if (!fs.existsSync(ENCRYPTED_WALLET_PATH)) {
    throw new Error('Encrypted wallet not found');
  }

  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(password, 'salt', 32);

  const encryptedData = JSON.parse(fs.readFileSync(ENCRYPTED_WALLET_PATH, 'utf8'));
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  const secretKey = Uint8Array.from(JSON.parse(decrypted));
  return Keypair.fromSecretKey(secretKey);
}

/**
 * Export wallet public key
 * @param {Keypair} keypair 
 * @returns {string}
 */
export function getPublicKey(keypair) {
  return keypair.publicKey.toBase58();
}

/**
 * Validate wallet has sufficient balance
 * @param {Connection} connection 
 * @param {Keypair} keypair 
 * @param {number} requiredLamports 
 * @returns {Promise<boolean>}
 */
export async function validateBalance(connection, keypair, requiredLamports) {
  const balance = await connection.getBalance(keypair.publicKey);
  return balance >= requiredLamports;
}