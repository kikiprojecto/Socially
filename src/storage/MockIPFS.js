import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import sharp from 'sharp';

import { Logger } from './Logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = new Logger();

export class MockIPFSClient {
  constructor() {
    logger.info('🎭 MOCK IPFS: Simulating image storage (no Pinata API calls)');
    this.testImagesDir = path.join(__dirname, '../../tests/fixtures/images');
    this.ensureTestImagesExist();
  }

  ensureTestImagesExist() {
    if (!fs.existsSync(this.testImagesDir)) {
      fs.mkdirSync(this.testImagesDir, { recursive: true });
    }
  }

  async uploadImage(_imageBuffer, filename) {
    logger.info('🎭 MOCK IPFS: Simulating upload', { filename });
    await this.sleep(500);

    const mockHash = `QmMock${Date.now()}${Math.random().toString(36).slice(2)}`;
    return {
      ipfsUrl: `ipfs://${mockHash}`,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${mockHash}`,
      ipfsHash: mockHash
    };
  }

  async fetchImage(ipfsUrl) {
    logger.info('🎭 MOCK IPFS: Simulating download', { ipfsUrl });
    await this.sleep(500);

    return this.createTestImage(ipfsUrl);
  }

  async createTestImage(seed = '') {
    const text = seed.includes('HighQuality') ? 'POIDH HIGH' : seed.includes('MediumQuality') ? 'POIDH MED' : 'POIDH';

    const svg = Buffer.from(
      `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="50%" font-size="64" text-anchor="middle" dominant-baseline="middle" fill="black" font-family="Arial, sans-serif">${text}</text>
      </svg>`
    );

    const buf = await sharp(svg).jpeg({ quality: 90 }).toBuffer();
    logger.success('✅ Mock download complete', { bytes: buf.length });
    return buf;
  }

  toGatewayUrl(ipfsUrl) {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    return ipfsUrl;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
