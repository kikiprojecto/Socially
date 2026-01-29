import 'dotenv/config';

import fs from 'fs';
import http from 'http';
import path from 'path';
import { spawn } from 'child_process';

const PORT = Number.parseInt(process.env.WORKER_PORT || '8787', 10);
const TOKEN = process.env.WORKER_TOKEN || '';

const PROJECT_ROOT = process.cwd();
const LOG_DIR = path.join(PROJECT_ROOT, 'logs');

let botProc = null;
let botStartedAt = null;
let lastExitCode = null;
let lastExitSignal = null;

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

function unauthorized(res) {
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

  botProc = spawn(process.execPath, ['src/main.js'], {
    cwd: PROJECT_ROOT,
    env: {
      ...process.env,
      ...envOverrides
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const logPath = getTodayLogPath('bot');
  const stream = fs.createWriteStream(logPath, { flags: 'a' });

  botProc.stdout.on('data', (chunk) => stream.write(chunk));
  botProc.stderr.on('data', (chunk) => stream.write(chunk));

  botProc.on('exit', (code, signal) => {
    lastExitCode = code;
    lastExitSignal = signal;
    botProc = null;
    botStartedAt = null;
    stream.end();
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
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (url.pathname === '/health') {
      return json(res, 200, { ok: true });
    }

    if (!isAuthorized(req)) {
      return unauthorized(res);
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
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`worker_server listening on :${PORT}`);
});
