'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, X, RefreshCw } from 'lucide-react';
import type { Message } from '@/lib/chat/types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  messages: Message[];
  onSend: (text: string) => void | Promise<void>;
  onClose: () => void;
  onReset: () => void;
  isSending: boolean;
  error: string | null;
}

const MAX_MESSAGE_LENGTH = 1000;

export function ChatWindow({
  messages,
  onSend,
  onClose,
  onReset,
  isSending,
  error,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-label="Chat asistente Mirador de Villarrica"
      aria-modal="false"
      className={cn(
        'fixed z-50 flex flex-col bg-crema shadow-2xl',
        'inset-0 md:inset-auto md:bottom-24 md:right-6 md:h-[560px] md:w-[380px] md:rounded-2xl',
        'overflow-hidden border border-bosque-100'
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-bosque-100 bg-bosque-800 px-4 py-3 text-crema">
        <div>
          <h2 className="text-sm font-semibold">Mirador de Villarrica</h2>
          <p className="text-xs opacity-80">Asistente virtual</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onReset}
            className="rounded-full p-1.5 hover:bg-bosque-700"
            aria-label="Reiniciar conversación"
            title="Reiniciar conversación"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-bosque-700"
            aria-label="Cerrar chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isSending && <TypingIndicator />}
        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-bosque-100 bg-white px-3 py-2"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu mensaje…"
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            className="flex-1 resize-none rounded-lg border border-bosque-200 bg-white px-3 py-2 text-sm text-bosque-800 placeholder:text-bosque-400 focus:outline-none focus:ring-2 focus:ring-mostaza"
            aria-label="Mensaje"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bosque-800 text-crema hover:bg-bosque-700 disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-[10px] text-bosque-400">
          Asistente virtual · Las respuestas las valida Diego Cavagnaro
        </p>
      </form>
    </motion.div>
  );
}
