'use client';

import useSWR from 'swr';
import { useMemo } from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import {
  buildMockInventario,
  type EstadoParcela,
  type ParcelaInventario,
} from '@/data/parcelas';
import { ChatCta } from './ChatCta';
import { Reveal } from './Reveal';

interface InventarioResponse {
  parcelas: ParcelaInventario[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function SalesProgress() {
  const { data } = useSWR<InventarioResponse>('/api/inventario', fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  const counts = useMemo(() => {
    const source = data?.parcelas?.length ? data.parcelas : buildMockInventario();
    const out = source.reduce<Record<EstadoParcela, number>>(
      (acc, p) => {
        acc[p.estado] = (acc[p.estado] ?? 0) + 1;
        return acc;
      },
      { disponible: 0, reservada: 0, vendida: 0 },
    );
    out.disponible ||= 0;
    out.reservada ||= 0;
    out.vendida ||= 0;
    return out;
  }, [data]);

  const total = counts.disponible + counts.reservada + counts.vendida || 94;
  const vendidasPct = Math.round((counts.vendida / total) * 100);
  const reservadasPct = Math.round((counts.reservada / total) * 100);
  const ocupadasPct = vendidasPct + reservadasPct;

  return (
    <section className="relative bg-crema py-20 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal>
          <div className="relative rounded-3xl bg-bosque-950 text-crema p-8 sm:p-12 lg:p-16 overflow-hidden shadow-card-hover">
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(244,168,75,0.15),transparent_55%)]"
              aria-hidden
            />
            <div className="absolute inset-0 chat-dotgrid opacity-[0.04]" aria-hidden />

            <div className="relative grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <div className="lg:col-span-7">
                <p className="inline-flex items-center gap-2.5 text-mostaza text-[11px] tracking-eyebrow uppercase mb-5">
                  <span className="size-1.5 rounded-full bg-mostaza animate-pulse-dot" />
                  Estado de venta · sincronizado en vivo
                </p>

                <h2 className="font-display text-crema tracking-display leading-[1.05] text-[clamp(1.75rem,3.5vw,3rem)] font-light">
                  <span className="font-display italic text-mostaza tabular-nums">
                    {counts.disponible}
                  </span>{' '}
                  de {total} parcelas
                  <br />
                  todavía esperan dueño.
                </h2>

                <div className="mt-9">
                  <div className="flex items-baseline justify-between mb-3 text-xs">
                    <span className="text-crema/60 tracking-eyebrow uppercase">
                      Avance del proyecto
                    </span>
                    <span className="font-display text-mostaza text-base tabular-nums">
                      {ocupadasPct}% colocado
                    </span>
                  </div>
                  <div
                    className="relative h-2.5 rounded-full bg-crema/8 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={ocupadasPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="absolute inset-y-0 left-0 bg-bosque-500 transition-all duration-1000"
                      style={{ width: `${vendidasPct}%` }}
                    />
                    <div
                      className="absolute inset-y-0 bg-mostaza transition-all duration-1000"
                      style={{ left: `${vendidasPct}%`, width: `${reservadasPct}%` }}
                    />
                  </div>

                  <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
                    <Legend dot="bg-bosque-500" label="Vendidas" value={counts.vendida} />
                    <Legend dot="bg-mostaza" label="Reservadas" value={counts.reservada} />
                    <Legend
                      dot="bg-crema/30"
                      label="Disponibles"
                      value={counts.disponible}
                      highlight
                    />
                  </dl>
                </div>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <ChatCta size="md" variant="primary" intent="masterplan">
                    Ver disponibles
                  </ChatCta>
                  <span className="inline-flex items-center gap-2 text-xs text-crema/55">
                    <Clock className="size-3.5" /> actualizado cada 30 segundos
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 lg:border-l lg:border-crema/10 lg:pl-12">
                <p className="text-[11px] tracking-eyebrow uppercase text-crema/55 mb-5">
                  Ritmo de colocación
                </p>
                <ul className="space-y-5">
                  <Pulse
                    icon={<TrendingUp className="size-4 text-mostaza" />}
                    title="3 reservas esta semana"
                    sub="Parcelas P-031, P-058 y P-072 — todas en zona mirador"
                  />
                  <Pulse
                    icon={
                      <span className="size-4 rounded-full bg-bosque-500/30 border border-bosque-500" />
                    }
                    title={`${counts.disponible} todavía abiertas`}
                    sub="Tamaños desde 5.000 m² hasta 1 hectárea"
                  />
                  <Pulse
                    icon={
                      <span className="size-4 rounded-full bg-mostaza/30 border border-mostaza" />
                    }
                    title="Promesa firme en 72 h"
                    sub="Reserva → escritura sin intermediarios bancarios"
                  />
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Legend({
  dot,
  label,
  value,
  highlight,
}: {
  dot: string;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-crema/65 text-[11px] tracking-eyebrow uppercase mb-1.5">
        <span className={`size-1.5 rounded-full ${dot}`} />
        {label}
      </dt>
      <dd
        className={`font-display tabular-nums leading-none ${
          highlight ? 'text-mostaza text-3xl sm:text-4xl' : 'text-crema text-2xl sm:text-3xl'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function Pulse({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="mt-1 shrink-0">{icon}</span>
      <div>
        <p className="text-crema text-[15px] font-medium tracking-tight">{title}</p>
        <p className="text-crema/55 text-xs mt-0.5 leading-relaxed">{sub}</p>
      </div>
    </li>
  );
}
