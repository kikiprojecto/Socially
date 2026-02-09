import express from 'express';

export default function statusRoutes(opts = {}) {
  const router = express.Router();

  router.get('/', async (_req, res) => {
    const bot = opts.getBotStatus ? await opts.getBotStatus() : null;
    res.json({ ok: true, bot });
  });

  return router;
}
