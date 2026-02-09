import { describe, it, expect } from '@jest/globals';
import { DecisionEngine } from '../../src/ai/DecisionEngine.js';

describe('DecisionEngine', () => {
  it('should select highest scoring submission', () => {
    const engine = new DecisionEngine({ threshold: 70 });

    const evaluations = [
      { claimId: '1', total_score: 92, claimer: '0xabc' },
      { claimId: '2', total_score: 78, claimer: '0xdef' },
      { claimId: '3', total_score: 65, claimer: '0xghi' }
    ];

    const winner = engine.selectWinner(evaluations);

    expect(winner).toBeDefined();
    expect(winner.claimId).toBe('1');
    expect(winner.total_score).toBe(92);
  });

  it('should return null if no submissions meet threshold', () => {
    const engine = new DecisionEngine({ threshold: 70 });

    const evaluations = [
      { claimId: '1', total_score: 65, claimer: '0xabc' },
      { claimId: '2', total_score: 60, claimer: '0xdef' }
    ];

    const winner = engine.selectWinner(evaluations);
    expect(winner).toBeNull();
  });
});
