'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Compass,
  Table as TableIcon,
  Map,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

type Tab = 'tour' | 'inventory' | 'masterplan';

const MASTERPLAN_URL = '/assets/master-plan.jpg';

interface AttachmentFloatingExplorerProps {
  tourUrl: string;
  title?: string;
  caption?: string;
}

interface Parcela {
  lote: string;
  destacado: boolean;
  tamano: string;
  contado: string;
  credito: string;
  pie: string;
  cuota: string;
}

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1gtqd1Xb6Yr3g3myw0nnJDsnZUSybQYS9aFAEJWaPqhQ/export?format=csv&gid=1975618999';

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else if (c === '\r') {
        // ignore
      } else {
        field += c;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function formatTamano(raw: string): string {
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  if (!n) return raw || '—';
  return `${n.toLocaleString('es-CL')} m²`;
}

function cleanMoney(raw: string): string {
  const v = (raw || '').trim();
  if (!v || v.includes('#DIV')) return '—';
  return v;
}

function moneyToNumber(raw: string): number | null {
  if (!raw || raw === '—') return null;
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return null;
  return parseInt(digits, 10);
}

function tamanoToNumber(raw: string): number | null {
  const digits = (raw || '').replace(/[^0-9]/g, '');
  if (!digits) return null;
  return parseInt(digits, 10);
}

type PriceRange = 'all' | 'lt15' | '15-18' | '18-22' | 'gt22';
type TamanoFilter = 'all' | '5000' | '10000';

const PRICE_RANGES: { id: PriceRange; label: string; min: number; max: number | null }[] = [
  { id: 'all', label: 'Todos', min: 0, max: null },
  { id: 'lt15', label: 'Hasta $15M', min: 0, max: 15_000_000 },
  { id: '15-18', label: '$15M – $18M', min: 15_000_000, max: 18_000_000 },
  { id: '18-22', label: '$18M – $22M', min: 18_000_000, max: 22_000_000 },
  { id: 'gt22', label: 'Más de $22M', min: 22_000_000, max: null },
];

const PIE_RANGES: { id: PriceRange; label: string; min: number; max: number | null }[] = [
  { id: 'all', label: 'Todos', min: 0, max: null },
  { id: 'lt15', label: 'Hasta $9M', min: 0, max: 9_000_000 },
  { id: '15-18', label: '$9M – $11M', min: 9_000_000, max: 11_000_000 },
  { id: '18-22', label: '$11M – $13M', min: 11_000_000, max: 13_000_000 },
  { id: 'gt22', label: 'Más de $13M', min: 13_000_000, max: null },
];

function inRange(
  value: number | null,
  range: { min: number; max: number | null }
): boolean {
  if (value === null) return false;
  if (value < range.min) return false;
  if (range.max !== null && value > range.max) return false;
  return true;
}

export function AttachmentFloatingExplorer({
  tourUrl,
  title,
  caption,
}: AttachmentFloatingExplorerProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('tour');

  const openWith = (t: Tab) => {
    setTab(t);
    setOpen(true);
  };

  // Tour state
  const [tourLoaded, setTourLoaded] = useState(false);

  // Masterplan state
  const [masterplanZoom, setMasterplanZoom] = useState(1);

  // Inventory state
  const [invLoading, setInvLoading] = useState(false);
  const [invError, setInvError] = useState<string | null>(null);
  const [invRows, setInvRows] = useState<Parcela[]>([]);
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [contadoFilter, setContadoFilter] = useState<PriceRange>('all');
  const [creditoFilter, setCreditoFilter] = useState<PriceRange>('all');
  const [pieFilter, setPieFilter] = useState<PriceRange>('all');
  const [tamanoFilter, setTamanoFilter] = useState<TamanoFilter>('all');

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const fetchInventory = async () => {
    setInvLoading(true);
    setInvError(null);
    try {
      const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = parseCsv(text);
      const disponibles: Parcela[] = [];
      for (const r of parsed) {
        if (r.length < 12) continue;
        const estado = (r[2] || '').trim().toLowerCase();
        if (estado !== 'disponible') continue;
        const lote = (r[1] || '').trim();
        if (!lote) continue;
        disponibles.push({
          lote,
          destacado: (r[0] || '').includes('⭐'),
          tamano: formatTamano(r[3] || ''),
          contado: cleanMoney(r[6]),
          credito: cleanMoney(r[9]),
          pie: cleanMoney(r[10]),
          cuota: cleanMoney(r[11]),
        });
      }
      setInvRows(disponibles);
    } catch (e) {
      setInvError(e instanceof Error ? e.message : 'Error cargando inventario');
    } finally {
      setInvLoading(false);
    }
  };

  // Cuando el modal se abre o el usuario cambia a la tab de inventario, cargar si no hay data
  useEffect(() => {
    if (!open) return;
    if (tab === 'inventory' && invRows.length === 0 && !invLoading && !invError) {
      fetchInventory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab]);

  const activeFilterCount =
    (contadoFilter !== 'all' ? 1 : 0) +
    (creditoFilter !== 'all' ? 1 : 0) +
    (pieFilter !== 'all' ? 1 : 0) +
    (tamanoFilter !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setContadoFilter('all');
    setCreditoFilter('all');
    setPieFilter('all');
    setTamanoFilter('all');
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const contadoRange = PRICE_RANGES.find((r) => r.id === contadoFilter)!;
    const creditoRange = PRICE_RANGES.find((r) => r.id === creditoFilter)!;
    const pieRange = PIE_RANGES.find((r) => r.id === pieFilter)!;

    return invRows.filter((r) => {
      if (q && !r.lote.toLowerCase().includes(q)) return false;

      if (tamanoFilter !== 'all') {
        const t = tamanoToNumber(r.tamano);
        if (t === null) return false;
        if (tamanoFilter === '5000' && t !== 5000) return false;
        if (tamanoFilter === '10000' && t !== 10000) return false;
      }

      if (contadoFilter !== 'all') {
        if (!inRange(moneyToNumber(r.contado), contadoRange)) return false;
      }
      if (creditoFilter !== 'all') {
        if (!inRange(moneyToNumber(r.credito), creditoRange)) return false;
      }
      if (pieFilter !== 'all') {
        if (!inRange(moneyToNumber(r.pie), pieRange)) return false;
      }

      return true;
    });
  }, [invRows, query, contadoFilter, creditoFilter, pieFilter, tamanoFilter]);

  const inlinePreview = (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: [
          '0 0 0 0 rgba(251, 240, 217, 0.55)',
          '0 0 0 8px rgba(251, 240, 217, 0)',
          '0 0 0 0 rgba(251, 240, 217, 0)',
        ],
      }}
      transition={{
        opacity: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
        boxShadow: { duration: 1.8, repeat: Infinity, repeatDelay: 0.6, ease: 'easeOut' },
      }}
      className="mt-2 flex w-full overflow-hidden rounded-lg bg-bosque-800 text-crema shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]"
    >
      <motion.button
        type="button"
        onClick={() => openWith('tour')}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5 text-[12px] font-semibold transition-colors hover:bg-bosque-700"
        aria-label="Abrir tour 360°"
      >
        <Compass className="h-3.5 w-3.5" strokeWidth={2.25} />
        Tour 360°
      </motion.button>
      <div aria-hidden="true" className="w-px bg-crema/20" />
      <motion.button
        type="button"
        onClick={() => openWith('masterplan')}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5 text-[12px] font-semibold transition-colors hover:bg-bosque-700"
        aria-label="Ver masterplan del proyecto"
      >
        <Map className="h-3.5 w-3.5" strokeWidth={2.25} />
        Masterplan
      </motion.button>
      <div aria-hidden="true" className="w-px bg-crema/20" />
      <motion.button
        type="button"
        onClick={() => openWith('inventory')}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="flex flex-1 items-center justify-center gap-1.5 px-2 py-2.5 text-[12px] font-semibold transition-colors hover:bg-bosque-700"
        aria-label="Ver inventario de parcelas"
      >
        <TableIcon className="h-3.5 w-3.5" strokeWidth={2.25} />
        Inventario
      </motion.button>
    </motion.div>
  );

  const tabs: { id: Tab; label: string; icon: typeof Compass }[] = [
    { id: 'tour', label: 'Tour 360°', icon: Compass },
    { id: 'masterplan', label: 'Masterplan', icon: Map },
    { id: 'inventory', label: 'Inventario', icon: TableIcon },
  ];

  const headerTitle =
    title ??
    (tab === 'tour'
      ? 'Tour 360° · Mirador de Villarrica'
      : tab === 'masterplan'
        ? 'Masterplan · Mirador de Villarrica'
        : 'Inventario · Parcelas disponibles');
  const headerCaption =
    caption ??
    (tab === 'tour'
      ? 'Recorre el proyecto desde tu dispositivo'
      : tab === 'masterplan'
        ? 'Plano comercial — 74 parcelas desde 5.000 m²'
        : 'Precios, tamaños y cuotas actualizados en tiempo real');
  const HeaderIcon = tab === 'tour' ? Compass : tab === 'masterplan' ? Map : TableIcon;

  const floating =
    open && mounted
      ? createPortal(
          <AnimatePresence>
            <motion.div
              key="exp-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              aria-hidden="true"
              className="fixed inset-0 z-[45] bg-bosque-900/40 backdrop-blur-md"
            />
            <motion.div
              key="exp-floating"
              initial={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 24 : 0, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: isMobile ? 0 : 24, y: isMobile ? 24 : 0, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-label={tab === 'tour' ? 'Tour 360° del proyecto' : 'Inventario de parcelas disponibles'}
              aria-modal="false"
              className="fixed z-[60] flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-bosque-900/10
                         inset-0 md:inset-auto md:left-6 md:right-[440px] md:top-6 md:bottom-6 md:rounded-2xl"
            >
              <header className="flex items-center justify-between bg-bosque-800 px-4 py-3 text-crema">
                <div className="flex min-w-0 items-center gap-2.5">
                  <HeaderIcon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-semibold leading-tight">
                      {headerTitle}
                    </h3>
                    <p className="truncate text-[11px] leading-tight opacity-70">
                      {headerCaption}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {tab === 'inventory' && (
                    <button
                      type="button"
                      onClick={fetchInventory}
                      disabled={invLoading}
                      className="rounded-full p-1.5 transition-colors hover:bg-bosque-700 disabled:opacity-50"
                      aria-label="Recargar inventario"
                      title="Recargar"
                    >
                      <RefreshCw
                        className={`h-[16px] w-[16px] ${invLoading ? 'animate-spin' : ''}`}
                      />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-1.5 transition-colors hover:bg-bosque-700"
                    aria-label="Cerrar ventana"
                  >
                    <X className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </header>

              <div
                role="tablist"
                aria-label="Cambiar vista"
                className="flex gap-1 border-b border-bosque-100 bg-crema/60 px-2 pt-2"
              >
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={active}
                      aria-controls={`panel-${t.id}`}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`flex items-center gap-1.5 rounded-t-lg px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
                        active
                          ? 'bg-white text-bosque-900 ring-1 ring-bosque-100 ring-offset-0'
                          : 'text-bosque-600 hover:bg-white/60 hover:text-bosque-800'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {tab === 'tour' && (
                <div
                  id="panel-tour"
                  role="tabpanel"
                  className="relative flex flex-1 flex-col overflow-hidden bg-black"
                >
                  {!tourLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bosque-900 text-crema">
                      <Loader2 className="h-8 w-8 animate-spin" strokeWidth={2} />
                      <p className="text-[12px] opacity-80">Cargando tour 360°…</p>
                    </div>
                  )}
                  <iframe
                    src={tourUrl}
                    title="Tour 360° Mirador de Villarrica"
                    onLoad={() => setTourLoaded(true)}
                    className="h-full w-full flex-1 border-0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; xr-spatial-tracking; fullscreen"
                    allowFullScreen
                  />
                  <div className="border-t border-bosque-100 bg-crema px-4 py-2.5">
                    <p className="text-[11.5px] leading-snug text-bosque-700">
                      Tip: Arrastra para mirar alrededor. En móvil, moviendo el teléfono también.
                    </p>
                  </div>
                </div>
              )}

              {tab === 'masterplan' && (
                <div
                  id="panel-masterplan"
                  role="tabpanel"
                  className="relative flex flex-1 flex-col overflow-hidden bg-bosque-900"
                >
                  <div className="relative flex-1 overflow-auto">
                    <div className="flex h-full w-full items-center justify-center p-3">
                      <img
                        src={MASTERPLAN_URL}
                        alt="Masterplan Mirador de Villarrica"
                        style={{ transform: `scale(${masterplanZoom})`, transformOrigin: 'center center' }}
                        className="max-h-full max-w-full select-none object-contain transition-transform duration-150 ease-out"
                        draggable={false}
                      />
                    </div>
                    <div className="pointer-events-none absolute bottom-3 right-3 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMasterplanZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                        className="pointer-events-auto rounded-full bg-bosque-800/90 p-2 text-crema shadow-lg backdrop-blur transition-colors hover:bg-bosque-700"
                        aria-label="Alejar"
                      >
                        <ZoomOut className="h-4 w-4" strokeWidth={2.25} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMasterplanZoom(1)}
                        className="pointer-events-auto rounded-full bg-bosque-800/90 px-3 py-2 text-[11px] font-semibold text-crema shadow-lg backdrop-blur transition-colors hover:bg-bosque-700"
                        aria-label="Reset zoom"
                      >
                        {Math.round(masterplanZoom * 100)}%
                      </button>
                      <button
                        type="button"
                        onClick={() => setMasterplanZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                        className="pointer-events-auto rounded-full bg-bosque-800/90 p-2 text-crema shadow-lg backdrop-blur transition-colors hover:bg-bosque-700"
                        aria-label="Acercar"
                      >
                        <ZoomIn className="h-4 w-4" strokeWidth={2.25} />
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-bosque-100 bg-crema px-4 py-2.5">
                    <p className="text-[11.5px] leading-snug text-bosque-700">
                      Plano comercial oficial: distribución de lotes, caminos internos, ubicación y distancias a lugares cercanos.
                    </p>
                  </div>
                </div>
              )}

              {tab === 'inventory' && (
                <div
                  id="panel-inventory"
                  role="tabpanel"
                  className="flex flex-1 flex-col overflow-hidden bg-white"
                >
                  <div className="border-b border-bosque-100 bg-crema/50">
                    <div className="flex items-center gap-2 px-4 py-2.5">
                      <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-bosque-500" />
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Buscar por número de lote (ej. 12, B3)"
                          className="w-full rounded-lg border border-bosque-200 bg-white py-1.5 pl-8 pr-3 text-[12.5px] text-bosque-900 placeholder:text-bosque-400 focus:border-bosque-500 focus:outline-none focus:ring-2 focus:ring-bosque-500/20"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFiltersOpen((v) => !v)}
                        aria-expanded={filtersOpen}
                        aria-controls="filters-panel"
                        className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                          activeFilterCount > 0
                            ? 'border-bosque-800 bg-bosque-800 text-crema hover:bg-bosque-700'
                            : 'border-bosque-200 bg-white text-bosque-800 hover:bg-bosque-50'
                        }`}
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.25} />
                        Filtros
                        {activeFilterCount > 0 && (
                          <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-crema px-1 text-[10px] font-bold text-bosque-800">
                            {activeFilterCount}
                          </span>
                        )}
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
                          strokeWidth={2.25}
                        />
                      </button>
                      <span className="shrink-0 rounded-full bg-bosque-800/10 px-2.5 py-1 text-[11px] font-semibold text-bosque-800">
                        {filtered.length} {filtered.length === 1 ? 'lote' : 'lotes'}
                      </span>
                    </div>

                    <AnimatePresence initial={false}>
                      {filtersOpen && (
                        <motion.div
                          id="filters-panel"
                          key="filters-panel"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 gap-3 border-t border-bosque-100 bg-white px-4 py-3 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-bosque-600">
                                Tamaño
                              </label>
                              <select
                                value={tamanoFilter}
                                onChange={(e) => setTamanoFilter(e.target.value as TamanoFilter)}
                                className="w-full cursor-pointer rounded-lg border border-bosque-200 bg-white px-2.5 py-1.5 text-[12.5px] text-bosque-900 focus:border-bosque-500 focus:outline-none focus:ring-2 focus:ring-bosque-500/20"
                              >
                                <option value="all">Todos</option>
                                <option value="5000">5.000 m²</option>
                                <option value="10000">1 hectárea</option>
                              </select>
                            </div>

                            <div>
                              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-bosque-600">
                                Precio contado
                              </label>
                              <select
                                value={contadoFilter}
                                onChange={(e) => setContadoFilter(e.target.value as PriceRange)}
                                className="w-full cursor-pointer rounded-lg border border-bosque-200 bg-white px-2.5 py-1.5 text-[12.5px] text-bosque-900 focus:border-bosque-500 focus:outline-none focus:ring-2 focus:ring-bosque-500/20"
                              >
                                {PRICE_RANGES.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-bosque-600">
                                Precio crédito
                              </label>
                              <select
                                value={creditoFilter}
                                onChange={(e) => setCreditoFilter(e.target.value as PriceRange)}
                                className="w-full cursor-pointer rounded-lg border border-bosque-200 bg-white px-2.5 py-1.5 text-[12.5px] text-bosque-900 focus:border-bosque-500 focus:outline-none focus:ring-2 focus:ring-bosque-500/20"
                              >
                                {PRICE_RANGES.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-bosque-600">
                                Pie 50%
                              </label>
                              <select
                                value={pieFilter}
                                onChange={(e) => setPieFilter(e.target.value as PriceRange)}
                                className="w-full cursor-pointer rounded-lg border border-bosque-200 bg-white px-2.5 py-1.5 text-[12.5px] text-bosque-900 focus:border-bosque-500 focus:outline-none focus:ring-2 focus:ring-bosque-500/20"
                              >
                                {PIE_RANGES.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {activeFilterCount > 0 && (
                              <div className="sm:col-span-2">
                                <button
                                  type="button"
                                  onClick={resetFilters}
                                  className="text-[11.5px] font-semibold text-bosque-700 underline-offset-2 hover:underline"
                                >
                                  Limpiar filtros
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative flex-1 overflow-auto bg-white">
                    {invLoading && invRows.length === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white text-bosque-700">
                        <Loader2 className="h-8 w-8 animate-spin" strokeWidth={2} />
                        <p className="text-[12px] opacity-80">Cargando inventario…</p>
                      </div>
                    )}
                    {invError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                        <p className="text-[13px] font-semibold text-red-700">
                          No pudimos cargar el inventario
                        </p>
                        <p className="text-[11.5px] text-bosque-600">{invError}</p>
                        <button
                          type="button"
                          onClick={fetchInventory}
                          className="mt-1 rounded-lg bg-bosque-800 px-3 py-1.5 text-[12px] font-semibold text-crema hover:bg-bosque-700"
                        >
                          Reintentar
                        </button>
                      </div>
                    )}
                    {!invLoading && !invError && filtered.length === 0 && invRows.length > 0 && (
                      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                        <p className="text-[12.5px] text-bosque-500">
                          Sin resultados
                          {query ? ` para "${query}"` : ''}
                          {activeFilterCount > 0 ? ' con los filtros aplicados' : ''}
                        </p>
                        {activeFilterCount > 0 && (
                          <button
                            type="button"
                            onClick={resetFilters}
                            className="text-[12px] font-semibold text-bosque-700 underline-offset-2 hover:underline"
                          >
                            Limpiar filtros
                          </button>
                        )}
                      </div>
                    )}
                    {!invError && filtered.length > 0 && (
                      <table className="w-full border-collapse text-[12px]">
                        <thead className="sticky top-0 z-10 bg-bosque-50 text-[11px] uppercase tracking-wide text-bosque-700">
                          <tr>
                            <th className="border-b border-bosque-100 px-3 py-2 text-left font-semibold">
                              Lote
                            </th>
                            <th className="border-b border-bosque-100 px-3 py-2 text-left font-semibold">
                              Tamaño
                            </th>
                            <th className="border-b border-bosque-100 px-3 py-2 text-right font-semibold">
                              Contado
                            </th>
                            <th className="border-b border-bosque-100 px-3 py-2 text-right font-semibold">
                              Crédito
                            </th>
                            <th className="border-b border-bosque-100 px-3 py-2 text-right font-semibold">
                              Pie 50%
                            </th>
                            <th className="border-b border-bosque-100 px-3 py-2 text-right font-semibold">
                              Cuota <span className="text-bosque-500">(×36)</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((r, i) => (
                            <tr
                              key={r.lote}
                              className={`transition-colors hover:bg-bosque-50/60 ${
                                i % 2 === 1 ? 'bg-crema/20' : 'bg-white'
                              }`}
                            >
                              <td className="border-b border-bosque-100/60 px-3 py-2.5 font-semibold text-bosque-900">
                                <span className="inline-flex items-center gap-1.5">
                                  {r.destacado && (
                                    <span
                                      className="text-[10px]"
                                      title="Lote destacado"
                                      aria-label="Destacado"
                                    >
                                      ⭐
                                    </span>
                                  )}
                                  Lote {r.lote}
                                </span>
                              </td>
                              <td className="border-b border-bosque-100/60 px-3 py-2.5 text-bosque-700">
                                {r.tamano}
                              </td>
                              <td className="border-b border-bosque-100/60 px-3 py-2.5 text-right font-semibold text-bosque-900">
                                {r.contado}
                              </td>
                              <td className="border-b border-bosque-100/60 px-3 py-2.5 text-right text-bosque-700">
                                {r.credito}
                              </td>
                              <td className="border-b border-bosque-100/60 px-3 py-2.5 text-right text-bosque-700">
                                {r.pie}
                              </td>
                              <td className="border-b border-bosque-100/60 px-3 py-2.5 text-right text-bosque-700">
                                {r.cuota !== '—' ? (
                                  <>
                                    {r.cuota}
                                    <span className="ml-1 text-[10px] text-bosque-500">/ mes</span>
                                  </>
                                ) : (
                                  '—'
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="border-t border-bosque-100 bg-crema px-4 py-2.5">
                    <p className="text-[11.5px] leading-snug text-bosque-700">
                      Cuota mensual calculada sobre crédito directo a 36 meses con pie del 50%.
                      Datos actualizados desde el inventario oficial del proyecto.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <>
      {inlinePreview}
      {floating}
    </>
  );
}
