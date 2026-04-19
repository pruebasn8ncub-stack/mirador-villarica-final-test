'use client';

import { useMemo, useState } from 'react';

interface AttachmentMortgageSimulatorProps {
  /** Precio contado en CLP (opcional) */
  priceClp?: number;
  /** Precio contado en UF (prioritario si viene) */
  priceUf?: number;
  /** Pie inicial como porcentaje (0-100). Default 50. */
  defaultDownPct?: number;
  /** Cuotas por defecto. Default 36. */
  defaultMonths?: number;
  /** UF referencial para convertir CLP ↔ UF cuando solo viene priceClp. */
  ufValue?: number;
}

export interface MortgageInputs {
  priceUf: number;
  downPct: number;
  months: number;
  /**
   * Tasa anual nominal en formato decimal (0.05 = 5%).
   * Si tu modelo no usa tasa, ignora este parámetro.
   */
  annualRate?: number;
}

export interface MortgageResult {
  /** Monto del pie en UF. */
  downUf: number;
  /** Saldo a financiar en UF. */
  balanceUf: number;
  /** Cuota mensual en UF. */
  monthlyUf: number;
  /** Total pagado en UF (pie + cuotas * meses). Opcional. */
  totalUf?: number;
}

/**
 * MVP v2 — Fórmula básica: sistema francés con tasa anual UF configurable.
 *
 * cuota = balance × r / (1 − (1 + r)^−n)   con r = tasa/12, n = meses
 * Si la tasa es 0 colapsa a división simple (balance / meses).
 *
 * Default: 5% anual UF (mediana típica de crédito directo inmobiliario CL).
 * Cuando tengamos la tasa real de Terra Segura, solo cambia DEFAULT_ANNUAL_RATE.
 */
const DEFAULT_ANNUAL_RATE = 0.05;

function calculateMortgage(inputs: MortgageInputs): MortgageResult {
  const { priceUf, downPct, months, annualRate = DEFAULT_ANNUAL_RATE } = inputs;
  const downUf = (priceUf * downPct) / 100;
  const balanceUf = priceUf - downUf;

  const r = annualRate / 12;
  const monthlyUf =
    months <= 0
      ? 0
      : r === 0
      ? balanceUf / months
      : (balanceUf * r) / (1 - Math.pow(1 + r, -months));

  return {
    downUf: Math.round(downUf * 10) / 10,
    balanceUf: Math.round(balanceUf * 10) / 10,
    monthlyUf: Math.round(monthlyUf * 100) / 100,
    totalUf: Math.round((downUf + monthlyUf * months) * 10) / 10,
  };
}

const UF_REFERENCE = 38500; // CLP por UF — referencial, solo si no llega priceUf.

export function AttachmentMortgageSimulator({
  priceClp,
  priceUf,
  defaultDownPct = 50,
  defaultMonths = 36,
  ufValue = UF_REFERENCE,
}: AttachmentMortgageSimulatorProps) {
  const baseUf = priceUf ?? (priceClp ? priceClp / ufValue : 450);
  const [downPct, setDownPct] = useState(defaultDownPct);
  const [months, setMonths] = useState(defaultMonths);

  const result = useMemo(
    () => calculateMortgage({ priceUf: baseUf, downPct, months }),
    [baseUf, downPct, months]
  );

  const downClp = Math.round(result.downUf * ufValue);

  return (
    <div className="rounded-xl border border-bosque-100 bg-bosque-50/40 p-3.5">
      <h4 className="text-[13.5px] font-semibold text-bosque-900">Simulador rápido</h4>
      <p className="mt-0.5 text-[10.5px] text-bosque-500">
        Precio referencia: UF {baseUf.toFixed(0)}
      </p>

      <div className="mt-3 space-y-2.5">
        <Slider
          label="Pie"
          display={`${downPct}%`}
          value={downPct}
          min={30}
          max={70}
          step={5}
          onChange={setDownPct}
        />
        <Slider
          label="Cuotas"
          display={`${months} meses`}
          value={months}
          min={12}
          max={60}
          step={6}
          onChange={setMonths}
        />
      </div>

      <div className="mt-3 rounded-lg border border-bosque-100 bg-white p-2.5">
        <Row label="Pie" value={`$${downClp.toLocaleString('es-CL')}`} />
        <div className="my-2 border-t border-dashed border-bosque-100" />
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] text-bosque-500">Cuota mensual</span>
          <span className="text-[17px] font-semibold tracking-tight text-bosque-900">
            UF {result.monthlyUf.toFixed(1)}
          </span>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-bosque-400">
        Cálculo referencial. Las condiciones finales las confirma Diego por WhatsApp.
      </p>
    </div>
  );
}

function Slider({
  label,
  display,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  display: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-bosque-500">{label}</span>
        <span className="font-mono font-semibold text-bosque-900">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-bosque mt-1 w-full"
        aria-label={label}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-bosque-500">{label}</span>
      <span className="font-mono text-bosque-900">{value}</span>
    </div>
  );
}
