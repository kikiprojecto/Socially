import express from 'express';

const router = express.Router();

router.post('/add-claim', async (req, res) => {
  if (process.env.MOCK_MODE !== 'true') {
    return res.status(403).json({ error: 'Mock endpoints only available in MOCK_MODE' });
  }

  try {
    const { bountyId, description, imageURI, claimer } = req.body;

    const bot = req.app.get('bot');
    if (!bot || !bot.contract) {
      return res.status(400).json({ error: 'Bot not initialized' });
    }

    if (!bountyId || !description || !imageURI) {
      return res.status(400).json({ error: 'bountyId, description, and imageURI are required' });
    }

    if (typeof bot.contract.addManualClaim !== 'function') {
      return res.status(400).json({ error: 'Mock contract does not support manual claims' });
    }

    const claimId = await bot.contract.addManualClaim(bountyId, {
      claimer,
      description,
      imageURI
    });

    return res.json({ success: true, claimId, message: 'Mock claim added successfully' });
  } catch (error) {
    return res.status(500).json({ error: error?.message || String(error) });
  }
});

export default router;
