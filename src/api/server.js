import express from 'express';
import cors from 'cors';

import botRoutes from './routes/bot.js';
import statusRoutes from './routes/status.js';

export function createServer(opts = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/status', statusRoutes(opts));
  app.use('/api/bot', botRoutes(opts));

  return app;
}

export async function startServer(opts = {}) {
  const port = Number.parseInt(process.env.API_PORT || String(opts.port || '8787'), 10);
  const app = createServer(opts);

  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve({ app, server, port }));
  });
}

if (process.argv[1] && process.argv[1].endsWith('/src/api/server.js')) {
  startServer().catch((e) => {
    console.error(e?.message || String(e));
    process.exit(1);
  });
}
