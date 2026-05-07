'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { LoaderScene } from './loader/LoaderScene';

const SHOWN_KEY = 'mirador:loader-v3';
const MAX_DURATION_MS = 7000;

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
  const logosRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    setMounted(true);

    const params = new URLSearchParams(window.location.search);
    const forceShow =
      params.has('loader') ||
      params.get('preview') === 'loader' ||
      process.env.NODE_ENV !== 'production';

    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SHOWN_KEY) === '1';
    } catch {
      // sessionStorage may be unavailable in privacy mode; fall through with show=true
    }
    if (alreadyShown && !forceShow) {
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
      if (!containerRef.current) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduced) {
        gsap.set([miradorRef.current, tsRef.current, dividerRef.current, sceneRef.current], {
          autoAlpha: 1,
        });
        const tl = gsap.timeline({ onComplete: finish });
        tl.to(overlayRef.current, { autoAlpha: 1, duration: 0.2 })
          .to({}, { duration: 1.4 })
          .to(containerRef.current, { autoAlpha: 0, duration: 0.5 });
        timelineRef.current = tl;

        const failsafe = window.setTimeout(finish, MAX_DURATION_MS);
        return () => window.clearTimeout(failsafe);
      }

      {
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          onComplete: finish,
        });

        // 1) Overlay + Mirador logo (0 → 1.4s)
        tl.fromTo(overlayRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4, ease: 'power2.in' }
        )
          .fromTo(miradorRef.current,
            { scale: 0.6, filter: 'blur(20px)', autoAlpha: 0 },
            { scale: 1, filter: 'blur(0px)', autoAlpha: 1, duration: 1.2, ease: 'power3.out' },
            0.2
          )

          // 2) Divider + "Un proyecto de" + Terra Segura (1.4s → 2.6s)
          .fromTo(dividerRef.current,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.55 },
            1.5
          )
          .fromTo(tsRef.current,
            { y: 16, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.7 },
            '<+0.05'
          )

          // 3) Logos lift slightly + scene reveals (2.8s)
          .to(logosRef.current,
            { y: -28, scale: 0.94, duration: 1.0, ease: 'power2.out' },
            2.8
          )
          .to(sceneRef.current,
            { autoAlpha: 1, duration: 0.5, ease: 'power1.out' },
            2.8
          )

          // 4) Volcano draws (2.95s → 4.25s)
          .fromTo('[data-draw="volcano"]',
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 1.3, ease: 'power2.out', stagger: 0.08 },
            2.95
          )

          // 5) Trees draw stagger (3.4s → 4.6s)
          .fromTo('[data-draw="tree"]',
            { drawSVG: '0%' },
            { drawSVG: '100%', duration: 0.75, stagger: 0.12, ease: 'power1.inOut' },
            3.4
          )

          // 6) Hold + outro (5.0s → 5.7s)
          .to({}, { duration: 0.5 }, 4.8)
          .to(overlayRef.current,
            {
              background: 'linear-gradient(180deg, #071410 0%, rgba(7,20,16,0.4) 55%, #faf6ee 100%)',
              duration: 0.7,
            },
            5.1
          )
          .to(containerRef.current,
            { autoAlpha: 0, duration: 0.6 },
            5.4
          );

        timelineRef.current = tl;

        gsap.fromTo(skipRef.current,
          { autoAlpha: 0, y: 6 },
          { autoAlpha: 1, y: 0, duration: 0.5, delay: 1.5,
            onStart: () => setSkipVisible(true),
          }
        );
      }

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
        logosRef={logosRef}
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
