import AutonomousPoidhBot from '../../poidh_main_bot.js';

export default class BountyBot {
  constructor() {
    this.inner = new AutonomousPoidhBot();
  }

  async initialize() {
    return this.inner.initialize();
  }

  async run() {
    return this.inner.run();
  }

  async stop() {
    return this.inner.stop();
  }
}
