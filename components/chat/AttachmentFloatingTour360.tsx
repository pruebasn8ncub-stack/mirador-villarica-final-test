'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Compass, Maximize2, Loader2 } from 'lucide-react';

interface AttachmentFloatingTour360Props {
  url: string;
  caption?: string;
  poster?: string;
  title?: string;
}

export function AttachmentFloatingTour360({
  url,
  caption,
  poster,
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
    <div className="mt-2 flex flex-col gap-2 overflow-hidden rounded-xl border border-bosque-100 bg-white p-2 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative aspect-[16/10] overflow-hidden rounded-lg bg-black"
        aria-label="Abrir tour 360°"
      >
        {poster && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={poster}
            alt={title ?? 'Tour 360° del proyecto'}
            className="h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-bosque-900/30 via-bosque-900/50 to-bosque-900/70 text-crema">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-2 ring-crema/80 backdrop-blur-sm transition-transform group-hover:scale-110">
            <Compass className="h-7 w-7" strokeWidth={2} />
          </div>
          <span className="rounded-full bg-bosque-900/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur-sm">
            Tour 360°
          </span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-bosque-800 px-3 py-2 text-[12px] font-semibold text-crema transition-colors hover:bg-bosque-700"
      >
        <Maximize2 className="h-3.5 w-3.5" strokeWidth={2.5} />
        {isMobile ? 'Abrir tour 360° a pantalla completa' : 'Abrir tour 360° al costado'}
      </button>
    </div>
  );

  const floating =
    open && mounted
      ? createPortal(
          <AnimatePresence>
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
                         inset-0 md:inset-auto md:bottom-6 md:right-[440px] md:h-[calc(100vh-3rem)] md:max-h-[780px] md:w-[500px] md:rounded-2xl"
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
