'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, MapPin, Plane, Trees, Waves, Mountain, Coffee, Compass } from 'lucide-react';
import Map, { Marker, NavigationControl, FullscreenControl, ScaleControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DISTANCIAS } from '@/data/content';
import { cn } from '@/lib/utils';

const QUE_HAY_CERCA = [
  { icon: Waves,    titulo: 'Lago Colico',          desc: 'Uno de los lagos más limpios del sur. Kayak, pesca, paddle.' },
  { icon: Mountain, titulo: 'Termas naturales',     desc: 'Geométricas, Pellaifa, Coñaripe — todas en menos de 2h.' },
  { icon: Trees,    titulo: 'Senderismo',           desc: 'Reservas Villarrica y Huerquehue, bosques nativos.' },
  { icon: Compass,  titulo: 'Ski y deportes',       desc: 'Centro de esquí Villarrica-Pucón a 1h 30 min.' },
  { icon: Coffee,   titulo: 'Gastronomía',          desc: 'Pucón y Villarrica con la mejor escena gastronómica del sur.' },
  { icon: Plane,    titulo: 'Aeropuerto Araucanía', desc: 'Vuelo directo Santiago–Temuco (1h 20). 45 min al proyecto.' },
];

const LAT = -39.0833;
const LNG = -71.9667;
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function Ubicacion() {
  const [showFallback, setShowFallback] = useState(false);

  const hasMapbox = !!MAPBOX_TOKEN;
  const fallbackEmbedUrl = `https://www.google.com/maps?q=${LAT},${LNG}&hl=es&z=11&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}&travelmode=driving`;

  return (
    <section id="ubicacion" className="relative bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="grid items-end gap-6 md:grid-cols-[1.4fr_1fr]"
        >
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza-500">
              Ubicación
            </p>
            <h2 className="font-display text-4xl font-light leading-[1.05] tracking-display text-bosque-900 md:text-5xl lg:text-6xl">
              En Colico,<br />
              <span className="italic text-bosque-700">a pocos minutos de todo.</span>
            </h2>
          </div>
          <p className="text-[14.5px] leading-relaxed text-bosque-700/80">
            Sobre la ruta Villarrica–Las Hortensias, en el corazón de la Araucanía. A 20 minutos
            del lago Colico, 55 del centro de Villarrica y 45 del aeropuerto.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-10 grid gap-6 lg:grid-cols-12"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-card-hover ring-1 ring-bosque-100 lg:col-span-7 lg:aspect-auto">
            {hasMapbox && !showFallback ? (
              <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={{ longitude: LNG, latitude: LAT, zoom: 10.5 }}
                mapStyle="mapbox://styles/mapbox/outdoors-v12"
                style={{ width: '100%', height: '100%', minHeight: '420px' }}
                onError={() => setShowFallback(true)}
              >
                <Marker longitude={LNG} latitude={LAT} anchor="bottom">
                  <div className="flex flex-col items-center" aria-label="Ubicación de Mirador de Villarrica">
                    <div className="rounded-full bg-mostaza px-3 py-1 text-[11px] font-bold text-bosque-900 shadow-lg ring-2 ring-white">
                      Mirador
                    </div>
                    <div className="-mt-1 h-3 w-3 rotate-45 bg-mostaza shadow" />
                    <span className="relative mt-1 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mostaza opacity-60" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-mostaza ring-2 ring-white" />
                    </span>
                  </div>
                </Marker>
                <NavigationControl position="top-right" showCompass={false} />
                <FullscreenControl position="top-right" />
                <ScaleControl position="bottom-left" maxWidth={120} unit="metric" />
              </Map>
            ) : (
              <iframe
                src={fallbackEmbedUrl}
                title="Ubicación de Mirador de Villarrica en Colico"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
              />
            )}
          </div>

          <div className="space-y-3 lg:col-span-5">
            <div className="rounded-[24px] bg-crema p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza-500">
                  Distancias en auto
                </p>
                <Car className="h-4 w-4 text-bosque-500" strokeWidth={2.2} />
              </div>
              <ul className="space-y-3">
                {DISTANCIAS.map((d) => (
                  <li key={d.lugar} className="flex items-baseline justify-between gap-3 border-b border-bosque-100 pb-2 last:border-b-0 last:pb-0">
                    <span className="text-[14px] font-medium text-bosque-900">{d.lugar}</span>
                    <span className="text-[13.5px] tabular-nums text-bosque-700">
                      {d.tiempo}
                      {d.km && <span className="ml-2 text-bosque-500">· {d.km}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-bosque-200 px-5 py-2.5 text-[13px] font-semibold text-bosque-800 transition hover:border-mostaza hover:text-mostaza"
              >
                <Compass className="h-3.5 w-3.5" strokeWidth={2.4} />
                Cómo llegar
              </a>
              {!hasMapbox && (
                <p className="mt-3 flex items-start gap-1.5 text-[11px] text-bosque-500/85">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={2.4} />
                  Mapa interactivo disponible al configurar <code className="rounded bg-bosque-50 px-1 text-[10.5px]">NEXT_PUBLIC_MAPBOX_TOKEN</code>.
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16"
        >
          <p className="mb-7 text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza-500">
            Qué hay cerca
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUE_HAY_CERCA.map((q) => {
              const Icon = q.icon;
              return (
                <div
                  key={q.titulo}
                  className={cn(
                    'group rounded-2xl border border-bosque-100 bg-white p-5 transition',
                    'hover:-translate-y-1 hover:border-mostaza/40 hover:shadow-card-hover',
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bosque-50 text-bosque-700 transition group-hover:bg-mostaza/15 group-hover:text-mostaza-500">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-medium text-bosque-900">
                    {q.titulo}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-bosque-700/80">
                    {q.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
