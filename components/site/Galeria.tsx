'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import { GALERIA } from '@/data/content';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const PATTERN = [
  'col-span-2 row-span-2', '', '', '', 'col-span-2', '', '', '', 'row-span-2',
];

export function Galeria() {
  const [index, setIndex] = useState<number>(-1);

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
            agrandar, hacer zoom o navegar con las flechas.
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
              onClick={() => setIndex(i)}
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

      <Lightbox
        index={index}
        open={index >= 0}
        close={() => setIndex(-1)}
        slides={GALERIA.map((g) => ({
          src: g.src,
          alt: g.alt,
          description: g.alt,
        }))}
        plugins={[Captions, Zoom, Counter]}
        captions={{ descriptionTextAlign: 'center', descriptionMaxLines: 2 }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
        counter={{ container: { style: { top: 'unset', bottom: 0 } } }}
        controller={{ closeOnBackdropClick: true }}
        styles={{
          container: { backgroundColor: 'rgba(7, 20, 16, 0.95)' },
          slide: { padding: '24px' },
        }}
        animation={{ swipe: 240, fade: 220 }}
      />
    </section>
  );
}
