-- ==============================================================
-- Mirador de Villarrica Chatbot — feedback de vendedores
-- ==============================================================
-- Anotaciones del equipo de ventas sobre conversaciones del bot durante
-- la fase de depuración. Snapshot completo de la conversación + nota libre.
-- RLS deshabilitado. Acceso solo vía service_role desde la API.

create table if not exists chat_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  reviewer_name text not null,
  annotation text not null,
  messages jsonb not null,
  user_agent text,
  referrer text,
  created_at timestamptz default now()
);

create index if not exists idx_chat_feedback_session
  on chat_feedback(session_id, created_at desc);

create index if not exists idx_chat_feedback_reviewer
  on chat_feedback(reviewer_name, created_at desc);
