import AutonomousPoidhBot from '../poidh_main_bot.js';

async function main() {
  const bot = new AutonomousPoidhBot();

  try {
    await bot.initialize();
    await bot.run();
  } catch (error) {
    console.error('Fatal error:', error?.message || error);
    process.exit(1);
  }
}

main();
