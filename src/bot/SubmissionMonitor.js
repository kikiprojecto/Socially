export class SubmissionMonitor {
  constructor() {
    this.lastPollAt = null;
  }

  markPoll() {
    this.lastPollAt = Date.now();
  }
}
