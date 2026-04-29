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

  const safe = async <T,>(p: Promise<{ rows: T[]; count: number | null }>) => {
    try { return await p; } catch { return { rows: [] as T[], count: 0 }; }
  };

  const num = (v: number | string | null | undefined): number => {
    if (v == null) return 0;
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return Number.isFinite(n) ? n : 0;
  };

  try {
    const [history, leadRes, sessionRes, feedbackRes, eventsRes, costsRes] = await Promise.all([
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
      safe(
        supabaseSelect<{
          execution_id: string | null;
          workflow: string;
          model_real: string | null;
          provider: string | null;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          total_tokens: number | null;
          cached_tokens: number | null;
          reasoning_tokens: number | null;
          cost_usd: number | string | null;
          cost_input_usd: number | string | null;
          cost_output_usd: number | string | null;
          duration_ms: number | null;
          exec_started_at: string;
          exec_ended_at: string;
          span_id: string | null;
        }>(
          'mirador_session_costs',
          {
            query: `select=execution_id,workflow,model_real,provider,prompt_tokens,completion_tokens,total_tokens,cached_tokens,reasoning_tokens,cost_usd,cost_input_usd,cost_output_usd,duration_ms,exec_started_at,exec_ended_at,span_id&session_id=eq.${sid}&order=exec_started_at.asc&limit=500`,
          },
          config
        )
      ),
    ]);

    const messages = history.rows.map((r) => ({
      id: r.id,
      role: extractRole(r.message),
      content: extractText(r.message),
      raw: r.message,
    }));

    const costs = costsRes.rows.map((r) => ({
      execution_id: r.execution_id,
      workflow: r.workflow,
      model: r.model_real,
      provider: r.provider,
      prompt_tokens: num(r.prompt_tokens),
      completion_tokens: num(r.completion_tokens),
      total_tokens: num(r.total_tokens),
      cached_tokens: num(r.cached_tokens),
      reasoning_tokens: num(r.reasoning_tokens),
      cost_usd: num(r.cost_usd),
      cost_input_usd: num(r.cost_input_usd),
      cost_output_usd: num(r.cost_output_usd),
      duration_ms: r.duration_ms,
      exec_started_at: r.exec_started_at,
      exec_ended_at: r.exec_ended_at,
      matched: r.span_id !== null,
    }));

    const cost_totals = costs.reduce(
      (acc, c) => ({
        cost_usd: acc.cost_usd + c.cost_usd,
        cost_input_usd: acc.cost_input_usd + c.cost_input_usd,
        cost_output_usd: acc.cost_output_usd + c.cost_output_usd,
        prompt_tokens: acc.prompt_tokens + c.prompt_tokens,
        completion_tokens: acc.completion_tokens + c.completion_tokens,
        total_tokens: acc.total_tokens + c.total_tokens,
        cached_tokens: acc.cached_tokens + c.cached_tokens,
        reasoning_tokens: acc.reasoning_tokens + c.reasoning_tokens,
        llm_calls: acc.llm_calls + 1,
      }),
      {
        cost_usd: 0,
        cost_input_usd: 0,
        cost_output_usd: 0,
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        cached_tokens: 0,
        reasoning_tokens: 0,
        llm_calls: 0,
      }
    );

    return NextResponse.json({
      session_id: sid,
      messages,
      lead: leadRes.rows[0] || null,
      session: sessionRes.rows[0] || null,
      feedback: feedbackRes.rows,
      events: eventsRes.rows,
      costs,
      cost_totals,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upstream error' },
      { status: 502 }
    );
  }
}
