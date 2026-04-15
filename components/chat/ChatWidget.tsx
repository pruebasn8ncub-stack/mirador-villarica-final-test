'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatLauncher } from './ChatLauncher';
import { ChatWindow } from './ChatWindow';
import { getOrCreateSessionId, loadMessages, resetSession, saveMessages } from '@/lib/chat/storage';
import { sendChatMessage, ChatApiError } from '@/lib/chat/api';
import type { Message } from '@/lib/chat/types';

const OPENING_MESSAGE: Message = {
  id: 'opening',
  role: 'assistant',
  content:
    'Hola, soy el asistente virtual de Mirador de Villarrica — el proyecto de Terra Segura en Colico, Región de La Araucanía: 94 parcelas con SAG aprobado, roles listos y caminos estabilizados.\n\nCuéntame, ¿qué te gustaría saber del proyecto?',
  timestamp: Date.now(),
};

const USE_MOCKS = process.env.NEXT_PUBLIC_CHAT_MOCKS === '1';

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function mockReply(userText: string): Promise<{ reply: string; attachments?: Message['attachments'] }> {
  await new Promise((r) => setTimeout(r, 700));
  const lower = userText.toLowerCase();
  if (lower.includes('plano') || lower.includes('master')) {
    return {
      reply: 'Claro, te comparto el master plan del proyecto. Las 94 parcelas se distribuyen en una meseta elevada con vistas al volcán y al lago.',
      attachments: [
        {
          type: 'image',
          url: '/assets/master-plan.jpg',
          caption: 'Master Plan — Mirador de Villarrica',
        },
      ],
    };
  }
  if (lower.includes('foto') || lower.includes('galer') || lower.includes('imagen')) {
    return {
      reply: 'Te dejo algunas fotos del entorno:',
      attachments: [
        {
          type: 'gallery',
          images: [
            { url: '/assets/banner-volcan.jpg', alt: 'Vista con Volcán Villarrica' },
            { url: '/assets/galeria1.jpg', alt: 'Entorno natural' },
            { url: '/assets/lagocolico.jpg', alt: 'Lago Colico cercano' },
          ],
        },
      ],
    };
  }
  if (lower.includes('diego') || lower.includes('whatsapp') || lower.includes('contacto')) {
    return {
      reply: 'Te dejo el contacto directo de Diego para que conversen por WhatsApp:',
      attachments: [
        {
          type: 'whatsapp_link',
          url: 'https://wa.me/56940329987?text=Hola%20Diego%2C%20vengo%20del%20chat%20de%20Mirador%20de%20Villarrica',
          label: 'Hablar con Diego por WhatsApp',
        },
      ],
    };
  }
  return {
    reply:
      '[mock] Recibí: "' +
      userText +
      '". En producción, un agente IA responderá con datos reales del brochure.',
  };
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Message[]>([OPENING_MESSAGE]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = getOrCreateSessionId();
    setSessionId(id);
    const stored = loadMessages(id);
    if (stored.length > 0) {
      setMessages(stored);
    }
  }, []);

  useEffect(() => {
    if (sessionId && messages.length > 0) {
      saveMessages(sessionId, messages);
    }
  }, [sessionId, messages]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!sessionId) return;
      setError(null);

      const userMsg: Message = {
        id: makeId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsSending(true);

      try {
        if (USE_MOCKS) {
          const { reply, attachments } = await mockReply(text);
          const assistantMsg: Message = {
            id: makeId(),
            role: 'assistant',
            content: reply,
            attachments,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        } else {
          const res = await sendChatMessage({
            session_id: sessionId,
            message: text,
            user_metadata: {
              referrer: typeof document !== 'undefined' ? document.referrer : undefined,
              user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
            },
          });
          const assistantMsg: Message = {
            id: makeId(),
            role: 'assistant',
            content: res.reply,
            attachments: res.attachments,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }
      } catch (err) {
        const msg =
          err instanceof ChatApiError
            ? err.code === 'rate_limit'
              ? 'Demasiados mensajes seguidos. Espera un momento.'
              : err.code === 'timeout'
                ? 'El asistente está demorando. Intenta de nuevo.'
                : 'No pude contactar al asistente. Intenta de nuevo.'
            : 'Ocurrió un problema. Intenta de nuevo.';
        setError(msg);
      } finally {
        setIsSending(false);
      }
    },
    [sessionId]
  );

  const handleReset = useCallback(() => {
    const newId = resetSession();
    setSessionId(newId);
    setMessages([OPENING_MESSAGE]);
    setError(null);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <ChatLauncher isOpen={isOpen} onClick={() => setIsOpen((v) => !v)} />
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            messages={messages}
            onSend={handleSend}
            onClose={() => setIsOpen(false)}
            onReset={handleReset}
            isSending={isSending}
            error={error}
          />
        )}
      </AnimatePresence>
    </>
  );
}
