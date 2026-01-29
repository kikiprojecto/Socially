import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function requireDashboardKey(req: Request) {
  const expected = process.env.DASHBOARD_KEY;
  if (!expected) return true;
  const provided = req.headers.get('x-dashboard-key') || '';
  return provided === expected;
}

export async function POST(req: Request) {
  if (!requireDashboardKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.WORKER_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: 'WORKER_BASE_URL is not set' }, { status: 500 });
  }

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/bot/start`, {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.WORKER_TOKEN || ''}` }
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
