import { WebSocketServer } from 'ws';

export class BotWebSocket {
  constructor(server, opts = {}) {
    this.path = opts.path || '/ws';
    this.wss = new WebSocketServer({ server, path: this.path });
  }

  broadcast(event, data) {
    const payload = JSON.stringify({ event, data });
    for (const client of this.wss.clients) {
      if (client.readyState === 1) {
        client.send(payload);
      }
    }
  }
}
