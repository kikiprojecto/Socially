import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const baseUrl = process.env.WORKER_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json({ ok: false, error: 'WORKER_BASE_URL is not set' }, { status: 500 });
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/metrics`, {
      headers: { authorization: `Bearer ${process.env.WORKER_TOKEN || ''}` },
      cache: 'no-store'
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Worker unreachable' }, { status: 502 });
  }
}
