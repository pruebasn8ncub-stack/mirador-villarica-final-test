import Image from 'next/image';
import { Reveal } from './Reveal';

const PANELS = [
  {
    id: 'suenia',
    eyebrow: 'Sueña',
    titleStart: 'Sueña y vive a 50 minutos de',
    titleEnd: 'Villarrica',
    copy: '80 hectáreas en uno de los entornos más codiciados del sur de Chile, sobre la ruta Villarrica – Las Hortensias.',
    chip: 'Bosque nativo intacto',
    image: '/assets/imagen1.jpg',
    alt: 'Vista aérea del campo Mirador de Villarrica, 80 hectáreas en Colico',
    align: 'left',
  },
  {
    id: 'naturaleza',
    eyebrow: 'Vive',
    titleStart: 'Naturaleza y',
    titleEnd: 'exclusividad',
    copy: 'Deportes de montaña, termas, senderismo y silencio. Donde el tiempo, la naturaleza y la visión se encuentran.',
    chip: 'Volcán al frente · Lago Colico a 20 min',
    image: '/assets/galeria5-atardecer.jpg',
    alt: 'Atardecer en la Araucanía con bosque nativo y montañas',
    align: 'right',
  },
] as const;

export function VivirVillarrica() {
  return (
    <section className="relative bg-bosque-950">
      {PANELS.map((p, i) => (
        <Reveal key={p.id}>
          <article className="relative isolate overflow-hidden h-[88svh] min-h-[560px] sm:min-h-[640px]">
            <Image
              src={p.image}
              alt={p.alt}
              fill
              quality={95}
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />

            <div
              className={
                p.align === 'left'
                  ? 'absolute inset-0 bg-gradient-to-r from-bosque-950/85 via-bosque-950/55 to-bosque-950/10'
                  : 'absolute inset-0 bg-gradient-to-l from-bosque-950/85 via-bosque-950/55 to-bosque-950/10'
              }
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-bosque-950/55 via-transparent to-bosque-950/35"
              aria-hidden
            />

            <div className="relative z-10 h-full mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 flex items-center">
              <div
                className={`max-w-xl ${p.align === 'right' ? 'ml-auto text-left' : ''}`}
              >
                <p className="inline-flex items-center gap-2.5 text-mostaza text-[11px] tracking-eyebrow uppercase mb-6">
                  <span className="size-1.5 rounded-full bg-mostaza animate-pulse-dot" />
                  {p.eyebrow}
                </p>

                <h2 className="font-display text-crema tracking-display leading-[0.98] text-[clamp(2.25rem,5vw,4.5rem)] font-light mb-7">
                  <span className="block">{p.titleStart}</span>
                  <span className="block italic font-normal text-mostaza">
                    {p.titleEnd}.
                  </span>
                </h2>

                <p className="text-crema/85 text-base sm:text-lg leading-[1.6] mb-8 max-w-md">
                  {p.copy}
                </p>

                <span className="inline-flex items-center gap-2.5 text-crema/85 text-[12px] sm:text-[13px] px-4 py-2 rounded-full bg-bosque-950/40 backdrop-blur-md border border-crema/15">
                  <span className="size-1.5 rounded-full bg-mostaza" aria-hidden />
                  {p.chip}
                </span>
              </div>
            </div>
          </article>
        </Reveal>
      ))}
    </section>
  );
}
