export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withTimeout(promise, ms, message = 'Timed out') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export async function retry(fn, opts = {}) {
  const attempts = Number.isFinite(opts.attempts) ? opts.attempts : 3;
  const initialDelayMs = Number.isFinite(opts.initialDelayMs) ? opts.initialDelayMs : 750;
  const backoffFactor = Number.isFinite(opts.backoffFactor) ? opts.backoffFactor : 2;
  const maxDelayMs = Number.isFinite(opts.maxDelayMs) ? opts.maxDelayMs : 8000;
  const shouldRetry = typeof opts.shouldRetry === 'function' ? opts.shouldRetry : () => true;

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn({ attempt });
    } catch (err) {
      lastError = err;
      if (attempt >= attempts) break;
      if (!shouldRetry(err)) break;

      const delay = Math.min(maxDelayMs, initialDelayMs * Math.pow(backoffFactor, attempt - 1));
      await sleep(delay);
    }
  }

  throw lastError;
}
