'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssistantAvatar } from './AssistantAvatar';

interface ChatLauncherProps {
  isOpen: boolean;
  onClick: () => void;
  hasUnread?: boolean;
  /**
   * Si true, muestra una burbuja de preview después de unos segundos
   * para invitar al usuario a abrir el chat.
   */
  showPreview?: boolean;
  previewDelayMs?: number;
  previewMessage?: string;
}

const DEFAULT_PREVIEW = '👋 ¿Te ayudo con Mirador de Villarrica?';

export function ChatLauncher({
  isOpen,
  onClick,
  hasUnread,
  showPreview = true,
  previewDelayMs = 3500,
  previewMessage = DEFAULT_PREVIEW,
}: ChatLauncherProps) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDismissed, setPreviewDismissed] = useState(false);

  // Muestra preview una sola vez por sesión (sessionStorage)
  useEffect(() => {
    if (!showPreview || isOpen) return;
    if (typeof window === 'undefined') return;

    const KEY = 'mirador-chat-preview-seen';
    if (sessionStorage.getItem(KEY) === '1') {
      setPreviewDismissed(true);
      return;
    }
    const t = setTimeout(() => {
      setPreviewVisible(true);
      sessionStorage.setItem(KEY, '1');
    }, previewDelayMs);
    return () => clearTimeout(t);
  }, [showPreview, isOpen, previewDelayMs]);

  // Esconde preview si abren el chat
  useEffect(() => {
    if (isOpen) setPreviewVisible(false);
  }, [isOpen]);

  const dismissPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewVisible(false);
    setPreviewDismissed(true);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {/* Preview bubble */}
      <AnimatePresence>
        {previewVisible && !isOpen && !previewDismissed && (
          <motion.button
            type="button"
            onClick={onClick}
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className={cn(
              'preview-tail relative max-w-[260px] rounded-2xl rounded-br-md bg-white',
              'border border-bosque-100 px-4 py-3 pr-8 text-left shadow-preview',
              'hover:shadow-lg transition-shadow'
            )}
            aria-label="Abrir chat con el mensaje de bienvenida"
          >
            <div className="flex items-start gap-2.5">
              <AssistantAvatar size="xs" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-bosque-500">
                  Lucía · Mirador
                </p>
                <p className="mt-0.5 text-sm leading-snug text-bosque-800">
                  {previewMessage}
                </p>
              </div>
            </div>
            <span
              role="button"
              tabIndex={0}
              onClick={dismissPreview}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  dismissPreview(e as unknown as React.MouseEvent);
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

      {/* Botón launcher */}
      <motion.button
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.4 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onClick}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat de Mirador de Villarrica'}
        aria-expanded={isOpen}
        className={cn(
          'group relative flex h-14 w-14 items-center justify-center overflow-visible rounded-full',
          'bg-gradient-launcher text-crema shadow-chat-launcher',
          'transition-all duration-300 hover:shadow-xl md:h-16 md:w-16'
        )}
      >
        {/* Pulse ring — solo cuando está cerrado y sin preview activo */}
        {!isOpen && !previewVisible && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-bosque-600 animate-pulse-ring"
          />
        )}

        {/* Contenido: avatar o X */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="avatar"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <AssistantAvatar size="md" className="ring-2 ring-crema/20" />
              {hasUnread && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-mostaza ring-2 ring-bosque-800"
                  aria-label="Mensaje nuevo"
                >
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-white" />
                </span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
