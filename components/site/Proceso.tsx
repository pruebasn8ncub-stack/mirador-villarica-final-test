import { PROCESO_COMPRA } from '@/data/content';
import { Reveal } from './Reveal';

export function Proceso() {
  return (
    <section id="proceso" className="relative py-24 sm:py-32 lg:py-40 bg-crema">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl mb-14 sm:mb-20">
          <p className="inline-flex items-center gap-2.5 text-[11px] tracking-eyebrow uppercase text-bosque-700/80 mb-6">
            <span className="size-1.5 rounded-full bg-mostaza" /> Cómo se compra
          </p>
          <h2 className="font-display text-bosque-900 tracking-display leading-[1.05] text-[clamp(2rem,4.5vw,3.75rem)] font-light">
            De la reunión
            <span className="italic"> a la inscripción</span>,
            <br />
            en 5 pasos.
          </h2>
        </div>

        <ol className="relative grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-bosque-900/8 border border-bosque-900/8 rounded-3xl overflow-hidden">
          {PROCESO_COMPRA.map((p, i) => (
            <Reveal key={p.numero} delay={i * 0.06} className="contents">
              <li className="bg-crema p-7 sm:p-8 flex flex-col gap-4 group transition-colors hover:bg-crema-200">
                <div className="flex items-baseline justify-between">
                  <span className="font-display italic text-mostaza-400 text-3xl sm:text-4xl leading-none">
                    0{p.numero}
                  </span>
                  <span className="text-bosque-900/20 text-[10px] tracking-eyebrow uppercase">
                    Paso {p.numero}/5
                  </span>
                </div>
                <h3 className="font-display text-bosque-900 text-xl sm:text-2xl tracking-display leading-tight">
                  {p.titulo}
                </h3>
                <p className="text-bosque-900/65 text-[14px] leading-relaxed">
                  {p.descripcion}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
