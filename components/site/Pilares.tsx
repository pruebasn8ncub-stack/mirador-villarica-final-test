import {
  Droplet,
  FileCheck2,
  Mountain,
  Route,
  Shield,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { CARACTERISTICAS } from '@/data/content';
import { Reveal } from './Reveal';

const ICONS: Record<string, LucideIcon> = {
  Droplet,
  Zap,
  Route,
  Shield,
  FileCheck2,
  Mountain,
};

export function Pilares() {
  return (
    <section id="proyecto" className="relative py-24 sm:py-32 lg:py-40 bg-crema">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-16 sm:mb-20">
          <div className="lg:col-span-5">
            <p className="inline-flex items-center gap-2.5 text-[11px] tracking-eyebrow uppercase text-bosque-700/80 mb-6">
              <span className="size-1.5 rounded-full bg-mostaza" /> El proyecto
            </p>
            <h2 className="font-display text-bosque-900 tracking-display leading-[1.05] text-[clamp(2rem,4.5vw,3.75rem)] font-light">
              Naturaleza con
              <span className="italic"> papeles en regla</span>.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-3">
            <p className="text-bosque-900/75 text-base sm:text-lg leading-relaxed">
              Cada parcela tiene rol propio, infraestructura terminada y entorno
              blindado por bosque nativo. La inscripción en el Conservador queda
              firme la misma semana de la escritura.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-bosque-900/8 border border-bosque-900/8 rounded-3xl overflow-hidden">
          {CARACTERISTICAS.map((c, i) => {
            const Icon = ICONS[c.icon] ?? Mountain;
            return (
              <Reveal key={c.titulo} delay={i * 0.06} className="contents">
                <article className="group relative bg-crema p-8 sm:p-10 transition-colors duration-300 hover:bg-crema-200">
                  <div className="size-12 rounded-2xl bg-bosque-900/5 border border-bosque-900/10 flex items-center justify-center mb-7 transition-all duration-300 group-hover:bg-mostaza group-hover:border-mostaza-400 group-hover:rotate-[-4deg]">
                    <Icon className="size-5 text-bosque-900 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="font-display text-bosque-900 text-2xl sm:text-[1.65rem] tracking-display leading-tight font-normal mb-2">
                    {c.titulo}
                  </h3>
                  <p className="text-bosque-900/70 text-[15px] leading-relaxed">{c.detalle}</p>
                  <span className="absolute top-6 right-6 font-display italic text-bosque-900/15 text-sm">
                    0{i + 1}
                  </span>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
