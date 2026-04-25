import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseConfig, supabaseUpsert } from '@/lib/chat/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const messageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.number().optional(),
  attachment_types: z.array(z.string()).optional(),
});

const feedbackSchema = z.object({
  session_id: z.string().regex(UUID_RE, 'session_id debe ser UUID'),
  reviewer_name: z.string().trim().min(2).max(120),
  annotation: z.string().trim().min(3).max(4000),
  messages: z.array(messageSchema).min(1).max(500),
  user_agent: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = feedbackSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.json(
      { error: 'Storage not configured' },
      { status: 503 }
    );
  }

  try {
    const rows = await supabaseUpsert<{ id: string }>(
      'chat_feedback',
      {
        session_id: parsed.data.session_id,
        reviewer_name: parsed.data.reviewer_name,
        annotation: parsed.data.annotation,
        messages: parsed.data.messages,
        user_agent: parsed.data.user_agent ?? null,
        referrer: parsed.data.referrer ?? null,
      },
      {},
      config
    );
    return NextResponse.json({ ok: true, id: rows[0]?.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upstream error' },
      { status: 502 }
    );
  }
}
