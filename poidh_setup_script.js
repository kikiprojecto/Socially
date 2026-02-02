#!/usr/bin/env node

/**
 * Socially Autonomous Bot - Setup Script
 * Initializes wallet, validates configuration, and prepares bot for first run
 */

import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { loadOrCreateWallet } from './poidh_wallet.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🤖 Socially Autonomous Bot - Setup Wizard\n');
  console.log('This script will help you set up your bot for the first time.\n');

  // Check .env file
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found!');
    console.log('Creating from .env.example...\n');
    
    const examplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      console.log('✅ .env file created\n');
      console.log('⚠️  IMPORTANT: Edit .env and add your ANTHROPIC_API_KEY\n');
    }
  }

  // Load .env
  const dotenv = await import('dotenv');
  dotenv.config();

  const aiProvider = (process.env.AI_PROVIDER || 'ollama').toLowerCase();

  // Validate Anthropic API key only if needed
  console.log('1️⃣  Checking AI provider configuration...');
  if (aiProvider === 'anthropic') {
    console.log('AI Provider: anthropic');
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      console.log('❌ Anthropic API key not configured');
      console.log('\nGet your API key from: https://console.anthropic.com/');
      console.log('Then add it to .env file: ANTHROPIC_API_KEY=your_key_here\n');

      if (process.stdin.isTTY) {
        const proceed = await question('Continue setup anyway? (y/n): ');
        if (proceed.toLowerCase() !== 'y') {
          console.log('\nSetup cancelled. Please configure your API key and run again.\n');
          rl.close();
          process.exit(0);
        }
      }
    } else {
      console.log('✅ API key found\n');
    }
  } else {
    console.log('AI Provider: ollama');
    console.log('✅ No API key needed for Ollama\n');
  }

  // Network selection
  console.log('2️⃣  Selecting Solana network...');
  const network = process.env.SOLANA_NETWORK || 'devnet';
  console.log(`📡 Network: ${network}`);
  
  if (network === 'mainnet-beta') {
    console.log('\n⚠️  WARNING: You are using MAINNET');
    console.log('This will use REAL SOL for bounties!');
    const confirm = await question('\nContinue with mainnet? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('\nSetup cancelled. Change SOLANA_NETWORK in .env to "devnet" for testing.\n');
      rl.close();
      process.exit(0);
    }
  } else {
    console.log('✅ Using devnet (test network)\n');
  }

  // Create/load wallet
  console.log('3️⃣  Setting up wallet...');
  let wallet;
  try {
    wallet = loadOrCreateWallet();
    console.log(`✅ Wallet address: ${wallet.publicKey.toBase58()}\n`);
  } catch (error) {
    console.log(`❌ Wallet error: ${error.message}\n`);
    rl.close();
    process.exit(1);
  }

  // Check balance
  console.log('4️⃣  Checking wallet balance...');
  try {
    const connection = new Connection(clusterApiUrl(network), 'confirmed');
    const balance = await connection.getBalance(wallet.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    
    console.log(`💰 Balance: ${balanceSOL.toFixed(4)} SOL\n`);

    if (balanceSOL < 0.1) {
      console.log('⚠️  Low balance detected!');
      
      if (network === 'devnet') {
        console.log('\n📝 To get free devnet SOL, run:');
        console.log(`   solana airdrop 2 ${wallet.publicKey.toBase58()} --url devnet\n`);

        if (process.stdin.isTTY) {
          const getAirdrop = await question('Request airdrop now? (y/n): ');
          if (getAirdrop.toLowerCase() === 'y') {
            console.log('\nRequesting airdrop...');
            const { exec } = await import('child_process');
            exec(`solana airdrop 1 ${wallet.publicKey.toBase58()} --url devnet`, (error, stdout, stderr) => {
              if (error) {
                console.log(`❌ Airdrop failed: ${error.message}`);
              } else {
                console.log('✅ Airdrop requested! Check balance in a few seconds.\n');
              }
            });
          }
        }
      } else {
        console.log('\n⚠️  You need to fund this wallet with SOL before running bounties');
        console.log(`   Send SOL to: ${wallet.publicKey.toBase58()}\n`);
      }
    } else {
      console.log('✅ Sufficient balance for bounties\n');
    }
  } catch (error) {
    console.log(`⚠️  Could not check balance: ${error.message}\n`);
  }

  // Create logs directory
  console.log('5️⃣  Creating logs directory...');
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('✅ Logs directory created\n');
  } else {
    console.log('✅ Logs directory exists\n');
  }

  // Validate bounty templates
  console.log('6️⃣  Validating bounty templates...');
  const templatesPath = path.join(__dirname, 'config/bounty-templates.json');
  if (fs.existsSync(templatesPath)) {
    try {
      const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
      console.log(`✅ Found ${templates.bounties.length} bounty templates\n`);
    } catch (error) {
      console.log(`❌ Invalid bounty templates: ${error.message}\n`);
    }
  } else {
    console.log('⚠️  Bounty templates not found\n');
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SETUP SUMMARY');
  console.log('='.repeat(60));
  console.log(`Wallet Address: ${wallet.publicKey.toBase58()}`);
  console.log(`Network: ${network}`);
  console.log(`AI Provider: ${aiProvider}`);
  console.log(`API Key: ${aiProvider === 'anthropic' ? (process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Missing') : 'N/A'}`);
  console.log('='.repeat(60) + '\n');

  // Next steps
  console.log('📌 NEXT STEPS:\n');
  
  if (aiProvider === 'anthropic' && (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here')) {
    console.log('1. ⚠️  Add your ANTHROPIC_API_KEY to .env file');
  }
  
  console.log('2. 💰 Fund your wallet with SOL (if not already done)');
  console.log('3. 🚀 Run the bot: npm start');
  console.log('4. 📊 Monitor logs in the logs/ directory\n');

  console.log('🎯 Ready to claim the poidh bounty!\n');

  rl.close();
}

main().catch(console.error);