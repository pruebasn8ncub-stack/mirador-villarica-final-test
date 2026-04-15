import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const chatRequestSchema = z.object({
  session_id: z.string().regex(UUID_RE, 'session_id debe ser UUID'),
  message: z.string().min(1).max(1000),
  user_metadata: z
    .object({
      referrer: z.string().max(500).optional(),
      user_agent: z.string().max(500).optional(),
    })
    .optional(),
});

// Rate limit in-memory por session_id. 10 requests / 60s.
// Nota: esta tabla se reinicia por instancia serverless. Suficiente para MVP.
// Antes de producción sostenida, migrar a Upstash / Vercel KV.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;
const rateTable = new Map<string, number[]>();

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const hits = (rateTable.get(sessionId) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) {
    rateTable.set(sessionId, hits);
    return false;
  }
  hits.push(now);
  rateTable.set(sessionId, hits);
  return true;
}

export async function POST(req: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const webhookToken = process.env.N8N_WEBHOOK_TOKEN;

  if (!webhookUrl || !webhookToken) {
    return NextResponse.json(
      { error: 'Chat service not configured' },
      { status: 503 }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!checkRateLimit(parsed.data.session_id)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${webhookToken}`,
      },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'Upstream error', status: upstream.status },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    return NextResponse.json(
      { error: isAbort ? 'Upstream timeout' : 'Upstream failure' },
      { status: 504 }
    );
  }
}
