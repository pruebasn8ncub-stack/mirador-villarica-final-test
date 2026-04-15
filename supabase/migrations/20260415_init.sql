-- ==============================================================
-- Mirador de Villarrica Chatbot — schema inicial (Fase 1)
-- ==============================================================
-- Referencia: docs/superpowers/specs/2026-04-15-mirador-villarrica-chatbot-design.md §6
-- RLS deshabilitado en Fase 1. Acceso solo vía service_role desde n8n.

-- Sesiones de chat (una por apertura del widget)
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  closed_at timestamptz,
  user_agent text,
  referrer text,
  ip_hash text,
  project_slug text default 'mirador-villarrica',
  status text default 'active'
);

-- Historial de mensajes
create table if not exists messages (
  id bigserial primary key,
  session_id uuid references sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  tool_name text,
  tool_input jsonb,
  tool_output jsonb,
  tokens_in int,
  tokens_out int,
  created_at timestamptz default now()
);
create index if not exists idx_messages_session on messages(session_id, created_at);

-- Leads calificados (1 por sesión máx)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) unique,
  nombre text not null,
  whatsapp text,
  email text,
  intencion text,
  plazo text,
  presupuesto text,
  score text not null check (score in ('CALIENTE', 'TIBIO', 'FRIO')),
  resumen text,
  notified_diego bool default false,
  notified_at timestamptz,
  project_slug text default 'mirador-villarrica',
  created_at timestamptz default now()
);
create index if not exists idx_leads_score on leads(score, created_at desc);
create index if not exists idx_leads_notified on leads(notified_diego, score);

-- Auditoría de invocaciones de tools
create table if not exists tool_events (
  id bigserial primary key,
  session_id uuid references sessions(id) on delete cascade,
  tool_name text not null,
  input jsonb,
  output jsonb,
  status text check (status in ('ok', 'error', 'timeout')),
  error_message text,
  duration_ms int,
  created_at timestamptz default now()
);
create index if not exists idx_tool_events_session on tool_events(session_id, created_at desc);
create index if not exists idx_tool_events_tool on tool_events(tool_name, created_at desc);

-- RLS explícitamente deshabilitado en Fase 1
alter table sessions disable row level security;
alter table messages disable row level security;
alter table leads disable row level security;
alter table tool_events disable row level security;

comment on table sessions is 'Una fila por apertura de widget. Mirador Villarrica MVP Fase 1.';
comment on table messages is 'Mensajes de cada sesión (user/assistant/tool).';
comment on table leads is 'Leads calificados. Score CALIENTE/TIBIO notifica a Diego; FRIO queda registrado.';
comment on table tool_events is 'Auditoría de invocaciones a sub-workflows del AI Agent.';
