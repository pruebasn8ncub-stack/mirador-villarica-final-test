'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import useSWR from 'swr';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { MessageCircle, Maximize2, Filter, MapPin, Loader2, X, ZoomIn, ZoomOut, RotateCcw, type LucideIcon } from 'lucide-react';
import {
  PARCELAS_GEO,
  SVG_VIEWBOX,
  ESTADO_COLORS,
  buildMockInventario,
  mergeParcelas,
  type Parcela,
  type ParcelaInventario,
  type EstadoParcela,
} from '@/data/parcelas';
import { openChatWith } from '@/lib/chat-events';
import { formatCLP } from '@/lib/simulator';
import { cn } from '@/lib/utils';

interface InventarioResponse {
  source: string;
  counts: Record<EstadoParcela, number>;
  parcelas: ParcelaInventario[];
}

const FALLBACK_INV = buildMockInventario();
const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error('inv fetch failed');
  return r.json() as Promise<InventarioResponse>;
});

const TAMANO_FILTERS = [
  { label: 'Todos', min: 0,    max: Infinity },
  { label: '5–6k m²', min: 5000, max: 6499 },
  { label: '6.5–8k m²', min: 6500, max: 7999 },
  { label: '8k+ m²', min: 8000, max: Infinity },
];

export function MasterPlanInteractivo() {
  const [tamanoFilter, setTamanoFilter] = useState(0);
  const [hoverLote, setHoverLote] = useState<number | null>(null);
  const [selectedLote, setSelectedLote] = useState<number | null>(null);

  // SWR: fetch inicial + revalidación cada 30s + retry on focus.
  // Fallback inmediato al mock para SSR + primer render.
  const { data, isLoading, isValidating } = useSWR<InventarioResponse>(
    '/api/inventario',
    fetcher,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      fallbackData: { source: 'mock', counts: { disponible: 0, reservada: 0, vendida: 0 }, parcelas: FALLBACK_INV },
      dedupingInterval: 10_000,
    }
  );
  const inv = data?.parcelas ?? FALLBACK_INV;

  const parcelas: Parcela[] = useMemo(
    () => mergeParcelas(PARCELAS_GEO, inv),
    [inv]
  );

  const counts = useMemo(() => {
    const c: Record<EstadoParcela, number> = { disponible: 0, reservada: 0, vendida: 0 };
    for (const p of parcelas) c[p.estado]++;
    return c;
  }, [parcelas]);

  const visible = useMemo(() => {
    const f = TAMANO_FILTERS[tamanoFilter];
    return new Set(parcelas.filter((p) => p.tamanio_m2 >= f.min && p.tamanio_m2 <= f.max).map((p) => p.lote));
  }, [parcelas, tamanoFilter]);

  const selected = selectedLote ? parcelas.find((p) => p.lote === selectedLote) : null;
  const hover = hoverLote ? parcelas.find((p) => p.lote === hoverLote) : null;

  const tooltipTarget = hover ?? selected;

  return (
    <section
      id="master-plan"
      className="relative bg-bosque-50/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza-500">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mostaza/70 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mostaza-500" />
            </span>
            Inventario en vivo
          </p>
          <h2 className="font-display text-4xl font-light leading-[1.05] tracking-display text-bosque-900 md:text-5xl lg:text-6xl">
            Master Plan <span className="italic text-bosque-700">interactivo</span>
          </h2>
          <p className="mt-5 text-[15.5px] leading-relaxed text-bosque-800/75">
            Toca cualquier parcela para ver su tamaño, precio y estado en tiempo real.
            Si está disponible, te conectamos con Lucía con la información ya cargada.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {(['disponible', 'reservada', 'vendida'] as EstadoParcela[]).map((estado) => {
            const c = ESTADO_COLORS[estado];
            return (
              <div key={estado} className="flex items-center gap-2 rounded-full border border-bosque-100 bg-white px-4 py-2 shadow-sm">
                <span className="h-3 w-3 rounded-full" style={{ background: c.fill, border: `1.5px solid ${c.stroke}` }} />
                <span className="text-[13px] font-medium text-bosque-800">{c.label}</span>
                <span className="text-[12px] font-semibold text-bosque-500">{counts[estado]}</span>
              </div>
            );
          })}
          {(isLoading || isValidating) && (
            <span className="flex items-center gap-1.5 text-[12px] text-bosque-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.4} />
              {isLoading ? 'Cargando…' : 'Sincronizando…'}
            </span>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-2"
        >
          <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-eyebrow text-bosque-500">
            <Filter className="h-3 w-3" strokeWidth={2.4} /> Filtrar por tamaño
          </span>
          {TAMANO_FILTERS.map((f, i) => (
            <button
              key={f.label}
              onClick={() => setTamanoFilter(i)}
              className={cn(
                'rounded-full px-4 py-1.5 text-[12.5px] font-medium transition',
                tamanoFilter === i
                  ? 'bg-bosque-900 text-crema shadow-md'
                  : 'border border-bosque-200 bg-white text-bosque-700 hover:border-bosque-400'
              )}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="relative mt-10 overflow-hidden rounded-[28px] bg-white shadow-card-hover ring-1 ring-bosque-100"
        >
          <div className="relative aspect-[10/7] w-full">
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={4}
              wheel={{ step: 0.15 }}
              doubleClick={{ disabled: false, step: 1.6 }}
              panning={{ velocityDisabled: false }}
              limitToBounds
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5 rounded-xl bg-white/90 p-1 shadow-md backdrop-blur-sm">
                    <button
                      onClick={() => zoomIn()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-bosque-700 transition hover:bg-bosque-50"
                      aria-label="Acercar"
                    >
                      <ZoomIn className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                    <button
                      onClick={() => zoomOut()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-bosque-700 transition hover:bg-bosque-50"
                      aria-label="Alejar"
                    >
                      <ZoomOut className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-bosque-700 transition hover:bg-bosque-50"
                      aria-label="Vista inicial"
                    >
                      <RotateCcw className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                  </div>

                  <TransformComponent
                    wrapperClass="!w-full !h-full"
                    contentClass="!w-full !h-full"
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src="/assets/master-plan.jpg"
                        alt="Plano comercial Mirador de Villarrica"
                        fill
                        priority
                        sizes="(min-width: 1024px) 1100px, 100vw"
                        className="object-cover opacity-95"
                      />
                      <svg
                        viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
                        className="absolute inset-0 h-full w-full"
                        preserveAspectRatio="xMidYMid meet"
                        role="img"
                        aria-label="Master plan interactivo con parcelas clickeables"
                      >
              {parcelas.map((p) => {
                const c = ESTADO_COLORS[p.estado];
                const isVisible = visible.has(p.lote);
                const isSelected = selectedLote === p.lote;
                const isHover = hoverLote === p.lote;
                return (
                  <g key={p.lote}>
                    <rect
                      x={p.x}
                      y={p.y}
                      width={p.w}
                      height={p.h}
                      rx={6}
                      fill={c.fill}
                      stroke={isSelected || isHover ? '#1a3d2e' : c.stroke}
                      strokeWidth={isSelected ? 3 : isHover ? 2.5 : 1.5}
                      opacity={isVisible ? (isHover || isSelected ? 1 : 0.78) : 0.12}
                      style={{
                        cursor: p.estado === 'vendida' ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.25s, stroke-width 0.15s',
                      }}
                      onMouseEnter={() => isVisible && setHoverLote(p.lote)}
                      onMouseLeave={() => setHoverLote(null)}
                      onClick={() => isVisible && setSelectedLote(p.lote)}
                    />
                    {(isHover || isSelected) && isVisible && (
                      <text
                        x={p.x + p.w / 2}
                        y={p.y + p.h / 2 + 4}
                        textAnchor="middle"
                        className="pointer-events-none select-none fill-white text-[11px] font-bold"
                      >
                        {p.lote}
                      </text>
                    )}
                  </g>
                );
              })}
                      </svg>
                    </div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>
        </motion.div>

        <p className="mt-3 text-center text-[11.5px] text-bosque-500">
          {parcelas.length} parcelas · {visible.size} visibles con el filtro actual
        </p>

        <AnimatePresence>
          {tooltipTarget && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none mx-auto mt-6 max-w-2xl rounded-2xl border border-bosque-100 bg-white p-5 shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-eyebrow text-mostaza-500">
                    Lote {String(tooltipTarget.lote).padStart(3, '0')} · {tooltipTarget.zona}
                  </p>
                  <p className="mt-1 font-display text-2xl font-medium text-bosque-900">
                    {tooltipTarget.tamanio_m2.toLocaleString('es-CL')} m²
                  </p>
                </div>
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold"
                  style={{
                    background: ESTADO_COLORS[tooltipTarget.estado].fill + '22',
                    color: ESTADO_COLORS[tooltipTarget.estado].stroke,
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: ESTADO_COLORS[tooltipTarget.estado].fill }} />
                  {ESTADO_COLORS[tooltipTarget.estado].label}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-bosque-100 pt-4">
                <div>
                  <p className="text-[10.5px] uppercase tracking-eyebrow text-bosque-500">Precio contado</p>
                  <p className="mt-1 font-display text-lg font-medium text-bosque-900">
                    {formatCLP(tooltipTarget.precio_contado)}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] uppercase tracking-eyebrow text-bosque-500">Pie 50%</p>
                  <p className="mt-1 font-display text-lg font-medium text-bosque-900">
                    {formatCLP(tooltipTarget.pie_minimo_50pct)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selected && selected.estado !== 'vendida' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mx-auto mt-4 flex max-w-2xl flex-col items-center gap-2 sm:flex-row sm:justify-between"
            >
              <button
                onClick={() => {
                  openChatWith({ parcela: `P-${String(selected.lote).padStart(3, '0')}`, intent: 'consulta_lote' });
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-mostaza px-6 py-3 text-sm font-semibold text-bosque-900 shadow-md transition hover:-translate-y-0.5 hover:bg-mostaza-400 sm:w-auto"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={2.4} />
                Consultar lote {selected.lote} con Lucía
              </button>
              <button
                onClick={() => setSelectedLote(null)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-bosque-600 hover:text-bosque-900"
              >
                <X className="h-3.5 w-3.5" /> Cerrar selección
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 grid gap-3 rounded-2xl bg-white p-5 text-[13px] text-bosque-700/80 shadow-sm sm:grid-cols-3">
          <Hint icon={Maximize2}>Tap o hover sobre una parcela para verla.</Hint>
          <Hint icon={Filter}>Filtra por rango de m² para encontrar la tuya.</Hint>
          <Hint icon={MapPin}>Click en disponible → conversación con contexto.</Hint>
        </div>
      </div>
    </section>
  );
}

function Hint({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mostaza-500" strokeWidth={2.4} />
      {children}
    </p>
  );
}
