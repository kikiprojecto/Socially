import test from 'node:test';
import assert from 'node:assert/strict';

import { PoidhIndexerClient } from '../src/api/PoidhIndexerClient.js';

test('PoidhIndexerClient builds correct paths', async () => {
  const client = new PoidhIndexerClient({ baseUrl: 'http://example.test' });

  const calls = [];
  client.http.get = async (path) => {
    calls.push(path);
    return { data: { ok: true, path } };
  };

  const chainId = 8453;
  const bountyId = 376;

  const a = await client.getLiveBounties(chainId);
  const b = await client.getBounty(chainId, bountyId);
  const c = await client.getBountyClaims(chainId, bountyId);

  assert.deepEqual(a, { ok: true, path: `/live/bounty/${chainId}` });
  assert.deepEqual(b, { ok: true, path: `/bounty/${chainId}/${bountyId}` });
  assert.deepEqual(c, { ok: true, path: `/bounty/claims/${chainId}/${bountyId}` });
  assert.deepEqual(calls, [
    `/live/bounty/${chainId}`,
    `/bounty/${chainId}/${bountyId}`,
    `/bounty/claims/${chainId}/${bountyId}`
  ]);
});
