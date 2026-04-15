import { PROYECTO } from '@/data/content';

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-[600px] overflow-hidden bg-bosque-900 text-crema"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/banner-volcan.jpg"
        alt="Vista aérea de Mirador de Villarrica con el Volcán Villarrica al fondo"
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bosque-900/40 via-bosque-900/60 to-bosque-900/90" />

      <div className="relative mx-auto flex min-h-[600px] max-w-6xl flex-col items-start justify-end px-4 pb-16 pt-32 md:px-6 md:pb-24 md:pt-40">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-mostaza">
          Terra Segura · Colico, Araucanía
        </p>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
          Tu parcela entre el volcán y el lago.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-crema-100/90">
          {PROYECTO.totalParcelas} parcelas desde 5.000 m² en {PROYECTO.ubicacion}. SAG aprobado,
          roles listos, caminos estabilizados.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#cotizar"
            className="rounded-full bg-mostaza px-6 py-3 font-semibold text-bosque-900 shadow-lg hover:bg-mostaza-400"
          >
            Cotizar desde {PROYECTO.precioContado}
          </a>
          <a
            href="#tour"
            className="rounded-full border border-crema/40 px-6 py-3 font-medium text-crema hover:bg-white/10"
          >
            Tour 360°
          </a>
        </div>
      </div>
    </section>
  );
}
