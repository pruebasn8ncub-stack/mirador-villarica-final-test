import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/feedback/auth';
import {
  getLangfuseConfig,
  langfuseList,
  observationToTurn,
  type LangfuseObservation,
} from '@/lib/langfuse/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function presetToDate(preset: string | null): Date | null {
  if (!preset || preset === 'all') return null;
  const now = new Date();
  if (preset === 'today') {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 0;
  if (!days) return null;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

// Para una observación, devolver el sessionId (= traceId, que en nuestro setup
// LiteLLM coincide con el chat session_id).
function sessionIdFromObservation(obs: LangfuseObservation): string {
  const meta = obs.metadata?.requester_metadata;
  const fromMeta = meta?.sessionId || meta?.session_id;
  if (typeof fromMeta === 'string' && UUID_RE.test(fromMeta)) return fromMeta;
  return obs.traceId;
}

export async function GET(req: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  const lf = getLangfuseConfig();
  if (!lf) {
    return NextResponse.json(
      { error: 'Langfuse no está configurado (faltan LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY)' },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get('session_id');

  // ─── Modo detalle: ?session_id=X ─────────────────────────────
  if (sessionId) {
    if (!UUID_RE.test(sessionId)) {
      return NextResponse.json({ error: 'session_id inválido' }, { status: 400 });
    }
    try {
      const observations = await langfuseList<LangfuseObservation>(
        '/api/public/observations',
        { traceId: sessionId, type: 'GENERATION', limit: 100 },
        500,
        lf
      );
      observations.sort((a, b) => a.startTime.localeCompare(b.startTime));
      const turns = observations.map(observationToTurn);
      const totals = {
        sessions: 1,
        turns: turns.length,
        total_cost_usd: turns.reduce((s, t) => s + t.cost_usd, 0),
        total_tokens: turns.reduce((s, t) => s + t.total_tokens, 0),
        total_prompt_tokens: turns.reduce((s, t) => s + t.prompt_tokens, 0),
        total_completion_tokens: turns.reduce((s, t) => s + t.completion_tokens, 0),
        models_used: Array.from(new Set(turns.map((t) => t.model).filter(Boolean) as string[])),
      };
      return NextResponse.json({
        session_id: sessionId,
        totals,
        turns: turns.map((t) => ({
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
          price_per_input_token: t.input_price ?? 0,
          price_per_output_token: t.output_price ?? 0,
          duration_ms: t.duration_ms,
          started_at: t.started_at,
          matched: t.matched,
        })),
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Upstream error' },
        { status: 502 }
      );
    }
  }

  // ─── Modo agregado: dashboard global ─────────────────────────
  const preset = url.searchParams.get('range') || '30d';
  const since = presetToDate(preset);

  try {
    const observations = await langfuseList<LangfuseObservation>(
      '/api/public/observations',
      {
        type: 'GENERATION',
        fromStartTime: since ? since.toISOString() : undefined,
        limit: 100,
      },
      10000,
      lf
    );

    const turns = observations.map((obs) => ({
      ...observationToTurn(obs),
      session_id: sessionIdFromObservation(obs),
    }));

    // Agrupación por sesión
    type SessionAcc = {
      session_id: string;
      total_cost_usd: number;
      total_tokens: number;
      turns: number;
      llm_calls_matched: number;
      unmatched: number;
      models_used: Set<string>;
      first_call_at: string | null;
      last_call_at: string | null;
    };
    const bySession = new Map<string, SessionAcc>();
    for (const t of turns) {
      let acc = bySession.get(t.session_id);
      if (!acc) {
        acc = {
          session_id: t.session_id,
          total_cost_usd: 0,
          total_tokens: 0,
          turns: 0,
          llm_calls_matched: 0,
          unmatched: 0,
          models_used: new Set(),
          first_call_at: null,
          last_call_at: null,
        };
        bySession.set(t.session_id, acc);
      }
      acc.total_cost_usd += t.cost_usd;
      acc.total_tokens += t.total_tokens;
      acc.turns += 1;
      if (t.matched) acc.llm_calls_matched += 1;
      else acc.unmatched += 1;
      if (t.model) acc.models_used.add(t.model);
      if (!acc.first_call_at || t.started_at < acc.first_call_at) acc.first_call_at = t.started_at;
      const endRef = t.ended_at ?? t.started_at;
      if (!acc.last_call_at || endRef > acc.last_call_at) acc.last_call_at = endRef;
    }

    const totalSessions = bySession.size;
    const totalCost = turns.reduce((s, t) => s + t.cost_usd, 0);
    const totalCostInput = turns.reduce((s, t) => s + t.cost_input_usd, 0);
    const totalCostOutput = turns.reduce((s, t) => s + t.cost_output_usd, 0);
    const totalPromptTokens = turns.reduce((s, t) => s + t.prompt_tokens, 0);
    const totalCompletionTokens = turns.reduce((s, t) => s + t.completion_tokens, 0);
    const totalTokens = turns.reduce((s, t) => s + t.total_tokens, 0);
    const totalLatency = turns.reduce((s, t) => s + (t.duration_ms ?? 0), 0);
    const matched = turns.filter((t) => t.matched).length;
    const unmatched = turns.length - matched;

    const topSessions = Array.from(bySession.values())
      .sort((a, b) => b.total_cost_usd - a.total_cost_usd)
      .slice(0, 50)
      .map((s) => ({
        session_id: s.session_id,
        total_cost_usd: s.total_cost_usd,
        total_tokens: s.total_tokens,
        turns: s.turns,
        llm_calls_matched: s.llm_calls_matched,
        unmatched: s.unmatched,
        models_used: Array.from(s.models_used),
        first_call_at: s.first_call_at,
        last_call_at: s.last_call_at,
      }));

    // Series temporal por día
    const days = preset === 'today' ? 1 : preset === '7d' ? 7 : preset === '30d' ? 30 : 60;
    const buckets: Record<string, { cost: number; tokens: number; calls: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { cost: 0, tokens: 0, calls: 0 };
    }
    for (const t of turns) {
      const k = (t.started_at || '').slice(0, 10);
      if (buckets[k]) {
        buckets[k].cost += t.cost_usd;
        buckets[k].tokens += t.total_tokens;
        buckets[k].calls += 1;
      }
    }
    const series = Object.entries(buckets).map(([date, v]) => ({ date, ...v }));

    // Breakdown por modelo
    type Bucket = {
      cost: number;
      cost_input: number;
      cost_output: number;
      prompt_tokens: number;
      completion_tokens: number;
      tokens: number;
      calls: number;
    };
    const byModel: Record<string, Bucket> = {};
    for (const t of turns) {
      const m = t.model || 'desconocido';
      if (!byModel[m])
        byModel[m] = { cost: 0, cost_input: 0, cost_output: 0, prompt_tokens: 0, completion_tokens: 0, tokens: 0, calls: 0 };
      byModel[m].cost += t.cost_usd;
      byModel[m].cost_input += t.cost_input_usd;
      byModel[m].cost_output += t.cost_output_usd;
      byModel[m].prompt_tokens += t.prompt_tokens;
      byModel[m].completion_tokens += t.completion_tokens;
      byModel[m].tokens += t.total_tokens;
      byModel[m].calls += 1;
    }
    const models = Object.entries(byModel)
      .map(([model, v]) => ({ model, ...v }))
      .sort((a, b) => b.cost - a.cost);

    // Breakdown por workflow
    const byWorkflow: Record<string, Bucket> = {};
    for (const t of turns) {
      const w = t.workflow || 'desconocido';
      if (!byWorkflow[w])
        byWorkflow[w] = { cost: 0, cost_input: 0, cost_output: 0, prompt_tokens: 0, completion_tokens: 0, tokens: 0, calls: 0 };
      byWorkflow[w].cost += t.cost_usd;
      byWorkflow[w].cost_input += t.cost_input_usd;
      byWorkflow[w].cost_output += t.cost_output_usd;
      byWorkflow[w].prompt_tokens += t.prompt_tokens;
      byWorkflow[w].completion_tokens += t.completion_tokens;
      byWorkflow[w].tokens += t.total_tokens;
      byWorkflow[w].calls += 1;
    }
    const workflows = Object.entries(byWorkflow)
      .map(([workflow, v]) => ({ workflow, ...v }))
      .sort((a, b) => b.cost - a.cost);

    return NextResponse.json({
      range: preset,
      kpis: {
        sessions: totalSessions,
        total_cost_usd: totalCost,
        total_cost_input_usd: totalCostInput,
        total_cost_output_usd: totalCostOutput,
        total_prompt_tokens: totalPromptTokens,
        total_completion_tokens: totalCompletionTokens,
        total_tokens: totalTokens,
        llm_calls: turns.length,
        unmatched_calls: unmatched,
        avg_cost_per_session: totalSessions > 0 ? totalCost / totalSessions : 0,
        avg_latency_ms: turns.length > 0 ? totalLatency / turns.length : 0,
      },
      top_sessions: topSessions,
      series,
      by_model: models,
      by_workflow: workflows,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upstream error' },
      { status: 502 }
    );
  }
}
