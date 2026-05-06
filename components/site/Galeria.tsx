'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
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

const photos = GALERIA;
const total = photos.length;
const totalLabel = total.toString().padStart(2, '0');

function pad(n: number) {
  return (n + 1).toString().padStart(2, '0');
}

// First sentence of alt — used as editorial title.
function titleFromAlt(alt: string) {
  const split = alt.split(/[—–\-:·]/);
  return (split[0] ?? alt).trim();
}

function eyebrowFromAlt(alt: string) {
  const split = alt.split(/[—–\-:·]/);
  return (split[1] ?? 'Mirador de Villarrica').trim();
}

export function Galeria() {
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [activeIndex, setActiveIndex] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const imgRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dragStateRef = useRef({ down: false, moved: false, startX: 0, startScroll: 0 });
  const rafRef = useRef<number | null>(null);

  // Parallax + active-slide tracking driven by scroll position.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lastIndex = -1;

    const update = () => {
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      let bestIdx = 0;
      let bestDist = Infinity;

      for (let i = 0; i < slideRefs.current.length; i++) {
        const slide = slideRefs.current[i];
        const inner = imgRefs.current[i];
        if (!slide) continue;
        const rect = slide.getBoundingClientRect();
        const slideCenter = rect.left + rect.width / 2;
        const distance = slideCenter - center;
        const absDistance = Math.abs(distance);

        if (absDistance < bestDist) {
          bestDist = absDistance;
          bestIdx = i;
        }

        if (inner && !reduced) {
          // Parallax: shift image inside frame opposite to slide travel,
          // capped to ±32px so it never reveals frame edges (img is scaled 1.15).
          const norm = Math.max(-1, Math.min(1, distance / rect.width));
          const tx = -norm * 32;
          inner.style.transform = `translate3d(${tx}px, 0, 0) scale(1.15)`;
        }
      }

      if (bestIdx !== lastIndex) {
        lastIndex = bestIdx;
        setActiveIndex(bestIdx);
      }
      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Drag-to-scroll (desktop) + wheel-to-horizontal while hovering.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onPointerDown = (e: PointerEvent) => {
      // Only main button, and skip if user clicked a focusable child (img click handled separately).
      if (e.button !== 0) return;
      dragStateRef.current = {
        down: true,
        moved: false,
        startX: e.clientX,
        startScroll: track.scrollLeft,
      };
    };
    const onPointerMove = (e: PointerEvent) => {
      const s = dragStateRef.current;
      if (!s.down) return;
      const dx = e.clientX - s.startX;
      if (Math.abs(dx) > 4) {
        s.moved = true;
        track.style.cursor = 'grabbing';
        track.style.scrollSnapType = 'none';
      }
      if (s.moved) {
        track.scrollLeft = s.startScroll - dx;
      }
    };
    const onPointerUp = () => {
      const s = dragStateRef.current;
      if (s.moved) {
        track.style.cursor = '';
        // Re-enable snap; browser will glide to nearest.
        track.style.scrollSnapType = '';
      }
      s.down = false;
    };

    const onWheel = (e: WheelEvent) => {
      // Only redirect vertical wheel to horizontal scroll when carousel is hovered
      // and the user isn't already producing horizontal delta.
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        track.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    track.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    track.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      track.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      track.removeEventListener('wheel', onWheel);
    };
  }, []);

  const scrollByOne = (dir: 1 | -1) => {
    const track = trackRef.current;
    const slide = slideRefs.current[0];
    if (!track || !slide) return;
    const step = slide.getBoundingClientRect().width + 24; // include gap
    track.scrollBy({ left: step * dir, behavior: 'smooth' });
  };

  const handleSlideClick = (i: number) => {
    if (dragStateRef.current.moved) return; // suppress click after drag
    setLightboxIndex(i);
  };

  return (
    <section id="galeria" className="relative py-24 sm:py-32 lg:py-40 bg-crema-200 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal>
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
        </Reveal>
      </div>

      <div className="relative">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-crema-200 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-crema-200 to-transparent" />

        {/* Track */}
        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-5 sm:px-12 lg:px-[max(3rem,calc((100vw-80rem)/2+3rem))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x select-none"
          style={{ cursor: 'grab' }}
        >
          {photos.map((photo, i) => {
            const title = titleFromAlt(photo.alt);
            const eyebrow = eyebrowFromAlt(photo.alt);
            return (
              <article
                key={photo.src}
                ref={(el) => {
                  slideRefs.current[i] = el;
                }}
                className="snap-center shrink-0 w-[88vw] sm:w-[70vw] lg:w-[58vw] xl:w-[52vw] max-w-[940px]"
              >
                <button
                  type="button"
                  onClick={() => handleSlideClick(i)}
                  aria-label={`Abrir foto ${pad(i)}: ${title}`}
                  className="group relative block w-full overflow-hidden rounded-3xl bg-bosque-900/5 aspect-[16/10] focus:outline-none focus-visible:ring-2 focus-visible:ring-mostaza/70 focus-visible:ring-offset-4 focus-visible:ring-offset-crema-200"
                >
                  <div
                    ref={(el) => {
                      imgRefs.current[i] = el;
                    }}
                    className="absolute inset-0 will-change-transform motion-reduce:!transform-none"
                    style={{ transform: 'scale(1.15)' }}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 70vw, 58vw"
                      className="object-cover pointer-events-none"
                      draggable={false}
                      priority={i === 0}
                    />
                  </div>

                  {/* Vignette + bottom gradient for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bosque-950/70 via-bosque-950/10 to-transparent" />

                  {/* Editorial overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 lg:p-10 pointer-events-none">
                    <div className="flex items-start justify-between text-crema">
                      <span className="font-display text-3xl sm:text-4xl tracking-tight tabular-nums">
                        {pad(i)}
                        <span className="text-crema/50 text-base align-top ml-1">/{totalLabel}</span>
                      </span>
                      <span className="text-[10px] tracking-eyebrow uppercase text-mostaza/90 max-w-[55%] text-right">
                        {eyebrow}
                      </span>
                    </div>
                    <div className="space-y-2 max-w-[80%]">
                      <span className="block h-px w-12 bg-mostaza/80 transition-all duration-500 group-hover:w-20" />
                      <h3 className="font-display text-crema text-xl sm:text-2xl lg:text-3xl leading-tight font-light">
                        {title}
                      </h3>
                    </div>
                  </div>

                  {/* Hover hint */}
                  <span className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 inline-flex items-center gap-2 rounded-full border border-crema/30 bg-bosque-950/30 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-eyebrow uppercase text-crema/85 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Ver foto
                  </span>
                </button>
              </article>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 mt-8 sm:mt-10 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-bosque-900/60 text-[11px] tracking-eyebrow uppercase">
            <span className="font-display text-bosque-900 text-2xl tabular-nums">{pad(activeIndex)}</span>
            <span className="h-px w-10 bg-bosque-900/20" />
            <span className="tabular-nums">{totalLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByOne(-1)}
              aria-label="Foto anterior"
              className="group size-12 rounded-full border border-bosque-900/15 hover:border-mostaza hover:bg-mostaza/10 transition-all flex items-center justify-center"
              disabled={activeIndex === 0}
            >
              <svg viewBox="0 0 24 24" className="size-4 text-bosque-900 group-hover:text-mostaza transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByOne(1)}
              aria-label="Foto siguiente"
              className="group size-12 rounded-full border border-bosque-900/15 hover:border-mostaza hover:bg-mostaza/10 transition-all flex items-center justify-center"
              disabled={activeIndex === total - 1}
            >
              <svg viewBox="0 0 24 24" className="size-4 text-bosque-900 group-hover:text-mostaza transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
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
