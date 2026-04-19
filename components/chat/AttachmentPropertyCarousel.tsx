'use client';

import type { PropertyCarouselItem } from '@/lib/chat/types';
import { PhotoPlaceholder } from './PhotoPlaceholder';

interface AttachmentPropertyCarouselProps {
  items: PropertyCarouselItem[];
  onPick?: (item: PropertyCarouselItem) => void;
}

export function AttachmentPropertyCarousel({ items, onPick }: AttachmentPropertyCarouselProps) {
  return (
    <div
      className="carousel-scroll -mx-0.5 flex gap-2 overflow-x-auto py-1"
      style={{ scrollSnapType: 'x mandatory' }}
      role="list"
    >
      {items.map((it) => (
        <button
          key={it.parcela}
          type="button"
          onClick={() => onPick?.(it)}
          className="shrink-0 w-[150px] overflow-hidden rounded-xl border border-bosque-100 bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ scrollSnapAlign: 'start' }}
          role="listitem"
          aria-label={`Ver parcela ${it.parcela}, ${it.sqm} m², ${it.price}`}
        >
          <div className="relative h-20">
            <PhotoPlaceholder tone={it.tone ?? 'forest'} url={it.image} alt={`Parcela ${it.parcela}`} />
            <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide text-bosque-900">
              {it.parcela}
            </span>
          </div>
          <div className="px-2.5 py-2">
            <div className="text-[11px] text-bosque-500">{it.sqm} m²</div>
            <div className="mt-0.5 text-[13px] font-semibold text-bosque-900">{it.price}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
