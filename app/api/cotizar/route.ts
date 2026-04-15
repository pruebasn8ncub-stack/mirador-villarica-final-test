import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const cotizarSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email(),
  telefono: z.string().min(8).max(30),
  cuando: z.enum(['ahora', '1_a_3_meses', '3_a_6_meses', '6_a_12_meses', 'evaluando']),
  mensaje: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = cotizarSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Stub Fase 1: el formulario tradicional se mantiene para visitantes que no usen el chat.
  // En producción este endpoint delega a n8n (mismo webhook o uno dedicado /cotizar-form).
  const webhookUrl = process.env.N8N_COTIZAR_WEBHOOK_URL;
  const webhookToken = process.env.N8N_WEBHOOK_TOKEN;

  if (webhookUrl && webhookToken) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${webhookToken}`,
        },
        body: JSON.stringify({ ...parsed.data, source: 'web-form' }),
      });
    } catch {
      // Ignorar fallo silencioso: el form no debe romperse por downstream.
    }
  }

  return NextResponse.json({ ok: true });
}
