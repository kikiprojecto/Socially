'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';

type Status = {
  ok: boolean;
  worker?: {
    ok: boolean;
    baseUrl: string;
  };
  bot?: {
    running: boolean;
    pid?: number;
    startedAt?: string;
    lastExitCode?: number | null;
    lastExitSignal?: string | null;
  };
};

type LogsResponse = {
  botLogTail: string[];
  decisionLogTail: string[];
};

export default function Page() {
  const [status, setStatus] = useState<Status | null>(null);
  const [logs, setLogs] = useState<LogsResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [dashboardKey, setDashboardKey] = useState('');

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (dashboardKey.trim()) h['x-dashboard-key'] = dashboardKey.trim();
    return h;
  }, [dashboardKey]);

  async function refresh() {
    const s = await fetch('/api/status', { cache: 'no-store' }).then((r) => r.json());
    setStatus(s);

    const l = await fetch('/api/logs', { cache: 'no-store' }).then((r) => r.json());
    setLogs(l);
  }

  async function post(path: string) {
    setBusy(true);
    try {
      const res = await fetch(path, { method: 'POST', headers });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Request failed: ${res.status}`);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Socially Bot Dashboard</h1>

      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr', marginBottom: 20 }}>
        <div style={{ padding: 16, border: '1px solid #24304a', borderRadius: 12, background: '#0f1a2f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Worker</div>
              <div style={{ fontSize: 14 }}>
                {status?.worker?.ok ? 'Online' : 'Offline'}
                {status?.worker?.baseUrl ? ` (${status.worker.baseUrl})` : ''}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Bot</div>
              <div style={{ fontSize: 14 }}>{status?.bot?.running ? 'Running' : 'Stopped'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>PID</div>
              <div style={{ fontSize: 14 }}>{status?.bot?.pid ?? '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Started</div>
              <div style={{ fontSize: 14 }}>{status?.bot?.startedAt ?? '-'}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 16, border: '1px solid #24304a', borderRadius: 12, background: '#0f1a2f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <input
              value={dashboardKey}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDashboardKey(e.target.value)}
              placeholder="Dashboard key (required for start/stop/run)"
              style={{
                flex: 1,
                minWidth: 260,
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #24304a',
                background: '#0b1220',
                color: '#e6edf3'
              }}
            />
            <button
              disabled={busy}
              onClick={() => refresh()}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #24304a', background: '#152447', color: '#e6edf3' }}
            >
              Refresh
            </button>
            <button
              disabled={busy}
              onClick={() => post('/api/bot/start')}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #24304a', background: '#1b3a2a', color: '#e6edf3' }}
            >
              Start Bot
            </button>
            <button
              disabled={busy}
              onClick={() => post('/api/bot/stop')}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #24304a', background: '#3a1b1b', color: '#e6edf3' }}
            >
              Stop Bot
            </button>
            <button
              disabled={busy}
              onClick={() => post('/api/bot/run-once')}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid #24304a', background: '#3a2f1b', color: '#e6edf3' }}
            >
              Run One Cycle (Safe)
            </button>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ padding: 16, border: '1px solid #24304a', borderRadius: 12, background: '#0f1a2f', minHeight: 320 }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Bot log (tail)</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.9 }}>
            {(logs?.botLogTail || []).join('\n') || 'No logs'}
          </pre>
        </div>
        <div style={{ padding: 16, border: '1px solid #24304a', borderRadius: 12, background: '#0f1a2f', minHeight: 320 }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Decision log (tail)</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.9 }}>
            {(logs?.decisionLogTail || []).join('\n') || 'No decisions'}
          </pre>
        </div>
      </section>

      <div style={{ marginTop: 18, fontSize: 12, opacity: 0.75 }}>
        This dashboard is public. Start/stop/run actions require a dashboard key.
      </div>
    </main>
  );
}
