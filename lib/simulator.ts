/**
 * Simulador hipotecario para parcelas de Mirador de Villarrica.
 * Crédito directo de Terra Segura: 50% pie + N cuotas mensuales en UF.
 *
 * Simplificación: dado que es crédito directo (no bancario), modelamos
 * cuotas iguales en UF sin interés explícito (el interés viene
 * implícito en el delta entre precio_contado y precio_credito).
 */

export interface SimulatorInput {
  precioContadoCLP: number;
  precioCreditoCLP: number;
  pieFraccion: number;       // 0.5 = 50%, 0.7 = 70%, etc.
  meses: number;             // 12 / 24 / 36
  ufCLP?: number;            // CLP / UF (default UF_DEFAULT)
}

export interface SimulatorResult {
  pieCLP: number;
  saldoCLP: number;
  cuotaCLP: number;
  cuotaUF: number;
  totalPagado: number;
  ahorroVsContado: number;   // negativo = paga MÁS que contado
}

export const UF_DEFAULT = 38000;

export function simulate({
  precioContadoCLP,
  precioCreditoCLP,
  pieFraccion,
  meses,
  ufCLP = UF_DEFAULT,
}: SimulatorInput): SimulatorResult {
  const pieCLP = Math.round(precioCreditoCLP * pieFraccion);
  const saldoCLP = precioCreditoCLP - pieCLP;
  const cuotaCLP = Math.round(saldoCLP / meses);
  const cuotaUF = Math.round((cuotaCLP / ufCLP) * 100) / 100;
  const totalPagado = pieCLP + cuotaCLP * meses;
  const ahorroVsContado = precioContadoCLP - totalPagado;
  return { pieCLP, saldoCLP, cuotaCLP, cuotaUF, totalPagado, ahorroVsContado };
}

export function formatCLP(n: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatUF(n: number): string {
  return `UF ${n.toLocaleString('es-CL', { maximumFractionDigits: 2 })}`;
}
