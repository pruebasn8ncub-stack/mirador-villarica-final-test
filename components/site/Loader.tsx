'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { LoaderScene } from './loader/LoaderScene';

const SHOWN_KEY = 'mirador:loader-v2';
const MAX_DURATION_MS = 6500;

export function Loader() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(true);
  const [skipVisible, setSkipVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const miradorRef = useRef<HTMLDivElement>(null);
  const tsRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    setMounted(true);

    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SHOWN_KEY) === '1';
    } catch {
      // sessionStorage may be unavailable in privacy mode; fall through with show=true
    }
    if (alreadyShown) {
      setShow(false);
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const finish = () => {
    try {
      sessionStorage.setItem(SHOWN_KEY, '1');
    } catch {
      // ignore
    }
    setShow(false);
  };

  useGSAP(
    () => {
      if (!show || !mounted) return;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set([miradorRef.current, tsRef.current, dividerRef.current], { autoAlpha: 1 });
        gsap.set(sceneRef.current, { autoAlpha: 0 });
        const tl = gsap.timeline({ onComplete: finish });
        tl.to(overlayRef.current, { autoAlpha: 1, duration: 0.2 })
          .to({}, { duration: 0.6 })
          .to(containerRef.current, { autoAlpha: 0, duration: 0.4 });
        timelineRef.current = tl;
      });

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          onComplete: finish,
        });

        tl.fromTo(overlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4, ease: 'power2.in' }
        )
          .fromTo(miradorRef.current,
            { scale: 0.6, filter: 'blur(20px)', autoAlpha: 0 },
            { scale: 1, filter: 'blur(0px)', autoAlpha: 1, duration: 1.2, ease: 'power3.out' },
            0.2
          )
          .fromTo(dividerRef.current,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.5 },
            1.6
          )
          .fromTo(tsRef.current,
            { y: 16, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.7 },
            '<'
          )
          .to(photoRef.current,
            { autoAlpha: 0.15, duration: 1.2 },
            2.4
          )
          .fromTo('[data-draw="mountain"]',
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 1.0, stagger: 0.15, ease: 'power1.inOut' },
            2.6
          )
          .fromTo('[data-draw="volcano"]',
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 0.9, ease: 'power2.out' },
            '-=0.6'
          )
          .fromTo('[data-draw="tree"]',
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 0.6, stagger: 0.1 },
            '-=0.5'
          )
          .fromTo('[data-draw="water"]',
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 0.7, stagger: 0.08 },
            '-=0.4'
          )
          .to([miradorRef.current, tsRef.current, dividerRef.current],
            { y: -40, scale: 0.9, autoAlpha: 0.7, duration: 0.6 },
            3.8
          )
          // bosque-950 → crema (matches tailwind.config.ts tokens)
          .to(overlayRef.current,
            {
              background: 'linear-gradient(180deg, #071410 0%, rgba(7,20,16,0.4) 50%, #faf6ee 100%)',
              duration: 0.8,
            },
            '<'
          )
          .to(containerRef.current,
            { autoAlpha: 0, duration: 0.6 },
            4.4
          );

        timelineRef.current = tl;

        gsap.fromTo(skipRef.current,
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.5, delay: 1.5,
            onStart: () => setSkipVisible(true),
          }
        );
      });

      const failsafe = window.setTimeout(finish, MAX_DURATION_MS);
      return () => window.clearTimeout(failsafe);
    },
    { scope: containerRef, dependencies: [show, mounted] }
  );

  const handleSkip = () => {
    timelineRef.current?.totalProgress(1);
  };

  if (!mounted || !show) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100]" aria-hidden="true">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-bosque-950"
        style={{ opacity: 0 }}
      />
      <LoaderScene
        miradorRef={miradorRef}
        tsRef={tsRef}
        dividerRef={dividerRef}
        sceneRef={sceneRef}
        photoRef={photoRef}
      />
      <button
        ref={skipRef}
        type="button"
        onClick={handleSkip}
        className="absolute bottom-6 right-6 z-20 text-[10px] tracking-[0.3em] uppercase text-crema/60 hover:text-mostaza transition-colors"
        style={{ opacity: 0 }}
        aria-label="Saltar intro"
        tabIndex={skipVisible ? 0 : -1}
      >
        Saltar →
      </button>
    </div>
  );
}
