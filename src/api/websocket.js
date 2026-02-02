export class BotWebSocket {
  constructor() {
    throw new Error('BotWebSocket is not enabled in safe mode (use /events SSE endpoint)');
  }
}
