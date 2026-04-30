import { NextResponse } from 'next/server';
import { getSupabaseConfig, supabaseSelect } from '@/lib/chat/supabase';
import { isAuthed } from '@/lib/feedback/auth';
import {
  getLangfuseConfig,
  langfuseGet,
  langfuseList,
  observationToTurn,
  totalsFromTurns,
  LITELLM_TRACE_NAME,
  type LangfuseObservation,
  type LangfuseTrace,
  type LangfuseListResponse,
  type TurnRecord,
} from '@/lib/langfuse/client';

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

async function fetchSessionGenerations(
  sessionId: string
): Promise<LangfuseObservation[]> {
  const lfConfig = getLangfuseConfig();
  if (!lfConfig) return [];
  // 1) Buscar todos los traces bajo ese sessionId (filtramos por LiteLLM-emitidos).
  const tracesPage = await langfuseGet<LangfuseListResponse<LangfuseTrace>>(
    '/api/public/traces',
    { sessionId, limit: 50 },
    lfConfig
  );
  const liteTraces = tracesPage.data.filter(
    (t) => t.name === LITELLM_TRACE_NAME
  );
  if (liteTraces.length === 0) return [];

  // 2) Para cada trace, traer sus GENERATIONs.
  const all: LangfuseObservation[] = [];
  for (const trace of liteTraces) {
    const obs = await langfuseList<LangfuseObservation>(
      '/api/public/observations',
      { traceId: trace.id, type: 'GENERATION', limit: 100 },
      500,
      lfConfig
    );
    all.push(...obs);
  }
  // Ordenar por startTime ascendente para el agrupamiento por turno en el cliente.
  all.sort((a, b) => a.startTime.localeCompare(b.startTime));
  return all;
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
    const [history, leadRes, sessionRes, feedbackRes, eventsRes, generations] =
      await Promise.all([
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
        fetchSessionGenerations(sid).catch((err) => {
          console.warn('[langfuse] session fetch failed', err);
          return [] as LangfuseObservation[];
        }),
      ]);

    const messages = history.rows.map((r) => ({
      id: r.id,
      role: extractRole(r.message),
      content: extractText(r.message),
      raw: r.message,
    }));

    const turns: TurnRecord[] = generations.map(observationToTurn);
    // Mantener compatibilidad de shape con el cliente legacy.
    const costs = turns.map((t) => ({
      execution_id: t.observation_id,
      workflow: t.workflow,
      model: t.model,
      provider: t.model ? t.model.split('/')[0] : null,
      prompt_tokens: t.prompt_tokens,
      completion_tokens: t.completion_tokens,
      total_tokens: t.total_tokens,
      cached_tokens: 0,
      reasoning_tokens: 0,
      cost_usd: t.cost_usd,
      cost_input_usd: t.cost_input_usd,
      cost_output_usd: t.cost_output_usd,
      duration_ms: t.duration_ms,
      exec_started_at: t.started_at,
      exec_ended_at: t.ended_at ?? t.started_at,
      matched: t.matched,
      agent: t.agent,
      generation_name: t.generation_name,
      input_price: t.input_price,
      output_price: t.output_price,
    }));

    const totals = totalsFromTurns(turns);
    const cost_totals = {
      // shape histórica
      cost_usd: totals.cost_usd,
      cost_input_usd: totals.cost_input_usd,
      cost_output_usd: totals.cost_output_usd,
      prompt_tokens: totals.prompt_tokens,
      completion_tokens: totals.completion_tokens,
      total_tokens: totals.total_tokens,
      cached_tokens: 0,
      reasoning_tokens: 0,
      llm_calls: totals.llm_calls,
      // métricas nuevas
      latency_total_ms: totals.latency_total_ms,
      models_used: totals.models_used,
      workflows: totals.workflows,
      avg_cost_per_call: totals.avg_cost_per_call,
    };

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
