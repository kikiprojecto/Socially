import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';
import { IPFSClient } from '../../src/storage/IPFSClient.js';

describe('IPFSClient', () => {
  let prevApiKey;
  let prevSecretKey;

  beforeAll(() => {
    prevApiKey = process.env.PINATA_API_KEY;
    prevSecretKey = process.env.PINATA_SECRET_KEY;
    process.env.PINATA_API_KEY = 'test';
    process.env.PINATA_SECRET_KEY = 'test';
  });

  afterAll(() => {
    if (typeof prevApiKey === 'undefined') {
      delete process.env.PINATA_API_KEY;
    } else {
      process.env.PINATA_API_KEY = prevApiKey;
    }

    if (typeof prevSecretKey === 'undefined') {
      delete process.env.PINATA_SECRET_KEY;
    } else {
      process.env.PINATA_SECRET_KEY = prevSecretKey;
    }
  });

  it('should convert ipfs:// to gateway URL', () => {
    const client = new IPFSClient();
    const ipfsUrl = 'ipfs://QmTest123';
    const gatewayUrl = client.toGatewayUrl(ipfsUrl);

    expect(gatewayUrl).toBe('https://gateway.pinata.cloud/ipfs/QmTest123');
  });

  it('should return http URLs unchanged', () => {
    const client = new IPFSClient();
    const httpUrl = 'https://example.com/image.jpg';
    const result = client.toGatewayUrl(httpUrl);

    expect(result).toBe(httpUrl);
  });

  it('fetchImage supports http urls', async () => {
    const origGet = axios.get;
    axios.get = async () => ({ data: new Uint8Array([1, 2, 3]) });
    try {
      const client = new IPFSClient();
      const buf = await client.fetchImage('https://example.com/image.jpg');
      expect(Buffer.isBuffer(buf)).toBe(true);
      expect(buf.length).toBe(3);
    } finally {
      axios.get = origGet;
    }
  });

  it('fetchImage supports ipfs:// urls', async () => {
    const origGet = axios.get;
    axios.get = async () => ({ data: new Uint8Array([9]) });
    try {
      const client = new IPFSClient();
      const buf = await client.fetchImage('ipfs://QmTest123');
      expect(Buffer.isBuffer(buf)).toBe(true);
      expect(buf.length).toBe(1);
    } finally {
      axios.get = origGet;
    }
  });

  it('fetchImage rejects invalid urls', async () => {
    const client = new IPFSClient();
    await expect(client.fetchImage('ftp://bad')).rejects.toThrow(/Invalid IPFS URL/);
  });

  it('uploadImage returns ipfs url + gateway url', async () => {
    const origPost = axios.post;
    axios.post = async () => ({ data: { IpfsHash: 'QmHash' } });
    try {
      const client = new IPFSClient();
      const out = await client.uploadImage(Buffer.from([1]), 'x.jpg');
      expect(out.ipfsHash).toBe('QmHash');
      expect(out.ipfsUrl).toBe('ipfs://QmHash');
      expect(out.gatewayUrl).toBe('https://gateway.pinata.cloud/ipfs/QmHash');
    } finally {
      axios.post = origPost;
    }
  });
});
