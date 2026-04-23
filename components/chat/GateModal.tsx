'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { LeadGateData } from '@/lib/chat/types';
import { AssistantAvatar } from './AssistantAvatar';
import { GateForm } from './GateForm';

interface GateModalProps {
  onSubmit: (data: LeadGateData) => Promise<void> | void;
  onClose: () => void;
  error?: string | null;
}

export function GateModal({ onSubmit, onClose, error }: GateModalProps) {
  // ESC cierra + bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-modal-title"
    >
      {/* Backdrop difuminado — click para cerrar */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar formulario"
        className="absolute inset-0 h-full w-full cursor-default bg-bosque-900/50 backdrop-blur-md"
      />

      {/* Card central */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex max-h-[92svh] w-full max-w-[440px] flex-col overflow-hidden rounded-[28px] bg-crema shadow-[0_40px_80px_-20px_rgba(0,0,0,0.45),0_20px_40px_-12px_rgba(26,61,46,0.35),0_0_0_1px_rgba(26,61,46,0.08)] ring-1 ring-white/40"
      >
        {/* Halo ambient dorado — detalle luxury que separa del fondo */}
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[28px] bg-gradient-to-b from-mostaza/[0.04] via-transparent to-transparent"
        />
        {/* Header idéntico al de ChatWindow — avatar de Lucía + estado online */}
        <header className="chat-header-glass flex items-center justify-between gap-3 px-4 pb-3 pt-3 text-crema md:pt-4">
          <div className="flex min-w-0 items-center gap-3">
            <AssistantAvatar size="lg" photo className="ring-2 ring-crema/20" />
            <div className="min-w-0">
              <h2 id="gate-modal-title" className="truncate text-[15px] font-semibold leading-tight">
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
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-2 text-crema/80 transition-colors hover:bg-white/10 hover:text-crema"
            aria-label="Cerrar"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </header>

        <GateForm onSubmit={onSubmit} error={error} />
      </motion.div>
    </motion.div>
  );
}
