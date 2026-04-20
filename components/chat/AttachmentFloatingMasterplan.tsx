'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Map, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface AttachmentFloatingMasterplanProps {
  url: string;
  caption?: string;
  title?: string;
}

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.5;

export function AttachmentFloatingMasterplan({
  url,
  caption,
  title,
}: AttachmentFloatingMasterplanProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-' || e.key === '_') zoomOut();
      if (e.key === '0') resetZoom();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [open]);

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () =>
    setZoom((z) => {
      const next = Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: pan.x,
      baseY: pan.y,
    };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.baseX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.baseY + (e.clientY - dragRef.current.startY),
    });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const legendItems: { color: string; label: string }[] = [
    { color: 'bg-red-500', label: 'Vendidas' },
    { color: 'bg-blue-500', label: 'Reservadas' },
    { color: 'bg-white ring-1 ring-bosque-300', label: 'Disponibles' },
  ];

  const inlinePreview = (
    <div className="mt-2 flex flex-col gap-2 overflow-hidden rounded-xl border border-bosque-100 bg-white p-2 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative aspect-[16/10] overflow-hidden rounded-lg bg-bosque-50"
        aria-label="Abrir masterplan"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title ?? 'Masterplan del proyecto'}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-b from-bosque-900/10 via-bosque-900/30 to-bosque-900/60 text-crema opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-2 ring-crema/80 backdrop-blur-sm">
            <Maximize2 className="h-5 w-5" strokeWidth={2.5} />
          </div>
        </div>
        <span className="absolute left-2 top-2 rounded-full bg-bosque-900/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-crema backdrop-blur-sm">
          Masterplan
        </span>
      </button>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
        {legendItems.map((i) => (
          <span key={i.label} className="flex items-center gap-1.5 text-[11px] font-medium text-bosque-700">
            <span className={`h-2.5 w-2.5 rounded-sm ${i.color}`} aria-hidden />
            {i.label}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-bosque-800 px-3 py-2 text-[12px] font-semibold text-crema transition-colors hover:bg-bosque-700"
      >
        <Maximize2 className="h-3.5 w-3.5" strokeWidth={2.5} />
        {isMobile ? 'Abrir masterplan a pantalla completa' : 'Abrir masterplan al costado'}
      </button>
    </div>
  );

  const floating =
    open && mounted
      ? createPortal(
          <AnimatePresence>
            <motion.div
              key="masterplan-floating"
              initial={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 24 : 0, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 24 : 0, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-label="Masterplan del proyecto"
              aria-modal="false"
              className="fixed z-[60] flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-bosque-900/10
                         inset-0 md:inset-auto md:bottom-6 md:right-[440px] md:h-[calc(100vh-3rem)] md:max-h-[780px] md:w-[500px] md:rounded-2xl"
            >
              <header className="flex items-center justify-between bg-bosque-800 px-4 py-3 text-crema">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Map className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-semibold leading-tight">
                      {title ?? 'Masterplan del proyecto'}
                    </h3>
                    <p className="truncate text-[11px] leading-tight opacity-70">
                      {caption ?? 'Plano comercial · Mirador de Villarrica'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-bosque-700"
                  aria-label="Cerrar masterplan"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              </header>

              <div
                className="relative flex-1 overflow-hidden bg-bosque-900/90 select-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{ cursor: zoom > 1 ? (dragRef.current ? 'grabbing' : 'grab') : 'default' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={title ?? 'Masterplan del proyecto'}
                  draggable={false}
                  className="h-full w-full object-contain transition-transform duration-150 ease-out"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                />

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/60 p-1 text-white backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={zoomOut}
                    disabled={zoom <= ZOOM_MIN}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:opacity-40"
                    aria-label="Alejar"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="min-w-[42px] text-center text-[11px] font-semibold tabular-nums">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={zoomIn}
                    disabled={zoom >= ZOOM_MAX}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:opacity-40"
                    aria-label="Acercar"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={resetZoom}
                    disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10 disabled:opacity-40"
                    aria-label="Restablecer zoom"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-bosque-100 bg-crema px-4 py-2.5">
                {legendItems.map((i) => (
                  <span
                    key={i.label}
                    className="flex items-center gap-1.5 text-[11.5px] font-semibold text-bosque-800"
                  >
                    <span className={`h-3 w-3 rounded-sm ${i.color}`} aria-hidden />
                    {i.label}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      {inlinePreview}
      {floating}
    </>
  );
}
