import { NextResponse } from 'next/server';
import { getSupabaseConfig, supabaseSelect } from '@/lib/chat/supabase';
import { isAuthed } from '@/lib/feedback/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatHistoryRow {
  id: number;
  session_id: string;
  message: unknown;
}

interface LeadMini {
  session_id: string;
  nombre: string;
  score: string;
  score_numeric: number | null;
  created_at: string;
}

interface SessionMini {
  id: string;
  created_at: string;
  user_agent: string | null;
  referrer: string | null;
}

interface MessageContent {
  type?: string;
  content?: unknown;
  data?: { content?: unknown };
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
  const m = message as MessageContent & { type?: string };
  const t = (m.type || '').toLowerCase();
  if (t === 'human' || t === 'user') return 'user';
  if (t === 'ai' || t === 'assistant') return 'assistant';
  if (t === 'tool' || t === 'function') return 'tool';
  return 'system';
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
  const limit = Math.min(Number(url.searchParams.get('limit') || 80), 200);

  try {
    const [history, leads, sessions] = await Promise.all([
      supabaseSelect<ChatHistoryRow>(
        'mirador_chat_history',
        { query: 'select=id,session_id,message&order=id.asc&limit=20000' },
        config
      ),
      supabaseSelect<LeadMini>(
        'leads',
        { query: 'select=session_id,nombre,score,score_numeric,created_at&limit=5000' },
        config
      ),
      supabaseSelect<SessionMini>(
        'sessions',
        { query: 'select=id,created_at,user_agent,referrer&limit=5000' },
        config
      ),
    ]);

    type Convo = {
      session_id: string;
      message_count: number;
      user_messages: number;
      first_user_message: string | null;
      last_message: string | null;
      last_role: string | null;
      first_at: string | null; // approx via session.created_at o lead.created_at
      lead: LeadMini | null;
      session: SessionMini | null;
    };

    const convoMap = new Map<string, Convo>();
    const leadMap = new Map(leads.rows.map((l) => [l.session_id, l]));
    const sessionMap = new Map(sessions.rows.map((s) => [s.id, s]));

    for (const row of history.rows) {
      let convo = convoMap.get(row.session_id);
      if (!convo) {
        const lead = leadMap.get(row.session_id) || null;
        const session = sessionMap.get(row.session_id) || null;
        convo = {
          session_id: row.session_id,
          message_count: 0,
          user_messages: 0,
          first_user_message: null,
          last_message: null,
          last_role: null,
          first_at: session?.created_at || lead?.created_at || null,
          lead,
          session,
        };
        convoMap.set(row.session_id, convo);
      }
      convo.message_count += 1;
      const role = extractRole(row.message);
      const text = extractText(row.message);
      if (role === 'user') {
        convo.user_messages += 1;
        if (!convo.first_user_message && text) convo.first_user_message = text;
      }
      if (text) {
        convo.last_message = text;
        convo.last_role = role;
      }
    }

    let items = Array.from(convoMap.values()).filter(
      (c) => c.message_count > 0
    );

    if (q) {
      const lo = q.toLowerCase();
      items = items.filter((c) => {
        return (
          c.lead?.nombre?.toLowerCase().includes(lo) ||
          c.first_user_message?.toLowerCase().includes(lo) ||
          c.last_message?.toLowerCase().includes(lo) ||
          c.session_id.toLowerCase().includes(lo)
        );
      });
    }

    items.sort((a, b) => {
      const da = a.first_at ? new Date(a.first_at).getTime() : 0;
      const db = b.first_at ? new Date(b.first_at).getTime() : 0;
      return db - da;
    });

    return NextResponse.json({
      total: items.length,
      items: items.slice(0, limit),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upstream error' },
      { status: 502 }
    );
  }
}
