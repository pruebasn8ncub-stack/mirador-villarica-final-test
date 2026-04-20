-- ==============================================================
-- Mirador de Villarrica Chatbot — BANT+ Lead Scoring (Fase 2)
-- ==============================================================
-- Referencia: /home/hugo/.claude/plans/analizemos-el-flujo-que-zany-aurora.md
--
-- Objetivo: expandir la tabla `leads` con señales BANT+ y score numérico
-- granular (0-100) para permitir filtrado fino de leads antes del broker.
--
-- score_numeric es la fuente de verdad (0-100).
-- score text (CALIENTE/TIBIO/FRIO) queda como etiqueta derivada por umbrales.
-- Se mantiene el CHECK original de score text (sin cambios).
--
-- score_history acumula cada acción (gate_submit, partial_update, final_score,
-- broker_requested) en orden cronológico para auditoría y análisis.

alter table leads
  add column if not exists score_numeric int check (score_numeric between 0 and 100),
  add column if not exists forma_pago text check (forma_pago in (
    'contado','credito','subsidio','mixto','no_definido'
  )),
  add column if not exists pre_aprobacion bool,
  add column if not exists decisor text check (decisor in (
    'solo','pareja','familia','no_definido'
  )),
  add column if not exists uso text check (uso in (
    'vivienda','segunda','inversion','no_definido'
  )),
  add column if not exists rango_presupuesto text check (rango_presupuesto in (
    '<20M','20-40M','40-60M','>60M','no_definido'
  )),
  add column if not exists score_history jsonb not null default '[]'::jsonb,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists broker_requested_at timestamptz,
  add column if not exists broker_request_reason text check (broker_request_reason in (
    'lead_solicito','bot_no_pudo_resolver','score_alto_proactivo'
  )),
  add column if not exists last_notified_score text check (last_notified_score in (
    'CALIENTE','TIBIO','FRIO'
  ));

-- Índices para consultas frecuentes
create index if not exists idx_leads_score_numeric on leads(score_numeric desc, updated_at desc);
create index if not exists idx_leads_broker_requested on leads(broker_requested_at)
  where broker_requested_at is not null;
create index if not exists idx_leads_updated_at on leads(updated_at desc);

-- Trigger para mantener updated_at en cada UPDATE
create or replace function set_leads_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_leads_updated_at on leads;
create trigger trg_leads_updated_at
  before update on leads
  for each row execute function set_leads_updated_at();

comment on column leads.score_numeric is 'Score BANT+ 0-100. Fuente de verdad. Score text se deriva por umbrales (>=70 CALIENTE, 40-69 TIBIO, <40 FRIO).';
comment on column leads.score_history is 'Array JSONB de eventos. Cada item: { at, action, ...payload }. Acciones: gate_submit, partial_update, final_score, broker_requested.';
comment on column leads.broker_requested_at is 'Timestamp de cuando el lead pidió (o se gatilló) handoff a broker humano.';
comment on column leads.broker_request_reason is 'Motivo del handoff: lead_solicito | bot_no_pudo_resolver | score_alto_proactivo.';
comment on column leads.last_notified_score is 'Último score con el que se notificó al broker. Usar para decidir si re-notificar en upgrades.';
