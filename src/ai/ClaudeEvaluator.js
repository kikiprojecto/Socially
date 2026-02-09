import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';

function safeJsonExtract(text) {
  const match = String(text || '').match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export class ClaudeEvaluator {
  constructor(apiKey) {
    const key = (apiKey || process.env.ANTHROPIC_API_KEY || '').trim();
    if (!key) throw new Error('ANTHROPIC_API_KEY is required');
    this.client = new Anthropic({ apiKey: key });
    this.cache = new Map();
    this.rateLimitDelay = 1000;
  }

  getCacheKey(imageBuffer, requirements) {
    const imageHash = imageBuffer.slice(0, 100).toString('hex');
    const reqHash = JSON.stringify(requirements).slice(0, 50);
    return `${imageHash}_${reqHash}`;
  }

  async preprocessImage(imageBuffer) {
    try {
      const processed = await sharp(imageBuffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      return processed.toString('base64');
    } catch {
      return imageBuffer.toString('base64');
    }
  }

  buildPrompt(requirements) {
    return `You are evaluating a bounty submission. Score this image based on these criteria:\n\nREQUIREMENTS:\n${requirements.map((req, i) => `${i + 1}. ${req}`).join('\n')}\n\nSCORING CRITERIA (0-100 total):\n\n1. AUTHENTICITY (0-40 points):\n   - Is this a real, unedited photo?\n   - Any signs of AI generation or manipulation?\n   - Shows genuine real-world action?\n\n2. COMPLIANCE (0-30 points):\n   - Does it meet ALL stated requirements?\n   - Are required elements clearly visible?\n   - Is the task correctly completed?\n\n3. QUALITY (0-20 points):\n   - Is the image clear and well-composed?\n   - Does it provide strong proof of completion?\n   - Professional presentation?\n\n4. VALIDITY (0-10 points):\n   - Does it appear recent/timely?\n   - Legitimate user interaction?\n\nRespond with ONLY valid JSON in this EXACT format:\n{\n  "authenticity_score": <number 0-40>,\n  "compliance_score": <number 0-30>,\n  "quality_score": <number 0-20>,\n  "validity_score": <number 0-10>,\n  "total_score": <sum of above>,\n  "reasoning": "<2-3 sentence explanation>",\n  "winner_worthy": <true if total >= 70, else false>\n}`;
  }

  validateEvaluation(e) {
    const required = [
      'authenticity_score',
      'compliance_score',
      'quality_score',
      'validity_score',
      'total_score',
      'reasoning',
      'winner_worthy'
    ];

    if (!e || typeof e !== 'object') return false;
    for (const k of required) {
      if (!(k in e)) return false;
    }

    if (typeof e.reasoning !== 'string') return false;
    if (typeof e.winner_worthy !== 'boolean') return false;

    const ranges = {
      authenticity_score: [0, 40],
      compliance_score: [0, 30],
      quality_score: [0, 20],
      validity_score: [0, 10],
      total_score: [0, 100]
    };

    for (const [k, [min, max]] of Object.entries(ranges)) {
      if (typeof e[k] !== 'number' || !Number.isFinite(e[k])) return false;
      if (e[k] < min || e[k] > max) return false;
    }

    return true;
  }

  fallbackEvaluation() {
    return {
      authenticity_score: 20,
      compliance_score: 15,
      quality_score: 10,
      validity_score: 5,
      total_score: 50,
      reasoning: 'Automatic AI evaluation failed. Conservative default scores applied for safety.',
      winner_worthy: false,
      is_fallback: true
    };
  }

  parseResponse(response) {
    const text = response?.content?.[0]?.text || '';
    const parsed = safeJsonExtract(text);
    if (!parsed) throw new Error('No JSON found in response');
    return parsed;
  }

  async callClaude(imageBase64, requirements) {
    const prompt = this.buildPrompt(requirements);
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64
              }
            },
            { type: 'text', text: prompt }
          ]
        }
      ],
      timeout: 30000
    });

    return this.parseResponse(response);
  }

  async evaluate(imageBuffer, requirements) {
    const cacheKey = this.getCacheKey(imageBuffer, requirements);
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const processedImage = await this.preprocessImage(imageBuffer);

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const evaluation = await this.callClaude(processedImage, requirements);
        if (!this.validateEvaluation(evaluation)) throw new Error('Invalid evaluation format');
        this.cache.set(cacheKey, evaluation);
        return evaluation;
      } catch (error) {
        const status = error?.status;
        if (status === 429) {
          const delay = this.rateLimitDelay * attempt;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        if (attempt === 3) {
          const fallback = this.fallbackEvaluation();
          this.cache.set(cacheKey, fallback);
          return fallback;
        }

        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    const fallback = this.fallbackEvaluation();
    this.cache.set(cacheKey, fallback);
    return fallback;
  }
}
