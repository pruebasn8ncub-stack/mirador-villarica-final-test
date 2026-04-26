'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Calendar,
  User,
  LogOut,
  Download,
  X,
  Copy,
  Check,
  MessageSquareText,
  Users,
  Layers,
  Clock,
  Hash,
  ChevronRight,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SerializedMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  attachment_types?: string[];
}

interface FeedbackItem {
  id: string;
  session_id: string;
  reviewer_name: string;
  annotation: string;
  messages: SerializedMessage[];
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
}

interface FeedbackResponse {
  items: FeedbackItem[];
  total: number | null;
  reviewers?: string[];
  sessions_count?: number | null;
}

const fetcher = async (url: string): Promise<FeedbackResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

type DatePreset = 'all' | 'today' | '7d' | '30d';

function presetToFrom(preset: DatePreset): string | null {
  if (preset === 'all') return null;
  const now = new Date();
  if (preset === 'today') {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  const days = preset === '7d' ? 7 : 30;
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `hace ${days} d`;
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

function formatExact(iso: string): string {
  return new Date(iso).toLocaleString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortSession(uuid: string): string {
  return uuid.slice(0, 8);
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function downloadCsv(items: FeedbackItem[]) {
  const headers = ['fecha', 'reviewer', 'session_id', 'anotacion'];
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = items.map((it) =>
    [
      formatExact(it.created_at),
      it.reviewer_name,
      it.session_id,
      it.annotation,
    ]
      .map((v) => escape(String(v)))
      .join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `anotaciones-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AnnotationsClient() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [sessionFilter, setSessionFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Deep link inicial
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session');
    if (sid) setSessionFilter(sid);
  }, []);

  // Debounce búsqueda
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => window.clearTimeout(t);
  }, [q]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', '100');
    params.set('stats', '1');
    if (debouncedQ) params.set('q', debouncedQ);
    if (reviewer) params.set('reviewer', reviewer);
    if (sessionFilter) params.set('session_id', sessionFilter);
    const from = presetToFrom(datePreset);
    if (from) params.set('from', from);
    return params.toString();
  }, [debouncedQ, reviewer, sessionFilter, datePreset]);

  const { data, error, isLoading, mutate } = useSWR<FeedbackResponse>(
    `/api/feedback?${queryString}`,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  // Auto-seleccionar primera al cargar
  useEffect(() => {
    if (!data?.items.length) return;
    if (!selectedId || !data.items.find((i) => i.id === selectedId)) {
      setSelectedId(data.items[0].id);
    }
  }, [data, selectedId]);

  const selected = useMemo(
    () => data?.items.find((i) => i.id === selectedId) ?? null,
    [data, selectedId]
  );

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/feedback/auth', { method: 'DELETE' });
    router.replace('/anotaciones/login');
    router.refresh();
  }

  const total = data?.total ?? data?.items.length ?? 0;
  const reviewersList = data?.reviewers ?? [];
  const sessionsCount = data?.sessions_count ?? 0;
  const lastIso = data?.items[0]?.created_at;

  const filtersActive =
    !!debouncedQ || !!reviewer || datePreset !== 'all' || !!sessionFilter;

  return (
    <main className="mx-auto flex min-h-screen max-w-[1400px] flex-col px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-bosque-700">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-mostaza" />
            <span className="text-[10.5px] font-semibold uppercase tracking-eyebrow">
              Mirador · Panel interno
            </span>
          </div>
          <h1 className="font-display text-3xl font-medium tracking-display text-bosque-900 md:text-4xl">
            Anotaciones de brokers
          </h1>
          <p className="mt-1 text-sm text-bosque-700">
            Feedback dejado por el equipo de ventas sobre conversaciones de Lucía.
          </p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-1.5 rounded-lg border border-bosque-200 bg-white px-3 py-1.5 text-xs font-medium text-bosque-700 transition-colors hover:bg-bosque-50 disabled:opacity-50"
        >
          {loggingOut ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5" />
          )}
          Cerrar sesión
        </button>
      </header>

      {/* Stats */}
      <section className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatCard
          icon={MessageSquareText}
          label="Anotaciones"
          value={total.toString()}
        />
        <StatCard
          icon={Users}
          label="Brokers"
          value={reviewersList.length.toString()}
        />
        <StatCard
          icon={Layers}
          label="Sesiones cubiertas"
          value={sessionsCount.toString()}
        />
        <StatCard
          icon={Clock}
          label="Última"
          value={lastIso ? formatRelative(lastIso) : '—'}
        />
      </section>

      {/* Filtros */}
      <section className="mb-4 rounded-2xl bg-white p-3 shadow-card ring-1 ring-bosque-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bosque-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en anotaciones…"
              className="w-full rounded-lg border border-bosque-200 bg-bosque-50/50 py-2 pl-9 pr-3 text-sm text-bosque-900 placeholder:text-bosque-400 focus:border-bosque-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-bosque-200"
            />
          </div>

          {/* Reviewer */}
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bosque-400" />
            <select
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              className="appearance-none rounded-lg border border-bosque-200 bg-bosque-50/50 py-2 pl-9 pr-8 text-sm text-bosque-900 focus:border-bosque-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-bosque-200"
            >
              <option value="">Todos los brokers</option>
              {reviewersList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Date presets */}
          <div className="flex items-center gap-0.5 rounded-lg border border-bosque-200 bg-bosque-50/50 p-0.5">
            <Calendar className="ml-2 h-3.5 w-3.5 text-bosque-400" />
            {(
              [
                ['all', 'Todo'],
                ['30d', '30d'],
                ['7d', '7d'],
                ['today', 'Hoy'],
              ] as [DatePreset, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setDatePreset(v)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  datePreset === v
                    ? 'bg-bosque-800 text-crema'
                    : 'text-bosque-700 hover:bg-bosque-100'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            onClick={() => data?.items && downloadCsv(data.items)}
            disabled={!data?.items.length}
            className="flex items-center gap-1.5 rounded-lg border border-bosque-200 bg-white px-3 py-2 text-xs font-medium text-bosque-700 transition-colors hover:bg-bosque-50 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
        </div>

        {/* Session filter chip */}
        {sessionFilter && (
          <div className="mt-2 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-mostaza/10 px-2.5 py-1 text-[11px] font-medium text-bosque-800">
              <Hash className="h-3 w-3" />
              Sesión {shortSession(sessionFilter)}
              <button
                onClick={() => setSessionFilter(null)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-bosque-900/10"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </div>
        )}
      </section>

      {/* Lista + detalle */}
      <section className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* Lista */}
        <div className="flex max-h-[calc(100vh-280px)] flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-bosque-100">
          <div className="flex items-center justify-between border-b border-bosque-100 px-4 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-bosque-700">
              {filtersActive ? 'Resultados' : 'Todas las anotaciones'}
            </span>
            <span className="text-[11px] text-bosque-500">
              {data?.items.length ?? 0}
              {data?.total != null && data.total !== data.items.length
                ? ` / ${data.total}`
                : ''}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="p-6 text-center text-xs text-red-700">
                Error cargando: {String(error.message ?? error)}
                <button
                  onClick={() => mutate()}
                  className="mt-2 block w-full rounded-lg border border-red-200 px-3 py-1.5 text-xs hover:bg-red-50"
                >
                  Reintentar
                </button>
              </div>
            )}
            {isLoading && !data && (
              <div className="flex items-center justify-center p-10">
                <Loader2 className="h-5 w-5 animate-spin text-bosque-400" />
              </div>
            )}
            {data && data.items.length === 0 && (
              <EmptyState filtersActive={filtersActive} />
            )}
            {data && data.items.length > 0 && (
              <ul className="divide-y divide-bosque-100">
                {data.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        'group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                        selectedId === item.id
                          ? 'bg-bosque-50'
                          : 'hover:bg-bosque-50/50'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold uppercase',
                          selectedId === item.id
                            ? 'bg-gradient-launcher text-crema'
                            : 'bg-bosque-100 text-bosque-700 group-hover:bg-bosque-200'
                        )}
                      >
                        {initials(item.reviewer_name) || '·'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-bosque-900">
                            {item.reviewer_name}
                          </span>
                          <span className="shrink-0 text-[10.5px] tabular-nums text-bosque-500">
                            {formatRelative(item.created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-bosque-700">
                          {item.annotation}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-bosque-500">
                          <span className="flex items-center gap-1 rounded-full bg-bosque-50 px-1.5 py-0.5 font-mono">
                            <Hash className="h-2.5 w-2.5" />
                            {shortSession(item.session_id)}
                          </span>
                          <span>·</span>
                          <span>{item.messages.length} msgs</span>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          'mt-2 h-4 w-4 shrink-0 transition-colors',
                          selectedId === item.id
                            ? 'text-bosque-700'
                            : 'text-bosque-300 group-hover:text-bosque-500'
                        )}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Detalle */}
        <div className="flex max-h-[calc(100vh-280px)] flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-bosque-100">
          <AnimatePresence mode="wait">
            {selected ? (
              <DetailPanel
                key={selected.id}
                item={selected}
                onFilterSession={() => setSessionFilter(selected.session_id)}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center p-10 text-center text-sm text-bosque-500">
                Selecciona una anotación para ver el detalle
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MessageSquareText;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-3.5 shadow-card ring-1 ring-bosque-100">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-bosque-600">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-medium tabular-nums text-bosque-900">
        {value}
      </div>
    </div>
  );
}

function EmptyState({ filtersActive }: { filtersActive: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bosque-50">
        <MessageSquareText className="h-5 w-5 text-bosque-400" />
      </div>
      <p className="text-sm font-medium text-bosque-900">
        {filtersActive ? 'Sin resultados' : 'Aún no hay anotaciones'}
      </p>
      <p className="mt-1 text-xs text-bosque-600">
        {filtersActive
          ? 'Probá ajustar los filtros para ampliar la búsqueda.'
          : 'Cuando un broker deje feedback en el chat, aparecerá acá.'}
      </p>
    </div>
  );
}

function DetailPanel({
  item,
  onFilterSession,
}: {
  item: FeedbackItem;
  onFilterSession: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyAnnotation() {
    try {
      await navigator.clipboard.writeText(item.annotation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="flex h-full flex-col overflow-hidden"
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-3 border-b border-bosque-100 px-5 py-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wide text-bosque-600">
            <span>{item.reviewer_name}</span>
            <span className="text-bosque-300">·</span>
            <span className="font-mono normal-case text-bosque-500">
              {formatExact(item.created_at)}
            </span>
          </div>
          <button
            onClick={onFilterSession}
            className="mt-1 inline-flex items-center gap-1 rounded-full bg-mostaza/10 px-2 py-0.5 font-mono text-[11px] text-bosque-800 transition-colors hover:bg-mostaza/20"
          >
            <Hash className="h-3 w-3" />
            sesión {shortSession(item.session_id)}
            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
          </button>
        </div>
      </header>

      {/* Anotación */}
      <div className="border-b border-bosque-100 bg-mostaza/[0.06] px-5 py-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-bosque-700">
            Anotación
          </span>
          <button
            onClick={copyAnnotation}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-medium text-bosque-700 transition-colors hover:bg-bosque-100"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copiar
              </>
            )}
          </button>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-bosque-900">
          {item.annotation}
        </p>
      </div>

      {/* Transcripción */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-bosque-100 px-5 py-2">
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-bosque-700">
            Transcripción de la conversación
          </span>
          <span className="text-[10.5px] text-bosque-500">
            {item.messages.length} mensajes
          </span>
        </div>
        <div className="flex-1 overflow-y-auto bg-bosque-50/40 px-4 py-4">
          {item.messages.length === 0 ? (
            <p className="text-center text-xs italic text-bosque-500">
              Esta anotación no incluye mensajes.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {item.messages.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    'flex',
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[78%] rounded-2xl px-3 py-2 text-[13px] leading-snug shadow-sm',
                      m.role === 'user'
                        ? 'bg-bosque-800 text-crema'
                        : 'bg-white text-bosque-900 ring-1 ring-bosque-100'
                    )}
                  >
                    <div
                      className={cn(
                        'mb-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        m.role === 'user'
                          ? 'text-mostaza-200/80'
                          : 'text-bosque-600'
                      )}
                    >
                      {m.role === 'user' ? 'Cliente' : 'Lucía'}
                    </div>
                    {m.content && (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                    {m.attachment_types && m.attachment_types.length > 0 && (
                      <p
                        className={cn(
                          'mt-1 text-[10.5px]',
                          m.role === 'user'
                            ? 'text-mostaza-100/70'
                            : 'text-bosque-500'
                        )}
                      >
                        {m.attachment_types
                          .map((t) => `[adjunto: ${t}]`)
                          .join(' ')}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Meta footer */}
      {(item.user_agent || item.referrer) && (
        <footer className="border-t border-bosque-100 bg-white px-5 py-2.5 text-[10.5px] text-bosque-500">
          {item.referrer && (
            <div className="truncate">
              <span className="font-semibold text-bosque-700">Origen:</span>{' '}
              {item.referrer}
            </div>
          )}
          {item.user_agent && (
            <div className="truncate">
              <span className="font-semibold text-bosque-700">UA:</span>{' '}
              {item.user_agent}
            </div>
          )}
        </footer>
      )}
    </motion.div>
  );
}
