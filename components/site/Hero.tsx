import { ArrowDown } from 'lucide-react';
import { ChatCta } from './ChatCta';
import { PROYECTO } from '@/data/content';

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate min-h-[100svh] flex items-end overflow-hidden bg-bosque-950"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/assets/banner-volcan.jpg"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center scale-[1.02] motion-safe:animate-[fadeIn_1.2s_ease-out]"
      >
        <source src="/assets/hero-video.mp4" type="video/mp4" />
      </video>

      <div
        className="absolute inset-0 bg-gradient-to-b from-bosque-950/55 via-bosque-950/30 to-bosque-950/85"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(244,168,75,0.10),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 pt-32 sm:pt-40 pb-20 sm:pb-28">
        <div className="max-w-4xl">
          <p className="inline-flex items-center gap-2.5 text-mostaza text-[11px] sm:text-xs font-sans tracking-eyebrow uppercase mb-7 sm:mb-9">
            <span className="size-1.5 rounded-full bg-mostaza animate-pulse-dot" />
            <span>Lago Colico · Región de La Araucanía</span>
          </p>

          <h1 className="font-display text-crema tracking-display leading-[0.95] text-[clamp(2.5rem,7.5vw,6.25rem)] font-light">
            <span className="block">Tu pedazo de sur,</span>
            <span className="block italic font-normal">
              <span className="text-mostaza">entre el volcán</span> y el lago.
            </span>
          </h1>

          <p className="mt-9 sm:mt-11 max-w-2xl text-crema/85 text-lg sm:text-xl leading-[1.55]">
            {PROYECTO.totalParcelas} parcelas desde 5.000 m² en {PROYECTO.superficieTotal}{' '}
            de bosque nativo. SAG aprobado, roles listos, crédito directo desde{' '}
            <span className="text-crema font-medium">{PROYECTO.precioContado}</span>.
          </p>

          <div className="mt-9 sm:mt-12 flex flex-wrap items-center gap-3 sm:gap-4">
            <ChatCta size="lg" variant="primary" intent="general" icon="sparkle">
              Conversa con Lucía
            </ChatCta>
            <a
              href="#proyecto"
              className="group inline-flex items-center gap-2.5 h-14 px-6 text-base font-medium text-crema/90 hover:text-crema rounded-full border border-crema/25 hover:border-crema/50 transition-colors"
            >
              Ver el proyecto
              <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 sm:bottom-8 right-5 sm:right-8 lg:right-12 z-10 hidden md:block">
        <div className="bg-bosque-950/40 backdrop-blur-xl border border-crema/12 rounded-full pl-4 pr-6 py-3 flex items-center gap-4 text-crema text-[11px] sm:text-[12px]">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-mostaza opacity-75 animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-mostaza" />
            </span>
            <span className="tracking-eyebrow uppercase text-crema font-medium">
              Proyecto activo
            </span>
          </span>
          <span className="h-4 w-px bg-crema/20" aria-hidden />
          <span className="text-crema/85 tracking-tight">
            <span className="font-display italic text-crema mr-2">Mirador</span>
            <span className="text-crema/55">·</span>
            <span className="ml-2 tabular-nums">80 ha</span>
            <span className="text-crema/30 mx-1.5">·</span>
            <span className="tabular-nums">94 parcelas</span>
          </span>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 sm:left-12 z-10 hidden sm:flex flex-col items-start gap-2 text-crema/50 md:left-12">
        <span className="text-[10px] tracking-eyebrow uppercase">Scroll</span>
        <div className="relative h-10 w-px bg-crema/15 overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-3 bg-mostaza animate-[scroll-hint_2s_cubic-bezier(0.4,0,0.2,1)_infinite]" />
        </div>
      </div>
    </section>
  );
}
