import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { Logger } from '../../src/storage/Logger.js';

function findLogFile(dir, prefix) {
  const files = fs.readdirSync(dir);
  const match = files.find((f) => f.startsWith(`${prefix}-`) && f.endsWith('.jsonl'));
  if (!match) throw new Error(`No ${prefix} log file found in ${dir}`);
  return path.join(dir, match);
}

describe('Logger', () => {
  it('writes info/error to bot log and decision to decisions log', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'socially-logs-'));
    const logger = new Logger({ logDir: tmpDir });

    logger.info('hello', { a: 1 });
    logger.warn('heads up', { w: 1 });
    logger.success('ok', { s: 1 });
    logger.error('oops', { b: 2 });
    logger.decision('winner', { c: 3 });

    const botLog = findLogFile(tmpDir, 'bot');
    const decisionsLog = findLogFile(tmpDir, 'decisions');

    const botLines = fs.readFileSync(botLog, 'utf8').trim().split('\n');
    const decisionLines = fs.readFileSync(decisionsLog, 'utf8').trim().split('\n');

    expect(botLines.length).toBeGreaterThanOrEqual(2);
    expect(decisionLines.length).toBe(1);

    const first = JSON.parse(botLines[0]);
    expect(first.level).toBe('info');
    expect(first.message).toBe('hello');

    const dec = JSON.parse(decisionLines[0]);
    expect(dec.level).toBe('decision');
    expect(dec.message).toBe('winner');
  });
});
