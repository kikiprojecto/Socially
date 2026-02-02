import http from 'node:http';

export default async function startWorker() {
  const TOKEN = process.env.WORKER_TOKEN || '';

  function json(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  }

  function isAuthorized(req) {
    if (!TOKEN) return false;
    const h = req.headers.authorization || '';
    return h === `Bearer ${TOKEN}`;
  }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    if (url.pathname === '/health') return json(res, 200, { ok: true });
    if (!isAuthorized(req)) return json(res, 401, { error: 'Unauthorized' });
    if (url.pathname === '/status') return json(res, 200, { ok: true, bot: { running: false } });
    if (url.pathname === '/metrics') return json(res, 200, { ok: true, metrics: { requestsTotal: 1 } });
    return json(res, 404, { error: 'Not found' });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  return { server, port };
}
