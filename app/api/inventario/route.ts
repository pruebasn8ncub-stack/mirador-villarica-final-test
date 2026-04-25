import { NextResponse } from 'next/server';
import { buildMockInventario, type ParcelaInventario } from '@/data/parcelas';

/**
 * Endpoint GET /api/inventario
 *
 * Devuelve el estado (disponible/reservada/vendida) + precio + m² de las
 * 94 parcelas. Fuente de verdad: Google Sheet que ya consume el agente
 * Lucía (`recomendar_parcelas`). En esta primera versión el endpoint
 * devuelve el mock; conectaremos el Sheet real con SHEET_CSV_URL en el
 * próximo deploy (variable de entorno).
 */
export const revalidate = 30; // ISR: refresca cada 30s

const SHEET_CSV_URL = process.env.MIRADOR_SHEET_CSV_URL ??
  'https://docs.google.com/spreadsheets/d/1gtqd1Xb6Yr3g3myw0nnJDsnZUSybQYS9aFAEJWaPqhQ/export?format=csv&gid=1975618999';

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function parseSheet(csv: string): ParcelaInventario[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = {
    lote: headers.findIndex((h) => h === 'lote' || h === 'parcela'),
    estado: headers.findIndex((h) => h === 'estado'),
    m2: headers.findIndex((h) => h.includes('tama') || h.includes('m2')),
    contado: headers.findIndex((h) => h.includes('contado')),
    pie: headers.findIndex((h) => h.includes('pie')),
  };
  const out: ParcelaInventario[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const lote = parseInt(cols[idx.lote] ?? '', 10);
    if (Number.isNaN(lote)) continue;
    const estadoRaw = (cols[idx.estado] ?? '').toLowerCase();
    const estado: ParcelaInventario['estado'] =
      estadoRaw.includes('disp') ? 'disponible'
      : estadoRaw.includes('reserv') ? 'reservada'
      : estadoRaw.includes('vend') ? 'vendida'
      : 'disponible';
    out.push({
      lote,
      estado,
      tamanio_m2: parseInt((cols[idx.m2] ?? '').replace(/[^\d]/g, ''), 10) || 5000,
      precio_contado: parseInt((cols[idx.contado] ?? '').replace(/[^\d]/g, ''), 10) || 0,
      pie_minimo_50pct: parseInt((cols[idx.pie] ?? '').replace(/[^\d]/g, ''), 10) || 0,
    });
  }
  return out;
}

export async function GET() {
  try {
    const res = await fetch(SHEET_CSV_URL, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error(`sheet status ${res.status}`);
    const csv = await res.text();
    const data = parseSheet(csv);
    if (data.length === 0) throw new Error('empty sheet');
    const counts = data.reduce((acc, p) => { acc[p.estado] = (acc[p.estado] ?? 0) + 1; return acc; }, {} as Record<string, number>);
    return NextResponse.json({
      source: 'sheet',
      counts: { disponible: counts.disponible ?? 0, reservada: counts.reservada ?? 0, vendida: counts.vendida ?? 0 },
      parcelas: data,
    });
  } catch {
    const data = buildMockInventario();
    const counts = data.reduce((acc, p) => { acc[p.estado] = (acc[p.estado] ?? 0) + 1; return acc; }, {} as Record<string, number>);
    return NextResponse.json({
      source: 'mock',
      counts: { disponible: counts.disponible ?? 0, reservada: counts.reservada ?? 0, vendida: counts.vendida ?? 0 },
      parcelas: data,
    });
  }
}
