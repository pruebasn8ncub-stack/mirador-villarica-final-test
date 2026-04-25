'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { X, Send, CheckCircle2 } from 'lucide-react';
import type { Message } from '@/lib/chat/types';
import { cn } from '@/lib/utils';

const REVIEWER_NAME_KEY = 'mirador_reviewer_name';
const MAX_ANNOTATION = 4000;

interface FeedbackModalProps {
  sessionId: string;
  messages: Message[];
  onClose: () => void;
}

interface SerializableMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  attachment_types?: string[];
}

function serializeMessages(messages: Message[]): SerializableMessage[] {
  return messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp,
    ...(m.attachments && m.attachments.length > 0
      ? { attachment_types: m.attachments.map((a) => a.type) }
      : {}),
  }));
}

function attachmentLabel(type: string): string {
  return `[adjunto: ${type}]`;
}

export function FeedbackModal({ sessionId, messages, onClose }: FeedbackModalProps) {
  const [reviewerName, setReviewerName] = useState('');
  const [annotation, setAnnotation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const annotationRef = useRef<HTMLTextAreaElement>(null);

  // Cargar nombre persistido del último vendedor que anotó desde este navegador
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REVIEWER_NAME_KEY);
      if (saved) setReviewerName(saved);
    } catch {
      // localStorage bloqueado — ignorar
    }
  }, []);

  // ESC cierra + bloquear scroll del body
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, submitting]);

  // Scroll al final de la transcripción al montar
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const counter = useMemo(() => annotation.length, [annotation]);
  const counterDanger = counter >= MAX_ANNOTATION;

  const canSubmit =
    reviewerName.trim().length >= 2 &&
    annotation.trim().length >= 3 &&
    !submitting &&
    !success;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);

    try {
      window.localStorage.setItem(REVIEWER_NAME_KEY, reviewerName.trim());
    } catch {
      // ignorar
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          reviewer_name: reviewerName.trim(),
          annotation: annotation.trim(),
          messages: serializeMessages(messages),
          user_agent:
            typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          referrer:
            typeof document !== 'undefined' ? document.referrer : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      setSuccess(true);
      // Auto-cerrar tras feedback de éxito
      window.setTimeout(() => onClose(), 1400);
    } catch (err) {
      setError(
        err instanceof Error
          ? `No pudimos guardar la anotación: ${err.message}`
          : 'No pudimos guardar la anotación. Intenta de nuevo.'
      );
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <button
        type="button"
        onClick={() => !submitting && onClose()}
        aria-label="Cerrar anotación"
        className="absolute inset-0 h-full w-full cursor-default bg-bosque-900/55 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex max-h-[92svh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-crema shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] ring-1 ring-bosque-900/10"
      >
        <header className="flex items-start justify-between gap-3 border-b border-bosque-100 px-5 py-3.5">
          <div className="min-w-0">
            <h2
              id="feedback-modal-title"
              className="text-[15px] font-semibold leading-tight text-bosque-900"
            >
              Anotar conversación
            </h2>
            <p className="mt-0.5 text-[11.5px] leading-snug text-bosque-700">
              Revisa la transcripción y deja tu observación para depurar el bot.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="shrink-0 rounded-full p-1.5 text-bosque-600 transition-colors hover:bg-bosque-50 hover:text-bosque-900 disabled:opacity-40"
            aria-label="Cerrar"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </header>

        {/* Transcripción */}
        <div
          ref={transcriptRef}
          className="max-h-[40svh] overflow-y-auto border-b border-bosque-100 bg-white/60 px-4 py-3"
        >
          {messages.length === 0 ? (
            <p className="text-xs italic text-bosque-500">
              Aún no hay mensajes en esta conversación.
            </p>
          ) : (
            <ul className="space-y-2">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    'flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-[12.5px] leading-snug',
                    m.role === 'user'
                      ? 'bg-bosque-50 text-bosque-900'
                      : 'bg-mostaza/[0.08] text-bosque-900'
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-bosque-600">
                    {m.role === 'user' ? 'Cliente' : 'Lucía'}
                  </span>
                  {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                  {m.attachments && m.attachments.length > 0 && (
                    <p className="text-[11px] text-bosque-500">
                      {m.attachments.map((a) => attachmentLabel(a.type)).join(' ')}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4"
        >
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-bosque-700">
              Tu nombre <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value.slice(0, 120))}
              placeholder="Ej. Diego Cavagnaro"
              required
              minLength={2}
              maxLength={120}
              disabled={submitting || success}
              className="rounded-lg border border-bosque-200 bg-white px-3 py-2 text-sm text-bosque-900 placeholder:text-bosque-400 focus:border-bosque-400 focus:outline-none focus:ring-2 focus:ring-bosque-200 disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-bosque-700">
              <span>
                Anotación <span className="text-red-500">*</span>
              </span>
              <span
                className={cn(
                  'tabular-nums normal-case tracking-normal',
                  counterDanger ? 'text-red-500' : 'text-bosque-500'
                )}
              >
                {counter}/{MAX_ANNOTATION}
              </span>
            </span>
            <textarea
              ref={annotationRef}
              value={annotation}
              onChange={(e) =>
                setAnnotation(e.target.value.slice(0, MAX_ANNOTATION))
              }
              rows={5}
              placeholder="Ej. en el saludo no me gustó que dijera X, prefiero que diga Y"
              required
              minLength={3}
              maxLength={MAX_ANNOTATION}
              disabled={submitting || success}
              className="resize-y rounded-lg border border-bosque-200 bg-white px-3 py-2 text-sm leading-relaxed text-bosque-900 placeholder:text-bosque-400 focus:border-bosque-400 focus:outline-none focus:ring-2 focus:ring-bosque-200 disabled:opacity-60"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Anotación guardada. ¡Gracias!
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg px-3 py-2 text-sm font-medium text-bosque-700 transition-colors hover:bg-bosque-50 disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                canSubmit
                  ? 'bg-gradient-launcher text-crema shadow-sm hover:shadow-md active:scale-95'
                  : 'bg-bosque-100 text-bosque-400'
              )}
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Enviando…' : 'Enviar anotación'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
