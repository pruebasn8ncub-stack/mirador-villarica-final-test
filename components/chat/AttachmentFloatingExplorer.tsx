'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Compass,
  Table as TableIcon,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';

type Tab = 'tour' | 'inventory';

interface AttachmentFloatingExplorerProps {
  initialTab?: Tab;
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

export function AttachmentFloatingExplorer({
  initialTab = 'tour',
  tourUrl,
  title,
  caption,
}: AttachmentFloatingExplorerProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>(initialTab);

  // Tour state
  const [tourLoaded, setTourLoaded] = useState(false);

  // Inventory state
  const [invLoading, setInvLoading] = useState(false);
  const [invError, setInvError] = useState<string | null>(null);
  const [invRows, setInvRows] = useState<Parcela[]>([]);
  const [query, setQuery] = useState('');

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

  // Al abrir, respetar initialTab
  useEffect(() => {
    if (open) setTab(initialTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invRows;
    return invRows.filter((r) => r.lote.toLowerCase().includes(q));
  }, [invRows, query]);

  const ctaLabel =
    initialTab === 'inventory'
      ? 'Ver inventario de parcelas'
      : 'Abrir tour 360°';
  const CtaIcon = initialTab === 'inventory' ? TableIcon : Compass;

  const inlinePreview = (
    <motion.button
      type="button"
      onClick={() => setOpen(true)}
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
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-bosque-800 px-3.5 py-2.5 text-[12.5px] font-semibold text-crema transition-colors hover:bg-bosque-700"
      aria-label={ctaLabel}
    >
      <CtaIcon className="h-4 w-4" strokeWidth={2.25} />
      {ctaLabel}
    </motion.button>
  );

  const tabs: { id: Tab; label: string; icon: typeof Compass }[] = [
    { id: 'tour', label: 'Tour 360°', icon: Compass },
    { id: 'inventory', label: 'Inventario', icon: TableIcon },
  ];

  const headerTitle =
    title ??
    (tab === 'tour'
      ? 'Tour 360° · Mirador de Villarrica'
      : 'Inventario · Parcelas disponibles');
  const headerCaption =
    caption ??
    (tab === 'tour'
      ? 'Recorre el proyecto desde tu dispositivo'
      : 'Precios, tamaños y cuotas actualizados en tiempo real');
  const HeaderIcon = tab === 'tour' ? Compass : TableIcon;

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

              {tab === 'inventory' && (
                <div
                  id="panel-inventory"
                  role="tabpanel"
                  className="flex flex-1 flex-col overflow-hidden bg-white"
                >
                  <div className="flex items-center gap-2 border-b border-bosque-100 bg-crema/50 px-4 py-2.5">
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
                    <span className="shrink-0 rounded-full bg-bosque-800/10 px-2.5 py-1 text-[11px] font-semibold text-bosque-800">
                      {filtered.length} {filtered.length === 1 ? 'lote' : 'lotes'}
                    </span>
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
                      <div className="flex h-full items-center justify-center">
                        <p className="text-[12.5px] text-bosque-500">
                          Sin resultados para &quot;{query}&quot;
                        </p>
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
