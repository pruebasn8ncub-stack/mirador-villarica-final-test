import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseConfig } from '@/lib/chat/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const bodySchema = z.object({
  session_id: z.string().regex(UUID_RE, 'session_id debe ser UUID'),
});

// Campos BANT del lead que se limpian al resetear. Se conservan id, session_id,
// nombre, email, whatsapp, project_slug, created_at y updated_at.
const LEAD_RESET_FIELDS = {
  parcela_interes: null,
  plazo: null,
  forma_pago: null,
  uso: null,
};

export async function POST(req: Request) {
  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const sessionId = parsed.data.session_id;
  const headers = {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  };

  // 1) Borrar historial de chat (memoria del agente) para este session_id.
  const delUrl = `${config.url}/rest/v1/mirador_chat_history?session_id=eq.${encodeURIComponent(sessionId)}`;
  const delRes = await fetch(delUrl, { method: 'DELETE', headers, cache: 'no-store' });
  if (!delRes.ok) {
    const body = await delRes.text().catch(() => '');
    return NextResponse.json(
      { ok: false, step: 'delete_chat_history', status: delRes.status, body },
      { status: 500 }
    );
  }

  // 2) Limpiar datos BANT del lead manteniendo identidad (nombre/email/whatsapp).
  const patchUrl = `${config.url}/rest/v1/leads?session_id=eq.${encodeURIComponent(sessionId)}`;
  const patchRes = await fetch(patchUrl, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(LEAD_RESET_FIELDS),
    cache: 'no-store',
  });
  if (!patchRes.ok) {
    const body = await patchRes.text().catch(() => '');
    return NextResponse.json(
      { ok: false, step: 'patch_lead', status: patchRes.status, body },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
