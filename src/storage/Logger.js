import fs from 'fs';
import path from 'path';

export class Logger {
  constructor(opts = {}) {
    this.projectRoot = opts.projectRoot || process.cwd();
    this.logDir = opts.logDir || path.join(this.projectRoot, 'logs');
    fs.mkdirSync(this.logDir, { recursive: true });
  }

  write(prefix, entry) {
    const stamp = new Date();
    const yyyy = stamp.getUTCFullYear();
    const mm = String(stamp.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(stamp.getUTCDate()).padStart(2, '0');

    const line = JSON.stringify({ timestamp: stamp.toISOString(), ...entry }) + '\n';
    const filePath = path.join(this.logDir, `${prefix}-${yyyy}-${mm}-${dd}.jsonl`);
    fs.appendFileSync(filePath, line);
  }

  info(message, data = {}) {
    this.write('bot', { level: 'info', message, ...data });
  }

  error(message, data = {}) {
    this.write('bot', { level: 'error', message, ...data });
  }

  warn(message, data = {}) {
    this.write('bot', { level: 'warn', message, ...data });
  }

  success(message, data = {}) {
    this.write('bot', { level: 'success', message, ...data });
  }

  decision(message, data = {}) {
    this.write('decisions', { level: 'decision', message, ...data });
  }
}
