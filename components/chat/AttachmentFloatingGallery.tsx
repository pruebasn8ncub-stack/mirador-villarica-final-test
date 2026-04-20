'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Images, Maximize2 } from 'lucide-react';

interface AttachmentFloatingGalleryProps {
  images: { url: string; alt?: string }[];
  caption?: string;
}

export function AttachmentFloatingGallery({ images, caption }: AttachmentFloatingGalleryProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

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
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, images.length]);

  if (images.length === 0) return null;

  const current = images[index];
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  const inlinePreview = (
    <div className="mt-2 flex flex-col gap-2 overflow-hidden rounded-xl border border-bosque-100 bg-white p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-1.5">
        {images.slice(0, 3).map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            className="aspect-[4/3] overflow-hidden rounded-lg bg-black"
            aria-label={`Abrir foto ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt ?? ''} className="h-full w-full object-cover" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setIndex(3);
            setOpen(true);
          }}
          className="relative aspect-[4/3] overflow-hidden rounded-lg bg-black"
          aria-label={`Ver las ${images.length} fotos`}
        >
          {images[3] && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={images[3].url} alt="" className="h-full w-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-bosque-900/50 text-crema">
            <span className="text-base font-semibold">+{images.length - 3} más</span>
          </div>
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-bosque-800 px-3 py-2 text-[12px] font-semibold text-crema transition-colors hover:bg-bosque-700"
      >
        <Maximize2 className="h-3.5 w-3.5" strokeWidth={2.5} />
        {isMobile ? `Ver ${images.length} fotos a pantalla completa` : `Abrir galería al costado`}
      </button>
    </div>
  );

  const floating =
    open && mounted
      ? createPortal(
          <AnimatePresence>
            <motion.div
              key="gallery-floating"
              initial={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 24 : 0, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 24 : 0, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-label="Galería del proyecto"
              aria-modal="false"
              className="fixed z-[60] flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-bosque-900/10
                         inset-0 md:inset-auto md:bottom-6 md:right-[440px] md:h-[calc(100vh-3rem)] md:max-h-[780px] md:w-[500px] md:rounded-2xl"
            >
              <header className="flex items-center justify-between bg-bosque-800 px-4 py-3 text-crema">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Images className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-semibold leading-tight">
                      Galería del proyecto
                    </h3>
                    <p className="truncate text-[11px] leading-tight opacity-70">
                      {caption ?? `${images.length} fotos · Mirador de Villarrica`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-bosque-700"
                  aria-label="Cerrar galería"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              </header>

              <div className="relative flex-1 overflow-hidden bg-black">
                <AnimatePresence mode="wait">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <motion.img
                    key={current.url}
                    src={current.url}
                    alt={current.alt ?? `Foto ${index + 1} de ${images.length}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="h-full w-full object-cover"
                  />
                </AnimatePresence>

                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  {index + 1} / {images.length}
                </span>
              </div>

              <div
                className="flex gap-1.5 overflow-x-auto border-t border-bosque-100 bg-crema px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                      i === index
                        ? 'border-bosque-800 opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`Ir a imagen ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>

              {current.alt && (
                <div className="border-t border-bosque-100 bg-white px-4 py-2.5">
                  <p className="text-[12px] leading-snug text-bosque-700">{current.alt}</p>
                </div>
              )}
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
