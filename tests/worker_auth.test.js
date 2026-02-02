import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

function request({ port, path, headers = {} }) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method: 'GET',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c.toString('utf8')));
        res.on('end', () => resolve({ status: res.statusCode || 0, body }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

test('worker /status requires auth', async () => {
  process.env.WORKER_TOKEN = 'test-token';
  process.env.WORKER_PORT = '0';

  const { default: startWorker } = await import('../tests/worker_server_spawn.js');
  const { server, port } = await startWorker();

  try {
    const unauth = await request({ port, path: '/status' });
    assert.equal(unauth.status, 401);

    const unauthMetrics = await request({ port, path: '/metrics' });
    assert.equal(unauthMetrics.status, 401);

    const auth = await request({
      port,
      path: '/status',
      headers: { authorization: 'Bearer test-token' }
    });
    assert.equal(auth.status, 200);

    const authMetrics = await request({
      port,
      path: '/metrics',
      headers: { authorization: 'Bearer test-token' }
    });
    assert.equal(authMetrics.status, 200);
  } finally {
    await new Promise((r) => server.close(r));
  }
});
