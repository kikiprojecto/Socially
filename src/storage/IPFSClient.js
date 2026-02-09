import axios from 'axios';
import FormData from 'form-data';

export class IPFSClient {
  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;

    if (!this.pinataApiKey || !this.pinataSecretKey) {
      console.warn('Pinata API keys not configured. IPFS features will be limited.');
    }
  }

  async uploadImage(imageBuffer, filename) {
    if (!this.pinataApiKey) {
      throw new Error('Pinata API key not configured');
    }

    const formData = new FormData();
    formData.append('file', imageBuffer, filename);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretKey
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const ipfsUrl = `ipfs://${ipfsHash}`;
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    return {
      ipfsUrl,
      gatewayUrl,
      ipfsHash
    };
  }

  async fetchImage(ipfsUrl) {
    let fetchUrl;
    if (ipfsUrl.startsWith('ipfs://')) {
      const ipfsHash = ipfsUrl.replace('ipfs://', '');
      fetchUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    } else if (ipfsUrl.startsWith('http')) {
      fetchUrl = ipfsUrl;
    } else {
      throw new Error(`Invalid IPFS URL: ${ipfsUrl}`);
    }

    const response = await axios.get(fetchUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxContentLength: 50 * 1024 * 1024
    });

    return Buffer.from(response.data);
  }

  toGatewayUrl(ipfsUrl) {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    return ipfsUrl;
  }
}
