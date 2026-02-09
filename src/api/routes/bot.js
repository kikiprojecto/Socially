import express from 'express';

export default function botRoutes(opts = {}) {
  const router = express.Router();

  router.post('/start', async (req, res) => {
    if (!opts.startBot) return res.status(501).json({ ok: false, error: 'startBot not configured' });
    const out = await opts.startBot();

    const botWS = req.app.get('botWS');
    if (botWS) {
      botWS.broadcast('BOT_STARTED', { timestamp: Date.now() });
    }

    return res.json({ ok: true, ...out });
  });

  router.post('/stop', async (req, res) => {
    if (!opts.stopBot) return res.status(501).json({ ok: false, error: 'stopBot not configured' });
    const out = await opts.stopBot();

    const botWS = req.app.get('botWS');
    if (botWS) {
      botWS.broadcast('BOT_STOPPED', { timestamp: Date.now() });
    }

    return res.json({ ok: true, ...out });
  });

  router.post('/run-once', async (_req, res) => {
    if (!opts.runOnce) return res.status(501).json({ ok: false, error: 'runOnce not configured' });
    const out = await opts.runOnce();
    return res.json({ ok: true, ...out });
  });

  return router;
}
