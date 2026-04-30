'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Eye,
  MousePointerClick,
  MessagesSquare,
  Users,
  StickyNote,
  Target,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsResponse {
  range: string;
  kpis: {
    sessions: number;
    launcher_clicks: number;
    conversations_started: number;
    leads: number;
    qualified_leads: number;
    feedback: number;
  };
  forma_pago_distribution: Record<string, number>;
  uso_distribution: Record<string, number>;
  funnel: {
    sessions: number;
    clicks: number;
    conversations: number;
    leads: number;
    qualified: number;
  };
  series: { date: string; sessions: number; clicks: number; leads: number }[];
}

const fetcher = async (url: string): Promise<StatsResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

type Range = 'today' | '7d' | '30d' | 'all';

export function OverviewClient() {
  const [range, setRange] = useState<Range>('30d');
  const { data, error, isLoading } = useSWR(
    `/api/dashboard/stats?range=${range}`,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-display text-bosque-900 md:text-4xl">
            Resumen
          </h1>
          <p className="mt-1 text-sm text-bosque-700">
            Telemetría agregada del widget y los leads de Mirador.
          </p>
        </div>
        <RangeTabs range={range} onChange={setRange} />
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error: {String(error.message ?? error)}
        </div>
      )}

      {isLoading && !data && (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-6 w-6 animate-spin text-bosque-400" />
        </div>
      )}

      {data && (
        <>
          <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi
              icon={Eye}
              label="Visitas (sessions)"
              value={data.kpis.sessions}
              hint="Cada apertura única del sitio con el widget cargado."
            />
            <Kpi
              icon={MousePointerClick}
              label="Clicks al launcher"
              value={data.kpis.launcher_clicks}
              accent="mostaza"
              hint="Veces que alguien tocó el botón flotante para abrir el chat."
            />
            <Kpi
              icon={MessagesSquare}
              label="Conversaciones"
              value={data.kpis.conversations_started}
              hint="Sesiones con al menos un mensaje intercambiado con Lucía."
            />
            <Kpi
              icon={Users}
              label="Leads registrados"
              value={data.kpis.leads}
              accent="bosque"
              hint="Pasaron el gate del nombre + WhatsApp + email."
            />
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-2xl bg-white p-5 shadow-card ring-1 ring-bosque-100">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-bosque-700">
                Funnel
              </h2>
              <Funnel data={data.funnel} />
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-bosque-100">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-bosque-700">
                Distribución de leads
              </h2>
              <DistList
                title="Forma de pago"
                dist={data.forma_pago_distribution}
              />
              <div className="mt-4 border-t border-bosque-100 pt-4">
                <DistList title="Uso" dist={data.uso_distribution} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-bosque-100 pt-4 text-xs">
                <SecondaryStat
                  icon={Target}
                  label="Calificados"
                  value={data.kpis.qualified_leads}
                />
                <SecondaryStat
                  icon={StickyNote}
                  label="Anotaciones"
                  value={data.kpis.feedback}
                />
              </div>
            </section>
          </div>

          <section className="mt-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-bosque-100">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-bosque-700">
              Tendencia diaria
            </h2>
            <SeriesChart series={data.series} />
          </section>
        </>
      )}
    </div>
  );
}

function RangeTabs({
  range,
  onChange,
}: {
  range: Range;
  onChange: (r: Range) => void;
}) {
  const opts: [Range, string][] = [
    ['today', 'Hoy'],
    ['7d', '7d'],
    ['30d', '30d'],
    ['all', 'Todo'],
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-bosque-200 bg-white p-0.5">
      {opts.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
            range === v
              ? 'bg-bosque-800 text-crema'
              : 'text-bosque-700 hover:bg-bosque-50'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
  hint?: string;
  accent?: 'bosque' | 'mostaza';
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-card ring-1 ring-bosque-100">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-bosque-600">
        <Icon
          className={cn(
            'h-3.5 w-3.5',
            accent === 'mostaza'
              ? 'text-mostaza-400'
              : accent === 'bosque'
                ? 'text-bosque-700'
                : 'text-bosque-500'
          )}
        />
        {label}
      </div>
      <div className="mt-1 font-display text-3xl font-medium tabular-nums text-bosque-900">
        {value.toLocaleString('es-CL')}
      </div>
      {hint && (
        <p className="mt-1 text-[11px] leading-snug text-bosque-500">{hint}</p>
      )}
    </div>
  );
}

function SecondaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-bosque-400" />
      <div>
        <div className="text-[10.5px] uppercase tracking-wide text-bosque-600">
          {label}
        </div>
        <div className="font-display text-base font-medium text-bosque-900">
          {value}
        </div>
      </div>
    </div>
  );
}

function Funnel({ data }: { data: StatsResponse['funnel'] }) {
  const steps = [
    { label: 'Visitas', value: data.sessions, color: 'bg-bosque-200' },
    { label: 'Click al launcher', value: data.clicks, color: 'bg-bosque-400' },
    { label: 'Conversación', value: data.conversations, color: 'bg-bosque-600' },
    { label: 'Lead capturado', value: data.leads, color: 'bg-mostaza-300' },
    { label: 'Calificado', value: data.qualified, color: 'bg-mostaza-400' },
  ];
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const conv =
          prev && prev > 0 ? `${Math.round((s.value / prev) * 100)}%` : null;
        return (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-32 shrink-0 text-[12px] font-medium text-bosque-700">
              {s.label}
            </div>
            <div className="relative flex-1">
              <div className="h-7 overflow-hidden rounded-md bg-bosque-50">
                <div
                  className={cn('h-full transition-all', s.color)}
                  style={{
                    width: `${(s.value / max) * 100}%`,
                    minWidth: s.value > 0 ? '8px' : '0',
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-between px-2.5 text-[11.5px] font-semibold text-bosque-900">
                <span className="tabular-nums">
                  {s.value.toLocaleString('es-CL')}
                </span>
                {conv && (
                  <span className="tabular-nums text-[10.5px] font-medium text-bosque-700">
                    {conv}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DistList({
  title,
  dist,
}: {
  title: string;
  dist: Record<string, number>;
}) {
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  if (entries.length === 0) {
    return (
      <div>
        <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-bosque-600">
          {title}
        </h3>
        <p className="text-[11px] italic text-bosque-400">Sin datos.</p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-bosque-600">
        {title}
      </h3>
      <ul className="space-y-1.5">
        {entries.map(([k, v]) => {
          const pct = (v / total) * 100;
          return (
            <li key={k}>
              <div className="mb-0.5 flex items-center justify-between text-[11.5px]">
                <span className="truncate text-bosque-800">{k}</span>
                <span className="tabular-nums text-bosque-600">
                  {v} <span className="text-bosque-500">{Math.round(pct)}%</span>
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-bosque-50">
                <div
                  className="h-full bg-bosque-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SeriesChart({ series }: { series: StatsResponse['series'] }) {
  const max = Math.max(
    ...series.map((s) => Math.max(s.sessions, s.clicks, s.leads)),
    1
  );
  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-[11px]">
        <Legend dot="bg-bosque-300" label="Visitas" />
        <Legend dot="bg-bosque-600" label="Clicks" />
        <Legend dot="bg-mostaza-300" label="Leads" />
      </div>
      <div className="flex h-40 items-end gap-1">
        {series.map((s) => {
          const sH = (s.sessions / max) * 100;
          const cH = (s.clicks / max) * 100;
          const lH = (s.leads / max) * 100;
          return (
            <div
              key={s.date}
              className="group relative flex flex-1 flex-col items-stretch justify-end gap-0.5 px-0.5"
              title={`${s.date}\nVisitas: ${s.sessions}\nClicks: ${s.clicks}\nLeads: ${s.leads}`}
            >
              <div className="flex h-full items-end gap-0.5">
                <div
                  className="flex-1 rounded-sm bg-bosque-300"
                  style={{ height: `${Math.max(sH, s.sessions > 0 ? 2 : 0)}%` }}
                />
                <div
                  className="flex-1 rounded-sm bg-bosque-600"
                  style={{ height: `${Math.max(cH, s.clicks > 0 ? 2 : 0)}%` }}
                />
                <div
                  className="flex-1 rounded-sm bg-mostaza-300"
                  style={{ height: `${Math.max(lH, s.leads > 0 ? 2 : 0)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[9.5px] text-bosque-500">
        <span>{series[0]?.date.slice(5) ?? ''}</span>
        <span>
          {series[Math.floor(series.length / 2)]?.date.slice(5) ?? ''}
        </span>
        <span>{series[series.length - 1]?.date.slice(5) ?? ''}</span>
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-bosque-600">
      <span className={cn('h-2 w-2 rounded-sm', dot)} />
      {label}
    </span>
  );
}
