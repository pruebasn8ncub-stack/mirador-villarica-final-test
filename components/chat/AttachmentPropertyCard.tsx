'use client';

import { MapPin, Maximize2, Mountain, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertyCta } from '@/lib/chat/types';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { PriceDisplay } from './PriceDisplay';
import { StatRow } from './StatRow';

interface AttachmentPropertyCardProps {
  parcela: string;
  sqm: string;
  price: string;
  image?: string;
  features?: string[];
  ctas?: PropertyCta[];
  status?: string;
  onAction?: (action: string) => void;
}

const STAT_ICONS = [Maximize2, Mountain, FileCheck];

/**
 * PropertyCard — hero card inmobiliario boutique.
 * Foto 16:10 protagonista, precio destacado mostaza, stats con iconos, 2 CTAs.
 * Responsive: w-full con cap en 320px para no romper el flujo del chat.
 */
export function AttachmentPropertyCard({
  parcela,
  sqm,
  price,
  image,
  features,
  ctas,
  status = 'Disponible',
  onAction,
}: AttachmentPropertyCardProps) {
  const effectiveCtas: PropertyCta[] =
    ctas && ctas.length > 0
      ? ctas
      : [
          { label: 'Ver detalles', action: `Ver detalles Parcela ${parcela}` },
          { label: 'Cotizar', action: 'Simular crédito' },
        ];

  // Features llegan ya formateadas (ej. "Vista al volcán") — si no, fallback sano.
  const stats = (features && features.length > 0
    ? features.slice(0, 3)
    : [`${sqm} m²`, 'Vista Volcán', 'Rol propio']
  ).map((stat, i) => ({
    label: ['Superficie', 'Vista', 'Rol'][i] ?? 'Atributo',
    value: stat,
    icon: STAT_ICONS[i],
  }));

  return (
    <div className="group w-full max-w-[320px] overflow-hidden rounded-2xl border border-bosque-100 bg-white shadow-card transition-all hover:-translate-y-[1px] hover:shadow-card-hover">
      {/* Hero image 16:10 */}
      <div className="relative aspect-[16/10] w-full">
        <PhotoPlaceholder
          tone="forest"
          url={image}
          label="VISTA AL VOLCÁN"
          alt={`Parcela ${parcela}`}
        />
        {/* Status badge izq-arriba — premium glass */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-bosque-800 shadow-sm backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          {status}
        </span>
        {/* Parcela pill der-abajo — mostaza acento */}
        <span className="absolute bottom-3 right-3 rounded-full bg-mostaza px-2.5 py-1 text-[11px] font-bold tracking-wide text-bosque-900 shadow-sm">
          {parcela}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4">
        {/* Título + ubicación */}
        <div>
          <h4 className="text-[14px] font-semibold leading-snug tracking-tight text-bosque-900">
            Parcela {parcela} · Mirador de Villarrica
          </h4>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-bosque-500">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            Colico · Ruta a Las Hortensias
          </p>
        </div>

        {/* Stats row con iconos */}
        <div className="flex flex-col gap-1.5 rounded-xl bg-bosque-50/60 px-3 py-2.5">
          {stats.map((s, i) => (
            <StatRow key={i} icon={s.icon} label={s.label} value={s.value} />
          ))}
        </div>

        {/* Precio hero con acento mostaza + meta-financing */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-bosque-400">
              Desde
            </div>
            <PriceDisplay value={price} size="hero" accent className="mt-0.5" />
          </div>
          <p className="pb-0.5 text-right text-[12px] leading-tight text-bosque-500">
            50% pie
            <br />
            36 cuotas UF
          </p>
        </div>

        {/* CTAs — secundario outline + primario filled */}
        <div className="flex gap-2 pt-1">
          {effectiveCtas.slice(0, 2).map((cta, i) => (
            <button
              key={cta.action}
              type="button"
              onClick={() => onAction?.(cta.action)}
              className={cn(
                'flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all active:scale-[0.98]',
                i === 1
                  ? 'bg-bosque-800 text-crema shadow-sm hover:bg-bosque-700 hover:shadow-md'
                  : 'border border-bosque-200 bg-white text-bosque-800 hover:border-bosque-300 hover:bg-bosque-50'
              )}
            >
              {cta.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
