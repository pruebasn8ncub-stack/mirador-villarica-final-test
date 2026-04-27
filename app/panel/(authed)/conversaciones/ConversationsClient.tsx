'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Loader2,
  ChevronRight,
  X,
  Hash,
  User,
  Bot,
  Wrench,
  StickyNote,
  ExternalLink,
  Calendar,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatExact,
  formatRelative,
  initials,
  scoreColor,
  shortSession,
} from '../_lib/format';

interface ConvoListItem {
  session_id: string;
  message_count: number;
  user_messages: number;
  first_user_message: string | null;
  last_message: string | null;
  last_role: string | null;
  first_at: string | null;
  lead: {
    session_id: string;
    nombre: string;
    score: 'CALIENTE' | 'TIBIO' | 'FRIO';
    score_numeric: number | null;
    created_at: string;
  } | null;
  session: {
    id: string;
    created_at: string;
    user_agent: string | null;
    referrer: string | null;
  } | null;
}

interface ConvoListResponse {
  total: number;
  items: ConvoListItem[];
}

interface ConvoMessage {
  id: number;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  raw: unknown;
}

interface ConvoDetail {
  session_id: string;
  messages: ConvoMessage[];
  lead: Record<string, unknown> | null;
  session: Record<string, unknown> | null;
  feedback: {
    id: string;
    reviewer_name: string;
    annotation: string;
    created_at: string;
  }[];
  events: { event_type: string; created_at: string }[];
}

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export function ConversationsClient() {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session');
    if (sid) setSelectedId(sid);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => window.clearTimeout(t);
  }, [q]);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set('limit', '120');
    if (debouncedQ) p.set('q', debouncedQ);
    return p.toString();
  }, [debouncedQ]);

  const { data, error, isLoading } = useSWR<ConvoListResponse>(
    `/api/dashboard/conversations?${queryString}`,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <header className="mb-5">
        <h1 className="font-display text-3xl font-medium tracking-display text-bosque-900 md:text-4xl">
          Conversaciones
        </h1>
        <p className="mt-1 text-sm text-bosque-700">
          Cada conversación que Lucía tuvo con un visitante. Hacé click para ver
          el chat completo.
        </p>
      </header>

      <div className="mb-4 rounded-2xl bg-white p-3 shadow-card ring-1 ring-bosque-100">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bosque-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, mensaje o session_id…"
            className="w-full rounded-lg border border-bosque-200 bg-bosque-50/50 py-2 pl-9 pr-3 text-sm text-bosque-900 placeholder:text-bosque-400 focus:border-bosque-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-bosque-200"
          />
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
              {data.items.length}{' '}
              {data.items.length === 1 ? 'conversación' : 'conversaciones'}
              {data.total !== data.items.length ? ` · ${data.total} total` : ''}
            </span>
          </div>
          {data.items.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-bosque-600">
              No hay conversaciones que coincidan.
            </div>
          ) : (
            <ul className="divide-y divide-bosque-100">
              {data.items.map((it) => (
                <ConvoRow
                  key={it.session_id}
                  item={it}
                  onOpen={() => setSelectedId(it.session_id)}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedId && (
          <ConversationDrawer
            sessionId={selectedId}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ConvoRow({
  item,
  onOpen,
}: {
  item: ConvoListItem;
  onOpen: () => void;
}) {
  const c = scoreColor(item.lead?.score);
  return (
    <li>
      <button
        onClick={onOpen}
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bosque-50/60"
      >
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold',
            item.lead ? c.bg + ' ' + c.text : 'bg-bosque-50 text-bosque-500'
          )}
        >
          {item.lead ? initials(item.lead.nombre) : '·'}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-bosque-900">
              {item.lead?.nombre || 'Visitante anónimo'}
            </span>
            {item.lead?.score && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide',
                  c.bg,
                  c.text
                )}
              >
                {item.lead.score}
              </span>
            )}
            <span className="rounded-full bg-bosque-50 px-1.5 py-0.5 font-mono text-[9.5px] text-bosque-600">
              {shortSession(item.session_id)}
            </span>
          </div>
          {item.first_user_message && (
            <p className="mt-1 line-clamp-1 text-[12.5px] text-bosque-700">
              <span className="text-bosque-500">primer msg:</span>{' '}
              {item.first_user_message}
            </p>
          )}
          {item.last_message && (
            <p className="mt-0.5 line-clamp-1 text-[11.5px] text-bosque-500">
              <span className="font-mono text-[9.5px] uppercase">
                {item.last_role === 'user' ? '➜' : '⬅︎'}
              </span>{' '}
              {item.last_message}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10.5px] tabular-nums text-bosque-500">
            {formatRelative(item.first_at)}
          </span>
          <span className="text-[10.5px] tabular-nums text-bosque-600">
            {item.message_count} msgs
          </span>
          <ChevronRight className="mt-0.5 h-3.5 w-3.5 text-bosque-400" />
        </div>
      </button>
    </li>
  );
}

function ConversationDrawer({
  sessionId,
  onClose,
}: {
  sessionId: string;
  onClose: () => void;
}) {
  const { data, error, isLoading } = useSWR<ConvoDetail>(
    `/api/dashboard/conversations/${sessionId}`,
    fetcher,
    { revalidateOnFocus: false }
  );

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

  const lead = data?.lead as
    | {
        nombre?: string;
        whatsapp?: string;
        email?: string;
        score?: 'CALIENTE' | 'TIBIO' | 'FRIO';
        score_numeric?: number;
        parcela_interes?: string;
        forma_pago?: string;
        plazo?: string;
        rango_presupuesto?: string;
      }
    | null
    | undefined;

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
        aria-label="Cerrar"
        className="absolute inset-0 h-full w-full cursor-default bg-bosque-900/45 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-bosque-100 px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-display text-xl font-medium text-bosque-900">
                {lead?.nombre || 'Visitante anónimo'}
              </h2>
              {lead?.score && <ScorePill score={lead.score} />}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] text-bosque-600">
              <span className="flex items-center gap-1 font-mono">
                <Hash className="h-3 w-3" />
                {shortSession(sessionId)}
              </span>
              {typeof data?.session?.created_at === 'string' && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatExact(data.session.created_at)}
                </span>
              )}
            </div>
            {lead && (
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10.5px]">
                {lead.parcela_interes && (
                  <Tag>Parcela {lead.parcela_interes}</Tag>
                )}
                {lead.forma_pago && lead.forma_pago !== 'no_definido' && (
                  <Tag>{lead.forma_pago}</Tag>
                )}
                {lead.plazo && lead.plazo !== 'no_definido' && (
                  <Tag>plazo {lead.plazo.replace(/_/g, ' ')}</Tag>
                )}
                {lead.rango_presupuesto &&
                  lead.rango_presupuesto !== 'no_definido' && (
                    <Tag>{lead.rango_presupuesto}</Tag>
                  )}
                {lead.score_numeric !== undefined && (
                  <Tag>score {lead.score_numeric}/100</Tag>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-bosque-600 transition-colors hover:bg-bosque-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-bosque-50/40">
          {isLoading && (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-5 w-5 animate-spin text-bosque-400" />
            </div>
          )}
          {error && (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              Error: {error instanceof Error ? error.message : String(error)}
            </div>
          )}

          {data && (
            <>
              {data.feedback && data.feedback.length > 0 && (
                <div className="border-b border-bosque-100 bg-mostaza/[0.06] px-5 py-3">
                  <div className="mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-bosque-700">
                    <StickyNote className="h-3 w-3" />
                    Anotaciones de brokers ({data.feedback.length})
                  </div>
                  <ul className="space-y-2">
                    {data.feedback.map((f) => (
                      <li
                        key={f.id}
                        className="rounded-lg bg-white px-3 py-2 ring-1 ring-bosque-100"
                      >
                        <div className="flex items-center justify-between text-[10.5px] text-bosque-600">
                          <span className="font-semibold text-bosque-800">
                            {f.reviewer_name}
                          </span>
                          <span>{formatRelative(f.created_at)}</span>
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap text-[12.5px] text-bosque-900">
                          {f.annotation}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="px-4 py-4">
                {data.messages.length === 0 ? (
                  <p className="text-center text-xs italic text-bosque-500">
                    Esta sesión no tiene mensajes registrados.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {data.messages.map((m) => (
                      <MessageBubble key={m.id} m={m} />
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-bosque-100 bg-white px-5 py-3 text-[11px]">
          <div className="flex items-center gap-3 text-bosque-600">
            {data?.events && data.events.length > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {data.events.length} eventos
              </span>
            )}
            <span>{data?.messages.length ?? 0} mensajes</span>
          </div>
          {lead && (
            <Link
              href={`/panel/leads`}
              className="flex items-center gap-1 text-bosque-700 underline-offset-2 hover:underline"
            >
              Ver lead completo
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Link>
          )}
        </footer>
      </motion.aside>
    </motion.div>
  );
}

function MessageBubble({ m }: { m: ConvoMessage }) {
  const isUser = m.role === 'user';
  const isTool = m.role === 'tool';
  const isSystem = m.role === 'system';

  if (isSystem || isTool) {
    return (
      <li className="flex justify-center">
        <div className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10.5px] text-bosque-600 ring-1 ring-bosque-100">
          {isTool ? (
            <Wrench className="h-3 w-3 text-mostaza-400" />
          ) : (
            <span className="font-mono">⚙</span>
          )}
          <span className="font-mono uppercase">{m.role}</span>
          {m.content && (
            <span className="max-w-[260px] truncate">· {m.content}</span>
          )}
        </div>
      </li>
    );
  }

  return (
    <li className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-3 py-2 text-[13px] leading-snug shadow-sm',
          isUser
            ? 'bg-bosque-800 text-crema'
            : 'bg-white text-bosque-900 ring-1 ring-bosque-100'
        )}
      >
        <div
          className={cn(
            'mb-0.5 flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-wide',
            isUser ? 'text-mostaza-200/80' : 'text-bosque-600'
          )}
        >
          {isUser ? (
            <User className="h-2.5 w-2.5" />
          ) : (
            <Bot className="h-2.5 w-2.5" />
          )}
          {isUser ? 'Cliente' : 'Lucía'}
        </div>
        {m.content ? (
          <p className="whitespace-pre-wrap">{m.content}</p>
        ) : (
          <p className="italic opacity-60">[mensaje sin texto]</p>
        )}
      </div>
    </li>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-bosque-50 px-2 py-0.5 text-[10px] font-medium text-bosque-700 ring-1 ring-bosque-100">
      {children}
    </span>
  );
}

function ScorePill({ score }: { score: 'CALIENTE' | 'TIBIO' | 'FRIO' }) {
  const c = scoreColor(score);
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ring-1',
        c.bg,
        c.text,
        c.ring
      )}
    >
      {score}
    </span>
  );
}
