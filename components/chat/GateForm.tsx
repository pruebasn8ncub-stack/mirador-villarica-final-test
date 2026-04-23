'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Lock, Sparkles } from 'lucide-react';
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
    whatsapp: defaultValues?.whatsapp ?? '+569 ',
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
      className="chat-dotgrid relative flex flex-1 min-h-0 flex-col overflow-y-auto px-5 pb-5 pt-5"
      noValidate
    >
      {/* Tarjeta intro — elevada con detalle mostaza y sparkle icon */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-crema-100/60 px-4 py-3.5 ring-1 ring-bosque-100/70 shadow-[0_1px_2px_rgba(26,61,46,0.04),0_8px_24px_-12px_rgba(26,61,46,0.12)]"
      >
        {/* Borde superior acento mostaza — detalle editorial */}
        <span
          aria-hidden
          className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-mostaza to-transparent opacity-70"
        />
        {/* Ornamento esquina — círculo difuso bosque */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-bosque-500/[0.06] blur-xl"
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mostaza/90 to-mostaza-400 shadow-[0_2px_6px_-1px_rgba(244,168,75,0.45)]">
            <Sparkles className="h-[14px] w-[14px] text-white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-mostaza-500">
              Atención exclusiva
            </p>
            <p className="text-[13px] leading-snug text-bosque-800">
              Necesito tus datos para enviarte{' '}
              <strong className="font-semibold text-bosque-900">información exclusiva</strong>{' '}
              y darte atención personalizada.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-3"
      >
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
            className="rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2.5 text-[12px] font-medium text-red-700 backdrop-blur-sm"
          >
            {error}
          </div>
        )}

        {/* Botones — separación clara con divider sutil arriba */}
        <div className="relative mt-2 flex flex-col gap-2.5">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-1 left-1/2 h-px w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-bosque-200/80 to-transparent"
          />

          {/* CTA primario — gradiente profundo + shine hover */}
          <button
            type="submit"
            disabled={submitting !== null}
            className={cn(
              'group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3 text-[13.5px] font-semibold tracking-[0.01em] transition-all duration-300',
              submitting === 'web'
                ? 'cursor-wait bg-bosque-500 text-crema'
                : 'bg-gradient-to-br from-bosque-700 via-bosque-800 to-bosque-900 text-crema shadow-[0_4px_14px_-3px_rgba(26,61,46,0.45),0_1px_2px_rgba(26,61,46,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:shadow-[0_8px_22px_-4px_rgba(26,61,46,0.55),0_2px_4px_rgba(26,61,46,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] active:translate-y-0 active:shadow-[0_2px_8px_-2px_rgba(26,61,46,0.4)]',
              submitting && submitting !== 'web' && 'opacity-55'
            )}
          >
            {/* Shine travel — detalle luxury */}
            {submitting !== 'web' && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
            )}
            {/* Borde interior highlight top */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-mostaza/40 to-transparent"
            />

            {submitting === 'web' ? (
              <>
                <Loader2 className="h-[15px] w-[15px] animate-spin" />
                <span>Conectando…</span>
              </>
            ) : (
              <>
                <span>Continuar aquí en el chat</span>
                <ArrowRight className="h-[15px] w-[15px] transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </>
            )}
          </button>

          {/* CTA secundario — WhatsApp, vidrio suave + borde emerald */}
          <button
            type="button"
            onClick={() => runSubmit('whatsapp')}
            disabled={submitting !== null}
            className={cn(
              'group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-[11px] text-[13.5px] font-semibold tracking-[0.01em] text-white transition-all duration-300',
              submitting === 'whatsapp'
                ? 'cursor-wait bg-[#1ebe57]'
                : 'bg-[#25D366] shadow-[0_4px_14px_-3px_rgba(37,211,102,0.45),0_1px_2px_rgba(37,211,102,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:bg-[#22c45e] hover:shadow-[0_8px_22px_-4px_rgba(37,211,102,0.55)] active:translate-y-0',
              submitting && submitting !== 'whatsapp' && 'opacity-55'
            )}
          >
            {/* Shine travel igual que el botón primario */}
            {submitting !== 'whatsapp' && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
            )}
            {submitting === 'whatsapp' ? (
              <>
                <Loader2 className="h-[15px] w-[15px] animate-spin" />
                <span>Abriendo WhatsApp…</span>
              </>
            ) : (
              <span>Continuar por WhatsApp</span>
            )}
          </button>
        </div>

        {/* Footer — divider superior + ítems refinados */}
        <div className="relative mt-3 pt-3">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bosque-200/60 to-transparent"
          />
          <div className="flex items-center justify-between gap-2 px-0.5">
            <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase leading-none tracking-[0.12em] text-bosque-700">
              <Lock aria-hidden className="h-[11px] w-[11px] shrink-0 text-bosque-600" strokeWidth={2.5} />
              <span>Conversación privada</span>
            </p>
            <p className="flex items-center gap-1.5 whitespace-nowrap text-[9.5px] font-semibold uppercase leading-none tracking-[0.1em] text-bosque-700">
              <span className="opacity-75">Powered by</span>
              <img
                src="/assets/terra-segura-logo.webp"
                alt="Terra Segura"
                className="h-[15px] w-auto object-contain"
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(17%) sepia(44%) saturate(626%) hue-rotate(108deg) brightness(94%) contrast(92%)',
                }}
              />
            </p>
          </div>
        </div>
      </motion.div>
    </form>
  );
}
