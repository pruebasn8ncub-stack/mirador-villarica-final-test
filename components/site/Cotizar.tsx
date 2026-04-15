'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { PROYECTO } from '@/data/content';

const cotizarSchema = z.object({
  nombre: z.string().min(2, 'Ingresa tu nombre'),
  email: z.string().email('Email inválido'),
  telefono: z
    .string()
    .min(8, 'Teléfono muy corto')
    .regex(/^[+]?[0-9\s-]+$/, 'Solo números, espacios o +'),
  cuando: z.enum(['ahora', '1_a_3_meses', '3_a_6_meses', '6_a_12_meses', 'evaluando']),
  mensaje: z.string().max(500).optional(),
});

type CotizarInput = z.infer<typeof cotizarSchema>;

export function Cotizar() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CotizarInput>({
    resolver: zodResolver(cotizarSchema),
    defaultValues: { cuando: 'evaluando' },
  });

  const onSubmit = async (data: CotizarInput) => {
    setStatus('sending');
    try {
      const res = await fetch('/api/cotizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('ok');
      reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="cotizar" className="bg-bosque-800 py-16 text-crema md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-mostaza">Conversemos</p>
          <h2 className="text-3xl font-bold md:text-4xl">
            Cotiza tu parcela desde {PROYECTO.precioContado}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-crema-100/90">
            Déjanos tus datos y Diego te contacta para mostrarte las parcelas que mejor calzan
            contigo. O conversa directo con el asistente haciendo clic en el botón verde.
          </p>
        </div>

        {status === 'ok' ? (
          <div
            role="status"
            className="mx-auto max-w-md rounded-2xl bg-mostaza-500/10 border border-mostaza-500 p-8 text-center"
          >
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-mostaza" aria-hidden="true" />
            <h3 className="text-xl font-semibold">¡Gracias!</h3>
            <p className="mt-2 text-crema-100/90">
              Diego te escribirá por WhatsApp o email en las próximas horas (lun-vie 9-19).
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto max-w-2xl space-y-4 rounded-2xl bg-white/5 p-6 backdrop-blur md:p-8"
            noValidate
          >
            <Field label="Nombre" htmlFor="nombre" error={errors.nombre?.message}>
              <input
                id="nombre"
                type="text"
                autoComplete="name"
                {...register('nombre')}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Email" htmlFor="email" error={errors.email?.message}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={inputCls}
                />
              </Field>
              <Field label="Teléfono / WhatsApp" htmlFor="telefono" error={errors.telefono?.message}>
                <input
                  id="telefono"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+56 9 ..."
                  {...register('telefono')}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="¿Cuándo te gustaría comprar?" htmlFor="cuando" error={errors.cuando?.message}>
              <select id="cuando" {...register('cuando')} className={inputCls}>
                <option value="ahora">Ahora</option>
                <option value="1_a_3_meses">En 1 a 3 meses</option>
                <option value="3_a_6_meses">En 3 a 6 meses</option>
                <option value="6_a_12_meses">En 6 a 12 meses</option>
                <option value="evaluando">Estoy evaluando</option>
              </select>
            </Field>

            <Field label="Mensaje (opcional)" htmlFor="mensaje" error={errors.mensaje?.message}>
              <textarea
                id="mensaje"
                rows={3}
                {...register('mensaje')}
                className={inputCls}
              />
            </Field>

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full rounded-full bg-mostaza px-6 py-3 font-semibold text-bosque-900 hover:bg-mostaza-400 disabled:opacity-60"
              >
                {status === 'sending' ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando…
                  </span>
                ) : (
                  'Quiero que me contacten'
                )}
              </button>
              {status === 'error' && (
                <p role="alert" className="mt-3 text-center text-sm text-red-300">
                  No pudimos enviar tu mensaje. Intenta de nuevo o escríbele directo a Diego.
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

const inputCls =
  'w-full rounded-lg border border-bosque-600 bg-white/10 px-3 py-2.5 text-crema placeholder:text-crema-100/50 focus:outline-none focus:ring-2 focus:ring-mostaza';

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-crema">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
