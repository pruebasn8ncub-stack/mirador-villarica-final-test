'use client';

import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';
import type { LeadFormField } from '@/lib/chat/types';
import { FormField } from './FormField';

interface AttachmentLeadFormProps {
  prompt?: string;
  fields?: LeadFormField[];
  defaultValues?: Record<string, string>;
  onSubmit?: (values: Record<string, string>) => void;
}

const LABELS: Record<LeadFormField, { label: string; placeholder: string; icon: 'user' | 'mail' | 'phone'; type?: string }> = {
  nombre: { label: 'Nombre completo', placeholder: 'Carolina Pérez', icon: 'user' },
  email: { label: 'Correo', placeholder: 'tu@email.cl', icon: 'mail', type: 'email' },
  whatsapp: { label: 'WhatsApp', placeholder: '+56 9 XXXX XXXX', icon: 'phone', type: 'tel' },
  cuando: { label: '¿Cuándo te interesa comprar?', placeholder: 'Ahora / 1-3 meses…', icon: 'user' },
};

export function AttachmentLeadForm({
  prompt,
  fields = ['nombre', 'email', 'whatsapp'],
  defaultValues,
  onSubmit,
}: AttachmentLeadFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => ({
    nombre: defaultValues?.nombre ?? '',
    email: defaultValues?.email ?? '',
    whatsapp: defaultValues?.whatsapp ?? '',
    cuando: defaultValues?.cuando ?? '',
  }));
  const [sent, setSent] = useState(false);

  const valid = fields.every((f) => values[f]?.trim().length > 1);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid || sent) return;
    setSent(true);
    onSubmit?.(Object.fromEntries(fields.map((f) => [f, values[f].trim()])));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 rounded-xl border border-bosque-100 bg-white p-3">
      {prompt && <p className="text-[12px] text-bosque-600">{prompt}</p>}
      {fields.map((f) => {
        const conf = LABELS[f];
        return (
          <FormField
            key={f}
            label={conf.label}
            icon={conf.icon}
            type={conf.type ?? 'text'}
            placeholder={conf.placeholder}
            value={values[f] ?? ''}
            onChange={(v) => setValues((prev) => ({ ...prev, [f]: v }))}
          />
        );
      })}
      <button
        type="submit"
        disabled={!valid || sent}
        className={cn(
          'mt-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors',
          sent
            ? 'bg-bosque-100 text-bosque-500'
            : valid
            ? 'bg-bosque-800 text-crema hover:bg-bosque-700'
            : 'bg-bosque-100 text-bosque-400'
        )}
      >
        {sent ? 'Datos enviados ✓' : 'Enviar mis datos'}
      </button>
    </form>
  );
}
