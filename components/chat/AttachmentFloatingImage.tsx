'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Map, ZoomIn, ZoomOut } from 'lucide-react';

interface AttachmentFloatingImageProps {
  url: string;
  caption?: string;
  title?: string;
}

export function AttachmentFloatingImage({ url, caption, title }: AttachmentFloatingImageProps) {
  const [open, setOpen] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const heading = title ?? 'Master Plan';

  const floatingWindow = open && mounted
    ? createPortal(
        <AnimatePresence>
          <motion.div
            key="floating-image"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label={heading}
            aria-modal="false"
            className="fixed z-[60] flex flex-col overflow-hidden rounded-2xl border border-bosque-100 bg-white shadow-2xl
                       inset-0 md:inset-auto md:bottom-24 md:right-[420px] md:h-[520px] md:w-[460px]"
          >
            <header className="flex items-center justify-between border-b border-bosque-100 bg-bosque-800 px-4 py-3 text-crema">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{heading}</h3>
                {caption && <p className="truncate text-xs opacity-80">{caption}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoomed((z) => !z)}
                  className="rounded-full p-1.5 hover:bg-bosque-700"
                  aria-label={zoomed ? 'Ajustar a pantalla' : 'Acercar'}
                >
                  {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1.5 hover:bg-bosque-700"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className={`relative flex-1 bg-black ${zoomed ? 'overflow-auto' : 'overflow-hidden'}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={heading}
                className={zoomed ? 'max-w-none' : 'h-full w-full object-contain'}
                style={zoomed ? { width: '200%', height: 'auto' } : undefined}
              />
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-bosque-200 bg-crema px-3 py-1.5 text-xs font-medium text-bosque-800 hover:bg-bosque-50"
        aria-label="Abrir master plan"
      >
        <Map className="h-3.5 w-3.5" />
        {open ? 'Master plan abierto' : 'Ver master plan'}
      </button>
      {floatingWindow}
    </>
  );
}
