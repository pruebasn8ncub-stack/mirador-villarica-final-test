import Image from 'next/image';
import { ChatCta } from './ChatCta';
import { DIEGO } from '@/data/content';

export function CtaFinal() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative aspect-[3/4] sm:aspect-[16/9] lg:aspect-[21/8] min-h-[520px] flex items-center">
        <Image
          src="/assets/galeria5-atardecer.jpg"
          alt="Atardecer en Mirador de Villarrica"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-bosque-950 via-bosque-950/70 to-bosque-950/30"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 lg:px-12 py-20 sm:py-28 text-crema text-center">
          <p className="inline-flex items-center gap-2.5 text-[11px] tracking-eyebrow uppercase text-mostaza mb-6">
            <span className="size-1.5 rounded-full bg-mostaza animate-pulse-dot" /> Empieza la conversación
          </p>
          <h2 className="font-display tracking-display leading-[0.98] text-[clamp(2.5rem,7vw,5rem)] font-light">
            Tu parcela ya está acá.
            <br />
            <span className="italic">Sólo falta que la elijas</span>.
          </h2>
          <p className="mt-7 max-w-xl mx-auto text-crema/80 text-base sm:text-lg leading-relaxed">
            Lucía resuelve dudas en español, simula crédito, recomienda parcelas según
            tu presupuesto y agenda con Diego cuando estés listo.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ChatCta size="lg" variant="primary" intent="general" icon="sparkle">
              Habla con Lucía
            </ChatCta>
            <a
              href={`https://wa.me/${DIEGO.whatsappRaw}?text=${encodeURIComponent(
                'Hola Diego, vi Mirador de Villarrica y quiero más información.',
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 h-14 px-7 rounded-full text-base font-medium text-crema/90 hover:text-crema border border-crema/25 hover:border-crema/50 transition-colors"
            >
              WhatsApp directo
            </a>
          </div>

          <p className="mt-8 text-xs text-crema/55">
            {DIEGO.nombre} · {DIEGO.whatsapp} · {DIEGO.horario}
          </p>
        </div>
      </div>
    </section>
  );
}
