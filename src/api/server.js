import express from 'express';
import cors from 'cors';
import { createServer as createHttpServer } from 'http';

import botRoutes from './routes/bot.js';
import mockRoutes from './routes/mock.js';
import statusRoutes from './routes/status.js';
import { BotWebSocket } from './websocket.js';
import { Logger } from '../storage/Logger.js';

export let botWS = null;

export function createServer(opts = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/status', statusRoutes(opts));
  app.use('/api/bot', botRoutes(opts));
  app.use('/api/mock', mockRoutes);

  return app;
}

export async function startServer(opts = {}) {
  const port = Number.parseInt(process.env.API_PORT || String(opts.port || '3001'), 10);
  const app = createServer(opts);
  const logger = opts.logger || new Logger();

  return new Promise((resolve) => {
    const server = createHttpServer(app);

    botWS = new BotWebSocket(server);
    logger.info('WebSocket broadcaster initialized');

    app.set('botWS', botWS);

    server.listen(port, () => {
      logger.info('API server running', { url: `http://localhost:${port}` });
      logger.info('WebSocket available', { url: `ws://localhost:${port}` });
      resolve({ app, server, port, botWS });
    });
  });
}

if (process.argv[1] && process.argv[1].endsWith('/src/api/server.js')) {
  startServer().catch((e) => {
    console.error(e?.message || String(e));
    process.exit(1);
  });
}
