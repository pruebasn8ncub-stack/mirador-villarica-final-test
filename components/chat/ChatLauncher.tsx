'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LuciaCharacter } from './LuciaCharacter';

interface ChatLauncherProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnread?: boolean;
  /**
   * Si true, muestra la burbuja de mensaje al costado del launcher
   * invitando a abrir el chat. La burbuja se esconde al abrir el chat.
   */
  showBubble?: boolean;
  bubbleDelayMs?: number;
  bubbleMessage?: string;
}

const DEFAULT_BUBBLE =
  '¿Te interesa un sitio en Mirador? Te muestro precios, planos y disponibilidad al instante.';

export function ChatLauncher({
  isOpen,
  onClick,
  hasUnread,
  showBubble = true,
  bubbleDelayMs = 1000,
  bubbleMessage = DEFAULT_BUBBLE,
}: ChatLauncherProps) {
  const [bubbleVisible, setBubbleVisible] = useState(false);

  // La burbuja aparece tras un delay corto y permanece visible hasta que
  // el usuario abra el chat (no es descartable — es el CTA principal).
  useEffect(() => {
    if (!showBubble || isOpen) return;
    const t = setTimeout(() => setBubbleVisible(true), bubbleDelayMs);
    return () => clearTimeout(t);
  }, [showBubble, isOpen, bubbleDelayMs]);

  useEffect(() => {
    if (isOpen) setBubbleVisible(false);
  }, [isOpen]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3 md:bottom-6 md:right-6">
      {/* Burbuja de mensaje lateral — CTA persistente a la izquierda del launcher */}
      <AnimatePresence>
        {bubbleVisible && !isOpen && (
          <motion.button
            type="button"
            onClick={onClick}
            initial={{ opacity: 0, x: 14, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.95, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.1 }}
            className={cn(
              'preview-tail-right group relative max-w-[230px] rounded-2xl bg-white text-left',
              'border border-bosque-100 shadow-preview',
              'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:border-mostaza-300',
              'animate-bubble-float'
            )}
            aria-label="Abrir chat con Lucía, ejecutiva comercial"
          >
            <div className="px-3.5 py-2.5">
              <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-mostaza-500">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
Ejecutiva comercial · Lucía
              </p>
              <p className="mt-1 text-[12.5px] font-medium leading-snug text-bosque-900">
                👋 {bubbleMessage}
              </p>
              <p className="mt-1.5 flex items-center gap-1 text-[10.5px] font-semibold text-bosque-700 transition-colors group-hover:text-mostaza-500">
                <span>Toca para conversar</span>
                <ArrowRight
                  className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                  aria-hidden
                />
              </p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Launcher — wrapper que aplica la animación de atención */}
      <motion.div
        initial={{ scale: 0, rotate: -60, y: 40 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.2 }}
        className="relative"
      >
        {/* Halos concéntricos triples (solo cuando está cerrado).
            Capa 1: pulse-glow (mostaza lento 2.8s)
            Capa 2: pulse-ring (bosque medio 2.4s, desfasado)
            Capa 3: halo-quick (mostaza rápido 1.6s) — capta el ojo periférico */}
        {!isOpen && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-mostaza/40 animate-pulse-glow"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-bosque-600/35 animate-pulse-ring"
              style={{ animationDelay: '0.9s' }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-mostaza/55 animate-halo-quick"
              style={{ animationDelay: '0.3s' }}
            />
          </>
        )}

        {/* Botón principal con animación de atención agresiva (saluda cada 5s).
            Estado cerrado: fondo crema para que la caricatura de Lucía (que tiene fondo cream) fluya sin bordes visibles.
            Estado abierto: gradiente bosque para el icono X. */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat con Lucía, ejecutiva comercial de Mirador de Villarrica'}
          aria-expanded={isOpen}
          className={cn(
            'group relative flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full',
            'shadow-chat-launcher ring-[3px] transition-all duration-300 hover:shadow-xl md:h-24 md:w-24',
            isOpen
              ? 'bg-gradient-launcher text-crema ring-mostaza/40'
              : 'bg-crema text-bosque-800 ring-mostaza/30',
            !isOpen && 'animate-attention-fast'
          )}
          style={{ transformOrigin: 'center center' }}
        >
          {/* Contenido: caricatura Lucía ↔ X */}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.22 }}
                className="flex items-center justify-center"
              >
                <X className="h-7 w-7" strokeWidth={2.6} aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span
                key="lucia"
                initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.22 }}
                className="relative flex h-full w-full items-center justify-center animate-lucia-nod"
                style={{ transformOrigin: '50% 65%' }}
              >
                <LuciaCharacter size={96} className="h-full w-full" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Badge "1 mensaje nuevo" flotante FUERA del botón (evita clip).
            Siempre visible cuando el chat está cerrado — refuerza
            visualmente "tienes un mensaje pendiente". */}
        {!isOpen && (
          <span
            className="pointer-events-none absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white ring-[3px] ring-crema shadow-md animate-badge-pop"
            aria-label="Mensaje nuevo"
          >
            1
          </span>
        )}
      </motion.div>
    </div>
  );
}
