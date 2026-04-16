'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
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
  'Habla con nuestra asesora virtual 24/7 y resuelve todas tus dudas';

export function ChatLauncher({
  isOpen,
  onClick,
  hasUnread,
  showBubble = true,
  bubbleDelayMs = 1800,
  bubbleMessage = DEFAULT_BUBBLE,
}: ChatLauncherProps) {
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  // La burbuja aparece tras un delay corto la primera vez de la sesión y
  // se mantiene hasta que el usuario la cierra o abra el chat.
  useEffect(() => {
    if (!showBubble || isOpen) return;
    if (typeof window === 'undefined') return;

    const DISMISS_KEY = 'mirador-chat-bubble-dismissed';
    if (sessionStorage.getItem(DISMISS_KEY) === '1') {
      setBubbleDismissed(true);
      return;
    }
    const t = setTimeout(() => setBubbleVisible(true), bubbleDelayMs);
    return () => clearTimeout(t);
  }, [showBubble, isOpen, bubbleDelayMs]);

  // Al abrir el chat, esconder la burbuja
  useEffect(() => {
    if (isOpen) setBubbleVisible(false);
  }, [isOpen]);

  const dismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBubbleVisible(false);
    setBubbleDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mirador-chat-bubble-dismissed', '1');
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-end gap-3 md:bottom-6 md:right-6">
      {/* Burbuja de mensaje lateral — a la izquierda del launcher */}
      <AnimatePresence>
        {bubbleVisible && !isOpen && !bubbleDismissed && (
          <motion.button
            type="button"
            onClick={onClick}
            initial={{ opacity: 0, x: 14, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.95, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.1 }}
            className={cn(
              'preview-tail-right relative mb-2 max-w-[260px] rounded-2xl bg-white',
              'border border-bosque-100 px-4 py-3 pr-9 text-left shadow-preview',
              'hover:shadow-lg transition-all hover:-translate-y-0.5',
              'animate-bubble-float'
            )}
            aria-label="Abrir chat con el mensaje de bienvenida"
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-mostaza-500">
              Asesora virtual · Lucía
            </p>
            <p className="mt-1 text-[13.5px] font-medium leading-snug text-bosque-800">
              👋 {bubbleMessage}
            </p>

            {/* Botón cerrar */}
            <span
              role="button"
              tabIndex={0}
              onClick={dismissBubble}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  dismissBubble(e as unknown as React.MouseEvent);
                }
              }}
              className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-bosque-400 hover:bg-bosque-50 hover:text-bosque-700"
              aria-label="Cerrar sugerencia"
            >
              <X className="h-3 w-3" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Launcher — wrapper que aplica la animación de atención */}
      <motion.div
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.25 }}
        className="relative"
      >
        {/* Halo concéntrico doble (solo cuando está cerrado) */}
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
          </>
        )}

        {/* Botón principal con animación de atención.
            Estado cerrado: fondo crema para que la caricatura de Lucía (que tiene fondo cream) fluya sin bordes visibles.
            Estado abierto: gradiente bosque para el icono X. */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onClick}
          aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat con Lucía, asesora virtual de Mirador de Villarrica'}
          aria-expanded={isOpen}
          className={cn(
            'group relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full',
            'shadow-chat-launcher ring-2 transition-all duration-300 hover:shadow-xl md:h-20 md:w-20',
            isOpen
              ? 'bg-gradient-launcher text-crema ring-mostaza/40'
              : 'bg-crema text-bosque-800 ring-bosque-800/15',
            !isOpen && 'animate-launcher-attention'
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
                className="relative flex h-full w-full items-center justify-center"
              >
                <LuciaCharacter size={80} className="h-full w-full" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Dot online + badge flotantes FUERA del botón (evita clip) */}
        {!isOpen && (
          <>
            <span
              className="pointer-events-none absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-crema bg-emerald-400 shadow"
              aria-label="En línea"
            >
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-white/80" />
            </span>
            {hasUnread && (
              <span
                className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-mostaza text-[10px] font-bold text-bosque-900 ring-2 ring-crema shadow"
                aria-label="Mensaje nuevo"
              >
                1
              </span>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
