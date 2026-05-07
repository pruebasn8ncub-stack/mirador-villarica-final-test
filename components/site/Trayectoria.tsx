'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Compass,
  GraduationCap,
  MapPin,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import {
  PROYECTOS_TERRA_SEGURA,
  TERRA_SEGURA,
} from '@/data/content';
import { Reveal } from './Reveal';
import { cn } from '@/lib/utils';

const PILLAR_ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Compass,
  GraduationCap,
};

const ESTADO_STYLES: Record<
  (typeof PROYECTOS_TERRA_SEGURA)[number]['estado'],
  string
> = {
  'Este proyecto': 'bg-mostaza text-bosque-950 border-mostaza',
  'En venta': 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  Nuevo: 'bg-mostaza-50 text-mostaza-500 border-mostaza-200/70',
  Próximamente: 'bg-bosque-50 text-bosque-800 border-bosque-200/60',
};

const REGIONES_UNICAS = Array.from(
  new Set(PROYECTOS_TERRA_SEGURA.map((p) => p.region))
).length;

export function Trayectoria() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-proyecto-card]');
    const step = card
      ? card.getBoundingClientRect().width + 24
      : el.clientWidth * 0.85;
    el.scrollBy({ left: step * dir, behavior: 'smooth' });
  };

  return (
    <section
      id="trayectoria"
      className="relative bg-crema-100 py-24 sm:py-32 lg:py-40 overflow-hidden"
    >
      <div className="absolute inset-0 chat-dotgrid opacity-[0.03]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-16 sm:mb-20">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2.5 text-[11px] tracking-eyebrow uppercase text-bosque-700/80 mb-6">
              <span className="size-1.5 rounded-full bg-mostaza" />
              Sobre Terra Segura · Inmobiliaria gestora
            </p>
            <h2 className="font-display text-bosque-900 tracking-display leading-[1.02] text-[clamp(2.25rem,5vw,4.25rem)] font-light">
              Mirador es uno de los proyectos de{' '}
              <span className="italic text-mostaza">Terra Segura</span>.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pt-3 space-y-7">
            <a
              href={TERRA_SEGURA.sitio}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Terra Segura Inmobiliaria — Sitio oficial"
              className="group block transition-opacity hover:opacity-80"
            >
              <span className="block text-[10px] tracking-eyebrow uppercase text-bosque-700/55 mb-2.5">
                Inmobiliaria gestora
              </span>
              <Image
                src="/assets/terra-segura-logo.png"
                alt="Terra Segura Inmobiliaria"
                width={400}
                height={83}
                className="h-8 sm:h-9 w-auto object-contain invert opacity-85"
              />
              <span className="block mt-4 h-px w-16 bg-bosque-900/15" aria-hidden />
            </a>
            <p className="text-bosque-900/75 text-base sm:text-lg leading-relaxed">
              Terra Segura Inmobiliaria desarrolla parcelaciones de inversión
              en Chile, desde Aysén hasta Valparaíso. Propone terrenos con
              respaldo legal, infraestructura real y acompañamiento en cada
              etapa: la misma fórmula que aplica en Mirador de Villarrica.
            </p>
            <a
              href={TERRA_SEGURA.sitio}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-medium text-bosque-900 hover:text-mostaza-500 transition-colors"
            >
              <ShieldCheck className="size-4" aria-hidden />
              Conoce más en terrasegura.cl
              <ArrowUpRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </a>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-px bg-bosque-900/8 border border-bosque-900/8 rounded-3xl overflow-hidden mb-16 sm:mb-20">
          {TERRA_SEGURA.pilares.map((p, i) => {
            const Icon = PILLAR_ICONS[p.icon] ?? ShieldCheck;
            return (
              <Reveal key={p.titulo} delay={i * 0.06} className="contents">
                <article className="group relative bg-crema p-7 sm:p-9 transition-colors duration-300 hover:bg-crema-200">
                  <div className="size-12 rounded-2xl bg-bosque-900/5 border border-bosque-900/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-mostaza group-hover:border-mostaza-400 group-hover:rotate-[-4deg]">
                    <Icon
                      className="size-5 text-bosque-900 transition-transform duration-300 group-hover:scale-110"
                      aria-hidden
                    />
                  </div>
                  <h3 className="font-display text-bosque-900 text-xl sm:text-2xl tracking-display leading-tight font-normal mb-2">
                    {p.titulo}
                  </h3>
                  <p className="text-bosque-900/70 text-[14.5px] leading-relaxed">
                    {p.detalle}
                  </p>
                  <span className="absolute top-5 right-6 font-display italic text-bosque-900/15 text-sm tabular-nums">
                    0{i + 1}
                  </span>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 mb-9 sm:mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-2.5 text-[11px] tracking-eyebrow uppercase text-bosque-700/80 mb-4">
              <span className="size-1.5 rounded-full bg-mostaza" />
              Otros proyectos
            </p>
            <h3 className="font-display text-bosque-900 tracking-display leading-[1.05] text-[clamp(1.5rem,3vw,2.25rem)] font-light max-w-xl">
              Una cartera viva en {REGIONES_UNICAS} regiones de Chile.
            </h3>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollLeft}
              aria-label="Proyecto anterior"
              className={cn(
                'inline-flex items-center justify-center size-11 rounded-full border transition-all',
                canScrollLeft
                  ? 'border-bosque-900/15 text-bosque-900 hover:bg-bosque-900 hover:text-crema hover:border-bosque-900'
                  : 'border-bosque-900/8 text-bosque-900/30 cursor-not-allowed'
              )}
            >
              <ArrowLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canScrollRight}
              aria-label="Siguiente proyecto"
              className={cn(
                'inline-flex items-center justify-center size-11 rounded-full border transition-all',
                canScrollRight
                  ? 'border-bosque-900/15 text-bosque-900 hover:bg-bosque-900 hover:text-crema hover:border-bosque-900'
                  : 'border-bosque-900/8 text-bosque-900/30 cursor-not-allowed'
              )}
            >
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-20 bg-gradient-to-r from-crema-100 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-20 bg-gradient-to-l from-crema-100 to-transparent" />

          <div
            ref={trackRef}
            className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 px-5 sm:px-12 lg:px-[max(3rem,calc((100vw-80rem)/2+3rem))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {PROYECTOS_TERRA_SEGURA.map((p, i) => {
              const isCurrent = p.estado === 'Este proyecto';
              const isExternal = p.href.startsWith('http');
              return (
                <Reveal
                  key={p.slug}
                  delay={i * 0.05}
                  className="snap-start shrink-0 w-[78vw] sm:w-[58vw] md:w-[44vw] lg:w-[34vw] xl:w-[30vw] max-w-[420px]"
                >
                  <a
                    data-proyecto-card
                    href={p.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    aria-label={`${p.nombre} — ${p.comuna}, ${p.region}`}
                    aria-current={isCurrent ? 'true' : undefined}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-crema border border-bosque-900/8 shadow-[0_8px_24px_-12px_rgba(26,61,46,0.16)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_56px_-18px_rgba(26,61,46,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-mostaza/70 focus-visible:ring-offset-4 focus-visible:ring-offset-crema-100"
                  >
                    <div className="relative aspect-[5/4] overflow-hidden">
                      <Image
                        src={p.image}
                        alt={`${p.nombre} — ${p.comuna}, ${p.region}`}
                        fill
                        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 44vw, 32vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bosque-950/60 via-bosque-950/10 to-transparent" />

                      <span
                        className={cn(
                          'absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10.5px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md',
                          ESTADO_STYLES[p.estado]
                        )}
                      >
                        {!isCurrent && (
                          <span className="size-1.5 rounded-full bg-current opacity-80" />
                        )}
                        {p.estado}
                      </span>

                      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-crema/90 text-[11px] tracking-eyebrow uppercase">
                        <MapPin className="size-3.5 text-mostaza" aria-hidden />
                        <span>
                          {p.comuna} · {p.region}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 p-6 sm:p-7">
                      <h4 className="font-display text-bosque-900 text-2xl sm:text-[1.65rem] tracking-display leading-tight font-normal mb-3">
                        {p.nombre}
                      </h4>
                      <p className="text-bosque-900/70 text-[14.5px] leading-relaxed flex-1 mb-6">
                        {p.descripcion}
                      </p>
                      <div className="flex items-end justify-between gap-4 pt-5 border-t border-bosque-900/8">
                        <div>
                          <p className="text-[10.5px] tracking-eyebrow uppercase text-bosque-700/65">
                            Desde
                          </p>
                          <p className="font-display text-bosque-900 text-xl tabular-nums leading-tight mt-0.5">
                            {p.precioDesde}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-bosque-900 group-hover:text-mostaza-500 transition-colors">
                          {isCurrent ? 'Estás aquí' : 'Ver proyecto'}
                          {!isCurrent && (
                            <ArrowUpRight
                              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              aria-hidden
                            />
                          )}
                        </span>
                      </div>
                    </div>

                    <span className="absolute top-5 right-6 font-display italic text-crema/80 text-sm tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </a>
                </Reveal>
              );
            })}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 mt-10 sm:mt-12 flex flex-wrap items-center justify-between gap-4">
          <p className="text-bosque-900/60 text-[13px] tracking-tight">
            Desliza para ver todos los proyectos · {PROYECTOS_TERRA_SEGURA.length} en
            cartera
          </p>
          <a
            href={TERRA_SEGURA.sitio}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm font-medium text-bosque-900 hover:text-mostaza-500 transition-colors"
          >
            Ver toda la cartera
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </a>
        </div>
      </div>
    </section>
  );
}
