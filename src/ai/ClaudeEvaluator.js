import crypto from 'crypto';
import { retry, withTimeout } from '../utils/async.js';
import { Logger } from '../storage/Logger.js';

function safeJsonExtract(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function validateEvaluation(e) {
  if (!e || typeof e !== 'object') return false;

  const nums = ['authenticity_score', 'compliance_score', 'quality_score', 'validity_score', 'total_score'];
  for (const k of nums) {
    if (typeof e[k] !== 'number' || !Number.isFinite(e[k])) return false;
  }

  if (typeof e.reasoning !== 'string') return false;
  if (typeof e.winner_worthy !== 'boolean') return false;

  if (e.authenticity_score < 0 || e.authenticity_score > 40) return false;
  if (e.compliance_score < 0 || e.compliance_score > 30) return false;
  if (e.quality_score < 0 || e.quality_score > 20) return false;
  if (e.validity_score < 0 || e.validity_score > 10) return false;

  if (e.total_score < 0 || e.total_score > 100) return false;
  return true;
}

export class ClaudeEvaluator {
  constructor(opts = {}) {
    this.ollamaUrl = opts.ollamaUrl || process.env.OLLAMA_API_URL || 'http://localhost:11434';
    this.model = opts.model || process.env.OLLAMA_MODEL || 'llava';
    this.timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 30_000;
    this.retryAttempts = Number.isFinite(opts.retryAttempts) ? opts.retryAttempts : 3;
    this.retryInitialDelayMs = Number.isFinite(opts.retryInitialDelayMs) ? opts.retryInitialDelayMs : 1000;
    this.cache = new Map();
    this.logger = opts.logger || new Logger();
  }

  cacheKey({ submissionId, prompt }) {
    return crypto.createHash('sha256').update(`${submissionId || ''}\n${prompt || ''}`).digest('hex');
  }

  buildPrompt({ title, requirements }) {
    return `Evaluate this bounty submission:\n\nTitle: ${title}\nRequirements: ${JSON.stringify(requirements, null, 2)}\n\nRate the submission 0-100 on these criteria:\n\n1. Authenticity (0-40 points):\n- Is this a genuine, unedited photo?\n- Any signs of AI generation or heavy manipulation?\n- Does it show a real-world action?\n\n2. Compliance (0-30 points):\n- Does it meet ALL stated requirements?\n- Are required elements clearly visible?\n- Is the task correctly completed?\n\n3. Quality (0-20 points):\n- Is the image clear and well-composed?\n- Does it provide strong proof of completion?\n- Professional presentation?\n\n4. Validity (0-10 points):\n- Does it appear recent/timely?\n- Is submission within deadline?\n- Legitimate user interaction?\n\nRespond with ONLY valid JSON in this exact format:\n{\n  \"authenticity_score\": <number 0-40>,\n  \"compliance_score\": <number 0-30>,\n  \"quality_score\": <number 0-20>,\n  \"validity_score\": <number 0-10>,\n  \"total_score\": <sum of above>,\n  \"reasoning\": \"<2-3 sentence explanation>\",\n  \"winner_worthy\": <true if total >= 70, else false>\n}`;
  }

  fallbackEvaluation() {
    return {
      authenticity_score: 20,
      compliance_score: 15,
      quality_score: 10,
      validity_score: 5,
      total_score: 50,
      reasoning: 'Automatic evaluation failed - conservative default scores applied',
      winner_worthy: false,
      is_fallback: true
    };
  }

  async evaluateSubmission({ submissionId, title, requirements }) {
    const prompt = this.buildPrompt({ title, requirements });
    const key = this.cacheKey({ submissionId, prompt });

    if (this.cache.has(key)) return this.cache.get(key);

    const evalResult = await retry(async ({ attempt }) => {
      this.logger.info('AI evaluation attempt', { submissionId, attempt });

      const response = await withTimeout(fetch(`${this.ollamaUrl.replace(/\/$/, '')}/api/generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: this.model, prompt, stream: false })
      }), this.timeoutMs, 'AI evaluation timed out');

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        const err = new Error(text || `AI provider returned ${response.status}`);
        err.status = response.status;
        throw err;
      }

      const json = await response.json();
      const parsed = safeJsonExtract(json?.response || '');
      if (!validateEvaluation(parsed)) {
        throw new Error('Invalid AI response format');
      }

      return parsed;
    }, {
      attempts: this.retryAttempts,
      initialDelayMs: this.retryInitialDelayMs,
      backoffFactor: 2,
      shouldRetry: (e) => {
        const status = e?.status;
        if (status === 429) return true;
        const msg = (e?.message || '').toLowerCase();
        return msg.includes('timed out') || msg.includes('invalid') || msg.includes('fetch') || msg.includes('returned');
      }
    }).catch((e) => {
      this.logger.error('AI evaluation failed', { submissionId, error: e?.message || String(e) });
      return this.fallbackEvaluation();
    });

    this.cache.set(key, evalResult);
    return evalResult;
  }
}
