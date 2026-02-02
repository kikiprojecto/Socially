import axios from 'axios';

import { retry, withTimeout } from '../utils/async.js';

export class PoidhIndexerClient {
  constructor(opts = {}) {
    this.baseUrl = opts.baseUrl || process.env.POIDH_INDEXER_BASE_URL || '';
    this.timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 10_000;
    this.retryAttempts = Number.isFinite(opts.retryAttempts) ? opts.retryAttempts : 3;
    this.retryInitialDelayMs = Number.isFinite(opts.retryInitialDelayMs) ? opts.retryInitialDelayMs : 750;

    if (!this.baseUrl) {
      throw new Error('POIDH_INDEXER_BASE_URL is required');
    }

    this.http = axios.create({
      baseURL: this.baseUrl.replace(/\/$/, ''),
      headers: {
        accept: 'application/json'
      }
    });
  }

  async getLiveBounties(chainId) {
    return this.getJson(`/live/bounty/${chainId}`);
  }

  async getBounty(chainId, bountyId) {
    return this.getJson(`/bounty/${chainId}/${bountyId}`);
  }

  async getBountyClaims(chainId, bountyId) {
    return this.getJson(`/bounty/claims/${chainId}/${bountyId}`);
  }

  async getBountyParticipations(chainId, bountyId) {
    return this.getJson(`/bounty/participations/${chainId}/${bountyId}`);
  }

  async getClaim(chainId, claimId) {
    return this.getJson(`/claim/${chainId}/${claimId}`);
  }

  async getJson(path) {
    const run = async () => {
      const res = await withTimeout(this.http.get(path), this.timeoutMs, `Timed out calling ${path}`);
      return res.data;
    };

    return retry(() => run(), {
      attempts: this.retryAttempts,
      initialDelayMs: this.retryInitialDelayMs,
      backoffFactor: 2,
      shouldRetry: (e) => {
        const status = e?.response?.status;
        if (!status) return true;
        if (status >= 500) return true;
        if (status === 429) return true;
        return false;
      }
    });
  }
}
