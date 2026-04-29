import { NextResponse } from 'next/server';
import { getSupabaseConfig, supabaseSelect } from '@/lib/chat/supabase';
import { isAuthed } from '@/lib/feedback/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SessionTotalsRow {
  session_id: string;
  turns: number | null;
  llm_calls_matched: number | null;
  unmatched: number | null;
  total_prompt_tokens: number | null;
  total_completion_tokens: number | null;
  total_tokens: number | null;
  total_cached_tokens: number | null;
  total_cost_usd: number | string | null;
  models_used: string[] | null;
  workflows_involved: string[] | null;
  first_call_at: string | null;
  last_call_at: string | null;
}

interface SessionCostsRow {
  execution_row_id: number;
  session_id: string;
  message_id: number | null;
  workflow: string;
  execution_id: string | null;
  model_declared: string;
  model_real: string | null;
  provider: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  cached_tokens: number | null;
  cache_write_tokens: number | null;
  reasoning_tokens: number | null;
  cost_usd: number | string | null;
  cost_input_usd: number | string | null;
  cost_output_usd: number | string | null;
  price_per_input_token: number | string | null;
  price_per_output_token: number | string | null;
  upstream_cost_usd: number | string | null;
  duration_ms: number | null;
  exec_started_at: string;
  exec_ended_at: string;
  gen_started_at: string | null;
  gen_ended_at: string | null;
  span_id: string | null;
  trace_id: string | null;
}

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

function num(v: number | string | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
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
  const sessionId = url.searchParams.get('session_id');

  // ─── Modo detalle: ?session_id=X ─────────────────────────────
  if (sessionId) {
    if (!UUID_RE.test(sessionId)) {
      return NextResponse.json({ error: 'session_id inválido' }, { status: 400 });
    }
    try {
      const [costs, totals] = await Promise.all([
        supabaseSelect<SessionCostsRow>(
          'mirador_session_costs',
          {
            query: `select=*&session_id=eq.${sessionId}&order=exec_started_at.asc&limit=500`,
          },
          config
        ),
        supabaseSelect<SessionTotalsRow>(
          'mirador_session_totals',
          { query: `select=*&session_id=eq.${sessionId}&limit=1` },
          config
        ),
      ]);

      const turns = costs.rows.map((r) => ({
        execution_id: r.execution_id,
        workflow: r.workflow,
        model: r.model_real || r.model_declared,
        provider: r.provider,
        prompt_tokens: num(r.prompt_tokens),
        completion_tokens: num(r.completion_tokens),
        total_tokens: num(r.total_tokens),
        cached_tokens: num(r.cached_tokens),
        reasoning_tokens: num(r.reasoning_tokens),
        cost_usd: num(r.cost_usd),
        cost_input_usd: num(r.cost_input_usd),
        cost_output_usd: num(r.cost_output_usd),
        price_per_input_token: num(r.price_per_input_token),
        price_per_output_token: num(r.price_per_output_token),
        duration_ms: r.duration_ms,
        started_at: r.exec_started_at,
        matched: r.span_id !== null,
      }));

      return NextResponse.json({
        session_id: sessionId,
        totals: totals.rows[0] || null,
        turns,
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
  const sinceFilter = since ? `&first_call_at=gte.${since.toISOString()}` : '';

  try {
    const [totals, costs] = await Promise.all([
      supabaseSelect<SessionTotalsRow>(
        'mirador_session_totals',
        {
          query: `select=*&order=total_cost_usd.desc.nullslast&limit=2000${sinceFilter}`,
          exactCount: true,
        },
        config
      ),
      // Para series temporal: agregamos por día desde mirador_session_costs
      supabaseSelect<{ exec_started_at: string; cost_usd: number | string | null; cost_input_usd: number | string | null; cost_output_usd: number | string | null; prompt_tokens: number | null; completion_tokens: number | null; total_tokens: number | null; model_real: string | null; workflow: string }>(
        'mirador_session_costs',
        {
          query: `select=exec_started_at,cost_usd,cost_input_usd,cost_output_usd,prompt_tokens,completion_tokens,total_tokens,model_real,workflow${
            since ? `&exec_started_at=gte.${since.toISOString()}` : ''
          }&limit=20000`,
        },
        config
      ),
    ]);

    // KPIs globales
    const totalSessions = totals.rows.length;
    const totalCost = totals.rows.reduce((acc, r) => acc + num(r.total_cost_usd), 0);
    const totalCostInput = costs.rows.reduce((acc, r) => acc + num(r.cost_input_usd), 0);
    const totalCostOutput = costs.rows.reduce((acc, r) => acc + num(r.cost_output_usd), 0);
    const totalPromptTokens = costs.rows.reduce((acc, r) => acc + num(r.prompt_tokens), 0);
    const totalCompletionTokens = costs.rows.reduce((acc, r) => acc + num(r.completion_tokens), 0);
    const totalTokens = totals.rows.reduce((acc, r) => acc + num(r.total_tokens), 0);
    const totalLlmCalls = totals.rows.reduce(
      (acc, r) => acc + num(r.llm_calls_matched),
      0
    );
    const unmatched = totals.rows.reduce((acc, r) => acc + num(r.unmatched), 0);

    // Top sesiones por costo
    const topSessions = totals.rows.slice(0, 50).map((r) => ({
      session_id: r.session_id,
      total_cost_usd: num(r.total_cost_usd),
      total_tokens: num(r.total_tokens),
      turns: num(r.turns),
      llm_calls_matched: num(r.llm_calls_matched),
      unmatched: num(r.unmatched),
      models_used: r.models_used || [],
      first_call_at: r.first_call_at,
      last_call_at: r.last_call_at,
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
    costs.rows.forEach((r) => {
      const k = (r.exec_started_at || '').slice(0, 10);
      if (buckets[k]) {
        buckets[k].cost += num(r.cost_usd);
        buckets[k].tokens += num(r.total_tokens);
        buckets[k].calls += 1;
      }
    });
    const series = Object.entries(buckets).map(([date, v]) => ({ date, ...v }));

    // Breakdown por modelo (con desglose input/output)
    type Bucket = { cost: number; cost_input: number; cost_output: number; prompt_tokens: number; completion_tokens: number; tokens: number; calls: number };
    const byModel: Record<string, Bucket> = {};
    costs.rows.forEach((r) => {
      const m = r.model_real || 'desconocido';
      if (!byModel[m]) byModel[m] = { cost: 0, cost_input: 0, cost_output: 0, prompt_tokens: 0, completion_tokens: 0, tokens: 0, calls: 0 };
      byModel[m].cost += num(r.cost_usd);
      byModel[m].cost_input += num(r.cost_input_usd);
      byModel[m].cost_output += num(r.cost_output_usd);
      byModel[m].prompt_tokens += num(r.prompt_tokens);
      byModel[m].completion_tokens += num(r.completion_tokens);
      byModel[m].tokens += num(r.total_tokens);
      byModel[m].calls += 1;
    });
    const models = Object.entries(byModel)
      .map(([model, v]) => ({ model, ...v }))
      .sort((a, b) => b.cost - a.cost);

    // Breakdown por workflow
    const byWorkflow: Record<string, Bucket> = {};
    costs.rows.forEach((r) => {
      const w = r.workflow || 'desconocido';
      if (!byWorkflow[w]) byWorkflow[w] = { cost: 0, cost_input: 0, cost_output: 0, prompt_tokens: 0, completion_tokens: 0, tokens: 0, calls: 0 };
      byWorkflow[w].cost += num(r.cost_usd);
      byWorkflow[w].cost_input += num(r.cost_input_usd);
      byWorkflow[w].cost_output += num(r.cost_output_usd);
      byWorkflow[w].prompt_tokens += num(r.prompt_tokens);
      byWorkflow[w].completion_tokens += num(r.completion_tokens);
      byWorkflow[w].tokens += num(r.total_tokens);
      byWorkflow[w].calls += 1;
    });
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
        llm_calls: totalLlmCalls,
        unmatched_calls: unmatched,
        avg_cost_per_session: totalSessions > 0 ? totalCost / totalSessions : 0,
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
