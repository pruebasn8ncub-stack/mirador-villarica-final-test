'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatLauncher } from './ChatLauncher';
import { ChatWindow } from './ChatWindow';
import { GateModal } from './GateModal';
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
import { GALERIA, PROYECTO } from '@/data/content';

const USE_MOCKS = process.env.NEXT_PUBLIC_CHAT_MOCKS === '1';

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

/**
 * Saludo local post-gate (1 burbuja + quick replies). El primer POST al n8n
 * recién ocurre cuando el usuario elige un quick reply o escribe.
 */
function buildOpeningMessages(lead: LeadGateData | null): Message[] {
  const name = lead ? firstName(lead.nombre) : '';
  const saludo = name ? `Hola ${name}` : 'Hola';
  return [
    {
      id: 'opening-1',
      role: 'assistant',
      content:
        `${saludo} 👋 Soy **Lucía**, asistente virtual de Mirador de Villarrica. ` +
        `Puedo ayudarte a consultar disponibilidad de parcelas, precios y conectarte con un broker cuando lo necesites.\n\n` +
        `Para partir, ¿ya tienes información del proyecto o prefieres que te guíe con un tour virtual?`,
      timestamp: Date.now(),
    },
  ];
}

/**
 * Mocks para iteración visual de rich cards. Activar con NEXT_PUBLIC_CHAT_MOCKS=1.
 * Cada keyword dispara una card específica para poder refinarla en aislamiento.
 */
async function mockReply(
  userText: string,
  lead: LeadGateData | null
): Promise<{ reply: string; attachments?: Attachment[] }> {
  await new Promise((r) => setTimeout(r, 400));
  const lower = userText.toLowerCase();
  const name = lead ? firstName(lead.nombre) : '';
  const greet = name ? `${name}, ` : '';

  // 0a. Tour 360° flotante — keywords: "360", "tour virtual", "recorrer", "recorrido"
  //     Debe ir ANTES de "tour" (property_carousel) y "video" (video_card que también captura "360").
  if (
    lower.includes('360') ||
    lower.includes('recorr') ||
    lower.includes('tour virtual') ||
    lower.includes('tour 360')
  ) {
    return {
      reply:
        `${greet}acá puedes ver el tour 360° con las distintas vistas del proyecto y una descripción de lo que verás. ` +
        `En el recorrido verás las parcelas marcadas: rojo son las vendidas, azul las reservadas y blanco las disponibles. ` +
        `¿Hay alguna parcela en específico que te interese? Así te consulto la disponibilidad en tiempo real y el precio.`,
      attachments: [
        {
          type: 'tour360_floating',
          url: PROYECTO.tour360Url,
          title: 'Tour 360° · Mirador de Villarrica',
          caption: 'Recorre el proyecto desde tu dispositivo',
          poster: '/assets/banner-volcan.jpg',
        },
      ],
    };
  }

  // 0b. Masterplan flotante — keywords: "masterplan", "master plan", "plano"
  if (
    lower.includes('masterplan') ||
    lower.includes('master plan') ||
    lower.includes('plano')
  ) {
    return {
      reply: `${greet}acá tienes el masterplan del proyecto — el plano comercial con las 94 parcelas distribuidas en 80 hectáreas. ¿Quieres que lo revisemos juntos por alguna zona en particular?`,
      attachments: [
        {
          type: 'masterplan_floating',
          url: PROYECTO.masterPlanOficialUrl,
          title: 'Masterplan · Mirador de Villarrica',
          caption: 'Plano comercial · 94 parcelas · 80 hectáreas',
        },
      ],
    };
  }

  // 0. Galería flotante — keyword: "galería", "galeria", "fotos"
  if (lower.includes('galer') || lower.includes('fotos')) {
    return {
      reply: `${greet}acá tienes la galería del proyecto — son ${GALERIA.length} fotos del entorno: bosque nativo, vista al volcán y lago Colico.`,
      attachments: [
        {
          type: 'gallery_floating',
          images: GALERIA.map((g) => ({ url: g.src, alt: g.alt })),
          caption: `${GALERIA.length} fotos · Mirador de Villarrica`,
        },
      ],
    };
  }

  // 1. PropertyCard (hero) — keyword: "parcela", "tarjeta", "detalle"
  if (lower.includes('tarjeta') || lower.includes('detalle') || lower.match(/\bparcela\b/)) {
    return {
      reply: `${greet}esta es una de nuestras parcelas destacadas:`,
      attachments: [
        {
          type: 'property_card',
          parcela: 'P-24',
          sqm: '5.120 m²',
          price: 'UF 520',
          status: 'Disponible',
          features: ['Vista al volcán', 'Acceso pavimentado', 'Bosque nativo'],
          ctas: [
            { label: 'Ver más fotos', action: 'Ver fotos de P-24' },
            { label: 'Me interesa', action: 'Quiero comprar P-24' },
          ],
        },
      ],
    };
  }

  // 2. PropertyCarousel — keyword: "tour", "opciones", "disponibles"
  if (lower.includes('tour') || lower.includes('opciones') || lower.includes('disponibles')) {
    return {
      reply: `${greet}perfecto. Te muestro las parcelas más solicitadas:`,
      attachments: [
        {
          type: 'property_carousel',
          items: [
            { parcela: 'P-24', sqm: '5.120', price: 'UF 520', tone: 'forest' },
            { parcela: 'P-31', sqm: '5.800', price: 'UF 580', tone: 'meadow' },
            { parcela: 'P-07', sqm: '6.450', price: 'UF 640', tone: 'lake' },
            { parcela: 'P-12', sqm: '5.950', price: 'UF 595', tone: 'volcano' },
          ],
        },
      ],
    };
  }

  // 3. CompareTable — keyword: "comparar", "comparativa"
  if (lower.includes('comparar') || lower.includes('comparativa')) {
    return {
      reply: 'Esta es la comparativa de las 3 parcelas más consultadas:',
      attachments: [
        {
          type: 'compare_table',
          rows: [
            { rol: 'P-07', sqm: '6.450', view: 'Lago', price: 'UF 640' },
            { rol: 'P-24', sqm: '5.120', view: 'Volcán', price: 'UF 520', highlight: true },
            { rol: 'P-31', sqm: '5.800', view: 'Bosque', price: 'UF 580' },
          ],
        },
      ],
    };
  }

  // 4. MapCard — keyword: "mapa", "ubicacion", "dónde"
  if (lower.includes('mapa') || lower.includes('ubicaci') || lower.includes('dónde') || lower.includes('donde')) {
    return {
      reply: 'Estamos sobre la ruta a Las Hortensias, en Colico:',
      attachments: [
        {
          type: 'map_card',
          title: 'Mirador de Villarrica',
          subtitle: 'Colico, Cunco · La Araucanía',
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

  // 5. MortgageSimulator — keyword: "comprar", "precio", "financ", "crédito", "simular"
  if (
    lower.includes('comprar') ||
    lower.includes('precio') ||
    lower.includes('financ') ||
    lower.includes('crédito') ||
    lower.includes('credito') ||
    lower.includes('simular') ||
    lower.includes('cuota')
  ) {
    return {
      reply:
        'Manejamos dos modalidades: **contado** desde $14.490.000 o **crédito directo** desde $17.490.000 (50% pie + 36 cuotas UF). Simula tu cuota:',
      attachments: [
        { type: 'mortgage_simulator', priceUf: 520, defaultDownPct: 50, defaultMonths: 36 },
      ],
    };
  }

  // 6. Brochure — keyword: "brochure", "pdf", "folleto", "información"
  if (
    lower.includes('brochure') ||
    lower.includes('folleto') ||
    lower.includes('pdf') ||
    lower.includes('información') ||
    lower.includes('informacion')
  ) {
    return {
      reply: 'Acá tienes el brochure completo del proyecto:',
      attachments: [
        {
          type: 'brochure_card',
          url: '/brochure-mirador-villarrica.pdf',
          title: 'Brochure · Mirador de Villarrica',
          pages: 24,
          sizeKb: 3400,
        },
      ],
    };
  }

  // 7. Video — keyword: "video", "drone"
  if (lower.includes('video') || lower.includes('drone')) {
    return {
      reply: 'Te muestro el video aéreo del proyecto:',
      attachments: [
        {
          type: 'video_card',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'Tour aéreo · Mirador de Villarrica',
          duration: '2:14',
        },
      ],
    };
  }

  // 8. LeadForm — keyword: "contacto", "llamar", "formulario"
  if (lower.includes('contacto') || lower.includes('llamar') || lower.includes('formulario')) {
    return {
      reply: 'Déjame tus datos y Diego se contacta contigo:',
      attachments: [
        {
          type: 'lead_form',
          prompt: '¿Cuándo te acomoda una llamada?',
          fields: ['nombre', 'whatsapp', 'cuando'],
        },
      ],
    };
  }

  // 9. Handoff — keyword: "asesor", "diego", "humano", "whatsapp"
  if (
    lower.includes('asesor') ||
    lower.includes('diego') ||
    lower.includes('humano') ||
    lower.includes('whatsapp')
  ) {
    return {
      reply: 'Te conecto con Diego, tu asesor directo:',
      attachments: [
        {
          type: 'handoff',
          advisorName: 'Diego Cavagnaro',
          advisorRole: 'Asesor inmobiliario · Terra Segura',
          whatsapp: '+56940329987',
          message:
            'Hola Diego, me interesa una parcela en Mirador de Villarrica. Vengo desde el chat de Lucía.',
        },
      ],
    };
  }

  return {
    reply: `[mock] Recibí: "${userText}". Probá: tarjeta · tour · comparar · mapa · simular · brochure · video · contacto · asesor.`,
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
  const streamTimers = useRef<number[]>([]);

  /**
   * Introduce los mensajes de bienvenida uno por uno con un typing indicator
   * entre medio, simulando que Lucía está escribiendo. Evita que los 3 mensajes
   * aparezcan de golpe y se sienta como un spam de texto.
   *
   * Timeline pausado para que el usuario alcance a leer cada mensaje:
   *   t=0     typing on
   *   t=1200  msg1 + typing off  (→ pausa de lectura 2200ms)
   *   t=3400  typing on
   *   t=4600  msg2 + typing off  (→ pausa de lectura 2200ms)
   *   t=6800  typing on
   *   t=8000  msg3 + typing off → quick replies
   */
  const streamOpeningMessages = useCallback((lead: LeadGateData | null) => {
    // Limpiar cualquier stream anterior en curso
    streamTimers.current.forEach((t) => window.clearTimeout(t));
    streamTimers.current = [];

    const msgs = buildOpeningMessages(lead);
    setMessages([]);
    setIsSending(true);

    const TYPING_MS = 1200;
    const GAP_MS = 2200;

    msgs.forEach((msg, i) => {
      const cycleStart = i * (TYPING_MS + GAP_MS);
      // Show typing before each message (ya está en true para el primero)
      if (i > 0) {
        streamTimers.current.push(
          window.setTimeout(() => setIsSending(true), cycleStart)
        );
      }
      // Add message and hide typing
      streamTimers.current.push(
        window.setTimeout(() => {
          setMessages((prev) => [...prev, msg]);
          setIsSending(false);
        }, cycleStart + TYPING_MS)
      );
    });
  }, []);

  // Cleanup timers si el componente se desmonta en medio del stream
  useEffect(
    () => () => {
      streamTimers.current.forEach((t) => window.clearTimeout(t));
    },
    []
  );

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
        streamOpeningMessages(savedLead);
      }
    }
  }, [streamOpeningMessages]);

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
      streamOpeningMessages(data);
    },
    [sessionId, streamOpeningMessages]
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
    // Cancelar cualquier stream de bienvenida en curso
    streamTimers.current.forEach((t) => window.clearTimeout(t));
    streamTimers.current = [];
    const newId = resetSession();
    setSessionId(newId);
    void ensureSession(newId);
    setLeadData(null);
    setGatePassed(false);
    setMessages([]);
    setIsSending(false);
    setError(null);
    setGateError(null);
    firstMessageSent.current = false;
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* El launcher solo existe cuando el chat está cerrado — al abrir se
          desmonta con fade/scale via AnimatePresence y la ventana del chat
          ocupa su rol. Evita el "botón X flotante" duplicado que confunde. */}
      <AnimatePresence>
        {!isOpen && (
          <ChatLauncher key="launcher" isOpen={false} onClick={() => setIsOpen(true)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && !gatePassed && (
          <GateModal
            key="gate-modal"
            onSubmit={handleGateSubmit}
            onClose={() => setIsOpen(false)}
            error={gateError}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && gatePassed && (
          <ChatWindow
            key="chat-window"
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
