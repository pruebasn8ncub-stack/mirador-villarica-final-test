'use client';

import { Download } from 'lucide-react';

interface AttachmentBrochureProps {
  url: string;
  title?: string;
  pages?: number;
  sizeKb?: number;
  onSend?: () => void;
}

function formatSize(sizeKb?: number): string | null {
  if (!sizeKb) return null;
  if (sizeKb > 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${sizeKb} KB`;
}

export function AttachmentBrochure({
  url,
  title = 'Brochure Mirador de Villarrica',
  pages,
  sizeKb,
  onSend,
}: AttachmentBrochureProps) {
  const meta = [pages ? `${pages} páginas` : null, formatSize(sizeKb)].filter(Boolean).join(' · ');

  return (
    <div className="flex items-center gap-3 rounded-xl border border-bosque-100 bg-white p-3">
      <div className="flex h-14 w-11 shrink-0 items-center justify-center rounded bg-gradient-to-br from-bosque-700 to-bosque-900 shadow-sm">
        <span className="font-mono text-[9px] font-bold tracking-wider text-mostaza-300">PDF</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-semibold text-bosque-900">{title}</p>
        {meta && <p className="mt-0.5 text-[10.5px] text-bosque-500">{meta}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="inline-flex items-center gap-1 rounded-lg border border-bosque-700 bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-bosque-700 transition-colors hover:bg-bosque-50"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Descargar
        </a>
        {onSend && (
          <button
            type="button"
            onClick={onSend}
            className="rounded-lg bg-bosque-800 px-2.5 py-1.5 text-[11.5px] font-medium text-crema transition-colors hover:bg-bosque-700"
          >
            Enviar
          </button>
        )}
      </div>
    </div>
  );
}
