/**
 * Geometría de las 94 parcelas del proyecto Mirador de Villarrica.
 *
 * Las coordenadas son placeholder en una grilla pseudo-realista hasta que
 * mapeemos manualmente las posiciones reales contra el plano comercial
 * oficial (`/assets/master-plan.jpg`). El estado y precios vienen en vivo
 * desde `/api/inventario` (Google Sheet de Terra Segura).
 *
 * ViewBox SVG: 0 0 1000 700 (proporción 10:7 ~ JPG plano comercial).
 */

export type EstadoParcela = 'disponible' | 'reservada' | 'vendida';

export interface ParcelaGeo {
  id: string;            // 'P-001' … 'P-094'
  lote: number;          // 1..94 (numérico para joins con Sheet)
  x: number;             // SVG x
  y: number;             // SVG y
  w: number;             // SVG width
  h: number;             // SVG height
  m2: number;            // m² aproximados
  zona: 'mirador' | 'bosque' | 'lago' | 'volcan';
}

export interface ParcelaInventario {
  lote: number;
  estado: EstadoParcela;
  tamanio_m2: number;
  precio_contado: number;       // CLP
  pie_minimo_50pct: number;     // CLP
}

export interface Parcela extends ParcelaGeo, Omit<ParcelaInventario, 'lote'> {}

export const SVG_VIEWBOX = { width: 1000, height: 700 } as const;

// Grilla 12 cols x 8 filas con calles internas. Generamos 94 parcelas
// (96 - 2 huecos para área común). Cada celda 70x70 con padding 4.
function generateGeo(): ParcelaGeo[] {
  const cols = 12;
  const rows = 8;
  const cellW = 75;
  const cellH = 78;
  const offsetX = 60;
  const offsetY = 50;
  const gap = 6;

  const skipCells = new Set([45, 46]); // dos huecos para área común central

  const out: ParcelaGeo[] = [];
  let lote = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (skipCells.has(idx)) continue;
      if (lote > 94) break;
      const zona: ParcelaGeo['zona'] =
        r < 2 ? 'volcan' : r < 4 ? 'mirador' : r < 6 ? 'bosque' : 'lago';
      // Tamaños variables según zona (mirador y volcan más grandes)
      const baseM2 = zona === 'mirador' ? 7500 : zona === 'volcan' ? 6800 : zona === 'bosque' ? 5500 : 5000;
      const m2 = Math.round((baseM2 + (lote * 73) % 2500) / 100) * 100;

      out.push({
        id: `P-${String(lote).padStart(3, '0')}`,
        lote,
        x: offsetX + c * (cellW + gap),
        y: offsetY + r * (cellH + gap),
        w: cellW,
        h: cellH,
        m2,
        zona,
      });
      lote++;
    }
  }
  return out;
}

export const PARCELAS_GEO: ParcelaGeo[] = generateGeo();

/**
 * Mock de inventario para SSR / fallback cuando el API falla.
 * Distribución realista: ~55% disponibles, ~12% reservadas, ~33% vendidas.
 */
export function buildMockInventario(): ParcelaInventario[] {
  return PARCELAS_GEO.map((p) => {
    const seed = (p.lote * 31) % 100;
    const estado: EstadoParcela =
      seed < 55 ? 'disponible' : seed < 67 ? 'reservada' : 'vendida';
    const precioBase = Math.round((p.m2 * 2900) / 10000) * 10000; // ~$2.900/m² baseline
    return {
      lote: p.lote,
      estado,
      tamanio_m2: p.m2,
      precio_contado: precioBase,
      pie_minimo_50pct: Math.round(precioBase * 0.5),
    };
  });
}

export function mergeParcelas(
  geo: ParcelaGeo[],
  inv: ParcelaInventario[]
): Parcela[] {
  const byLote = new Map(inv.map((i) => [i.lote, i]));
  return geo.map((g) => {
    const i = byLote.get(g.lote);
    return {
      ...g,
      estado: i?.estado ?? 'disponible',
      tamanio_m2: i?.tamanio_m2 ?? g.m2,
      precio_contado: i?.precio_contado ?? Math.round((g.m2 * 2900) / 10000) * 10000,
      pie_minimo_50pct: i?.pie_minimo_50pct ?? 0,
    };
  });
}

export const ESTADO_COLORS: Record<EstadoParcela, { fill: string; stroke: string; label: string }> = {
  disponible: { fill: '#3f8060', stroke: '#1a3d2e', label: 'Disponible' },   // bosque-500
  reservada:  { fill: '#f4a84b', stroke: '#c9731a', label: 'Reservada' },    // mostaza-300
  vendida:    { fill: '#94a3b8', stroke: '#475569', label: 'Vendida' },      // slate-400
};
