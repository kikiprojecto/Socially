import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const baseUrl = process.env.WORKER_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ botLogTail: [], decisionLogTail: [], error: 'WORKER_BASE_URL is not set' }, { status: 500 });
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/logs?tail=200`, {
      headers: { authorization: `Bearer ${process.env.WORKER_TOKEN || ''}` },
      cache: 'no-store'
    });

    const data = await res.json().catch(() => ({ botLogTail: [], decisionLogTail: [] }));
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ botLogTail: [], decisionLogTail: [], error: e?.message || 'Worker unreachable' }, { status: 502 });
  }
}
