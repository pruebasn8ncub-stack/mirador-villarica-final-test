'use client';

import { useState } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { PROCESO_COMPRA } from '@/data/content';

export function MasterPlan() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <section id="plano" className="bg-crema-200 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-mostaza-500">Distribución</p>
          <h2 className="text-3xl font-bold text-bosque-800 md:text-4xl">Master Plan</h2>
          <p className="mx-auto mt-3 max-w-2xl text-bosque-700">
            74 parcelas distribuidas en 80 hectáreas, con caminos internos estabilizados y
            portón de acceso.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-bosque-100 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-bosque-800/80 px-3 py-2 text-xs text-crema hover:bg-bosque-800"
            aria-label="Ver plano en pantalla completa"
          >
            <Maximize2 className="h-4 w-4" />
            Ampliar
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/master-plan.jpg"
            alt="Master Plan de Mirador de Villarrica — 74 parcelas en 80 hectáreas"
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="mt-16">
          <h3 className="mb-8 text-center text-2xl font-bold text-bosque-800">
            Proceso de compra en 5 pasos
          </h3>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {PROCESO_COMPRA.map((paso) => (
              <li
                key={paso.numero}
                className="rounded-2xl border border-bosque-100 bg-white p-5 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-mostaza-500 text-lg font-bold text-bosque-900">
                  {paso.numero}
                </span>
                <h4 className="mt-3 font-semibold text-bosque-800">{paso.titulo}</h4>
                <p className="mt-1 text-sm text-bosque-700">{paso.descripcion}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 text-white"
            aria-label="Cerrar"
          >
            <X className="h-8 w-8" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/master-plan.jpg"
            alt="Master Plan ampliado"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
