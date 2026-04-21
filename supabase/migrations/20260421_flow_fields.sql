-- ==============================================================
-- Mirador de Villarrica Chatbot — Flow conversacional (Fase 3)
-- ==============================================================
-- Campos para capturar el interes en parcela especifica, el pie
-- disponible declarado, las recomendaciones que el bot hizo, los
-- canales por los que se envio el resumen personalizado y el
-- timestamp del envio. Se usan por actualizar_datos_lead,
-- recomendar_parcelas y enviar_resumen_personalizado.

alter table leads
  add column if not exists pie_disponible text,
  add column if not exists parcela_interes text,
  add column if not exists parcelas_recomendadas text[],
  add column if not exists canales_envio text[],
  add column if not exists resumen_enviado_at timestamptz;

create index if not exists idx_leads_resumen_enviado on leads(resumen_enviado_at)
  where resumen_enviado_at is not null;

comment on column leads.pie_disponible is 'Monto declarado para el pie (credito). Texto libre tipo "8M" o "10000000".';
comment on column leads.parcela_interes is 'Numero de parcela que el lead menciono como de interes (ej 28, B5).';
comment on column leads.parcelas_recomendadas is 'Lista de numeros de parcela que el bot recomendo al lead.';
comment on column leads.canales_envio is 'Canales seleccionados para recibir el resumen: [email], [whatsapp], o ambos.';
comment on column leads.resumen_enviado_at is 'Timestamp del envio del resumen personalizado por la tool enviar_resumen_personalizado.';
