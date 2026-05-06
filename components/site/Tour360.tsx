'use client';

import { useState } from 'react';
import { Compass, Loader2, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import { PROYECTO } from '@/data/content';
import { ChatCta } from './ChatCta';

export function Tour360() {
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <section id="tour" className="relative py-24 sm:py-32 lg:py-40 bg-bosque-950 text-crema">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-[11px] tracking-eyebrow uppercase text-mostaza mb-5">
              <Compass className="size-3.5" /> Tour 360°
            </p>
            <h2 className="font-display text-crema tracking-display leading-[1.05] text-[clamp(2rem,4.5vw,3.75rem)] font-light">
              Camina el proyecto
              <br />
              <span className="italic">desde tu casa</span>.
            </h2>
          </div>
          <p className="max-w-sm text-crema/70 text-[15px] leading-relaxed">
            Recorrido inmersivo con todas las parcelas marcadas: rojo vendidas, azul
            reservadas, blanco disponibles.
          </p>
        </div>

        <div className="relative aspect-video rounded-3xl overflow-hidden border border-crema/10 bg-bosque-900/40">
          {!active ? (
            <button
              type="button"
              onClick={() => setActive(true)}
              className="group absolute inset-0 w-full h-full"
              aria-label="Iniciar tour 360°"
            >
              <Image
                src="/assets/galeria5-atardecer.jpg"
                alt="Vista previa del tour 360°"
                fill
                sizes="100vw"
                className="object-cover opacity-65 group-hover:opacity-80 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bosque-950/80 via-bosque-950/40 to-transparent" aria-hidden />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-crema">
                <span className="size-20 sm:size-24 rounded-full bg-mostaza/15 backdrop-blur-md border border-mostaza/30 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:bg-mostaza/25">
                  <PlayCircle className="size-10 text-mostaza" strokeWidth={1.5} />
                </span>
                <span className="text-[11px] tracking-eyebrow uppercase text-crema/75">
                  Iniciar recorrido
                </span>
              </div>
            </button>
          ) : (
            <>
              {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-crema/70">
                    <Loader2 className="size-6 animate-spin text-mostaza" />
                    <span className="text-xs tracking-eyebrow uppercase">
                      Cargando tour 360°
                    </span>
                  </div>
                </div>
              )}
              <iframe
                src={PROYECTO.tour360Url}
                title="Tour 360° Mirador de Villarrica"
                className="absolute inset-0 w-full h-full"
                allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
                onLoad={() => setLoaded(true)}
              />
            </>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-crema/55 text-sm max-w-md">
            Si no encuentras tu vista favorita, pídele a Lucía que te guíe hacia la zona
            que te interesa.
          </p>
          <ChatCta
            size="md"
            variant="primary"
            prefill="Quiero hacer un tour 360° del proyecto."
          >
            Recórrelo con Lucía
          </ChatCta>
        </div>
      </div>
    </section>
  );
}
