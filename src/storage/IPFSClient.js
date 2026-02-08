export class IPFSClient {
  constructor(opts = {}) {
    this.pinataApiKey = (opts.pinataApiKey ?? process.env.PINATA_API_KEY ?? '').trim();
    this.pinataSecretKey = (opts.pinataSecretKey ?? process.env.PINATA_SECRET_KEY ?? '').trim();
    this.gatewayBaseUrl = (opts.gatewayBaseUrl ?? process.env.IPFS_GATEWAY_BASE_URL ?? 'https://gateway.pinata.cloud/ipfs').replace(/\/$/, '');
  }

  ipfsToGatewayUrl(ipfsUrl) {
    if (!ipfsUrl) return null;
    if (ipfsUrl.startsWith('ipfs://')) {
      const cid = ipfsUrl.replace(/^ipfs:\/\//, '');
      return `${this.gatewayBaseUrl}/${cid}`;
    }
    return ipfsUrl;
  }

  async uploadBuffer(buffer, filename) {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      throw new Error('Missing PINATA_API_KEY/PINATA_SECRET_KEY');
    }

    const fd = new FormData();
    fd.append('file', new Blob([buffer]), filename);

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: this.pinataApiKey,
        pinata_secret_api_key: this.pinataSecretKey
      },
      body: fd
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(body || `Pinata upload failed: ${res.status}`);
    }

    const data = await res.json();
    const hash = data?.IpfsHash;
    if (!hash) throw new Error('Pinata response missing IpfsHash');

    return {
      ipfsHash: hash,
      ipfsUrl: `ipfs://${hash}`,
      gatewayUrl: `${this.gatewayBaseUrl}/${hash}`
    };
  }
}
