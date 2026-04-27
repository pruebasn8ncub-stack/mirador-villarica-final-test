'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Loader2,
  Mail,
  Phone,
  Hash,
  Flame,
  Thermometer,
  Snowflake,
  Calendar,
  X,
  ExternalLink,
  Download,
  CheckCircle2,
  PhoneCall,
  MessageSquareText,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatExact,
  formatRelative,
  initials,
  scoreColor,
  shortSession,
} from '../_lib/format';

interface Lead {
  id: string;
  session_id: string;
  nombre: string;
  whatsapp: string | null;
  email: string | null;
  intencion: string | null;
  plazo: string | null;
  presupuesto: string | null;
  score: 'CALIENTE' | 'TIBIO' | 'FRIO';
  score_numeric: number | null;
  resumen: string | null;
  parcela_interes: string | null;
  parcelas_recomendadas: string[] | null;
  forma_pago: string | null;
  pie_disponible: string | null;
  decisor: string | null;
  uso: string | null;
  rango_presupuesto: string | null;
  pre_aprobacion: boolean | null;
  canales_envio: string[] | null;
  resumen_enviado_at: string | null;
  broker_requested_at: string | null;
  broker_request_reason: string | null;
  notified_diego: boolean | null;
  notified_at: string | null;
  created_at: string;
  updated_at: string | null;
}

interface LeadsResponse {
  items: Lead[];
  total: number | null;
}

const fetcher = async (url: string): Promise<LeadsResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

type ScoreFilter = 'all' | 'CALIENTE' | 'TIBIO' | 'FRIO';

function ScoreBadge({ score }: { score: Lead['score'] }) {
  const c = scoreColor(score);
  const Icon =
    score === 'CALIENTE' ? Flame : score === 'TIBIO' ? Thermometer : Snowflake;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ring-1',
        c.bg,
        c.text,
        c.ring
      )}
    >
      <Icon className="h-3 w-3" />
      {score}
    </span>
  );
}

function downloadCsv(items: Lead[]) {
  const headers = [
    'fecha',
    'nombre',
    'whatsapp',
    'email',
    'score',
    'score_numeric',
    'parcela_interes',
    'forma_pago',
    'plazo',
    'rango_presupuesto',
    'broker_requested_at',
    'session_id',
    'resumen',
  ];
  const escape = (s: unknown) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const rows = items.map((l) =>
    [
      formatExact(l.created_at),
      l.nombre,
      l.whatsapp,
      l.email,
      l.score,
      l.score_numeric,
      l.parcela_interes,
      l.forma_pago,
      l.plazo,
      l.rango_presupuesto,
      l.broker_requested_at ? formatExact(l.broker_requested_at) : '',
      l.session_id,
      l.resumen,
    ]
      .map(escape)
      .join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function LeadsClient() {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [score, setScore] = useState<ScoreFilter>('all');
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => window.clearTimeout(t);
  }, [q]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', '200');
    if (debouncedQ) params.set('q', debouncedQ);
    if (score !== 'all') params.set('score', score);
    return params.toString();
  }, [debouncedQ, score]);

  const { data, error, isLoading } = useSWR<LeadsResponse>(
    `/api/dashboard/leads?${queryString}`,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-display text-bosque-900 md:text-4xl">
            Leads
          </h1>
          <p className="mt-1 text-sm text-bosque-700">
            Personas que pasaron el gate del chat. Click en una fila para ver
            todos los datos capturados durante la conversación.
          </p>
        </div>
        <button
          onClick={() => data?.items && downloadCsv(data.items)}
          disabled={!data?.items.length}
          className="flex items-center gap-1.5 rounded-lg border border-bosque-200 bg-white px-3 py-2 text-xs font-medium text-bosque-700 transition-colors hover:bg-bosque-50 disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar CSV
        </button>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-card ring-1 ring-bosque-100">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bosque-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, email, WhatsApp o resumen…"
            className="w-full rounded-lg border border-bosque-200 bg-bosque-50/50 py-2 pl-9 pr-3 text-sm text-bosque-900 placeholder:text-bosque-400 focus:border-bosque-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-bosque-200"
          />
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-bosque-200 bg-bosque-50/50 p-0.5">
          {(['all', 'CALIENTE', 'TIBIO', 'FRIO'] as ScoreFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setScore(s)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors',
                score === s
                  ? 'bg-bosque-800 text-crema'
                  : 'text-bosque-700 hover:bg-bosque-100'
              )}
            >
              {s === 'all' ? 'Todos' : s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error: {String(error.message ?? error)}
        </div>
      )}

      {isLoading && !data && (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-6 w-6 animate-spin text-bosque-400" />
        </div>
      )}

      {data && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-bosque-100">
          <div className="flex items-center justify-between border-b border-bosque-100 px-4 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-bosque-700">
              {data.items.length} {data.items.length === 1 ? 'lead' : 'leads'}
              {data.total && data.total !== data.items.length
                ? ` · ${data.total} total`
                : ''}
            </span>
          </div>
          {data.items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-bosque-900">
                Sin resultados
              </p>
              <p className="mt-1 text-xs text-bosque-600">
                Probá ajustar los filtros o esperar a que más personas pasen el
                gate.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-bosque-100">
              {data.items.map((lead) => (
                <li key={lead.id}>
                  <button
                    onClick={() => setSelected(lead)}
                    className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bosque-50/60"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bosque-100 text-[12px] font-semibold text-bosque-700">
                      {initials(lead.nombre)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-semibold text-bosque-900">
                          {lead.nombre}
                        </span>
                        <ScoreBadge score={lead.score} />
                        {lead.parcela_interes && (
                          <span className="rounded-full bg-mostaza/10 px-2 py-0.5 text-[10px] font-semibold text-bosque-800">
                            Parcela {lead.parcela_interes}
                          </span>
                        )}
                        {lead.broker_requested_at && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 ring-1 ring-red-200">
                            <PhoneCall className="h-2.5 w-2.5" />
                            Pidió broker
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-bosque-600">
                        {lead.whatsapp && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.whatsapp}
                          </span>
                        )}
                        {lead.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </span>
                        )}
                        {lead.forma_pago && lead.forma_pago !== 'no_definido' && (
                          <span className="text-bosque-500">
                            · {lead.forma_pago}
                          </span>
                        )}
                        {lead.plazo && lead.plazo !== 'no_definido' && (
                          <span className="text-bosque-500">
                            · plazo {lead.plazo.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10.5px] tabular-nums text-bosque-500">
                        {formatRelative(lead.created_at)}
                      </div>
                      {lead.score_numeric !== null && (
                        <div className="mt-0.5 font-mono text-[11px] font-semibold text-bosque-700">
                          {lead.score_numeric}/100
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <LeadDetailDrawer
            lead={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LeadDetailDrawer({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex justify-end"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar detalle"
        className="absolute inset-0 h-full w-full cursor-default bg-bosque-900/45 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-bosque-100 px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-display text-xl font-medium text-bosque-900">
                {lead.nombre}
              </h2>
              <ScoreBadge score={lead.score} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-bosque-600">
              <span className="flex items-center gap-1 font-mono">
                <Hash className="h-3 w-3" />
                {shortSession(lead.session_id)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatExact(lead.created_at)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-bosque-600 transition-colors hover:bg-bosque-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Contacto */}
          <Section title="Contacto">
            <Field label="WhatsApp" icon={Phone}>
              {lead.whatsapp ? (
                <a
                  href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bosque-800 underline-offset-2 hover:underline"
                >
                  {lead.whatsapp}
                </a>
              ) : (
                <Empty />
              )}
            </Field>
            <Field label="Email" icon={Mail}>
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="break-all text-bosque-800 underline-offset-2 hover:underline"
                >
                  {lead.email}
                </a>
              ) : (
                <Empty />
              )}
            </Field>
          </Section>

          {/* Calificación BANT+ */}
          <Section title="Calificación BANT+">
            <Field label="Score numérico">
              {lead.score_numeric !== null ? (
                <span className="font-mono text-base font-semibold">
                  {lead.score_numeric}/100
                </span>
              ) : (
                <Empty />
              )}
            </Field>
            <Field label="Forma de pago">
              {lead.forma_pago && lead.forma_pago !== 'no_definido' ? (
                lead.forma_pago
              ) : (
                <Empty />
              )}
            </Field>
            <Field label="Pie disponible">
              {lead.pie_disponible || <Empty />}
            </Field>
            <Field label="Plazo">
              {lead.plazo && lead.plazo !== 'no_definido' ? (
                lead.plazo.replace(/_/g, ' ')
              ) : (
                <Empty />
              )}
            </Field>
            <Field label="Rango presupuesto">
              {lead.rango_presupuesto && lead.rango_presupuesto !== 'no_definido' ? (
                lead.rango_presupuesto
              ) : (
                <Empty />
              )}
            </Field>
            <Field label="Presupuesto (texto)">
              {lead.presupuesto || <Empty />}
            </Field>
            <Field label="Decisor">
              {lead.decisor && lead.decisor !== 'no_definido' ? (
                lead.decisor
              ) : (
                <Empty />
              )}
            </Field>
            <Field label="Uso">
              {lead.uso && lead.uso !== 'no_definido' ? lead.uso : <Empty />}
            </Field>
            <Field label="Pre-aprobación bancaria">
              {lead.pre_aprobacion === null ? (
                <Empty />
              ) : lead.pre_aprobacion ? (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Sí
                </span>
              ) : (
                'No'
              )}
            </Field>
            <Field label="Intención">{lead.intencion || <Empty />}</Field>
          </Section>

          {/* Interés */}
          <Section title="Interés en parcelas">
            <Field label="Parcela de interés">
              {lead.parcela_interes ? (
                <span className="rounded-full bg-mostaza/10 px-2 py-0.5 font-semibold text-bosque-800">
                  {lead.parcela_interes}
                </span>
              ) : (
                <Empty />
              )}
            </Field>
            <Field label="Recomendadas por el bot">
              {lead.parcelas_recomendadas?.length ? (
                <div className="flex flex-wrap gap-1">
                  {lead.parcelas_recomendadas.map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-bosque-100 px-2 py-0.5 text-[11px] font-medium text-bosque-800"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <Empty />
              )}
            </Field>
          </Section>

          {/* Resumen IA */}
          {lead.resumen && (
            <Section title="Resumen del bot">
              <p className="whitespace-pre-wrap rounded-lg bg-bosque-50/60 px-3 py-2 text-[12.5px] leading-relaxed text-bosque-800 ring-1 ring-bosque-100">
                {lead.resumen}
              </p>
            </Section>
          )}

          {/* Eventos */}
          <Section title="Eventos">
            <Field label="Resumen enviado" icon={Send}>
              {lead.resumen_enviado_at ? (
                <span>
                  {formatExact(lead.resumen_enviado_at)}{' '}
                  {lead.canales_envio?.length && (
                    <span className="text-bosque-500">
                      · vía {lead.canales_envio.join(' + ')}
                    </span>
                  )}
                </span>
              ) : (
                <Empty />
              )}
            </Field>
            <Field label="Pidió broker" icon={PhoneCall}>
              {lead.broker_requested_at ? (
                <span>
                  {formatExact(lead.broker_requested_at)}{' '}
                  {lead.broker_request_reason && (
                    <span className="text-bosque-500">
                      · {lead.broker_request_reason}
                    </span>
                  )}
                </span>
              ) : (
                <Empty />
              )}
            </Field>
            <Field label="Notificado a Diego">
              {lead.notified_diego && lead.notified_at
                ? formatExact(lead.notified_at)
                : lead.notified_diego
                  ? 'Sí'
                  : 'No'}
            </Field>
          </Section>
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-bosque-100 bg-white px-5 py-3">
          <Link
            href={`/panel/conversaciones?session=${lead.session_id}`}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-launcher px-3 py-2 text-xs font-semibold text-crema transition-all hover:shadow-md"
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            Ver conversación
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Link>
          <Link
            href={`/panel/anotaciones?session=${lead.session_id}`}
            className="text-[11px] text-bosque-700 underline-offset-2 hover:underline"
          >
            Ver anotaciones de esta sesión
          </Link>
        </footer>
      </motion.aside>
    </motion.div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-bosque-100 px-5 py-4">
      <h3 className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-bosque-700">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-3 text-[12.5px]">
      <span className="flex items-center gap-1.5 pt-0.5 text-bosque-600">
        {Icon && <Icon className="h-3 w-3 text-bosque-400" />}
        {label}
      </span>
      <span className="text-bosque-900">{children}</span>
    </div>
  );
}

function Empty() {
  return <span className="text-bosque-400">—</span>;
}
