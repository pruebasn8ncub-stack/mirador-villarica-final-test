'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GALERIA } from '@/data/content';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

// Patrón asimétrico tipo masonry (col-span / row-span repetidos cada 9)
const PATTERN = [
  'col-span-2 row-span-2', '', '', '', 'col-span-2', '', '', '', 'row-span-2',
];

export function Galeria() {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? null : (i + GALERIA.length - 1) % GALERIA.length));
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? null : (i + 1) % GALERIA.length));
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <section
      id="galeria"
      className="relative bg-crema py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
        >
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza-500">
              Galería
            </p>
            <h2 className="font-display text-4xl font-light leading-[1.05] tracking-display text-bosque-900 md:text-5xl lg:text-6xl">
              Lo que <span className="italic text-bosque-700">verás</span> al llegar
            </h2>
          </div>
          <p className="max-w-md text-[14.5px] leading-relaxed text-bosque-700/80">
            Bosque nativo, vista al volcán, lago Colico a 20 minutos. Toca cualquier foto para
            agrandarla.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 sm:grid-cols-3 md:auto-rows-[220px] md:gap-4 lg:grid-cols-4"
        >
          {GALERIA.map((g, i) => (
            <motion.button
              key={g.src}
              variants={fadeUp}
              onClick={() => setOpen(i)}
              type="button"
              className={`group relative overflow-hidden rounded-2xl shadow-card transition hover:-translate-y-1 hover:shadow-card-hover ${PATTERN[i % PATTERN.length]}`}
              aria-label={`Ampliar imagen ${i + 1}: ${g.alt}`}
            >
              <Image
                src={g.src}
                alt={g.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition duration-700 group-hover:scale-[1.06]"
                priority={i < 3}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bosque-950/55 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-eyebrow text-bosque-800 opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100">
                Ampliar
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-bosque-950/92 backdrop-blur-sm"
          >
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(null); }}
              aria-label="Cerrar galería"
              className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-crema/20 text-crema/85 transition hover:bg-crema/10"
            >
              <X className="h-5 w-5" strokeWidth={2.4} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? null : (i + GALERIA.length - 1) % GALERIA.length)); }}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-crema/20 text-crema/85 transition hover:bg-crema/10 md:left-8 md:h-14 md:w-14"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={2.4} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? null : (i + 1) % GALERIA.length)); }}
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-crema/20 text-crema/85 transition hover:bg-crema/10 md:right-8 md:h-14 md:w-14"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={2.4} />
            </button>

            <motion.div
              key={open}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[80vh] w-[88vw] max-w-6xl"
            >
              <Image
                src={GALERIA[open].src}
                alt={GALERIA[open].alt}
                fill
                sizes="88vw"
                priority
                className="object-contain"
              />
              <p className="absolute -bottom-9 left-0 right-0 text-center text-[12.5px] text-crema/75">
                {GALERIA[open].alt} · {open + 1} / {GALERIA.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
