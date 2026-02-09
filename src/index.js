import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AutonomousBountyBot } from './bot/BountyBot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  network: process.env.NETWORK || 'base-sepolia',
  evaluationThreshold: Number.parseInt(process.env.EVALUATION_THRESHOLD || '70', 10),
  pollingInterval: Number.parseInt(process.env.POLLING_INTERVAL || '60000', 10)
};

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set in .env file');
  process.exit(1);
}

const bot = new AutonomousBountyBot(config);

async function main() {
  try {
    await bot.run();

    process.on('SIGINT', () => {
      process.exit(0);
    });
  } catch (error) {
    console.error(error?.message || String(error));
    process.exit(1);
  }
}

main();

export { bot };
