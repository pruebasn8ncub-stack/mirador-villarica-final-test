import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseConfig, supabaseUpsert } from '@/lib/chat/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const sessionSchema = z.object({
  session_id: z.string().regex(UUID_RE, 'session_id debe ser UUID'),
  user_agent: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.json({ ok: true, persisted: false }, { status: 200 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = sessionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await supabaseUpsert(
      'sessions',
      {
        id: parsed.data.session_id,
        user_agent: parsed.data.user_agent ?? null,
        referrer: parsed.data.referrer ?? null,
        project_slug: 'mirador-villarrica',
        status: 'active',
      },
      { onConflict: 'id', returnRepresentation: false },
      config
    );
    return NextResponse.json({ ok: true, persisted: true });
  } catch (err) {
    // Tolerante: si la tabla `sessions` no existe o la FK no está configurada,
    // no bloqueamos el widget. El lead igual se persiste vía /api/lead-gate.
    const message = err instanceof Error ? err.message : 'Upstream error';
    return NextResponse.json(
      { ok: true, persisted: false, warning: message },
      { status: 200 }
    );
  }
}
