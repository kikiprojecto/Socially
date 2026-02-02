import test from 'node:test';
import assert from 'node:assert/strict';

import { ClaudeEvaluator } from '../src/ai/ClaudeEvaluator.js';

test('ClaudeEvaluator fallback returns expected shape when fetch fails', async () => {
  const evaluator = new ClaudeEvaluator({
    ollamaUrl: 'http://127.0.0.1:1',
    model: 'llava',
    timeoutMs: 50,
    retryAttempts: 1,
    retryInitialDelayMs: 0
  });

  const res = await evaluator.evaluateSubmission({
    submissionId: 'sub_1',
    title: 'Test',
    requirements: { a: 1 }
  });

  assert.equal(typeof res.total_score, 'number');
  assert.equal(res.total_score, 50);
  assert.equal(res.winner_worthy, false);
});
