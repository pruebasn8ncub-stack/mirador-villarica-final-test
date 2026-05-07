import { Plane, MapPin, Mountain, Trees, ExternalLink } from 'lucide-react';
import { DISTANCIAS, PROYECTO } from '@/data/content';
import { ChatCta } from './ChatCta';
import { Reveal } from './Reveal';

const PROYECTO_LAT = -39.011906;
const PROYECTO_LNG = -72.123736;
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${PROYECTO_LAT},${PROYECTO_LNG}`;
// `t=h` = vista híbrida (satélite + nombres de calles/lugares).
// Para zonas rurales con bosque nativo da una imagen mucho más rica que el mapa
// estándar: se ven el lago, la topografía y el entorno real del proyecto.
const MAPS_EMBED = `https://maps.google.com/maps?q=loc:${PROYECTO_LAT},${PROYECTO_LNG}&hl=es&z=14&t=h&output=embed`;

const ICON_MAP: Record<string, typeof Plane> = {
  'Cunco': Trees,
  'Lago Colico': Trees,
  'Villarrica centro': MapPin,
  'Temuco': MapPin,
  'Pucón': Mountain,
  'Aeropuerto Araucanía': Plane,
};

export function Ubicacion() {
  return (
    <section id="ubicacion" className="relative py-24 sm:py-32 lg:py-40 bg-crema">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <p className="inline-flex items-center gap-2.5 text-[11px] tracking-eyebrow uppercase text-bosque-700/80 mb-6">
              <span className="size-1.5 rounded-full bg-mostaza" /> Ubicación
            </p>
            <h2 className="font-display text-bosque-900 tracking-display leading-[1.05] text-[clamp(2rem,4.5vw,3.75rem)] font-light mb-6">
              A 55 minutos
              <br />
              <span className="italic">del aeropuerto</span>.
            </h2>
            <p className="text-bosque-900/75 text-base sm:text-lg leading-relaxed mb-8">
              {PROYECTO.ubicacion}, sobre la ruta Villarrica – Las Hortensias. Lago Colico
              a 20 minutos, volcán Villarrica al frente, Pucón a una hora y media.
            </p>
            <ChatCta size="md" variant="secondary" prefill="¿Cómo llego al proyecto?">
              ¿Cómo llego?
            </ChatCta>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <Reveal>
              <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-3xl overflow-hidden bg-bosque-900/5 border border-bosque-900/8 shadow-card">
                <iframe
                  src={MAPS_EMBED}
                  title="Ubicación del proyecto Mirador de Villarrica en Colico, La Araucanía"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full border-0"
                />

                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bosque-950/85 via-bosque-950/30 to-transparent"
                  aria-hidden
                />

                <div className="pointer-events-none absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] tracking-eyebrow uppercase text-mostaza mb-1">
                      Mirador de Villarrica
                    </p>
                    <p className="font-display italic text-xl sm:text-2xl text-crema leading-tight">
                      39°08′S · 71°57′W
                    </p>
                  </div>
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto inline-flex items-center gap-2 text-crema text-xs sm:text-[13px] font-medium px-4 py-2 rounded-full bg-bosque-950/70 backdrop-blur-md border border-crema/20 hover:bg-mostaza hover:text-bosque-950 hover:border-mostaza transition-colors whitespace-nowrap"
                  >
                    <ExternalLink className="size-3.5" />
                    Ver en Google Maps
                  </a>
                </div>
              </div>
            </Reveal>

            <ul className="grid sm:grid-cols-2 gap-px bg-bosque-900/8 border border-bosque-900/8 rounded-2xl overflow-hidden">
              {DISTANCIAS.map((d, i) => {
                const Icon = ICON_MAP[d.lugar] ?? MapPin;
                return (
                  <li
                    key={d.lugar}
                    className="bg-crema p-5 sm:p-6 flex items-center gap-4 hover:bg-crema-200 transition-colors"
                  >
                    <span className="size-10 rounded-xl bg-bosque-900/5 border border-bosque-900/8 flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-bosque-700" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-bosque-900 font-medium tracking-tight">{d.lugar}</p>
                      <p className="text-bosque-900/55 text-xs mt-0.5">
                        {d.tiempo}
                        {d.km && ` · ${d.km}`}
                      </p>
                    </div>
                    <span className="font-display italic text-bosque-900/20 text-sm">
                      0{i + 1}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
