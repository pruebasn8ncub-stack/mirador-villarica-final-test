'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AttachmentImageProps {
  url: string;
  caption?: string;
}

export function AttachmentImage({ url, caption }: AttachmentImageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsFullscreen(true)}
        className="mt-2 block w-full overflow-hidden rounded-lg border border-bosque-100 hover:opacity-95"
        aria-label={caption ? `Ampliar imagen: ${caption}` : 'Ampliar imagen'}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={caption ?? 'Imagen del proyecto'}
          className="h-auto w-full object-cover"
        />
        {caption && (
          <p className="bg-crema-50 px-3 py-2 text-left text-xs text-bosque-700">
            {caption}
          </p>
        )}
      </button>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={caption ?? 'Imagen ampliada'}
          onClick={() => setIsFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 text-white"
            aria-label="Cerrar"
          >
            <X className="h-8 w-8" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={caption ?? 'Imagen del proyecto'}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
