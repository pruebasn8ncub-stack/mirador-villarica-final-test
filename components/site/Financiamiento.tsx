import { Banknote, Calendar, KeyRound, Sparkles } from 'lucide-react';
import { PROYECTO } from '@/data/content';
import { ChatCta } from './ChatCta';
import { Reveal } from './Reveal';

const PLANES = [
  {
    icon: Banknote,
    eyebrow: 'Pago contado',
    titulo: 'Desde $14,49M',
    sub: 'Precio publicado',
    bullets: [
      'Sin intereses',
      'Promesa y escritura en una sola visita',
      'Inscripción CBR a tu nombre',
    ],
    cta: 'Cotiza con Lucía',
    intent: 'cotizar' as const,
    accent: 'mostaza',
  },
  {
    icon: Calendar,
    eyebrow: 'Crédito directo',
    titulo: 'Desde $17,49M',
    sub: '50% pie + 36 cuotas en UF',
    bullets: [
      'Sin banco intermediario',
      'Aprobación express con tu RUT',
      'Pie con Webpay, transferencia o vale vista',
    ],
    cta: 'Simula tu cuota',
    prefill: 'Quiero simular el crédito directo a 36 cuotas.',
    accent: 'bosque',
    featured: true,
  },
  {
    icon: KeyRound,
    eyebrow: 'Reserva',
    titulo: '$500.000',
    sub: 'Cubre todos los gastos operacionales',
    bullets: [
      'Notaría · CBR · certificados · abogados',
      'Aplican al precio final',
      'Reembolsable hasta la promesa',
    ],
    cta: '¿Qué incluye la reserva?',
    prefill: '¿Qué incluye exactamente la reserva de $500.000?',
    accent: 'crema',
  },
];

export function Financiamiento() {
  return (
    <section id="financiamiento" className="relative py-24 sm:py-32 lg:py-40 bg-crema-200">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-16 sm:mb-20">
          <div className="lg:col-span-5">
            <p className="inline-flex items-center gap-2.5 text-[11px] tracking-eyebrow uppercase text-bosque-700/80 mb-6">
              <span className="size-1.5 rounded-full bg-mostaza" /> Financiamiento
            </p>
            <h2 className="font-display text-bosque-900 tracking-display leading-[1.05] text-[clamp(2rem,4.5vw,3.75rem)] font-light">
              Tres formas
              <br />
              <span className="italic">de empezar</span>.
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 lg:pt-3">
            <p className="text-bosque-900/75 text-base sm:text-lg leading-relaxed">
              Sin bancos, sin letra chica. Crédito directo de la inmobiliaria, con
              firma digital y promesa en menos de 48 horas.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {PLANES.map((p, i) => {
            const featured = p.featured;
            return (
              <Reveal key={p.eyebrow} delay={i * 0.08}>
                <article
                  className={`relative h-full rounded-3xl p-8 sm:p-10 flex flex-col transition-all duration-300 ${
                    featured
                      ? 'bg-bosque-950 text-crema shadow-card-hover lg:-translate-y-3'
                      : 'bg-crema text-bosque-900 shadow-card hover:shadow-card-hover hover:-translate-y-1'
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 text-[10px] tracking-eyebrow uppercase px-3 py-1.5 rounded-full bg-mostaza text-bosque-900 shadow-card">
                      <Sparkles className="size-3" /> El más elegido
                    </span>
                  )}

                  <p
                    className={`text-[10px] tracking-eyebrow uppercase mb-6 ${
                      featured ? 'text-mostaza' : 'text-bosque-700/70'
                    }`}
                  >
                    {p.eyebrow}
                  </p>

                  <p
                    className={`font-display tracking-display text-[clamp(2rem,4vw,2.75rem)] font-light leading-none ${
                      featured ? 'text-crema' : 'text-bosque-900'
                    }`}
                  >
                    {p.titulo}
                  </p>
                  <p
                    className={`mt-2 text-sm ${
                      featured ? 'text-crema/65' : 'text-bosque-900/55'
                    }`}
                  >
                    {p.sub}
                  </p>

                  <ul
                    className={`mt-8 space-y-3 text-[15px] ${
                      featured ? 'text-crema/85' : 'text-bosque-900/80'
                    }`}
                  >
                    {p.bullets.map((b) => (
                      <li key={b} className="flex gap-3">
                        <span
                          className={`mt-2 inline-block size-1 rounded-full shrink-0 ${
                            featured ? 'bg-mostaza' : 'bg-bosque-700/40'
                          }`}
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    <ChatCta
                      size="md"
                      variant={featured ? 'primary' : 'secondary'}
                      intent={p.intent}
                      prefill={p.prefill}
                      icon="arrow"
                      className="w-full"
                    >
                      {p.cta}
                    </ChatCta>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-10 sm:mt-14 text-center text-xs text-bosque-900/55">
          Reserva única {PROYECTO.reserva} · cubre gastos operacionales · aplica al precio final.
        </p>
      </div>
    </section>
  );
}
