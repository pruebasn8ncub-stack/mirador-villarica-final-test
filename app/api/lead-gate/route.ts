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

type LeadGatePayload = z.infer<typeof leadGateSchema>;

// Normaliza el valor del formulario al valor canónico BANT+ usado en DB.
const PLAZO_GATE_TO_CANONICAL: Record<LeadGatePayload['plazo'], string> = {
  inmediato: 'ahora',
  '1-3m': '1_a_3_meses',
  '3-6m': '3_a_6_meses',
  '6-12m': '6_a_12_meses',
  '12m+': 'mas_de_1_ano',
};

// Puntos de la columna "plazo" del framework BANT+ (ver n8n-workflows/scoring-spec.md).
const PLAZO_POINTS: Record<LeadGatePayload['plazo'], number> = {
  inmediato: 22,
  '1-3m': 22,
  '3-6m': 15,
  '6-12m': 8,
  '12m+': 3,
};

// Score inicial: plazo + contacto (whatsapp && email = 10). Nombre alcanzaría para 3.
// Con los 3 contactos que pide el gate, contacto vale 10.
function computeInitialScoreNumeric(plazo: LeadGatePayload['plazo']): number {
  return PLAZO_POINTS[plazo] + 10;
}

async function notifyN8n(payload: LeadGatePayload, scoreNumeric: number) {
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
      body: JSON.stringify({
        ...payload,
        score: 'FRIO',
        score_numeric: scoreNumeric,
        source: 'lead_gate',
      }),
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

  const scoreNumeric = computeInitialScoreNumeric(parsed.data.plazo);
  const plazoCanonical = PLAZO_GATE_TO_CANONICAL[parsed.data.plazo];

  const config = getSupabaseConfig();
  if (!config) {
    await notifyN8n(parsed.data, scoreNumeric);
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
        plazo: plazoCanonical,
        score: 'FRIO',
        score_numeric: scoreNumeric,
        score_history: [
          {
            at: new Date().toISOString(),
            action: 'gate_submit',
            source: 'form',
            plazo_raw: parsed.data.plazo,
            plazo_canonical: plazoCanonical,
            score_numeric: scoreNumeric,
          },
        ],
        project_slug: 'mirador-villarrica',
      },
      { onConflict: 'session_id' },
      config
    );
    await notifyN8n(parsed.data, scoreNumeric);
    return NextResponse.json({ ok: true, persisted: true, lead_id: rows[0]?.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upstream error' },
      { status: 502 }
    );
  }
}
