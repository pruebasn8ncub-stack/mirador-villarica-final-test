'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LeadGateData } from '@/lib/chat/types';
import { FormField } from './FormField';

interface GateFormProps {
  onSubmit: (data: LeadGateData) => Promise<void> | void;
  error?: string | null;
  defaultValues?: Partial<LeadGateData>;
}

type Errors = Partial<Record<keyof LeadGateData, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()\-]{6,}$/;

function validate(values: LeadGateData): Errors {
  const errors: Errors = {};
  if (values.nombre.trim().length < 2) {
    errors.nombre = 'Cuéntame tu nombre y apellido.';
  }
  if (!PHONE_RE.test(values.whatsapp.trim())) {
    errors.whatsapp = 'Déjame un WhatsApp o teléfono válido.';
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Revisa que el correo esté completo.';
  }
  return errors;
}

export function GateForm({ onSubmit, error, defaultValues }: GateFormProps) {
  const [values, setValues] = useState<LeadGateData>({
    nombre: defaultValues?.nombre ?? '',
    whatsapp: defaultValues?.whatsapp ?? '',
    email: defaultValues?.email ?? '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const setField = <K extends keyof LeadGateData>(key: K, value: LeadGateData[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (touched) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        nombre: values.nombre.trim(),
        whatsapp: values.whatsapp.trim(),
        email: values.email.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="chat-dotgrid flex flex-1 min-h-0 flex-col overflow-y-auto px-5 pb-6 pt-5"
      noValidate
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'relative mb-3 overflow-hidden rounded-2xl border border-mostaza-100 px-5 pb-4 pt-5 text-center',
          'bg-gradient-to-b from-mostaza-50 to-white shadow-sm'
        )}
      >
        <h3 className="text-[16px] font-semibold leading-snug tracking-tight text-bosque-900">
          ¡Hola! Soy Lucía <span aria-hidden>👋</span>
        </h3>
        <p className="mx-auto mt-1 max-w-[280px] text-[13px] leading-relaxed text-bosque-600">
          Para darte una{' '}
          <strong className="font-semibold text-bosque-900">atención personalizada</strong>{' '}
          y enviarte información exclusiva del proyecto, necesito algunos datos:
        </p>
      </motion.div>

      <div className="flex flex-col gap-3">
        <FormField
          label="Nombre y apellido"
          icon="user"
          placeholder="Ej. Carolina Pérez"
          autoComplete="name"
          value={values.nombre}
          onChange={(v) => setField('nombre', v)}
          error={errors.nombre}
        />
        <FormField
          label="WhatsApp o teléfono"
          icon="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+56 9 XXXX XXXX"
          value={values.whatsapp}
          onChange={(v) => setField('whatsapp', v)}
          error={errors.whatsapp}
        />
        <FormField
          label="Correo electrónico"
          icon="mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={values.email}
          onChange={(v) => setField('email', v)}
          error={errors.email}
        />

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            'mt-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
            submitting
              ? 'cursor-wait bg-bosque-400 text-crema'
              : 'bg-gradient-launcher text-crema shadow-md hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]'
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Conectando…
            </>
          ) : (
            <>
              Iniciar conversación
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-bosque-400">
          <Lock className="h-3 w-3" aria-hidden="true" />
          Tus datos son privados · No spam
        </p>
      </div>
    </form>
  );
}
