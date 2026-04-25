'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { PROYECTO, DIEGO } from '@/data/content';
import { formatCLP, formatUF, simulate } from '@/lib/simulator';
import { openChatWith } from '@/lib/chat-events';
import { getOrCreateSessionId } from '@/lib/chat/storage';

const PIE_OPTIONS = [
  { value: 0.5, label: '50%' },
  { value: 0.6, label: '60%' },
  { value: 0.7, label: '70%' },
  { value: 0.8, label: '80%' },
];

const MESES_OPTIONS = [12, 24, 36];

const CLP_CONTADO = 14_490_000;
const CLP_CREDITO = 17_490_000;

export function Cotizar() {
  const [pie, setPie] = useState(0.5);
  const [meses, setMeses] = useState(36);

  const sim = useMemo(
    () => simulate({
      precioContadoCLP: CLP_CONTADO,
      precioCreditoCLP: CLP_CREDITO,
      pieFraccion: pie,
      meses,
    }),
    [pie, meses]
  );

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      session_id: getOrCreateSessionId(),
      nombre: String(form.get('nombre') ?? ''),
      whatsapp: String(form.get('whatsapp') ?? ''),
      email: String(form.get('email') ?? ''),
    };
    try {
      const res = await fetch('/api/lead-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('lead_gate failed');
      setDone(true);
    } catch {
      setError('No pudimos enviar la cotización. Intenta nuevamente o escríbele a Diego por WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="cotizar"
      className="relative bg-gradient-to-b from-crema via-crema-100 to-bosque-50/40 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza-500">
            Cotizar
          </p>
          <h2 className="font-display text-4xl font-light leading-[1.05] tracking-display text-bosque-900 md:text-5xl lg:text-6xl">
            Reserva con <span className="italic text-mostaza-500">{PROYECTO.reserva}</span>.<br />
            Te la devolvemos si no concretas.
          </h2>
          <p className="mt-5 text-[15.5px] leading-relaxed text-bosque-800/75">
            La reserva cubre los gastos operacionales (notaría, CBR, abogados, certificados).
            Si decides no avanzar, la reembolsamos completa — sin letra chica.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="rounded-[28px] border border-bosque-100 bg-white p-7 shadow-card-hover">
              <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza-500">
                Simulador de cuota
              </p>
              <h3 className="mt-2 font-display text-2xl font-medium text-bosque-900">
                Crédito directo
              </h3>
              <p className="mt-1 text-[13px] text-bosque-700/75">
                Sin bancos, sin DICOM, sin trámites largos.
              </p>

              <div className="mt-6 space-y-4">
                <SelectField
                  label="Pie inicial"
                  value={String(pie)}
                  onChange={(v) => setPie(parseFloat(v))}
                  options={PIE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
                />
                <SelectField
                  label="Cuotas mensuales"
                  value={String(meses)}
                  onChange={(v) => setMeses(parseInt(v, 10))}
                  options={MESES_OPTIONS.map((m) => ({ value: String(m), label: `${m} cuotas` }))}
                />
              </div>

              <div className="mt-7 space-y-3 rounded-2xl bg-bosque-50/60 p-5">
                <Row label="Precio crédito" value={formatCLP(CLP_CREDITO)} />
                <Row label="Pie a pagar" value={formatCLP(sim.pieCLP)} highlight />
                <Row label="Saldo a financiar" value={formatCLP(sim.saldoCLP)} />
                <div className="border-t border-bosque-200/70 pt-3">
                  <Row
                    label={`Cuota mensual × ${meses}`}
                    value={`${formatCLP(sim.cuotaCLP)} · ${formatUF(sim.cuotaUF)}`}
                    highlight
                  />
                </div>
              </div>

              <p className="mt-4 text-[11.5px] leading-relaxed text-bosque-700/65">
                Valores referenciales en pesos chilenos. UF a $38.000 estimada.
                La cuota final se ajusta a UF al momento de la firma.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.22 }}
            className="lg:col-span-7"
          >
            <div className="rounded-[28px] bg-bosque-900 p-7 text-crema shadow-card-hover md:p-9">
              {!done ? (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza">
                    Solicita cotización
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-light tracking-display md:text-4xl">
                    Te respondemos en menos de <span className="italic text-mostaza-300">2 horas hábiles</span>.
                  </h3>

                  <form onSubmit={onSubmit} className="mt-7 grid gap-4 sm:grid-cols-2">
                    <InputField name="nombre" label="Nombre completo" required />
                    <InputField name="whatsapp" label="WhatsApp" placeholder="+56 9 ..." required />
                    <InputField name="email" type="email" label="Email" required className="sm:col-span-2" />
                    <TextareaField
                      name="mensaje"
                      label="¿Algo que quieras contarnos?"
                      placeholder="Ej. tamaño de parcela, plazo de compra, cómo pensás financiarla..."
                      className="sm:col-span-2"
                    />

                    {error && (
                      <p className="sm:col-span-2 rounded-xl bg-red-500/15 px-4 py-3 text-[13px] text-red-200">
                        {error}
                      </p>
                    )}

                    <div className="sm:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="flex items-center gap-1.5 text-[12px] text-crema/65">
                        <ShieldCheck className="h-3.5 w-3.5 text-mostaza" strokeWidth={2.4} />
                        No compartimos tus datos con terceros.
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-full bg-mostaza px-7 py-3.5 text-sm font-semibold text-bosque-900 shadow-md transition hover:-translate-y-0.5 hover:bg-mostaza-400 disabled:opacity-60"
                      >
                        {submitting ? 'Enviando…' : 'Enviar cotización'}
                      </button>
                    </div>
                  </form>

                  <div className="mt-8 flex flex-col gap-3 border-t border-crema/10 pt-6 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => openChatWith({ intent: 'cotizar' })}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full border border-crema/25 px-5 py-3 text-[13.5px] font-medium text-crema transition hover:border-mostaza hover:text-mostaza"
                    >
                      <MessageCircle className="h-4 w-4" strokeWidth={2.4} />
                      Prefiero conversar primero con Lucía
                    </button>
                    <a
                      href={`https://wa.me/${DIEGO.whatsappRaw}?text=${encodeURIComponent('Hola Diego, vengo desde el sitio. Me interesa cotizar Mirador de Villarrica.')}`}
                      target="_blank"
                      rel="noopener"
                      className="flex flex-1 items-center justify-center gap-2 rounded-full border border-crema/25 px-5 py-3 text-[13.5px] font-medium text-crema transition hover:border-mostaza hover:text-mostaza"
                    >
                      <Phone className="h-4 w-4" strokeWidth={2.4} />
                      WhatsApp directo a Diego
                    </a>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <CheckCircle2 className="h-14 w-14 text-mostaza" strokeWidth={1.8} />
                  <h3 className="font-display text-3xl font-light tracking-display">
                    ¡Cotización enviada!
                  </h3>
                  <p className="max-w-md text-[15px] text-crema/80">
                    {DIEGO.nombre.split(' ')[0]} te contactará en menos de 2 horas hábiles.
                    Si quieres adelantar, abre el chat con Lucía y revisamos disponibilidad ahora.
                  </p>
                  <button
                    onClick={() => openChatWith({ intent: 'general' })}
                    className="mt-3 rounded-full bg-mostaza px-7 py-3 text-sm font-semibold text-bosque-900"
                  >
                    Conversar con Lucía
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[13px] text-bosque-700/80">{label}</span>
      <span className={highlight
        ? 'font-display text-lg font-semibold text-bosque-900 md:text-xl'
        : 'text-[14px] font-medium text-bosque-800'
      }>
        {value}
      </span>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-eyebrow text-bosque-600">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-bosque-200 bg-white px-4 py-3 pr-10 text-[14.5px] font-medium text-bosque-900 outline-none transition focus:border-mostaza focus:ring-2 focus:ring-mostaza/30"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bosque-500" strokeWidth={2.2} />
      </div>
    </label>
  );
}

function InputField({ label, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-eyebrow text-mostaza-300">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-crema/15 bg-bosque-950/40 px-4 py-3 text-[14.5px] text-crema outline-none transition placeholder:text-crema/40 focus:border-mostaza focus:bg-bosque-950/60 focus:ring-2 focus:ring-mostaza/30"
      />
    </label>
  );
}

function TextareaField({ label, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-eyebrow text-mostaza-300">
        {label}
      </span>
      <textarea
        rows={3}
        {...props}
        className="w-full rounded-xl border border-crema/15 bg-bosque-950/40 px-4 py-3 text-[14.5px] text-crema outline-none transition placeholder:text-crema/40 focus:border-mostaza focus:bg-bosque-950/60 focus:ring-2 focus:ring-mostaza/30"
      />
    </label>
  );
}
