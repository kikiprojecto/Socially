import 'dotenv/config';

import fs from 'fs';
import http from 'http';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';

const PORT = Number.parseInt(process.env.WORKER_PORT || '8787', 10);
const TOKEN = process.env.WORKER_TOKEN || '';
const RATE_LIMIT_RPM = Number.parseInt(process.env.WORKER_RATE_LIMIT_RPM || '120', 10);
const RATE_LIMIT_BURST = Number.parseInt(process.env.WORKER_RATE_LIMIT_BURST || '30', 10);

const SSE_CLIENTS = new Set();
const STARTED_AT_MS = Date.now();
const RL_BUCKETS = new Map();
const METRICS = {
  requestsTotal: 0,
  requestsByPath: {},
  responsesByStatus: {},
  unauthorized: 0,
  rateLimited: 0
};

const PROJECT_ROOT = process.cwd();
const LOG_DIR = path.join(PROJECT_ROOT, 'logs');

let botProc = null;
let botStartedAt = null;
let lastExitCode = null;
let lastExitSignal = null;

function inc(map, key) {
  map[key] = (map[key] || 0) + 1;
}

function logRequest(entry) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    const d = new Date();
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const logFile = path.join(LOG_DIR, `worker-${yyyy}-${mm}-${dd}.jsonl`);
    fs.appendFileSync(logFile, `${JSON.stringify(entry)}\n`);
  } catch {
  }
}

function setSecurityHeaders(res) {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'DENY');
  res.setHeader('referrer-policy', 'no-referrer');
  res.setHeader('permissions-policy', 'geolocation=(), microphone=(), camera=()');
}

function getClientKey(req) {
  const ip = req.socket?.remoteAddress || 'unknown';
  const auth = req.headers.authorization ? 'auth' : 'noauth';
  return `${ip}:${auth}`;
}

function isRateLimited(req) {
  if (!Number.isFinite(RATE_LIMIT_RPM) || RATE_LIMIT_RPM <= 0) return false;
  const key = getClientKey(req);
  const now = Date.now();
  const refillPerMs = (RATE_LIMIT_RPM / 60_000);

  let bucket = RL_BUCKETS.get(key);
  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_BURST, last: now };
    RL_BUCKETS.set(key, bucket);
  }

  const elapsed = Math.max(0, now - bucket.last);
  bucket.tokens = Math.min(RATE_LIMIT_BURST, bucket.tokens + elapsed * refillPerMs);
  bucket.last = now;

  if (bucket.tokens < 1) return true;
  bucket.tokens -= 1;
  return false;
}

function tooManyRequests(res) {
  json(res, 429, { error: 'Too Many Requests' });
}

function sseBroadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of SSE_CLIENTS) {
    try {
      res.write(payload);
    } catch {
      SSE_CLIENTS.delete(res);
    }
  }
}

function json(res, status, body) {
  setSecurityHeaders(res);
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

function unauthorized(res) {
  METRICS.unauthorized += 1;
  json(res, 401, { error: 'Unauthorized' });
}

function isAuthorized(req) {
  if (!TOKEN) return false;
  const h = req.headers.authorization || '';
  return h === `Bearer ${TOKEN}`;
}

function readTailLines(filePath, maxLines) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/);
    const trimmed = lines.filter((l) => l.length > 0);
    return trimmed.slice(Math.max(0, trimmed.length - maxLines));
  } catch {
    return [];
  }
}

function getTodayLogPath(prefix) {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return path.join(LOG_DIR, `${prefix}-${yyyy}-${mm}-${dd}.jsonl`);
}

function getStatus() {
  return {
    running: Boolean(botProc && !botProc.killed),
    pid: botProc?.pid,
    startedAt: botStartedAt,
    lastExitCode,
    lastExitSignal
  };
}

function startBot(envOverrides = {}) {
  if (botProc && !botProc.killed) {
    return { ok: true, alreadyRunning: true, bot: getStatus() };
  }

  fs.mkdirSync(LOG_DIR, { recursive: true });

  lastExitCode = null;
  lastExitSignal = null;
  botStartedAt = new Date().toISOString();

  botProc = spawn(process.execPath, ['src/index.js'], {
    cwd: PROJECT_ROOT,
    env: {
      ...process.env,
      ...envOverrides
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const logPath = getTodayLogPath('bot');
  const stream = fs.createWriteStream(logPath, { flags: 'a' });

  botProc.stdout.on('data', (chunk) => {
    stream.write(chunk);
    sseBroadcast('bot_log', { source: 'stdout', chunk: chunk.toString('utf8') });
  });
  botProc.stderr.on('data', (chunk) => {
    stream.write(chunk);
    sseBroadcast('bot_log', { source: 'stderr', chunk: chunk.toString('utf8') });
  });

  sseBroadcast('bot_status', getStatus());

  botProc.on('exit', (code, signal) => {
    lastExitCode = code;
    lastExitSignal = signal;
    botProc = null;
    botStartedAt = null;
    stream.end();

    sseBroadcast('bot_exit', { code, signal });
    sseBroadcast('bot_status', getStatus());
  });

  return { ok: true, started: true, bot: getStatus() };
}

function stopBot() {
  if (!botProc || botProc.killed) {
    return { ok: true, alreadyStopped: true, bot: getStatus() };
  }

  botProc.kill('SIGTERM');
  return { ok: true, stopping: true, bot: getStatus() };
}

const server = http.createServer(async (req, res) => {
  let requestId = null;
  let started = null;
  try {
    requestId = crypto.randomUUID();
    started = Date.now();
    METRICS.requestsTotal += 1;
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    inc(METRICS.requestsByPath, url.pathname);

    if (isRateLimited(req)) {
      METRICS.rateLimited += 1;
      return tooManyRequests(res);
    }

    if (url.pathname === '/health') {
      return json(res, 200, {
        ok: true,
        uptimeMs: Date.now() - STARTED_AT_MS,
        bot: getStatus()
      });
    }

    if (req.method === 'GET' && url.pathname === '/events') {
      if (!isAuthorized(req)) {
        return unauthorized(res);
      }

      setSecurityHeaders(res);
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
        'x-accel-buffering': 'no'
      });

      res.write(`event: hello\ndata: ${JSON.stringify({ ok: true })}\n\n`);
      res.write(`event: bot_status\ndata: ${JSON.stringify(getStatus())}\n\n`);
      SSE_CLIENTS.add(res);

      const ping = setInterval(() => {
        try {
          res.write(`event: ping\ndata: ${JSON.stringify({ t: Date.now() })}\n\n`);
        } catch {
        }
      }, 25000);

      req.on('close', () => {
        clearInterval(ping);
        SSE_CLIENTS.delete(res);
      });

      return;
    }

    if (!isAuthorized(req)) {
      return unauthorized(res);
    }

    if (req.method === 'GET' && url.pathname === '/metrics') {
      return json(res, 200, {
        ok: true,
        uptimeMs: Date.now() - STARTED_AT_MS,
        bot: getStatus(),
        metrics: METRICS
      });
    }

    if (req.method === 'GET' && url.pathname === '/status') {
      return json(res, 200, { ok: true, bot: getStatus() });
    }

    if (req.method === 'GET' && url.pathname === '/logs') {
      const tail = Number.parseInt(url.searchParams.get('tail') || '200', 10);
      const botLogTail = readTailLines(getTodayLogPath('bot'), tail);
      const decisionLogTail = readTailLines(path.join(LOG_DIR, 'decisions.jsonl'), tail);
      return json(res, 200, { botLogTail, decisionLogTail });
    }

    if (req.method === 'POST' && url.pathname === '/bot/start') {
      return json(res, 200, startBot({ DEMO_MODE: 'false' }));
    }

    if (req.method === 'POST' && url.pathname === '/bot/stop') {
      return json(res, 200, stopBot());
    }

    if (req.method === 'POST' && url.pathname === '/bot/run-once') {
      // Safe, fast cycle for remote-trigger.
      return json(res, 200, startBot({ DEMO_MODE: 'true', DRY_RUN_PAYMENTS: 'true' }));
    }

    return json(res, 404, { error: 'Not found' });
  } catch (e) {
    return json(res, 500, { error: e?.message || 'Internal error' });
  } finally {
    try {
      inc(METRICS.responsesByStatus, String(res.statusCode || 0));
      logRequest({
        t: new Date().toISOString(),
        requestId: requestId || undefined,
        method: req.method,
        url: req.url,
        status: res.statusCode,
        ms: Number.isFinite(started) ? (Date.now() - started) : undefined
      });
    } catch {
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`worker_server listening on :${PORT}`);
});
