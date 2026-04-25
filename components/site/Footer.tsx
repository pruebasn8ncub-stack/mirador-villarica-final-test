'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Instagram, Facebook, Youtube, MessageCircle, ShieldCheck } from 'lucide-react';
import { DIEGO, PROYECTO } from '@/data/content';
import { openChatWith } from '@/lib/chat-events';

const TRUST = [
  '12 años en parcelaciones del sur',
  'SAG aprobado · Roles listos',
  'Inscripción inmediata en CBR',
];

const NAV_COLS = [
  {
    title: 'Proyecto',
    links: [
      { label: 'Conocer', href: '#proyecto' },
      { label: 'Master Plan', href: '#master-plan' },
      { label: 'Galería', href: '#galeria' },
      { label: 'Tour 360°', href: '#tour-360' },
      { label: 'Ubicación', href: '#ubicacion' },
    ],
  },
  {
    title: 'Comprar',
    links: [
      { label: 'Cotizar', href: '#cotizar' },
      { label: 'Simulador hipotecario', href: '#cotizar' },
      { label: 'Reservar parcela', href: '#cotizar' },
      { label: 'Brochure (PDF)', href: PROYECTO.brochureUrl },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-bosque-950 text-crema">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-20 md:px-10 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="rounded-[28px] bg-gradient-to-br from-bosque-800 via-bosque-900 to-bosque-950 p-8 ring-1 ring-crema/10 md:p-12"
        >
          <div className="grid items-center gap-8 md:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza">
                ¿Listo para asegurar tu parcela?
              </p>
              <h2 className="mt-3 font-display text-3xl font-light leading-[1.1] tracking-display md:text-4xl lg:text-5xl">
                Conversemos sin compromiso.<br />
                <span className="italic text-mostaza-300">Lucía o Diego — tú eliges.</span>
              </h2>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <button
                onClick={() => openChatWith({ intent: 'general' })}
                className="group flex items-center justify-center gap-2 rounded-full bg-mostaza px-7 py-3.5 text-sm font-semibold text-bosque-900 shadow-xl shadow-mostaza-500/20 transition hover:-translate-y-0.5 hover:bg-mostaza-400"
              >
                <MessageCircle className="h-4 w-4 transition-transform group-hover:rotate-12" strokeWidth={2.4} />
                Hablar con Lucía
              </button>
              <a
                href={`https://wa.me/${DIEGO.whatsappRaw}?text=${encodeURIComponent(`Hola ${DIEGO.nombre.split(' ')[0]}, me interesa Mirador de Villarrica.`)}`}
                target="_blank"
                rel="noopener"
                className="flex items-center justify-center gap-2 rounded-full border border-crema/25 px-7 py-3.5 text-sm font-medium text-crema transition hover:border-mostaza hover:text-mostaza"
              >
                <Phone className="h-4 w-4" strokeWidth={2.4} />
                WhatsApp · {DIEGO.nombre}
              </a>
            </div>
          </div>
        </motion.div>

        <div className="mt-16 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mostaza text-bosque-900 font-display text-xl font-bold ring-2 ring-mostaza/30">
                M
              </div>
              <div className="leading-tight">
                <p className="font-display text-lg font-semibold tracking-display">
                  {PROYECTO.nombre}
                </p>
                <p className="text-[10.5px] uppercase tracking-eyebrow text-crema/65">
                  por {PROYECTO.desarrolladora}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-[14px] leading-relaxed text-crema/70">
              Parcelación rural ubicada en {PROYECTO.ubicacion}.
              {' '}{PROYECTO.totalParcelas} parcelas desde 5.000 m² entre el volcán Villarrica y el lago Colico.
            </p>
            <ul className="mt-6 space-y-2">
              {TRUST.map((t) => (
                <li key={t} className="flex items-center gap-2 text-[13px] text-crema/75">
                  <ShieldCheck className="h-3.5 w-3.5 text-mostaza" strokeWidth={2.4} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {NAV_COLS.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[14px] text-crema/75 transition-colors hover:text-mostaza"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-3">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza">
              Contacto
            </p>
            <ul className="space-y-3 text-[13.5px] text-crema/80">
              <li>
                <p className="font-medium text-crema">{DIEGO.nombre}</p>
                <p className="text-crema/60">Asesor inmobiliario</p>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mostaza" strokeWidth={2.4} />
                <a href={`tel:${DIEGO.whatsappRaw}`} className="hover:text-mostaza">
                  {DIEGO.whatsapp}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mostaza" strokeWidth={2.4} />
                <a href={`mailto:${DIEGO.email}`} className="hover:text-mostaza">
                  {DIEGO.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mostaza" strokeWidth={2.4} />
                <span>{DIEGO.oficina}</span>
              </li>
            </ul>

            <div className="mt-5 flex items-center gap-2">
              <SocialLink href="https://instagram.com/terra.segura" label="Instagram"><Instagram className="h-4 w-4" strokeWidth={2.2} /></SocialLink>
              <SocialLink href="https://facebook.com/profile.php?id=61578113903295" label="Facebook"><Facebook className="h-4 w-4" strokeWidth={2.2} /></SocialLink>
              <SocialLink href="https://youtube.com/@PortalTerrenocom" label="YouTube"><Youtube className="h-4 w-4" strokeWidth={2.2} /></SocialLink>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start gap-3 border-t border-crema/10 pt-6 text-[12px] text-crema/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {PROYECTO.desarrolladora}. Todos los derechos reservados.</p>
          <p className="flex flex-wrap gap-x-5 gap-y-1">
            <a href="/politica-privacidad" className="hover:text-mostaza">Política de privacidad</a>
            <a href="/terminos" className="hover:text-mostaza">Términos y condiciones</a>
            <span className="text-crema/40">Sitio rediseñado · v2</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-crema/20 text-crema/80 transition hover:border-mostaza hover:bg-mostaza/10 hover:text-mostaza"
    >
      {children}
    </a>
  );
}
