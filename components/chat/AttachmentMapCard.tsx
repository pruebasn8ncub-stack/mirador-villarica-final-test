'use client';

import { Compass, MapPin } from 'lucide-react';
import type { NearbyPlace } from '@/lib/chat/types';

interface AttachmentMapCardProps {
  title?: string;
  subtitle?: string;
  address?: string;
  embedUrl?: string;
  lat?: number;
  lng?: number;
  nearbyMinutes?: NearbyPlace[];
  onTour?: () => void;
}

export function AttachmentMapCard({
  title = 'Ruta Villarrica — Las Hortensias',
  subtitle = '15 min del Lago Colico · 1h aeropuerto Temuco',
  address,
  embedUrl,
  lat,
  lng,
  nearbyMinutes,
  onTour,
}: AttachmentMapCardProps) {
  const src =
    embedUrl ??
    (lat && lng
      ? `https://www.google.com/maps?q=${lat},${lng}&z=12&output=embed`
      : address
      ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=12&output=embed`
      : undefined);

  return (
    <div className="overflow-hidden rounded-xl border border-bosque-100 bg-white">
      <div className="relative h-[140px] bg-gradient-to-br from-bosque-100 via-bosque-200 to-bosque-300">
        {src ? (
          <iframe
            src={src}
            title={title}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-bosque-600">
            <MapPin className="h-10 w-10 opacity-60" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="px-3.5 py-3">
        <h4 className="text-[13px] font-semibold text-bosque-900">{title}</h4>
        <p className="mt-0.5 text-[11px] text-bosque-500">{subtitle}</p>

        {nearbyMinutes && nearbyMinutes.length > 0 && (
          <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-bosque-700">
            {nearbyMinutes.map((n) => (
              <li key={n.place} className="flex items-center justify-between gap-2">
                <span className="truncate">{n.place}</span>
                <span className="font-mono font-semibold text-bosque-900">{n.minutes} min</span>
              </li>
            ))}
          </ul>
        )}

        {onTour && (
          <button
            type="button"
            onClick={onTour}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-bosque-700 bg-white px-3 py-2 text-[12px] font-medium text-bosque-700 transition-colors hover:bg-bosque-50"
          >
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            Iniciar tour 360°
          </button>
        )}
      </div>
    </div>
  );
}
