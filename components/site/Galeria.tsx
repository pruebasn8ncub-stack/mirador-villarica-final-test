'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GALERIA } from '@/data/content';

export function Galeria() {
  const [active, setActive] = useState<number | null>(null);

  const prev = () =>
    setActive((i) => (i === null ? null : (i - 1 + GALERIA.length) % GALERIA.length));
  const next = () => setActive((i) => (i === null ? null : (i + 1) % GALERIA.length));

  return (
    <section id="galeria" className="bg-crema-200 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-mostaza-500">Galería</p>
          <h2 className="text-3xl font-bold text-bosque-800 md:text-4xl">El entorno</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {GALERIA.map((img, idx) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setActive(idx)}
              className="aspect-[4/3] overflow-hidden rounded-lg bg-bosque-100 hover:opacity-90"
              aria-label={`Ver imagen: ${img.alt}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 text-white"
            aria-label="Cerrar"
          >
            <X className="h-8 w-8" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 text-white"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 text-white"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-10 w-10" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GALERIA[active].src}
            alt={GALERIA[active].alt}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
