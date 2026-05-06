import { Reveal } from './Reveal';

const STATS = [
  { v: '94', label: 'Parcelas', sub: 'desde 5.000 m² hasta 1 ha' },
  { v: '80', label: 'Hectáreas', sub: 'bosque nativo intacto' },
  { v: '20′', label: 'al lago Colico', sub: 'uno de los más limpios de Chile' },
  { v: '55′', label: 'al aeropuerto', sub: 'Araucanía · Temuco' },
  { v: 'SAG', label: 'Aprobado', sub: 'roles listos · CBR inmediato' },
  { v: '36', label: 'cuotas en UF', sub: 'crédito directo · 50% pie' },
];

export function StatsHero() {
  return (
    <section className="relative bg-bosque-950 text-crema overflow-hidden">
      <div className="absolute inset-0 chat-dotgrid opacity-[0.05]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-40">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-14 sm:mb-20">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2.5 text-mostaza text-[11px] tracking-eyebrow uppercase mb-6">
              <span className="size-1.5 rounded-full bg-mostaza animate-pulse-dot" /> En cifras
            </p>
            <h2 className="font-display text-crema tracking-display leading-[1.02] text-[clamp(2.25rem,5vw,4.25rem)] font-light">
              Cifras peritadas,
              <br />
              <span className="italic text-mostaza">no de marketing</span>.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-4">
            <p className="text-crema/70 text-base sm:text-lg leading-relaxed">
              Cada cifra está peritada y respaldada por documentación legal. Ningún
              número de marketing, ningún asterisco escondido.
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-crema/10 border border-crema/12 rounded-3xl overflow-hidden">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05} className="contents">
              <li className="bg-bosque-950 p-7 sm:p-10 group hover:bg-bosque-900/60 transition-colors duration-500">
                <p className="font-display text-mostaza tracking-display font-light leading-[0.95] text-[clamp(2.75rem,5.5vw,4.75rem)] tabular-nums">
                  {s.v}
                </p>
                <p className="mt-5 text-crema text-base sm:text-lg font-medium tracking-tight">
                  {s.label}
                </p>
                <p className="mt-1.5 text-crema/55 text-xs sm:text-sm leading-relaxed">
                  {s.sub}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
