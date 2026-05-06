'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MasonryPhotoAlbum, type RenderImageContext, type RenderImageProps } from 'react-photo-album';
import 'react-photo-album/masonry.css';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import { GALERIA } from '@/data/content';
import { Reveal } from './Reveal';

const photos = GALERIA.map((g) => ({
  src: g.src,
  alt: g.alt,
  width: g.width,
  height: g.height,
}));

function NextImageRenderer(
  { alt, title, sizes, className, onClick }: RenderImageProps,
  { photo, width, height }: RenderImageContext<(typeof photos)[number]>,
) {
  return (
    <div
      style={{ width: '100%', position: 'relative', aspectRatio: `${width} / ${height}` }}
      className={className}
    >
      <Image
        fill
        src={photo.src}
        alt={alt ?? photo.alt}
        title={title}
        sizes={sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        placeholder="empty"
        onClick={onClick}
        className="object-cover transition-transform duration-700 hover:scale-[1.04] cursor-zoom-in"
      />
    </div>
  );
}

export function Galeria() {
  const [index, setIndex] = useState(-1);

  return (
    <section id="galeria" className="relative py-24 sm:py-32 lg:py-40 bg-crema-200">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2.5 text-[11px] tracking-eyebrow uppercase text-bosque-700/80 mb-6">
              <span className="size-1.5 rounded-full bg-mostaza" /> El lugar
            </p>
            <h2 className="font-display text-bosque-900 tracking-display leading-[1.05] text-[clamp(2rem,4.5vw,3.75rem)] font-light">
              No es una promesa,
              <br />
              <span className="italic">son fotos del terreno</span>.
            </h2>
          </div>
          <p className="max-w-sm text-bosque-900/70 text-[15px] leading-relaxed">
            Tomadas en abril desde el punto exacto donde vivirá tu parcela.
          </p>
        </div>

        <Reveal>
          <div className="[&_.react-photo-album--masonryColumn>div]:overflow-hidden [&_.react-photo-album--masonryColumn>div]:rounded-2xl [&_.react-photo-album--masonryColumn>div]:bg-bosque-900/5">
            <MasonryPhotoAlbum
              photos={photos}
              columns={(containerWidth) => {
                if (containerWidth < 640) return 1;
                if (containerWidth < 1024) return 2;
                return 3;
              }}
              spacing={(containerWidth) => (containerWidth < 640 ? 12 : 16)}
              onClick={({ index }) => setIndex(index)}
              render={{ image: NextImageRenderer }}
              sizes={{
                size: '1200px',
                sizes: [
                  { viewport: '(max-width: 640px)', size: 'calc(100vw - 40px)' },
                  { viewport: '(max-width: 1024px)', size: 'calc(50vw - 24px)' },
                ],
              }}
            />
          </div>
        </Reveal>
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={photos.map((p) => ({
          src: p.src,
          alt: p.alt,
          width: p.width,
          height: p.height,
          description: p.alt,
        }))}
        plugins={[Captions, Fullscreen, Thumbnails, Zoom]}
        carousel={{ finite: false }}
        thumbnails={{ position: 'bottom', borderRadius: 8, gap: 12, padding: 4 }}
        zoom={{ maxZoomPixelRatio: 3, scrollToZoom: true }}
        captions={{ descriptionTextAlign: 'center', showToggle: true }}
        styles={{
          container: { backgroundColor: 'rgba(20, 30, 25, 0.96)' },
          thumbnailsContainer: { backgroundColor: 'rgba(20, 30, 25, 0.96)' },
        }}
      />
    </section>
  );
}
