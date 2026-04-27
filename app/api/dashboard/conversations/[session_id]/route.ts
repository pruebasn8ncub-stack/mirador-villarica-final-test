import { NextResponse } from 'next/server';
import { getSupabaseConfig, supabaseSelect } from '@/lib/chat/supabase';
import { isAuthed } from '@/lib/feedback/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ChatHistoryRow {
  id: number;
  session_id: string;
  message: unknown;
}

interface MessageContent {
  type?: string;
  content?: unknown;
  data?: { content?: unknown; additional_kwargs?: unknown };
  tool_call_id?: string;
  name?: string;
}

function extractText(message: unknown): string {
  if (!message || typeof message !== 'object') return '';
  const m = message as MessageContent;
  if (typeof m.content === 'string') return m.content;
  if (m.data && typeof m.data.content === 'string') return m.data.content;
  return '';
}

function extractRole(message: unknown): 'user' | 'assistant' | 'system' | 'tool' {
  if (!message || typeof message !== 'object') return 'system';
  const m = message as MessageContent;
  const t = (m.type || '').toLowerCase();
  if (t === 'human' || t === 'user') return 'user';
  if (t === 'ai' || t === 'assistant') return 'assistant';
  if (t === 'tool' || t === 'function') return 'tool';
  return 'system';
}

export async function GET(
  _req: Request,
  { params }: { params: { session_id: string } }
) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const sid = params.session_id;
  if (!UUID_RE.test(sid)) {
    return NextResponse.json({ error: 'session_id inválido' }, { status: 400 });
  }
  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }

  try {
    const [history, leadRes, sessionRes, feedbackRes, eventsRes] = await Promise.all([
      supabaseSelect<ChatHistoryRow>(
        'mirador_chat_history',
        {
          query: `select=id,session_id,message&session_id=eq.${sid}&order=id.asc&limit=2000`,
        },
        config
      ),
      supabaseSelect<Record<string, unknown>>(
        'leads',
        { query: `select=*&session_id=eq.${sid}&limit=1` },
        config
      ),
      supabaseSelect<Record<string, unknown>>(
        'sessions',
        { query: `select=*&id=eq.${sid}&limit=1` },
        config
      ),
      supabaseSelect<{
        id: string;
        reviewer_name: string;
        annotation: string;
        created_at: string;
      }>(
        'chat_feedback',
        {
          query: `select=id,reviewer_name,annotation,created_at&session_id=eq.${sid}&order=created_at.desc&limit=50`,
        },
        config
      ),
      supabaseSelect<{ event_type: string; created_at: string }>(
        'widget_events',
        {
          query: `select=event_type,created_at&session_id=eq.${sid}&order=created_at.asc&limit=200`,
        },
        config
      ),
    ]);

    const messages = history.rows.map((r) => ({
      id: r.id,
      role: extractRole(r.message),
      content: extractText(r.message),
      raw: r.message,
    }));

    return NextResponse.json({
      session_id: sid,
      messages,
      lead: leadRes.rows[0] || null,
      session: sessionRes.rows[0] || null,
      feedback: feedbackRes.rows,
      events: eventsRes.rows,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upstream error' },
      { status: 502 }
    );
  }
}
