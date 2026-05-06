-- ============================================================================
-- Cost Tracking v2 — Matching exacto via OpenRouter generation_id
-- ============================================================================
-- Reemplaza el matching probabilístico (model + ventana ±5s) por un JOIN
-- determinístico vía generation_id (que en OpenRouter Broadcast aparece como
-- span_id en el OTLP).
--
-- Aplicar en Supabase Studio → SQL Editor → ejecutar todo el script.
-- Idempotente: se puede ejecutar varias veces sin efectos secundarios.
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Tabla nueva: mapeo request → execution n8n → generation_id OpenRouter
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mirador_request_map (
  id                BIGSERIAL PRIMARY KEY,
  request_id        UUID         NOT NULL UNIQUE,
  session_id        UUID         NOT NULL,
  execution_id      TEXT         NOT NULL,
  workflow          TEXT         NOT NULL,
  node_name         TEXT,
  generation_id     TEXT,                    -- X-Generation-Id que retorna OpenRouter
  model_requested   TEXT,
  user_field        TEXT         NOT NULL,   -- "session_id::execution_id::request_id"
  proxy_started_at  TIMESTAMPTZ  NOT NULL,
  proxy_ended_at    TIMESTAMPTZ,
  upstream_status   SMALLINT,
  upstream_error    TEXT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_map_session     ON mirador_request_map(session_id);
CREATE INDEX IF NOT EXISTS idx_request_map_execution   ON mirador_request_map(execution_id);
CREATE INDEX IF NOT EXISTS idx_request_map_gen         ON mirador_request_map(generation_id);
CREATE INDEX IF NOT EXISTS idx_request_map_user_field  ON mirador_request_map(user_field);
CREATE INDEX IF NOT EXISTS idx_request_map_started_at  ON mirador_request_map(proxy_started_at DESC);

COMMENT ON TABLE mirador_request_map IS
  'Cada llamada al LLM crea una fila acá: enlaza session+execution n8n con generation_id de OpenRouter';

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Agregar user_field a traces (fallback si X-Generation-Id falla)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE mirador_openrouter_traces
  ADD COLUMN IF NOT EXISTS user_field TEXT;

CREATE INDEX IF NOT EXISTS idx_traces_user_field
  ON mirador_openrouter_traces(user_field);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Reemplazar vistas: matching exacto via generation_id ↔ span_id
-- ────────────────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS mirador_session_totals CASCADE;
DROP VIEW IF EXISTS mirador_session_costs  CASCADE;

CREATE VIEW mirador_session_costs AS
SELECT
  rm.id                AS request_map_id,
  rm.session_id,
  rm.execution_id,
  rm.workflow,
  rm.node_name,
  rm.model_requested   AS model_declared,
  t.model              AS model_real,
  t.provider,
  t.prompt_tokens,
  t.completion_tokens,
  t.total_tokens,
  t.cached_tokens,
  t.cache_write_tokens,
  t.reasoning_tokens,
  t.cost_usd,
  t.cost_input_usd,
  t.cost_output_usd,
  t.price_per_input_token,
  t.price_per_output_token,
  t.upstream_cost_usd,
  COALESCE(
    EXTRACT(EPOCH FROM (rm.proxy_ended_at - rm.proxy_started_at)) * 1000,
    0
  )::INT               AS proxy_duration_ms,
  rm.proxy_started_at  AS exec_started_at,
  rm.proxy_ended_at    AS exec_ended_at,
  t.started_at         AS gen_started_at,
  t.ended_at           AS gen_ended_at,
  t.span_id,
  t.trace_id,
  rm.user_field,
  rm.upstream_status,
  rm.upstream_error
FROM mirador_request_map rm
LEFT JOIN mirador_openrouter_traces t
  ON  t.span_id    = rm.generation_id   -- ✨ JOIN exacto primario
  OR  t.user_field = rm.user_field;     -- fallback si no se capturó X-Generation-Id

CREATE VIEW mirador_session_totals AS
SELECT
  session_id,
  COUNT(DISTINCT request_map_id)                                            AS turns,
  COUNT(*) FILTER (WHERE span_id IS NOT NULL)                               AS llm_calls_matched,
  COUNT(*) FILTER (WHERE span_id IS NULL)                                   AS unmatched,
  SUM(prompt_tokens)                                                        AS total_prompt_tokens,
  SUM(completion_tokens)                                                    AS total_completion_tokens,
  SUM(total_tokens)                                                         AS total_tokens,
  SUM(cached_tokens)                                                        AS total_cached_tokens,
  SUM(cost_input_usd)                                                       AS total_cost_input_usd,
  SUM(cost_output_usd)                                                      AS total_cost_output_usd,
  SUM(cost_usd)                                                             AS total_cost_usd,
  array_agg(DISTINCT model_real) FILTER (WHERE model_real IS NOT NULL)      AS models_used,
  array_agg(DISTINCT workflow)                                              AS workflows_involved,
  MIN(exec_started_at)                                                      AS first_call_at,
  MAX(exec_ended_at)                                                        AS last_call_at
FROM mirador_session_costs
GROUP BY session_id;

COMMENT ON VIEW mirador_session_costs  IS 'v2: JOIN exacto request_map.generation_id ↔ traces.span_id';
COMMENT ON VIEW mirador_session_totals IS 'v2: agregación por session_id sobre el matching exacto';

COMMIT;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Verificación post-deploy
-- ────────────────────────────────────────────────────────────────────────────
SELECT 'request_map'    AS object, COUNT(*) AS rows FROM mirador_request_map
UNION ALL
SELECT 'traces',           COUNT(*) FROM mirador_openrouter_traces
UNION ALL
SELECT 'session_costs',    COUNT(*) FROM mirador_session_costs
UNION ALL
SELECT 'session_totals',   COUNT(*) FROM mirador_session_totals;

SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'mirador_openrouter_traces' AND column_name = 'user_field';
