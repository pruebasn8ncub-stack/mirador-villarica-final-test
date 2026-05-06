import Image from 'next/image';
import { MessageCircle, Mail, MapPin, Clock } from 'lucide-react';
import { DIEGO } from '@/data/content';
import { ChatCta } from './ChatCta';
import { Reveal } from './Reveal';

export function BrokerCard() {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40 bg-crema-200">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal>
          <article className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] max-w-md mx-auto lg:mx-0 rounded-3xl overflow-hidden bg-bosque-900 shadow-card-hover">
                <div className="absolute inset-0 bg-gradient-to-br from-bosque-700 via-bosque-800 to-bosque-950" />
                <Image
                  src="/assets/galeria6.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover opacity-40 mix-blend-luminosity"
                  aria-hidden
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-crema p-10">
                  <span className="font-display italic text-mostaza text-[clamp(5rem,12vw,9rem)] leading-none tracking-display">
                    DC
                  </span>
                  <span className="mt-3 inline-flex items-center gap-2 text-[11px] tracking-eyebrow uppercase text-crema/70">
                    <span className="size-1.5 rounded-full bg-bosque-300 animate-pulse-dot" />
                    En línea ahora
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <p className="font-display italic text-2xl text-crema leading-tight">
                      {DIEGO.nombre}
                    </p>
                    <p className="text-crema/65 text-xs mt-1 tracking-tight">
                      Broker · Terra Segura Inmobiliaria
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2.5 text-[11px] tracking-eyebrow uppercase text-bosque-700/80 mb-6">
                <span className="size-1.5 rounded-full bg-mostaza" /> Tu asesor dedicado
              </p>

              <h2 className="font-display text-bosque-900 tracking-display leading-[1.05] text-[clamp(1.75rem,3.5vw,3rem)] font-light">
                Atrás de cada parcela
                <br />
                <span className="italic">hay una persona</span>.
              </h2>

              <p className="mt-7 max-w-xl text-bosque-900/75 text-base sm:text-lg leading-relaxed">
                Diego conoce el proyecto desde antes de la primera medición topográfica.
                Te muestra la parcela en terreno, te aclara cada certificado y te firma
                la promesa el mismo día si decides reservar.
              </p>

              <ul className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-5 text-[15px]">
                <ContactRow
                  icon={<MessageCircle className="size-4 text-mostaza" />}
                  label="WhatsApp directo"
                  value={DIEGO.whatsapp}
                  href={`https://wa.me/${DIEGO.whatsappRaw}`}
                  external
                />
                <ContactRow
                  icon={<Mail className="size-4 text-mostaza" />}
                  label="Email"
                  value={DIEGO.email}
                  href={`mailto:${DIEGO.email}`}
                />
                <ContactRow
                  icon={<Clock className="size-4 text-mostaza" />}
                  label="Horario"
                  value={DIEGO.horario}
                />
                <ContactRow
                  icon={<MapPin className="size-4 text-mostaza" />}
                  label="Oficina"
                  value={DIEGO.oficina}
                />
              </ul>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <ChatCta size="md" variant="secondary" intent="general" icon="sparkle">
                  Hablar primero con Lucía
                </ChatCta>
                <a
                  href={`https://wa.me/${DIEGO.whatsappRaw}?text=${encodeURIComponent(
                    'Hola Diego, me interesa Mirador de Villarrica.',
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-full text-[15px] font-medium text-bosque-900 hover:text-bosque-700 border border-bosque-900/15 hover:border-bosque-900/40 transition-colors"
                >
                  Saltar a Diego
                </a>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <span className="size-9 rounded-xl bg-bosque-900/5 border border-bosque-900/8 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] tracking-eyebrow uppercase text-bosque-900/50 mb-0.5">
          {label}
        </p>
        <p className="text-bosque-900 truncate">{value}</p>
      </div>
    </>
  );

  return (
    <li>
      {href ? (
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="flex items-center gap-3.5 group hover:opacity-80 transition-opacity"
        >
          {content}
        </a>
      ) : (
        <div className="flex items-center gap-3.5">{content}</div>
      )}
    </li>
  );
}
