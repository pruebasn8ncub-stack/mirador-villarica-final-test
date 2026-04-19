'use client';

import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertyCta } from '@/lib/chat/types';
import { PhotoPlaceholder } from './PhotoPlaceholder';

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

  const stats = features && features.length > 0 ? features : [`${sqm} m²`, 'Vista Volcán', 'Rol propio'];

  return (
    <div className="w-[288px] max-w-full overflow-hidden rounded-xl border border-bosque-100 bg-white shadow-chat-bubble-bot">
      <div className="relative h-[148px]">
        <PhotoPlaceholder tone="forest" url={image} label="VISTA AL VOLCÁN" alt={`Parcela ${parcela}`} />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-bosque-900">
          {status}
        </span>
        <span className="absolute bottom-2.5 right-2.5 rounded bg-mostaza-300 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-bosque-900">
          {parcela}
        </span>
      </div>

      <div className="px-3.5 pb-3.5 pt-3">
        <h4 className="text-[15px] font-semibold leading-tight tracking-tight text-bosque-900">
          Parcela {parcela} · Mirador de Villarrica
        </h4>
        <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-bosque-500">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          Colico · Ruta a Las Hortensias
        </p>

        <div className="mt-2.5 flex gap-2.5 border-t border-bosque-50 pt-2.5">
          {stats.slice(0, 3).map((stat, i) => {
            const [value, ...rest] = stat.split(' ');
            const label = rest.length > 0 ? rest.join(' ').toUpperCase() : 'INFO';
            return (
              <div key={i} className="flex-1">
                <div className="font-mono text-[9px] uppercase tracking-wider text-bosque-400">{label}</div>
                <div className="mt-0.5 text-[12.5px] font-semibold text-bosque-900">{value}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-3">
          <div className="font-mono text-[9.5px] uppercase tracking-wider text-bosque-400">Desde</div>
          <div className="text-[17px] font-semibold tracking-tight text-bosque-900">{price}</div>
          <div className="mt-0.5 text-[10.5px] text-bosque-400">50% pie + 36 cuotas UF</div>
        </div>

        <div className="mt-3 flex gap-1.5">
          {effectiveCtas.slice(0, 2).map((cta, i) => (
            <button
              key={cta.action}
              type="button"
              onClick={() => onAction?.(cta.action)}
              className={cn(
                'flex-1 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-colors',
                i === 1
                  ? 'bg-bosque-800 text-crema hover:bg-bosque-700'
                  : 'border border-bosque-100 bg-white text-bosque-800 hover:bg-bosque-50'
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
