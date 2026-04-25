'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Play, Maximize2 } from 'lucide-react';
import { PROYECTO } from '@/data/content';

export function Tour360() {
  const [active, setActive] = useState(false);

  return (
    <section
      id="tour-360"
      className="relative bg-bosque-950 py-24 text-crema md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza">
            Recorre antes de viajar
          </p>
          <h2 className="font-display text-4xl font-light leading-[1.1] tracking-display text-crema md:text-5xl lg:text-6xl">
            Vive el proyecto en <span className="italic text-mostaza-300">tour 360°</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-crema/75">
            Camina por los senderos internos, mira el bosque desde adentro y ve dónde queda cada
            parcela — sin moverte de tu casa. Lo más cerca que vas a estar de Mirador hasta tu
            visita en terreno.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto mt-14 aspect-video w-full max-w-6xl overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-crema/10"
        >
          {!active ? (
            <button
              type="button"
              onClick={() => setActive(true)}
              className="group relative block h-full w-full"
              aria-label="Cargar tour 360° del proyecto"
            >
              <Image
                src="/assets/banner-volcan.jpg"
                alt="Vista previa del tour 360 — Mirador de Villarrica"
                fill
                sizes="(min-width: 1024px) 1100px, 100vw"
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-bosque-950/70 via-bosque-950/30 to-transparent" />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-mostaza/95 text-bosque-900 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-mostaza md:h-24 md:w-24">
                  <Play className="h-9 w-9 translate-x-0.5" strokeWidth={2.4} fill="currentColor" />
                </span>
                <p className="font-display text-2xl tracking-display text-crema md:text-3xl">
                  Iniciar Tour 360°
                </p>
                <p className="text-[12px] uppercase tracking-eyebrow text-crema/65">
                  Explora 12 puntos de vista · Sin instalar nada
                </p>
              </div>

              <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-bosque-950/55 px-3 py-1.5 text-[11px] font-semibold text-crema backdrop-blur-sm">
                <Maximize2 className="h-3 w-3" strokeWidth={2.4} />
                Pantalla completa disponible
              </div>
            </button>
          ) : (
            <iframe
              src={PROYECTO.tour360Url}
              title="Tour 360° Mirador de Villarrica"
              loading="lazy"
              allowFullScreen
              allow="accelerometer; gyroscope; magnetometer; vr; xr-spatial-tracking"
              className="h-full w-full border-0"
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}
