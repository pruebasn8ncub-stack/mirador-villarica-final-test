'use client';

import { cn } from '@/lib/utils';
import type { CompareRow } from '@/lib/chat/types';

interface AttachmentCompareTableProps {
  rows: CompareRow[];
  onPick?: (rol: string) => void;
}

export function AttachmentCompareTable({ rows, onPick }: AttachmentCompareTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-bosque-100 bg-white">
      <div
        className="grid grid-cols-[48px_1fr_1fr_1fr] gap-1.5 border-b border-bosque-50 bg-bosque-50/60 px-3 py-2 font-mono text-[9.5px] uppercase tracking-wider text-bosque-500"
        role="row"
      >
        <span>Rol</span>
        <span>Superficie</span>
        <span>Vista</span>
        <span className="text-right">Precio UF</span>
      </div>
      {rows.map((r, i) => {
        const content = (
          <>
            <span className="font-mono text-[11px] font-bold text-bosque-900">{r.rol}</span>
            <span className="text-[12px] text-bosque-900">{r.sqm} m²</span>
            <span className="text-[12px] text-bosque-600">{r.view}</span>
            <span className="text-right font-mono text-[12px] font-bold text-bosque-900">{r.price}</span>
          </>
        );
        const rowClass = cn(
          'grid grid-cols-[48px_1fr_1fr_1fr] items-center gap-1.5 px-3 py-2.5',
          i < rows.length - 1 && 'border-b border-bosque-50',
          r.highlight && 'bg-mostaza-50'
        );
        return onPick ? (
          <button
            key={r.rol}
            type="button"
            onClick={() => onPick(r.rol)}
            className={cn(rowClass, 'w-full text-left transition-colors hover:bg-bosque-50')}
            role="row"
          >
            {content}
          </button>
        ) : (
          <div key={r.rol} className={rowClass} role="row">
            {content}
          </div>
        );
      })}
    </div>
  );
}
