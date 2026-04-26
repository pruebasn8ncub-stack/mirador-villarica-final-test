import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getSupabaseConfig,
  supabaseSelect,
  supabaseUpsert,
} from '@/lib/chat/supabase';
import { isAuthed } from '@/lib/feedback/auth';

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

interface FeedbackRow {
  id: string;
  session_id: string;
  reviewer_name: string;
  annotation: string;
  messages: unknown;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
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
  const reviewer = url.searchParams.get('reviewer')?.trim();
  const sessionId = url.searchParams.get('session_id')?.trim();
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const limit = Math.min(Number(url.searchParams.get('limit') || 50), 200);
  const offset = Math.max(Number(url.searchParams.get('offset') || 0), 0);
  const stats = url.searchParams.get('stats') === '1';

  const params = new URLSearchParams();
  params.set('select', 'id,session_id,reviewer_name,annotation,messages,user_agent,referrer,created_at');
  params.set('order', 'created_at.desc');
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  if (q) params.append('annotation', `ilike.*${escapeIlike(q)}*`);
  if (reviewer) params.append('reviewer_name', `eq.${reviewer}`);
  if (sessionId && UUID_RE.test(sessionId)) params.append('session_id', `eq.${sessionId}`);
  if (from) params.append('created_at', `gte.${from}`);
  if (to) params.append('created_at', `lte.${to}`);

  try {
    const { rows, count } = await supabaseSelect<FeedbackRow>(
      'chat_feedback',
      { query: params.toString(), exactCount: true },
      config
    );

    let reviewers: string[] = [];
    let sessionsCount: number | null = null;
    if (stats) {
      const allReviewers = await supabaseSelect<{ reviewer_name: string }>(
        'chat_feedback',
        { query: 'select=reviewer_name&order=reviewer_name.asc' },
        config
      );
      reviewers = Array.from(
        new Set(allReviewers.rows.map((r) => r.reviewer_name).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b, 'es'));

      const sessionsRes = await supabaseSelect<{ session_id: string }>(
        'chat_feedback',
        { query: 'select=session_id' },
        config
      );
      sessionsCount = new Set(sessionsRes.rows.map((r) => r.session_id)).size;
    }

    return NextResponse.json({
      items: rows,
      total: count,
      ...(stats ? { reviewers, sessions_count: sessionsCount } : {}),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upstream error' },
      { status: 502 }
    );
  }
}

function escapeIlike(s: string): string {
  return s.replace(/[%,()]/g, ' ').replace(/\s+/g, ' ').trim();
}
