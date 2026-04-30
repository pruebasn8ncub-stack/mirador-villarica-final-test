import { NextResponse } from 'next/server';
import { getSupabaseConfig, supabaseSelect } from '@/lib/chat/supabase';
import { isAuthed } from '@/lib/feedback/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LeadRow {
  id: string;
  session_id: string;
  nombre: string;
  whatsapp: string | null;
  email: string | null;
  parcela_interes: string | null;
  plazo: string | null;
  forma_pago: string | null;
  uso: string | null;
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
      'parcela_interes',
      'plazo',
      'forma_pago',
      'uso',
      'created_at',
      'updated_at',
    ].join(',')
  );
  params.set('order', 'created_at.desc');
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  if (q) {
    const safe = q.replace(/[%,()]/g, ' ').trim();
    if (safe) {
      const term = `*${safe}*`;
      params.append(
        'or',
        `(nombre.ilike.${term},email.ilike.${term},whatsapp.ilike.${term},parcela_interes.ilike.${term})`
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
