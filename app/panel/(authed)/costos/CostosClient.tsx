'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  DollarSign,
  Coins,
  Cpu,
  Loader2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatExact, shortSession } from '../_lib/format';

interface BreakdownRow {
  cost: number;
  cost_input: number;
  cost_output: number;
  prompt_tokens: number;
  completion_tokens: number;
  tokens: number;
  calls: number;
}

interface UsageResponse {
  range: string;
  kpis: {
    sessions: number;
    total_cost_usd: number;
    total_cost_input_usd: number;
    total_cost_output_usd: number;
    total_prompt_tokens: number;
    total_completion_tokens: number;
    total_tokens: number;
    llm_calls: number;
    unmatched_calls: number;
    avg_cost_per_session: number;
  };
  top_sessions: {
    session_id: string;
    total_cost_usd: number;
    total_tokens: number;
    turns: number;
    llm_calls_matched: number;
    unmatched: number;
    models_used: string[];
    first_call_at: string | null;
    last_call_at: string | null;
  }[];
  series: { date: string; cost: number; tokens: number; calls: number }[];
  by_model: (BreakdownRow & { model: string })[];
  by_workflow: (BreakdownRow & { workflow: string })[];
}

const fetcher = async (url: string): Promise<UsageResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

type Range = 'today' | '7d' | '30d' | 'all';

function fmtUsd(n: number, opts: { precise?: boolean } = {}): string {
  if (n === 0) return '$0.00';
  if (opts.precise || n < 0.01) {
    return `$${n.toFixed(6)}`;
  }
  return `$${n.toFixed(4)}`;
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('es-CL');
}

export function CostosClient() {
  const [range, setRange] = useState<Range>('30d');
  const { data, error, isLoading } = useSWR(
    `/api/dashboard/usage?range=${range}`,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true, refreshInterval: 30000 }
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-display text-bosque-900 md:text-4xl">
            Costos
          </h1>
          <p className="mt-1 text-sm text-bosque-700">
            Tokens consumidos y costo en USD por sesión, modelo y workflow. Datos
            reales reportados por OpenRouter (no estimaciones).
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
              icon={DollarSign}
              label="Costo total"
              value={fmtUsd(data.kpis.total_cost_usd)}
              accent="mostaza"
              hint={`Input ${fmtUsd(data.kpis.total_cost_input_usd)} · Output ${fmtUsd(data.kpis.total_cost_output_usd)}`}
            />
            <Kpi
              icon={Coins}
              label="Tokens totales"
              value={fmtTokens(data.kpis.total_tokens)}
              hint={`In ${fmtTokens(data.kpis.total_prompt_tokens)} · Out ${fmtTokens(data.kpis.total_completion_tokens)}`}
            />
            <Kpi
              icon={Cpu}
              label="Llamadas LLM"
              value={data.kpis.llm_calls.toLocaleString('es-CL')}
              hint={
                data.kpis.unmatched_calls > 0
                  ? `${data.kpis.unmatched_calls} ejecuciones sin match con OpenRouter`
                  : 'Cada generación reportada por el broadcast'
              }
            />
            <Kpi
              icon={TrendingUp}
              label="Costo prom. / sesión"
              value={fmtUsd(data.kpis.avg_cost_per_session)}
              accent="bosque"
              hint={`Sobre ${data.kpis.sessions.toLocaleString('es-CL')} sesiones con datos.`}
            />
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-bosque-100">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-bosque-700">
                Por modelo
              </h2>
              <BreakdownTable rows={data.by_model.map((r) => ({ name: r.model, ...r }))} />
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-bosque-100">
              <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-bosque-700">
                Por workflow (agente)
              </h2>
              <BreakdownTable rows={data.by_workflow.map((r) => ({ name: r.workflow, ...r }))} />
            </section>
          </div>

          <section className="mt-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-bosque-100">
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-wide text-bosque-700">
              Tendencia diaria
            </h2>
            <SeriesChart series={data.series} />
          </section>

          <section className="mt-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-bosque-100">
            <h2 className="mb-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-bosque-700">
              <span>Top sesiones por costo</span>
              {data.kpis.unmatched_calls > 0 && (
                <span className="flex items-center gap-1 normal-case text-[11px] font-normal text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {data.kpis.unmatched_calls} llamadas sin match
                </span>
              )}
            </h2>
            <TopSessionsTable rows={data.top_sessions} />
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
  icon: typeof DollarSign;
  label: string;
  value: string;
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
        {value}
      </div>
      {hint && (
        <p className="mt-1 text-[11px] leading-snug text-bosque-500">{hint}</p>
      )}
    </div>
  );
}

function BreakdownTable({
  rows,
}: {
  rows: (BreakdownRow & { name: string })[];
}) {
  if (rows.length === 0) {
    return <p className="text-xs text-bosque-500">Sin datos en el período.</p>;
  }
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const pct = totalCost > 0 ? (r.cost / totalCost) * 100 : 0;
        const inputPct = r.cost > 0 ? (r.cost_input / r.cost) * 100 : 0;
        return (
          <div key={r.name} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium text-bosque-900">
                {r.name}
              </span>
              <span className="font-display text-sm tabular-nums text-bosque-900">
                {fmtUsd(r.cost)}
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-bosque-100" title={`${pct.toFixed(1)}% del total`}>
              <div
                className="h-full bg-bosque-500 transition-all"
                style={{ width: `${Math.max(inputPct * pct / 100, 0.5)}%` }}
                title={`Input: ${fmtUsd(r.cost_input)}`}
              />
              <div
                className="h-full bg-mostaza-400 transition-all"
                style={{ width: `${Math.max((100 - inputPct) * pct / 100, 0.5)}%` }}
                title={`Output: ${fmtUsd(r.cost_output)}`}
              />
            </div>
            <div className="flex justify-between text-[10.5px] text-bosque-500 tabular-nums">
              <span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-bosque-500 mr-1" />
                Input {fmtTokens(r.prompt_tokens)} → {fmtUsd(r.cost_input)}
              </span>
              <span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-mostaza-400 mr-1" />
                Output {fmtTokens(r.completion_tokens)} → {fmtUsd(r.cost_output)}
              </span>
              <span className="text-bosque-400">{r.calls} calls</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SeriesChart({
  series,
}: {
  series: { date: string; cost: number; tokens: number; calls: number }[];
}) {
  const max = Math.max(...series.map((s) => s.cost), 0.0001);
  return (
    <div className="space-y-1">
      <div className="flex h-32 items-end gap-1">
        {series.map((s) => {
          const h = (s.cost / max) * 100;
          return (
            <div
              key={s.date}
              className="group relative flex-1 rounded-sm bg-bosque-100 transition-colors hover:bg-mostaza-300"
              style={{ height: `${Math.max(h, 2)}%` }}
              title={`${s.date}: ${fmtUsd(s.cost)} · ${fmtTokens(s.tokens)} tokens · ${s.calls} calls`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-bosque-500">
        <span>{series[0]?.date.slice(5)}</span>
        <span>{series[series.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

function TopSessionsTable({
  rows,
}: {
  rows: UsageResponse['top_sessions'];
}) {
  if (rows.length === 0) {
    return <p className="text-xs text-bosque-500">Sin sesiones con datos en el período.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="border-b border-bosque-100 text-left text-[10.5px] uppercase tracking-wide text-bosque-600">
            <th className="px-2 py-2 font-medium">Sesión</th>
            <th className="px-2 py-2 font-medium">Modelos</th>
            <th className="px-2 py-2 text-right font-medium">Turnos</th>
            <th className="px-2 py-2 text-right font-medium">Tokens</th>
            <th className="px-2 py-2 text-right font-medium">Costo</th>
            <th className="px-2 py-2 font-medium">Última actividad</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.session_id}
              className="border-b border-bosque-50 hover:bg-bosque-50/50"
            >
              <td className="px-2 py-2">
                <Link
                  href={`/panel/conversaciones?session=${r.session_id}`}
                  className="font-mono text-bosque-700 hover:text-bosque-900 hover:underline"
                >
                  {shortSession(r.session_id)}…
                </Link>
              </td>
              <td className="px-2 py-2">
                <div className="flex flex-wrap gap-1">
                  {r.models_used.slice(0, 2).map((m) => (
                    <span
                      key={m}
                      className="rounded bg-bosque-50 px-1.5 py-0.5 text-[10px] text-bosque-700"
                    >
                      {m.split('/').pop()}
                    </span>
                  ))}
                  {r.models_used.length > 2 && (
                    <span className="text-[10px] text-bosque-500">
                      +{r.models_used.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-2 py-2 text-right tabular-nums text-bosque-700">
                {r.turns}
                {r.unmatched > 0 && (
                  <span className="ml-1 text-amber-600" title={`${r.unmatched} sin match`}>
                    ⚠
                  </span>
                )}
              </td>
              <td className="px-2 py-2 text-right tabular-nums text-bosque-700">
                {fmtTokens(r.total_tokens)}
              </td>
              <td className="px-2 py-2 text-right font-display tabular-nums text-bosque-900">
                {fmtUsd(r.total_cost_usd)}
              </td>
              <td className="px-2 py-2 text-[11px] text-bosque-500">
                {formatExact(r.last_call_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
