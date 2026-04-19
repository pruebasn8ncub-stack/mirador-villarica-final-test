'use client';

import { MessageCircle } from 'lucide-react';

interface AttachmentHandoffProps {
  advisorName?: string;
  advisorRole?: string;
  whatsapp?: string;
  message?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function AttachmentHandoff({
  advisorName = 'Diego Cavagnaro',
  advisorRole = 'Asesor inmobiliario',
  whatsapp,
  message = 'Te está revisando la conversación y responderá en menos de 3 minutos.',
}: AttachmentHandoffProps) {
  return (
    <div className="rounded-xl border border-mostaza-200 bg-gradient-to-b from-mostaza-50 to-white p-3.5">
      <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-mostaza-500">
        ← Cambiaste a asesor humano
      </p>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-bosque-700 via-bosque-500 to-mostaza-300 font-semibold text-crema ring-2 ring-white">
          {initials(advisorName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-bosque-900">{advisorName}</p>
          <p className="text-[11px] text-bosque-500">{advisorRole}</p>
        </div>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
      </div>
      <p className="mt-2.5 text-[12px] leading-relaxed text-bosque-600">{message}</p>
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Escribir por WhatsApp
        </a>
      )}
    </div>
  );
}
