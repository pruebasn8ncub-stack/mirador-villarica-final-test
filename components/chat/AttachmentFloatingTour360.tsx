'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Compass, Loader2 } from 'lucide-react';

interface AttachmentFloatingTour360Props {
  url: string;
  caption?: string;
  poster?: string;
  title?: string;
}

export function AttachmentFloatingTour360({
  url,
  caption,
  title,
}: AttachmentFloatingTour360Props) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const inlinePreview = (
    <motion.button
      type="button"
      onClick={() => setOpen(true)}
      initial={{ opacity: 0, y: 6 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: [
          '0 0 0 0 rgba(251, 240, 217, 0.55)',
          '0 0 0 8px rgba(251, 240, 217, 0)',
          '0 0 0 0 rgba(251, 240, 217, 0)',
        ],
      }}
      transition={{
        opacity: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
        boxShadow: { duration: 1.8, repeat: Infinity, repeatDelay: 0.6, ease: 'easeOut' },
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-bosque-800 px-3.5 py-2.5 text-[12.5px] font-semibold text-crema transition-colors hover:bg-bosque-700"
      aria-label="Abrir tour 360°"
    >
      <Compass className="h-4 w-4" strokeWidth={2.25} />
      Abrir tour 360°
    </motion.button>
  );

  const floating =
    open && mounted
      ? createPortal(
          <AnimatePresence>
            <motion.div
              key="tour360-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              aria-hidden="true"
              className="fixed inset-0 z-[45] bg-bosque-900/40 backdrop-blur-md"
            />
            <motion.div
              key="tour360-floating"
              initial={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 24 : 0, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 24 : 0, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-label="Tour 360° del proyecto"
              aria-modal="false"
              className="fixed z-[60] flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-bosque-900/10
                         inset-0 md:inset-auto md:left-6 md:right-[440px] md:top-6 md:bottom-6 md:rounded-2xl"
            >
              <header className="flex items-center justify-between bg-bosque-800 px-4 py-3 text-crema">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Compass className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-semibold leading-tight">
                      {title ?? 'Tour 360° del proyecto'}
                    </h3>
                    <p className="truncate text-[11px] leading-tight opacity-70">
                      {caption ?? 'Recorre el proyecto desde tu dispositivo'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-bosque-700"
                  aria-label="Cerrar tour 360°"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              </header>

              <div className="relative flex-1 overflow-hidden bg-black">
                {!loaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bosque-900 text-crema">
                    <Loader2 className="h-8 w-8 animate-spin" strokeWidth={2} />
                    <p className="text-[12px] opacity-80">Cargando tour 360°…</p>
                  </div>
                )}
                <iframe
                  src={url}
                  title={title ?? 'Tour 360° Mirador de Villarrica'}
                  onLoad={() => setLoaded(true)}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; xr-spatial-tracking; fullscreen"
                  allowFullScreen
                />
              </div>

              <div className="border-t border-bosque-100 bg-crema px-4 py-2.5">
                <p className="text-[11.5px] leading-snug text-bosque-700">
                  Tip: Arrastra para mirar alrededor. En móvil, moviendo el teléfono también.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      {inlinePreview}
      {floating}
    </>
  );
}
