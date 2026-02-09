import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AutonomousBountyBot } from './bot/BountyBot.js';
import { startServer } from './api/server.js';

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

let bot = null;
let serverHandle = null;
let botRunPromise = null;

async function main() {
  try {
    serverHandle = await startServer({
      startBot: async () => {
        if (!bot) return { started: false, error: 'Bot not initialized' };
        if (!botRunPromise) botRunPromise = bot.run();
        return { started: true };
      },
      stopBot: async () => {
        if (serverHandle?.server) {
          serverHandle.server.close();
        }
        process.exit(0);
      },
      runOnce: async () => {
        if (!bot) return { ok: false, error: 'Bot not initialized' };
        const ok = await bot.triggerEvaluation();
        return { ok };
      },
      getBotStatus: async () => {
        if (!bot) return { running: false };
        return {
          running: Boolean(botRunPromise),
          network: bot.config?.network,
          bountyId: bot.activeBounty?.bountyId || null
        };
      }
    });

    bot = new AutonomousBountyBot(config, serverHandle.botWS);
    botRunPromise = bot.run();

    process.on('SIGINT', () => {
      process.exit(0);
    });
  } catch (error) {
    console.error(error?.message || String(error));
    process.exit(1);
  }
}

main();

export function getBotInstance() {
  return bot;
}

export { bot };
