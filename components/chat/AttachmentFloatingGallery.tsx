'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';

interface AttachmentFloatingGalleryProps {
  images: { url: string; alt?: string }[];
  caption?: string;
}

export function AttachmentFloatingGallery({ images, caption }: AttachmentFloatingGalleryProps) {
  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (images.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  const current = images[index];

  const floatingWindow = open && mounted
    ? createPortal(
        <AnimatePresence>
          <motion.div
            key="floating-gallery"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Galería del proyecto"
            aria-modal="false"
            className="fixed z-[60] flex flex-col overflow-hidden rounded-2xl border border-bosque-100 bg-white shadow-2xl
                       inset-0 md:inset-auto md:bottom-24 md:right-[420px] md:h-[480px] md:w-[400px]"
          >
            <header className="flex items-center justify-between border-b border-bosque-100 bg-bosque-800 px-4 py-3 text-crema">
              <div>
                <h3 className="text-sm font-semibold">Galería del proyecto</h3>
                <p className="text-xs opacity-80">
                  {caption ?? `${images.length} fotos del entorno`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 hover:bg-bosque-700"
                aria-label="Cerrar galería"
              >
                <X className="h-5 w-5" />
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
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                {index + 1}/{images.length}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 border-t border-bosque-100 bg-crema py-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-6 bg-bosque-800' : 'w-1.5 bg-bosque-300 hover:bg-bosque-400'
                  }`}
                  aria-label={`Ir a imagen ${i + 1}`}
                />
              ))}
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
        aria-label="Abrir galería"
      >
        <Images className="h-3.5 w-3.5" />
        {open ? 'Galería abierta' : 'Ver galería'}
      </button>
      {floatingWindow}
    </>
  );
}
