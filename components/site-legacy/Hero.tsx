'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { ArrowDown, MessageCircle, ShieldCheck, FileCheck2, Banknote } from 'lucide-react';
import { PROYECTO } from '@/data/content';
import { openChatWith } from '@/lib/chat-events';

const TRUST_PILLS = [
  { icon: ShieldCheck, label: 'SAG aprobado' },
  { icon: FileCheck2,  label: 'Roles listos · CBR inmediato' },
  { icon: Banknote,    label: 'Crédito directo' },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yBg       = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const yContent  = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const opacityBg = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

  return (
    <section
      ref={ref}
      id="inicio"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-bosque-950 text-crema"
    >
      <motion.div style={{ y: yBg, opacity: opacityBg }} className="absolute inset-0 -z-10">
        <Image
          src="/assets/banner-volcan.jpg"
          alt="Vista aérea del proyecto Mirador de Villarrica con el Volcán Villarrica al fondo"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bosque-950/60 via-bosque-950/35 to-bosque-950/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-bosque-950/55 via-transparent to-transparent" />
      </motion.div>

      <motion.div style={{ y: yContent }} className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 pt-32 md:px-10 md:pb-24 md:pt-40">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-mostaza/40 bg-bosque-900/45 px-4 py-1.5 text-[11.5px] font-medium uppercase tracking-eyebrow text-mostaza backdrop-blur-sm"
        >
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mostaza/70 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mostaza" />
          </span>
          Terra Segura · Colico, Araucanía
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl font-display text-[44px] font-light leading-[1.02] tracking-display text-crema md:text-7xl lg:text-[88px]"
        >
          Tu pedazo de sur,<br />
          <span className="italic text-mostaza-300">donde el tiempo se detiene.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28 }}
          className="mt-7 max-w-xl text-base leading-relaxed text-crema/85 md:text-lg"
        >
          {PROYECTO.totalParcelas} parcelas en {PROYECTO.superficieTotal} entre el volcán y el lago.
          Bosque nativo, caminos estabilizados y todos los papeles en regla — listo para escriturar.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-7 flex flex-wrap items-center gap-3"
        >
          <span className="rounded-full bg-crema/10 px-4 py-2 text-[13px] font-medium text-crema backdrop-blur-sm ring-1 ring-crema/15">
            Contado desde <span className="font-semibold text-mostaza">{PROYECTO.precioContado}</span>
          </span>
          <span className="rounded-full bg-crema/10 px-4 py-2 text-[13px] font-medium text-crema backdrop-blur-sm ring-1 ring-crema/15">
            Crédito directo desde <span className="font-semibold text-mostaza">{PROYECTO.precioCredito}</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.52 }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <button
            onClick={() => openChatWith({ intent: 'general' })}
            className="group flex items-center gap-2 rounded-full bg-mostaza px-7 py-3.5 text-sm font-semibold text-bosque-900 shadow-xl shadow-mostaza-500/20 transition hover:-translate-y-0.5 hover:bg-mostaza-400 hover:shadow-2xl"
          >
            <MessageCircle className="h-4 w-4 transition-transform group-hover:rotate-12" strokeWidth={2.4} />
            Conversar con Lucía
          </button>
          <a
            href="#master-plan"
            className="flex items-center gap-2 rounded-full border border-crema/30 px-7 py-3.5 text-sm font-medium text-crema backdrop-blur-sm transition hover:border-mostaza hover:bg-crema/10"
          >
            Ver Master Plan interactivo
            <ArrowDown className="h-4 w-4" strokeWidth={2.4} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-crema/15 pt-6"
        >
          {TRUST_PILLS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-[13px] text-crema/80">
              <Icon className="h-4 w-4 text-mostaza" strokeWidth={2.2} />
              {label}
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.a
        href="#proyecto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] uppercase tracking-eyebrow text-crema/60 md:flex"
        aria-label="Bajar a la siguiente sección"
      >
        Descubrir
        <span className="relative h-9 w-[1px] overflow-hidden bg-crema/20">
          <span className="absolute inset-x-0 top-0 h-3 bg-mostaza animate-[scroll-hint_1.8s_ease-in-out_infinite]" />
        </span>
      </motion.a>
    </section>
  );
}
