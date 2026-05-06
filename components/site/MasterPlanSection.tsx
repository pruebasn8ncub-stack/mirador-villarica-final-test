'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  ESTADO_COLORS,
  PARCELAS_GEO,
  SVG_VIEWBOX,
  buildMockInventario,
  mergeParcelas,
  type EstadoParcela,
  type Parcela,
  type ParcelaInventario,
} from '@/data/parcelas';
import { ChatCta } from './ChatCta';
import { openChatWith } from '@/lib/chat-events';

interface InventarioResponse {
  parcelas: ParcelaInventario[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const formatCLP = (v: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    .format(v);

export function MasterPlanSection() {
  const { data } = useSWR<InventarioResponse>('/api/inventario', fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  const inventario = data?.parcelas?.length ? data.parcelas : buildMockInventario();
  const parcelas = useMemo(() => mergeParcelas(PARCELAS_GEO, inventario), [inventario]);

  const [hovered, setHovered] = useState<Parcela | null>(null);
  const [filter, setFilter] = useState<'todas' | EstadoParcela>('todas');

  const filtered =
    filter === 'todas' ? parcelas : parcelas.filter((p) => p.estado === filter);

  return (
    <section
      id="master-plan"
      className="relative py-24 sm:py-32 lg:py-40 bg-bosque-950 text-crema overflow-hidden"
    >
      <div className="absolute inset-0 chat-dotgrid opacity-[0.06]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mb-12 sm:mb-16">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2.5 text-[11px] tracking-eyebrow uppercase text-mostaza mb-6">
              <span className="size-1.5 rounded-full bg-mostaza animate-pulse-dot" /> Master plan interactivo
            </p>
            <h2 className="font-display text-crema tracking-display leading-[1.05] text-[clamp(2rem,4.5vw,3.75rem)] font-light">
              Elige tu parcela.
              <br />
              <span className="italic text-mostaza">Lucía te cuenta el resto.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:pt-3">
            <p className="text-crema/75 text-base sm:text-lg leading-relaxed">
              Pasa el cursor sobre cualquier parcela para ver disponibilidad, tamaño y
              precio en tiempo real. Toca una y abrimos una conversación con Lucía con todo
              el contexto cargado.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip active={filter === 'todas'} onClick={() => setFilter('todas')}>
              Todas <span className="text-crema/50 ml-1">{parcelas.length}</span>
            </FilterChip>
            {(['disponible', 'reservada', 'vendida'] as const).map((e) => {
              const n = parcelas.filter((p) => p.estado === e).length;
              return (
                <FilterChip key={e} active={filter === e} onClick={() => setFilter(e)}>
                  <span
                    className="size-2 rounded-full mr-2"
                    style={{ background: ESTADO_COLORS[e].fill }}
                  />
                  {ESTADO_COLORS[e].label}
                  <span className="text-crema/50 ml-1">{n}</span>
                </FilterChip>
              );
            })}
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-crema/10 bg-bosque-900/40 shadow-card-hover">
          <div className="aspect-[10/7]">
            <svg
              viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
              className="w-full h-full"
              role="img"
              aria-label="Master plan interactivo de las 94 parcelas"
            >
              <defs>
                <pattern id="topo" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path
                    d="M0 30 Q15 22 30 30 T60 30"
                    fill="none"
                    stroke="rgba(244,168,75,0.06)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#topo)" />

              {parcelas.map((p) => {
                const dim = filter !== 'todas' && p.estado !== filter;
                const isHover = hovered?.id === p.id;
                const colors = ESTADO_COLORS[p.estado];
                return (
                  <g
                    key={p.id}
                    onMouseEnter={() => setHovered(p)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() =>
                      openChatWith({ parcela: p.id, intent: 'consulta_lote' })
                    }
                    className="cursor-pointer"
                  >
                    <rect
                      x={p.x}
                      y={p.y}
                      width={p.w}
                      height={p.h}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={isHover ? 3 : 1}
                      rx={6}
                      opacity={dim ? 0.18 : isHover ? 1 : 0.85}
                      className="transition-all duration-200"
                    />
                    <text
                      x={p.x + p.w / 2}
                      y={p.y + p.h / 2 + 4}
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      fontSize="14"
                      fontFamily="var(--font-fraunces)"
                      fill={p.estado === 'disponible' ? '#faf6ee' : '#1a3d2e'}
                      opacity={dim ? 0.3 : 0.9}
                    >
                      {p.lote}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {hovered && (
            <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-auto sm:max-w-xs bg-crema text-bosque-900 rounded-2xl p-5 shadow-preview animate-fade-in">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-display italic text-2xl">Parcela {hovered.lote}</span>
                <span
                  className="text-[10px] tracking-eyebrow uppercase px-2.5 py-1 rounded-full"
                  style={{
                    background: ESTADO_COLORS[hovered.estado].fill,
                    color: hovered.estado === 'disponible' ? '#faf6ee' : '#1a3d2e',
                  }}
                >
                  {ESTADO_COLORS[hovered.estado].label}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[10px] tracking-eyebrow uppercase text-bosque-900/55 mb-0.5">
                    Tamaño
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {hovered.tamanio_m2.toLocaleString('es-CL')} m²
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-eyebrow uppercase text-bosque-900/55 mb-0.5">
                    Contado
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {formatCLP(hovered.precio_contado)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-bosque-900/60">
                Toca para abrir Lucía con esta parcela cargada.
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-between gap-4">
          <p className="text-crema/55 text-sm max-w-md">
            La disponibilidad se sincroniza cada 30 segundos con el inventario oficial de
            Terra Segura.{' '}
            {filtered.length} parcelas {filter === 'todas' ? 'en el plano' : ESTADO_COLORS[filter as EstadoParcela].label.toLowerCase()}.
          </p>
          <ChatCta size="md" variant="primary" intent="masterplan">
            Pídele recomendación a Lucía
          </ChatCta>
        </div>
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center text-xs px-4 h-9 rounded-full border transition-all ${
        active
          ? 'bg-crema text-bosque-900 border-crema'
          : 'text-crema/75 border-crema/15 hover:border-crema/40 hover:text-crema'
      }`}
    >
      {children}
    </button>
  );
}
