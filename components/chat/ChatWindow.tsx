'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { motion } from 'framer-motion';
import { Send, X, RefreshCw, Minus } from 'lucide-react';
import type { LeadGateData, Message } from '@/lib/chat/types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { AssistantAvatar } from './AssistantAvatar';
import { GateForm } from './GateForm';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  messages: Message[];
  onSend: (text: string) => void | Promise<void>;
  onClose: () => void;
  onReset: () => void;
  onMinimize?: () => void;
  isSending: boolean;
  error: string | null;
  /** Si true, bloquea el chat y muestra el gate form. */
  gateRequired?: boolean;
  onGateSubmit?: (data: LeadGateData) => Promise<void> | void;
  gateError?: string | null;
}

const MAX_MESSAGE_LENGTH = 1000;

const QUICK_REPLIES = [
  { label: 'Ya tengo información', value: 'Ya tengo información del proyecto' },
  { label: 'Quiero un tour guiado', value: 'Quiero un tour guiado del proyecto' },
  { label: 'Quiero comprar', value: 'Quiero comprar una parcela' },
];

/**
 * Agrupa mensajes consecutivos del mismo remitente para decidir
 * cuándo mostrar el avatar (solo en el último mensaje del grupo).
 */
function computeShowAvatar(messages: Message[]): boolean[] {
  return messages.map((m, i) => {
    if (m.role !== 'assistant') return false;
    const next = messages[i + 1];
    return !next || next.role !== 'assistant';
  });
}

export function ChatWindow({
  messages,
  onSend,
  onClose,
  onReset,
  onMinimize,
  isSending,
  error,
  gateRequired = false,
  onGateSubmit,
  gateError,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [scrolledTop, setScrolledTop] = useState(true);
  const [scrolledBottom, setScrolledBottom] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const showAvatarMap = useMemo(() => computeShowAvatar(messages), [messages]);
  // Quick replies visibles mientras el usuario aún no haya respondido.
  const isFirstExchange =
    messages.length > 0 && messages.every((m) => m.role === 'assistant');
  const showCounter = input.length > 800;

  // Auto-scroll al recibir mensaje o typing
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  // Focus input al montar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ESC cierra
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Auto-grow del textarea (máx 4 líneas)
  useLayoutEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const maxHeight = 120; // ~4 líneas de 1.5rem
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, [input]);

  // Scroll shadows
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      setScrolledTop(el.scrollTop <= 4);
      setScrolledBottom(el.scrollHeight - el.scrollTop - el.clientHeight <= 4);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [messages.length]);

  const submitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setInput('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitText(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitText(input);
    }
  };

  const hasInput = input.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      role="dialog"
      aria-label="Chat asistente Mirador de Villarrica"
      aria-modal="false"
      className={cn(
        'fixed z-50 flex flex-col overflow-hidden bg-crema shadow-chat-window',
        // Mobile: sheet desde abajo con altura 92vh y esquinas superiores redondeadas
        'inset-x-0 bottom-0 top-auto max-h-[92svh] min-h-[60svh] rounded-t-2xl',
        // Desktop: ventana flotante bottom-right
        'md:inset-auto md:bottom-24 md:right-6 md:h-[620px] md:max-h-[calc(100vh-8rem)] md:w-[400px] md:rounded-2xl',
        'border border-bosque-100/60'
      )}
    >
      {/* Drag handle visual (solo mobile) */}
      <div className="flex justify-center pt-2 md:hidden">
        <span className="h-1 w-10 rounded-full bg-bosque-200" aria-hidden="true" />
      </div>

      {/* Header premium con gradient */}
      <header className="chat-header-glass flex items-center justify-between gap-3 px-4 pb-3 pt-3 text-crema md:pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <AssistantAvatar size="md" showStatus className="ring-2 ring-crema/10" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold leading-tight">
              Lucía
              <span className="ml-1.5 text-xs font-normal text-crema/70">· Mirador</span>
            </h2>
            <p className="flex items-center gap-1.5 text-[11px] leading-tight text-crema/70">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Responde en segundos
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onReset}
            className="rounded-full p-2 text-crema/80 transition-colors hover:bg-white/10 hover:text-crema"
            aria-label="Reiniciar conversación"
            title="Reiniciar conversación"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {onMinimize && (
            <button
              type="button"
              onClick={onMinimize}
              className="hidden rounded-full p-2 text-crema/80 transition-colors hover:bg-white/10 hover:text-crema md:block"
              aria-label="Minimizar chat"
              title="Minimizar"
            >
              <Minus className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-crema/80 transition-colors hover:bg-white/10 hover:text-crema"
            aria-label="Cerrar chat"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      {gateRequired && onGateSubmit ? (
        <GateForm onSubmit={onGateSubmit} error={gateError} />
      ) : (
      <>
      {/* Área de mensajes con scroll shadows */}
      <div
        ref={scrollContainerRef}
        className="chat-scroll-container relative flex-1 min-h-0"
        data-scrolled-top={scrolledTop}
        data-scrolled-bottom={scrolledBottom}
      >
        <div
          ref={scrollRef}
          className="chat-scroll h-full space-y-3 overflow-y-auto px-4 py-4"
        >
          {messages.map((m, i) => (
            <MessageBubble
              key={m.id}
              message={m}
              showAvatar={showAvatarMap[i]}
              onAction={submitText}
            />
          ))}

          {/* Quick replies después del primer mensaje de bienvenida */}
          {isFirstExchange && !isSending && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.25 }}
              className="flex flex-wrap gap-2 pl-8 pt-1"
              role="group"
              aria-label="Preguntas sugeridas"
            >
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => submitText(q.value)}
                  disabled={isSending}
                  className={cn(
                    'rounded-full border border-bosque-200 bg-white px-3 py-1.5 text-xs font-medium text-bosque-700',
                    'shadow-sm transition-all hover:-translate-y-0.5 hover:border-bosque-300 hover:bg-bosque-50 hover:shadow-md',
                    'disabled:opacity-50'
                  )}
                >
                  {q.label}
                </button>
              ))}
            </motion.div>
          )}

          {isSending && <TypingIndicator />}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 shadow-sm"
            >
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-bosque-100/80 bg-white/95 px-3 pb-3 pt-2.5 backdrop-blur-sm"
      >
        <div
          className={cn(
            'flex items-end gap-2 rounded-2xl border bg-white px-3 py-2 transition-colors',
            hasInput
              ? 'border-bosque-300 shadow-sm'
              : 'border-bosque-200 focus-within:border-bosque-300 focus-within:shadow-sm'
          )}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje…"
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            className={cn(
              'flex-1 resize-none border-0 bg-transparent py-1 text-sm leading-relaxed text-bosque-900',
              'placeholder:text-bosque-400 focus:outline-none focus:ring-0'
            )}
            style={{ maxHeight: 120 }}
            aria-label="Mensaje"
          />
          <button
            type="submit"
            disabled={!hasInput || isSending}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
              hasInput && !isSending
                ? 'bg-gradient-launcher text-crema shadow-sm hover:shadow-md active:scale-95'
                : 'bg-bosque-100 text-bosque-400'
            )}
            aria-label="Enviar mensaje"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2 px-1">
          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-bosque-400">
            <span aria-hidden>🔒</span>
            Conversación privada
          </p>
          {showCounter ? (
            <p
              className={cn(
                'text-[10px] tabular-nums',
                input.length >= MAX_MESSAGE_LENGTH ? 'text-red-500' : 'text-bosque-400'
              )}
            >
              {input.length}/{MAX_MESSAGE_LENGTH}
            </p>
          ) : (
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-bosque-400">
              Powered by Terra Segura Inmobiliaria
            </p>
          )}
        </div>
      </form>
      </>
      )}
    </motion.div>
  );
}
