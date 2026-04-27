import { NextResponse } from 'next/server';
import { getSupabaseConfig, supabaseSelect } from '@/lib/chat/supabase';
import { isAuthed } from '@/lib/feedback/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SCORE_VALUES = new Set(['CALIENTE', 'TIBIO', 'FRIO']);

interface LeadRow {
  id: string;
  session_id: string;
  nombre: string;
  whatsapp: string | null;
  email: string | null;
  intencion: string | null;
  plazo: string | null;
  presupuesto: string | null;
  score: string;
  score_numeric: number | null;
  resumen: string | null;
  parcela_interes: string | null;
  parcelas_recomendadas: string[] | null;
  forma_pago: string | null;
  pie_disponible: string | null;
  decisor: string | null;
  uso: string | null;
  rango_presupuesto: string | null;
  pre_aprobacion: boolean | null;
  canales_envio: string[] | null;
  resumen_enviado_at: string | null;
  broker_requested_at: string | null;
  broker_request_reason: string | null;
  notified_diego: boolean | null;
  notified_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export async function GET(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim();
  const score = url.searchParams.get('score');
  const limit = Math.min(Number(url.searchParams.get('limit') || 100), 500);
  const offset = Math.max(Number(url.searchParams.get('offset') || 0), 0);

  const params = new URLSearchParams();
  params.set(
    'select',
    [
      'id',
      'session_id',
      'nombre',
      'whatsapp',
      'email',
      'intencion',
      'plazo',
      'presupuesto',
      'score',
      'score_numeric',
      'resumen',
      'parcela_interes',
      'parcelas_recomendadas',
      'forma_pago',
      'pie_disponible',
      'decisor',
      'uso',
      'rango_presupuesto',
      'pre_aprobacion',
      'canales_envio',
      'resumen_enviado_at',
      'broker_requested_at',
      'broker_request_reason',
      'notified_diego',
      'notified_at',
      'created_at',
      'updated_at',
    ].join(',')
  );
  params.set('order', 'created_at.desc');
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  if (score && SCORE_VALUES.has(score)) {
    params.append('score', `eq.${score}`);
  }
  if (q) {
    const safe = q.replace(/[%,()]/g, ' ').trim();
    if (safe) {
      const term = `*${safe}*`;
      // PostgREST or() filter sobre multiple columnas
      params.append(
        'or',
        `(nombre.ilike.${term},email.ilike.${term},whatsapp.ilike.${term},resumen.ilike.${term})`
      );
    }
  }

  try {
    const { rows, count } = await supabaseSelect<LeadRow>(
      'leads',
      { query: params.toString(), exactCount: true },
      config
    );
    return NextResponse.json({ items: rows, total: count });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upstream error' },
      { status: 502 }
    );
  }
}
