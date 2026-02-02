import { retry, withTimeout } from '../utils/async.js';

function normalizeIpfsUrl(url) {
  const cid = url.replace(/^ipfs:\/\//, '');
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

function normalizeArweaveUrl(url) {
  if (url.startsWith('ar://')) {
    return `https://arweave.net/${url.replace(/^ar:\/\//, '')}`;
  }
  return url;
}

export class MediaFetcher {
  constructor(opts = {}) {
    this.maxBytes = Number.isFinite(opts.maxBytes) ? opts.maxBytes : 50 * 1024 * 1024;
    this.timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 30_000;
  }

  resolveUrl(input) {
    if (!input) return null;
    if (input.startsWith('ipfs://')) return normalizeIpfsUrl(input);
    if (input.startsWith('ar://') || input.includes('arweave.net')) return normalizeArweaveUrl(input);
    return input;
  }

  async fetchBuffer(inputUrl) {
    const url = this.resolveUrl(inputUrl);
    if (!url) throw new Error('Missing media url');

    return retry(async () => {
      const res = await withTimeout(fetch(url, { redirect: 'follow' }), this.timeoutMs, 'Media fetch timed out');
      if (!res.ok) throw new Error(`Media fetch failed: ${res.status}`);

      const len = Number.parseInt(res.headers.get('content-length') || '0', 10);
      if (len && len > this.maxBytes) throw new Error(`Media too large: ${len} bytes`);

      const arrayBuffer = await res.arrayBuffer();
      const buf = Buffer.from(arrayBuffer);
      if (buf.length > this.maxBytes) throw new Error(`Media too large: ${buf.length} bytes`);

      const contentType = res.headers.get('content-type') || 'application/octet-stream';
      return { buffer: buf, contentType };
    }, {
      attempts: 3,
      initialDelayMs: 800,
      backoffFactor: 2,
      shouldRetry: (e) => {
        const msg = (e?.message || '').toLowerCase();
        return msg.includes('timed out') || msg.includes('failed') || msg.includes('fetch');
      }
    });
  }
}
