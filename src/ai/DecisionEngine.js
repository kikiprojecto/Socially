export class DecisionEngine {
  constructor(opts = {}) {
    this.threshold = Number.isFinite(opts.threshold)
      ? opts.threshold
      : Number.parseInt(process.env.EVALUATION_THRESHOLD || '70', 10);
  }

  selectWinner(evaluations) {
    if (!Array.isArray(evaluations) || evaluations.length === 0) return null;

    const eligible = evaluations
      .filter((e) => typeof e?.total_score === 'number' && e.total_score >= this.threshold)
      .sort((a, b) => b.total_score - a.total_score);

    if (eligible.length === 0) return null;

    return eligible[0];
  }
}
