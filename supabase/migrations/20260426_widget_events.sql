-- ==============================================================
-- Mirador de Villarrica Chatbot — eventos del widget
-- ==============================================================
-- Telemetría liviana: clicks al launcher, aperturas del chat, etc.
-- RLS off, acceso vía service_role desde la API Next.

create table if not exists widget_events (
  id bigserial primary key,
  session_id uuid,
  event_type text not null check (event_type in (
    'launcher_clicked',
    'widget_opened',
    'widget_closed'
  )),
  user_agent text,
  referrer text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_widget_events_type_date
  on widget_events(event_type, created_at desc);

create index if not exists idx_widget_events_session
  on widget_events(session_id, created_at desc);

alter table widget_events disable row level security;

comment on table widget_events is 'Telemetría del widget (clicks, aperturas).';
