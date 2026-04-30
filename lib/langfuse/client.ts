// Cliente mínimo de Langfuse Public API para el panel admin.
// Filtramos siempre por trace name = "litellm-acompletion": son los traces emitidos
// por LiteLLM proxy (post-migración 2026-04-29). Otros traces históricos
// ("OpenRouter Request", "AgentExecutor") se ignoran porque no tienen el sessionId
// alineado al chat session_id o no traen costo.

export interface LangfuseConfig {
  host: string;
  publicKey: string;
  secretKey: string;
}

export interface LangfuseUsage {
  input?: number;
  output?: number;
  total?: number;
  unit?: string;
}

export interface LangfuseRequesterMetadata {
  agent?: string;
  workflow?: string;
  channel?: string;
  generation_name?: string;
  sessionId?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface LangfuseObservation {
  id: string;
  traceId: string;
  type: 'GENERATION' | 'SPAN' | 'EVENT';
  name: string | null;
  model: string | null;
  startTime: string;
  endTime: string | null;
  latency: number | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  usage?: LangfuseUsage | null;
  usageDetails?: Record<string, number> | null;
  costDetails?: Record<string, number> | null;
  inputPrice?: number | null;
  outputPrice?: number | null;
  totalPrice?: number | null;
  calculatedInputCost?: number | null;
  calculatedOutputCost?: number | null;
  calculatedTotalCost?: number | null;
  metadata?: { requester_metadata?: LangfuseRequesterMetadata } | null;
}

export interface LangfuseTrace {
  id: string;
  projectId: string;
  name: string | null;
  timestamp: string;
  userId: string | null;
  sessionId: string | null;
  tags: string[];
  metadata: Record<string, unknown> | null;
  totalCost?: number | null;
  latency?: number | null;
  observations?: LangfuseObservation[];
}

export interface LangfuseListResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export const LITELLM_TRACE_NAME = 'litellm-acompletion';

// Generation names a excluir del panel: corresponden a workflows o agentes
// retirados que dejaron observations residuales en Langfuse. Como la API pública
// de Langfuse no permite borrar observations individuales, los filtramos acá.
const EXCLUDED_OBSERVATION_NAMES = new Set<string>(['background-extractor-call']);

export function isExcludedObservation(obs: LangfuseObservation): boolean {
  if (obs.name && EXCLUDED_OBSERVATION_NAMES.has(obs.name)) return true;
  const reqMeta = obs.metadata?.requester_metadata;
  if (reqMeta?.workflow === 'mirador-background-lead-updater') return true;
  if (reqMeta?.agent === 'background-extractor') return true;
  return false;
}

export function getLangfuseConfig(): LangfuseConfig | null {
  const host = process.env.LANGFUSE_HOST || 'https://us.cloud.langfuse.com';
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  if (!publicKey || !secretKey) return null;
  return { host: host.replace(/\/+$/, ''), publicKey, secretKey };
}

function authHeader(config: LangfuseConfig): string {
  const raw = `${config.publicKey}:${config.secretKey}`;
  const b64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(raw).toString('base64')
      : btoa(raw);
  return `Basic ${b64}`;
}

export async function langfuseGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  config = getLangfuseConfig()
): Promise<T> {
  if (!config) throw new Error('Langfuse not configured');
  const url = new URL(config.host + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: authHeader(config),
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Langfuse ${path} ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

// Itera todas las páginas de un endpoint paginado hasta vaciarlo o cortar por hardLimit.
export async function langfuseList<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  hardLimit = 5000,
  config = getLangfuseConfig()
): Promise<T[]> {
  const limit = Number(params.limit ?? 100);
  const out: T[] = [];
  let page = 1;
  while (out.length < hardLimit) {
    const res = await langfuseGet<LangfuseListResponse<T>>(
      path,
      { ...params, limit, page },
      config
    );
    out.push(...res.data);
    if (res.data.length < limit) break;
    if (page >= res.meta.totalPages) break;
    page += 1;
  }
  return out;
}

// Devuelve un trace completo con sus observations (incluye usage + costo).
export async function getTraceWithObservations(
  traceId: string,
  config = getLangfuseConfig()
): Promise<LangfuseTrace | null> {
  try {
    return await langfuseGet<LangfuseTrace>(`/api/public/traces/${traceId}`, {}, config);
  } catch (err) {
    if (err instanceof Error && /\b404\b/.test(err.message)) return null;
    throw err;
  }
}

// ------------- Helpers de mapping y agregación -------------

export interface TurnRecord {
  observation_id: string;
  trace_id: string;
  workflow: string;
  agent: string | null;
  generation_name: string | null;
  model: string | null;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
  cost_input_usd: number;
  cost_output_usd: number;
  input_price: number | null;
  output_price: number | null;
  duration_ms: number | null;
  started_at: string;
  ended_at: string | null;
  matched: boolean;
}

export interface CostTotals {
  cost_usd: number;
  cost_input_usd: number;
  cost_output_usd: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  llm_calls: number;
  latency_total_ms: number;
  models_used: string[];
  workflows: string[];
  avg_cost_per_call: number;
}

const num = (v: number | null | undefined): number =>
  v == null || !Number.isFinite(v) ? 0 : Number(v);

export function observationToTurn(obs: LangfuseObservation): TurnRecord {
  const reqMeta = obs.metadata?.requester_metadata ?? {};
  const promptTokens = num(obs.usage?.input ?? obs.promptTokens);
  const completionTokens = num(obs.usage?.output ?? obs.completionTokens);
  const totalTokens =
    num(obs.usage?.total ?? obs.totalTokens) ||
    promptTokens + completionTokens;
  let inputCost = num(obs.calculatedInputCost ?? obs.costDetails?.input);
  let outputCost = num(obs.calculatedOutputCost ?? obs.costDetails?.output);
  const totalCost =
    num(obs.calculatedTotalCost ?? obs.costDetails?.total) ||
    inputCost + outputCost;
  // OpenRouter reporta total exacto pero no el split. Aproximamos con un peso
  // heurístico (output 4x el costo de input por token) cuando no viene desglosado.
  if (totalCost > 0 && inputCost === 0 && outputCost === 0 && totalTokens > 0) {
    const weightedTotal = promptTokens + completionTokens * 4;
    if (weightedTotal > 0) {
      inputCost = totalCost * (promptTokens / weightedTotal);
      outputCost = totalCost * ((completionTokens * 4) / weightedTotal);
    }
  }
  return {
    observation_id: obs.id,
    trace_id: obs.traceId,
    workflow: String(reqMeta.workflow ?? 'unknown'),
    agent: reqMeta.agent ? String(reqMeta.agent) : null,
    generation_name: obs.name,
    model: obs.model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens,
    cost_usd: totalCost,
    cost_input_usd: inputCost,
    cost_output_usd: outputCost,
    input_price: obs.inputPrice ?? null,
    output_price: obs.outputPrice ?? null,
    // Langfuse reporta latency en segundos; el panel usa milisegundos.
    duration_ms: obs.latency != null ? Math.round(obs.latency * 1000) : null,
    started_at: obs.startTime,
    ended_at: obs.endTime,
    matched: totalCost > 0,
  };
}

export function totalsFromTurns(turns: TurnRecord[]): CostTotals {
  const cost_usd = turns.reduce((s, t) => s + t.cost_usd, 0);
  const cost_input_usd = turns.reduce((s, t) => s + t.cost_input_usd, 0);
  const cost_output_usd = turns.reduce((s, t) => s + t.cost_output_usd, 0);
  const prompt_tokens = turns.reduce((s, t) => s + t.prompt_tokens, 0);
  const completion_tokens = turns.reduce((s, t) => s + t.completion_tokens, 0);
  const total_tokens = turns.reduce((s, t) => s + t.total_tokens, 0);
  const latency_total_ms = turns.reduce((s, t) => s + (t.duration_ms ?? 0), 0);
  const models_used = Array.from(
    new Set(turns.map((t) => t.model).filter(Boolean) as string[])
  );
  const workflows = Array.from(new Set(turns.map((t) => t.workflow)));
  return {
    cost_usd,
    cost_input_usd,
    cost_output_usd,
    prompt_tokens,
    completion_tokens,
    total_tokens,
    llm_calls: turns.length,
    latency_total_ms,
    models_used,
    workflows,
    avg_cost_per_call: turns.length > 0 ? cost_usd / turns.length : 0,
  };
}
