import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseConfig, supabaseUpsert } from '@/lib/chat/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const leadGateSchema = z.object({
  session_id: z.string().regex(UUID_RE, 'session_id debe ser UUID'),
  nombre: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(150),
  plazo: z.enum(['inmediato', '1-3m', '3-6m', '6-12m', '12m+']),
});

async function notifyN8n(payload: z.infer<typeof leadGateSchema>) {
  const webhookUrl = process.env.N8N_LEAD_GATE_WEBHOOK_URL;
  const webhookToken = process.env.N8N_WEBHOOK_TOKEN;
  if (!webhookUrl) return;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookToken ? { Authorization: `Bearer ${webhookToken}` } : {}),
      },
      body: JSON.stringify({ ...payload, score: 'FRIO', source: 'lead_gate' }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch {
    // fire-and-forget; la DB es la fuente autoritativa
  }
}

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = leadGateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const config = getSupabaseConfig();
  if (!config) {
    await notifyN8n(parsed.data);
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    const rows = await supabaseUpsert<{ id: string }>(
      'leads',
      {
        session_id: parsed.data.session_id,
        nombre: parsed.data.nombre,
        whatsapp: parsed.data.whatsapp,
        email: parsed.data.email,
        plazo: parsed.data.plazo,
        score: 'FRIO',
        project_slug: 'mirador-villarrica',
      },
      { onConflict: 'session_id' },
      config
    );
    await notifyN8n(parsed.data);
    return NextResponse.json({ ok: true, persisted: true, lead_id: rows[0]?.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upstream error' },
      { status: 502 }
    );
  }
}
