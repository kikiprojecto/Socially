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

  onBountyCreated(bounty) {
    this.broadcast('BOUNTY_CREATED', { bounty, timestamp: Date.now() });
  }

  onSubmissionReceived(submission) {
    this.broadcast('SUBMISSION_RECEIVED', { submission, timestamp: Date.now() });
  }

  onEvaluationComplete(evaluation) {
    this.broadcast('EVALUATION_COMPLETE', { evaluation, timestamp: Date.now() });
  }

  onWinnerSelected(winner) {
    this.broadcast('WINNER_SELECTED', { winner, timestamp: Date.now() });
  }

  onPaymentSent(result) {
    this.broadcast('PAYMENT_SENT', { result, timestamp: Date.now() });
  }
}
