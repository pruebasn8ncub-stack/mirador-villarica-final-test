'use client';

import useSWR from 'swr';
import { useMemo } from 'react';
import type { EstadoParcela, ParcelaInventario } from '@/data/parcelas';
import { buildMockInventario } from '@/data/parcelas';

interface InventarioResponse {
  parcelas: ParcelaInventario[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function InventarioBar() {
  const { data, isLoading } = useSWR<InventarioResponse>('/api/inventario', fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  const counts = useMemo(() => {
    const source = data?.parcelas?.length ? data.parcelas : buildMockInventario();
    return source.reduce<Record<EstadoParcela, number>>(
      (acc, p) => {
        acc[p.estado] = (acc[p.estado] ?? 0) + 1;
        return acc;
      },
      { disponible: 0, reservada: 0, vendida: 0 },
    );
  }, [data]);

  return (
    <div
      id="inventario"
      className="sticky top-16 sm:top-20 z-40 bg-bosque-950/92 backdrop-blur-md border-y border-mostaza/15"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 h-11 sm:h-12 flex items-center justify-between gap-6 text-crema text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-mostaza opacity-75 animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-mostaza" />
          </span>
          <span className="tracking-eyebrow uppercase text-crema/70 hidden sm:inline">
            Inventario en vivo
          </span>
          <span className="tracking-eyebrow uppercase text-crema/70 sm:hidden">En vivo</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-7 overflow-x-auto no-scrollbar">
          <Stat
            label="Disponibles"
            value={isLoading ? '—' : counts.disponible}
            dot="bg-bosque-300"
          />
          <Stat
            label="Reservadas"
            value={isLoading ? '—' : counts.reservada}
            dot="bg-mostaza"
          />
          <Stat label="Vendidas" value={isLoading ? '—' : counts.vendida} dot="bg-crema/40" />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  dot,
}: {
  label: string;
  value: number | string;
  dot: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
      <span className="font-display text-base sm:text-lg leading-none text-crema font-medium tabular-nums">
        {value}
      </span>
      <span className="text-crema/60">{label}</span>
    </span>
  );
}
