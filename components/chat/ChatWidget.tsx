'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatLauncher } from './ChatLauncher';
import { ChatWindow } from './ChatWindow';
import {
  getOrCreateSessionId,
  loadLead,
  loadMessages,
  resetSession,
  saveLead,
  saveMessages,
} from '@/lib/chat/storage';
import { sendChatMessage, ChatApiError } from '@/lib/chat/api';
import { ensureSession, submitLeadGate, LeadGateError } from '@/lib/chat/lead';
import type { Attachment, LeadGateData, Message } from '@/lib/chat/types';

const USE_MOCKS = process.env.NEXT_PUBLIC_CHAT_MOCKS === '1';

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

/**
 * Saludo local post-gate. 3 burbujas + quick replies llegan gratis (sin tokens).
 * El primer POST al n8n recién ocurre cuando el usuario elige un quick reply.
 */
function buildOpeningMessages(lead: LeadGateData | null): Message[] {
  const name = lead ? firstName(lead.nombre) : '';
  const baseTs = Date.now();
  const greeting = name
    ? `${name}, gracias por compartir tus datos. 🙌`
    : 'Gracias por compartir tus datos. 🙌';
  return [
    {
      id: 'opening-1',
      role: 'assistant',
      content: greeting,
      timestamp: baseTs,
    },
    {
      id: 'opening-2',
      role: 'assistant',
      content:
        'Soy Lucía, la asistente virtual del proyecto Mirador de Villarrica — 94 parcelas con SAG aprobado, roles listos y caminos estabilizados, en Colico.',
      timestamp: baseTs + 1,
    },
    {
      id: 'opening-3',
      role: 'assistant',
      content:
        'Estoy acá para ayudarte a elegir tu próxima parcela 🌲. Para continuar, ¿qué te acomoda?',
      timestamp: baseTs + 2,
    },
  ];
}

async function mockReply(
  userText: string,
  lead: LeadGateData | null
): Promise<{ reply: string; attachments?: Attachment[] }> {
  await new Promise((r) => setTimeout(r, 700));
  const lower = userText.toLowerCase();
  const name = lead ? firstName(lead.nombre) : '';

  if (lower.includes('tour')) {
    return {
      reply: `${name ? name + ', ' : ''}perfecto. Te muestro las parcelas más solicitadas:`,
      attachments: [
        {
          type: 'property_carousel',
          items: [
            { parcela: 'P-24', sqm: '5.120', price: 'UF 520', tone: 'forest' },
            { parcela: 'P-31', sqm: '5.800', price: 'UF 580', tone: 'meadow' },
            { parcela: 'P-07', sqm: '6.450', price: 'UF 640', tone: 'lake' },
          ],
        },
      ],
    };
  }
  if (lower.includes('comprar') || lower.includes('precio') || lower.includes('financ')) {
    return {
      reply:
        'Manejamos dos modalidades: **contado** desde $14.490.000 o **crédito directo** desde $17.490.000 (50% pie + 36 cuotas UF). Podés simular tu cuota acá:',
      attachments: [{ type: 'mortgage_simulator', priceUf: 520, defaultDownPct: 50, defaultMonths: 36 }],
    };
  }
  if (lower.includes('asesor') || lower.includes('diego')) {
    return {
      reply: 'Te conecto con Diego:',
      attachments: [
        {
          type: 'handoff',
          advisorName: 'Diego Cavagnaro',
          advisorRole: 'Asesor inmobiliario · Terra Segura',
          whatsapp: '+56940329987',
        },
      ],
    };
  }
  if (lower.includes('mapa')) {
    return {
      reply: 'Estamos sobre la ruta a Las Hortensias:',
      attachments: [
        {
          type: 'map_card',
          address: 'Colico, Cunco, La Araucanía, Chile',
          nearbyMinutes: [
            { place: 'Lago Colico', minutes: 15 },
            { place: 'Cunco', minutes: 20 },
            { place: 'Villarrica', minutes: 60 },
            { place: 'Aeropuerto Temuco', minutes: 60 },
          ],
        },
      ],
    };
  }
  return {
    reply: `[mock] Recibí: "${userText}". En producción Lucía responde con datos reales del brochure.`,
  };
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [leadData, setLeadData] = useState<LeadGateData | null>(null);
  const [gatePassed, setGatePassed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const firstMessageSent = useRef(false);

  // Bootstrap: sesión + lead + mensajes persistidos
  useEffect(() => {
    setMounted(true);
    const id = getOrCreateSessionId();
    setSessionId(id);
    void ensureSession(id);

    const savedLead = loadLead(id);
    const storedMessages = loadMessages(id);

    if (savedLead) {
      setLeadData(savedLead);
      setGatePassed(true);
      if (storedMessages.length > 0) {
        setMessages(storedMessages);
        if (storedMessages.some((m) => m.role === 'user')) {
          firstMessageSent.current = true;
        }
      } else {
        setMessages(buildOpeningMessages(savedLead));
      }
    }
  }, []);

  // Persistir mensajes tras cada cambio
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      saveMessages(sessionId, messages);
    }
  }, [sessionId, messages]);

  const handleGateSubmit = useCallback(
    async (data: LeadGateData) => {
      if (!sessionId) return;
      setGateError(null);
      try {
        await submitLeadGate(sessionId, data);
      } catch (err) {
        const msg =
          err instanceof LeadGateError && err.code === 'validation'
            ? 'Revisa los datos del formulario e intenta de nuevo.'
            : 'No pudimos registrar tus datos, pero podemos continuar. Si el problema persiste, avisale a Diego.';
        setGateError(msg);
        // Fallback: seguimos abriendo el chat aunque el POST falle, no bloqueamos al usuario.
      }
      saveLead(sessionId, data);
      setLeadData(data);
      setGatePassed(true);
      setMessages(buildOpeningMessages(data));
    },
    [sessionId]
  );

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

      const isFirstMessage = !firstMessageSent.current;

      try {
        if (USE_MOCKS) {
          const { reply, attachments } = await mockReply(text, leadData);
          setMessages((prev) => [
            ...prev,
            {
              id: makeId(),
              role: 'assistant',
              content: reply,
              attachments,
              timestamp: Date.now(),
            },
          ]);
        } else {
          const res = await sendChatMessage({
            session_id: sessionId,
            message: text,
            user_metadata: {
              referrer: typeof document !== 'undefined' ? document.referrer : undefined,
              user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
              // Solo inyectamos el lead en el PRIMER mensaje — n8n ya lo persiste en messages.
              ...(isFirstMessage && leadData ? { lead: leadData, first_message: true } : {}),
            },
          });
          setMessages((prev) => [
            ...prev,
            {
              id: makeId(),
              role: 'assistant',
              content: res.reply,
              attachments: res.attachments,
              timestamp: Date.now(),
            },
          ]);
        }
        firstMessageSent.current = true;
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
    [sessionId, leadData]
  );

  const handleReset = useCallback(() => {
    const newId = resetSession();
    setSessionId(newId);
    void ensureSession(newId);
    setLeadData(null);
    setGatePassed(false);
    setMessages([]);
    setError(null);
    setGateError(null);
    firstMessageSent.current = false;
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
            gateRequired={!gatePassed}
            onGateSubmit={handleGateSubmit}
            gateError={gateError}
          />
        )}
      </AnimatePresence>
    </>
  );
}
