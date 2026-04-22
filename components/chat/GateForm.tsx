'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Lock, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LeadGateData } from '@/lib/chat/types';
import { FormField } from './FormField';

type Channel = 'web' | 'whatsapp';

/** Hugo Vargas Cubelli — receptor directo de leads via WhatsApp. */
const WHATSAPP_TO = '56992533044';

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
  const [submitting, setSubmitting] = useState<Channel | null>(null);
  const [touched, setTouched] = useState(false);

  const setField = <K extends keyof LeadGateData>(key: K, value: LeadGateData[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (touched) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const buildWhatsAppUrl = (data: LeadGateData) => {
    const text =
      `Hola, soy ${data.nombre}.\n` +
      `Vi el proyecto Mirador de Villarrica y me gustaría recibir más información.\n\n` +
      `Mi correo: ${data.email}`;
    return `https://wa.me/${WHATSAPP_TO}?text=${encodeURIComponent(text)}`;
  };

  const runSubmit = async (channel: Channel) => {
    setTouched(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || submitting) return;
    const payload: LeadGateData = {
      nombre: values.nombre.trim(),
      whatsapp: values.whatsapp.trim(),
      email: values.email.trim(),
    };
    // Abrir wa.me ANTES del await para no ser bloqueado por el popup blocker
    // (sólo un click directo cuenta como gesto de usuario).
    let waWindow: Window | null = null;
    if (channel === 'whatsapp') {
      waWindow = window.open('about:blank', '_blank');
    }
    setSubmitting(channel);
    try {
      await onSubmit(payload);
      if (channel === 'whatsapp') {
        const url = buildWhatsAppUrl(payload);
        if (waWindow) waWindow.location.href = url;
        else window.location.href = url;
      }
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    runSubmit('web');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="chat-dotgrid flex flex-1 min-h-0 flex-col overflow-y-auto px-5 pb-4 pt-4"
      noValidate
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-2 rounded-xl bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(26,61,46,0.04),0_4px_16px_rgba(26,61,46,0.06)] ring-1 ring-bosque-100/60"
      >
        <p className="text-[12.5px] leading-snug text-bosque-700">
          Antes de continuar, necesito algunos datos para darte una{' '}
          <strong className="font-semibold text-bosque-900">atención personalizada</strong>{' '}
          y enviarte <strong className="font-semibold text-bosque-900">información exclusiva del proyecto</strong>.
        </p>
      </motion.div>

      <div className="flex flex-col gap-2">
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

        <div className="mt-0.5 flex flex-col gap-1.5">
          <button
            type="submit"
            disabled={submitting !== null}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border-2 border-transparent px-4 py-2.5 text-sm font-semibold transition-all',
              submitting === 'web'
                ? 'cursor-wait bg-bosque-400 text-crema'
                : 'bg-gradient-launcher text-crema shadow-md hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]',
              submitting && submitting !== 'web' && 'opacity-60'
            )}
          >
            {submitting === 'web' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Conectando…
              </>
            ) : (
              <>
                Continuar aquí en el chat
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => runSubmit('whatsapp')}
            disabled={submitting !== null}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all',
              submitting === 'whatsapp'
                ? 'cursor-wait border-emerald-400 bg-emerald-50 text-emerald-700'
                : 'border-emerald-500 bg-white text-emerald-700 hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md active:scale-[0.98]',
              submitting && submitting !== 'whatsapp' && 'opacity-60'
            )}
          >
            {submitting === 'whatsapp' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Abriendo WhatsApp…
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
                Continuar por WhatsApp
              </>
            )}
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2 px-1">
          <p className="flex h-4 items-center gap-1 text-[10px] font-semibold uppercase leading-none tracking-[0.1em] text-bosque-800">
            <Lock aria-hidden className="h-3 w-3 shrink-0" strokeWidth={2.5} />
            <span>Conversación privada</span>
          </p>
          <p className="flex h-4 items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-bosque-800">
            <span>Powered by</span>
            <img
              src="/assets/terra-segura-logo.webp"
              alt="Terra Segura"
              className="h-4 w-auto object-contain"
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(17%) sepia(44%) saturate(626%) hue-rotate(108deg) brightness(94%) contrast(92%)',
              }}
            />
          </p>
        </div>
      </div>
    </form>
  );
}
