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

type MetricsResponse = {
  ok: boolean;
  uptimeMs?: number;
  bot?: {
    running: boolean;
    pid?: number;
    startedAt?: string;
    lastExitCode?: number | null;
    lastExitSignal?: string | null;
  };
  metrics?: {
    requestsTotal?: number;
    requestsByPath?: Record<string, number>;
    responsesByStatus?: Record<string, number>;
    unauthorized?: number;
    rateLimited?: number;
  };
};

export default function Page() {
  const [status, setStatus] = useState<Status | null>(null);
  const [logs, setLogs] = useState<LogsResponse | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [dashboardKey, setDashboardKey] = useState('');
  const [streamStatus, setStreamStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState('');

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

    const m = await fetch('/api/metrics', { cache: 'no-store' }).then((r) => r.json());
    setMetrics(m);

    setLastRefreshedAt(new Date().toISOString());
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
    const t = setInterval(() => {
      if (!autoRefresh) return;
      refresh();
    }, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    refresh();
  }, [autoRefresh]);

  const filteredBotLog = useMemo(() => {
    const src = logs?.botLogTail || [];
    const f = logFilter.trim().toLowerCase();
    if (!f) return src;
    return src.filter((l) => l.toLowerCase().includes(f));
  }, [logs, logFilter]);

  const filteredDecisionLog = useMemo(() => {
    const src = logs?.decisionLogTail || [];
    const f = logFilter.trim().toLowerCase();
    if (!f) return src;
    return src.filter((l) => l.toLowerCase().includes(f));
  }, [logs, logFilter]);

  const streamLabel = useMemo(() => {
    if (streamStatus === 'open') return 'LIVE';
    if (streamStatus === 'connecting') return 'CONNECTING';
    return 'OFFLINE';
  }, [streamStatus]);

  const streamColor = useMemo(() => {
    if (streamStatus === 'open') return '#39d98a';
    if (streamStatus === 'connecting') return '#f5a524';
    return '#f31260';
  }, [streamStatus]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
    }
  }

  const topPaths = useMemo(() => {
    const m = metrics?.metrics?.requestsByPath || {};
    return Object.entries(m)
      .sort((a, b) => (b[1] || 0) - (a[1] || 0))
      .slice(0, 8);
  }, [metrics]);

  const topStatuses = useMemo(() => {
    const m = metrics?.metrics?.responsesByStatus || {};
    return Object.entries(m)
      .sort((a, b) => (b[1] || 0) - (a[1] || 0))
      .slice(0, 6);
  }, [metrics]);

  useEffect(() => {
    let es: EventSource | null = null;
    let closed = false;

    try {
      setStreamStatus('connecting');
      es = new EventSource('/api/events');

      es.addEventListener('open', () => {
        if (closed) return;
        setStreamStatus('open');
      });

      es.addEventListener('error', () => {
        if (closed) return;
        setStreamStatus('closed');
      });

      es.addEventListener('bot_status', (evt: MessageEvent) => {
        try {
          const next = JSON.parse(evt.data);
          setStatus((prev) => {
            const worker = prev?.worker;
            return { ok: true, worker, bot: next };
          });
        } catch {
        }
      });

      es.addEventListener('bot_exit', () => {
        refresh();
      });

      es.addEventListener('bot_log', (evt: MessageEvent) => {
        try {
          const payload = JSON.parse(evt.data);
          const chunk = typeof payload?.chunk === 'string' ? payload.chunk : '';
          if (!chunk) return;

          const lines = chunk.split(/\r?\n/).filter(Boolean);
          if (lines.length === 0) return;

          setLogs((prev) => {
            const next: LogsResponse = prev || { botLogTail: [], decisionLogTail: [] };
            const merged = [...(next.botLogTail || []), ...lines];
            const tail = merged.slice(Math.max(0, merged.length - 400));
            return { ...next, botLogTail: tail };
          });
        } catch {
        }
      });
    } catch {
      setStreamStatus('closed');
    }

    return () => {
      closed = true;
      setStreamStatus('closed');
      es?.close();
    };
  }, []);

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Socially Bot Dashboard</h1>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, opacity: 0.9 }}>
          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          Auto refresh
        </label>
        <div style={{ fontSize: 12, opacity: 0.75 }}>Last refreshed: {lastRefreshedAt || '-'}</div>
        <input
          value={logFilter}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setLogFilter(e.target.value)}
          placeholder="Filter logs"
          style={{
            flex: 1,
            minWidth: 220,
            padding: '8px 10px',
            borderRadius: 10,
            border: '1px solid #24304a',
            background: '#0b1220',
            color: '#e6edf3'
          }}
        />
      </div>

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
              <div style={{ fontSize: 12, opacity: 0.8 }}>Requests</div>
              <div style={{ fontSize: 14 }}>{metrics?.metrics?.requestsTotal ?? '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Unauthorized</div>
              <div style={{ fontSize: 14 }}>{metrics?.metrics?.unauthorized ?? '-'}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Rate-limited</div>
              <div style={{ fontSize: 14 }}>{metrics?.metrics?.rateLimited ?? '-'}</div>
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
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Live stream</div>
              <div style={{ fontSize: 14, color: streamColor, fontWeight: 700 }}>{streamLabel}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 16, border: '1px solid #24304a', borderRadius: 12, background: '#0f1a2f' }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>Worker metrics (top)</div>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Top paths</div>
              <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 12, opacity: 0.9 }}>
                {topPaths.length ? topPaths.map(([p, c]) => `${p}  ${c}`).join('\n') : 'No data'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Top statuses</div>
              <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 12, opacity: 0.9 }}>
                {topStatuses.length ? topStatuses.map(([s, c]) => `${s}  ${c}`).join('\n') : 'No data'}
              </div>
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

      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div style={{ padding: 16, border: '1px solid #24304a', borderRadius: 12, background: '#0f1a2f', minHeight: 320 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Bot log (tail)</h2>
            <button
              onClick={() => copy((filteredBotLog || []).join('\n'))}
              style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #24304a', background: '#152447', color: '#e6edf3' }}
            >
              Copy
            </button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.9 }}>
            {filteredBotLog.join('\n') || 'No logs'}
          </pre>
        </div>
        <div style={{ padding: 16, border: '1px solid #24304a', borderRadius: 12, background: '#0f1a2f', minHeight: 320 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h2 style={{ marginTop: 0, fontSize: 16 }}>Decision log (tail)</h2>
            <button
              onClick={() => copy((filteredDecisionLog || []).join('\n'))}
              style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid #24304a', background: '#152447', color: '#e6edf3' }}
            >
              Copy
            </button>
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.9 }}>
            {filteredDecisionLog.join('\n') || 'No decisions'}
          </pre>
        </div>
      </section>

      <div style={{ marginTop: 18, fontSize: 12, opacity: 0.75 }}>
        This dashboard is public. Start/stop/run actions require a dashboard key.
      </div>
    </main>
  );
}
