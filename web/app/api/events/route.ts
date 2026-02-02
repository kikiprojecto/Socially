import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const baseUrl = process.env.WORKER_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ error: 'WORKER_BASE_URL is not set' }, { status: 500 });
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/events`, {
      headers: { authorization: `Bearer ${process.env.WORKER_TOKEN || ''}` },
      cache: 'no-store'
    });

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => '');
      return NextResponse.json({ error: body || `Worker returned ${res.status}` }, { status: 502 });
    }

    return new Response(res.body, {
      status: 200,
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive'
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Worker unreachable' }, { status: 502 });
  }
}
