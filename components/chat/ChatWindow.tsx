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
import { Send, X, RefreshCw, Minus, Lock } from 'lucide-react';
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
  /** Texto sugerido para sembrar en el input (no envía solo). Cambia → reemplaza input. */
  prefillInput?: string;
}

const MAX_MESSAGE_LENGTH = 1000;

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
  prefillInput,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [scrolledTop, setScrolledTop] = useState(true);
  const [scrolledBottom, setScrolledBottom] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const showAvatarMap = useMemo(() => computeShowAvatar(messages), [messages]);
  const showCounter = input.length > 800;

  // Auto-scroll al recibir mensaje o typing
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  // Focus input al montar (solo cuando el chat es interactivo, no durante el gate).
  // El rAF evita que el cursor se renderice visible sobre el header durante el primer frame.
  useEffect(() => {
    if (gateRequired) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [gateRequired]);

  // ESC cierra
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prefill desde contexto externo (ej: click en parcela del master plan).
  // Cambia el valor → reemplaza el input y enfoca para que el usuario pueda enviar/editar.
  useEffect(() => {
    if (!prefillInput) return;
    setInput(prefillInput);
    requestAnimationFrame(() => {
      const ta = inputRef.current;
      if (!ta) return;
      ta.focus();
      const len = prefillInput.length;
      ta.setSelectionRange(len, len);
    });
  }, [prefillInput]);

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
        'fixed z-50 flex flex-col overflow-hidden bg-crema shadow-chat-window ring-1 ring-bosque-900/10',
        // Mobile: fullscreen anclado al top con altura dinámica (dvh).
        // IMPORTANTE: sin bottom:0 para que el teclado Android NO empuje el layout hacia arriba
        // (eso ocultaba el header). dvh se re-calcula cuando el teclado abre/cierra.
        'left-0 right-0 top-0 h-[100dvh] max-h-[100dvh] rounded-none',
        // Desktop: ventana flotante centrada verticalmente, anclada a la derecha.
        // top:calc(50% - 310px) evita conflicto con el transform Y de framer-motion.
        'md:inset-auto md:right-6 md:top-[calc(50%-310px)] md:bottom-auto md:h-[620px] md:max-h-[calc(100vh-4rem)] md:w-[400px] md:rounded-2xl'
      )}
    >

      {/* Header premium con gradient + foto de Lucía como identidad visual */}
      <header className="chat-header-glass flex items-center justify-between gap-3 px-4 pb-3 pt-3 text-crema md:pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <AssistantAvatar size="lg" photo className="ring-2 ring-crema/20" />
          <div className="min-w-0">
            <h2 className="truncate text-[15px] font-semibold leading-tight">
              Lucía
            </h2>
            <p className="truncate text-[11px] leading-tight text-crema/75">
              Asistente virtual · Proyecto Mirador de Villarrica
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide leading-tight text-emerald-300">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              En línea
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
          <p className="flex h-4 items-center gap-1 text-[10px] font-semibold uppercase leading-none tracking-[0.1em] text-bosque-800">
            <Lock aria-hidden className="h-3 w-3 shrink-0" strokeWidth={2.5} />
            <span>Conversación privada</span>
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
            <p className="flex h-4 items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-bosque-800">
              <span>Powered by</span>
              <img
                src="/assets/terra-segura-logo.webp"
                alt="Terra Segura"
                className="h-4 w-auto object-contain"
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(17%) sepia(44%) saturate(626%) hue-rotate(108deg) brightness(94%) contrast(92%)',
                }}
              />
            </p>
          )}
        </div>
      </form>
      </>
      )}
    </motion.div>
  );
}
