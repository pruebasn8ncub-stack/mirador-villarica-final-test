'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface AttachmentGalleryProps {
  images: { url: string; alt: string }[];
}

export function AttachmentGallery({ images }: AttachmentGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const prev = () =>
    setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () => setActiveIndex((i) => (i === null ? null : (i + 1) % images.length));

  return (
    <>
      <div className="mt-2 grid grid-cols-3 gap-1">
        {images.slice(0, 6).map((img, idx) => (
          <button
            key={`${img.url}-${idx}`}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className="aspect-square overflow-hidden rounded border border-bosque-100 hover:opacity-90"
            aria-label={`Ver imagen: ${img.alt}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-4 top-4 text-white"
            aria-label="Cerrar"
          >
            <X className="h-8 w-8" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 text-white"
            aria-label="Imagen anterior"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 text-white"
            aria-label="Imagen siguiente"
          >
            <ChevronRight className="h-10 w-10" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeIndex].url}
            alt={images[activeIndex].alt}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
