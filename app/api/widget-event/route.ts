import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseConfig, supabaseUpsert } from '@/lib/chat/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const eventSchema = z.object({
  session_id: z.string().regex(UUID_RE).optional(),
  event_type: z.enum(['launcher_clicked', 'widget_opened', 'widget_closed']),
  user_agent: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }

  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    await supabaseUpsert(
      'widget_events',
      {
        session_id: parsed.data.session_id ?? null,
        event_type: parsed.data.event_type,
        user_agent: parsed.data.user_agent ?? null,
        referrer: parsed.data.referrer ?? null,
        metadata: parsed.data.metadata ?? null,
      },
      { returnRepresentation: false },
      config
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, warning: err instanceof Error ? err.message : 'Upstream error' },
      { status: 200 }
    );
  }
}
