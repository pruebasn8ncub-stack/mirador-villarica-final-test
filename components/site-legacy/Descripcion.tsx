'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Droplet, Zap, Route, Shield, FileCheck2, Mountain,
} from 'lucide-react';
import { CARACTERISTICAS, PROYECTO } from '@/data/content';

const ICONS = { Droplet, Zap, Route, Shield, FileCheck2, Mountain };

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export function Descripcion() {
  return (
    <section
      id="proyecto"
      className="relative bg-crema py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid items-start gap-14 lg:grid-cols-12 lg:gap-20"
        >
          <motion.div variants={fadeUp} className="lg:col-span-5">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-eyebrow text-mostaza-500">
              El proyecto
            </p>
            <h2 className="font-display text-4xl font-light leading-[1.05] tracking-display text-bosque-900 md:text-5xl lg:text-[58px]">
              Un proyecto pensado para vivirlo,<br />
              <span className="italic text-bosque-700">no para guardarlo.</span>
            </h2>
            <p className="mt-7 max-w-md text-[15.5px] leading-relaxed text-bosque-800/80">
              {PROYECTO.totalParcelas} parcelas distribuidas en {PROYECTO.superficieTotal} sobre la
              ruta Villarrica–Las Hortensias, en el corazón de Colico. Bosque nativo, vistas
              limpias al volcán Villarrica y al lago, con todos los papeles listos para escriturar
              hoy mismo.
            </p>
            <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-bosque-800/80">
              Diseñado para que vivas el sur sin pelearte con trámites: rol propio,
              factibilidad de servicios y caminos estabilizados aptos para todo el año.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-bosque-100 pt-8">
              <Stat label="Parcelas" value={PROYECTO.totalParcelas.toString()} />
              <Stat label="Hectáreas" value="80" />
              <Stat label="Desde" value="5.000 m²" />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="relative lg:col-span-7">
            <div className="grid grid-cols-12 gap-3 md:gap-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="relative col-span-8 aspect-[4/5] overflow-hidden rounded-[28px] shadow-card-hover"
              >
                <Image
                  src="/assets/galeria1.jpg"
                  alt="Bosque nativo de Mirador de Villarrica"
                  fill
                  sizes="(min-width: 1024px) 40vw, 65vw"
                  className="object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="relative col-span-4 mt-12 aspect-[3/4] overflow-hidden rounded-[24px] shadow-card-hover md:mt-20"
              >
                <Image
                  src="/assets/lagocolico.jpg"
                  alt="Lago Colico a 20 minutos del proyecto"
                  fill
                  sizes="(min-width: 1024px) 22vw, 32vw"
                  className="object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative col-span-7 col-start-4 -mt-6 aspect-[16/10] overflow-hidden rounded-[24px] shadow-card-hover md:-mt-12"
              >
                <Image
                  src="/assets/banner-volcan.jpg"
                  alt="Vista al Volcán Villarrica desde el proyecto"
                  fill
                  sizes="(min-width: 1024px) 38vw, 60vw"
                  className="object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CARACTERISTICAS.map((c) => {
            const Icon = ICONS[c.icon as keyof typeof ICONS] ?? Mountain;
            return (
              <motion.div
                key={c.titulo}
                variants={fadeUp}
                className="group rounded-3xl border border-bosque-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-mostaza/40 hover:shadow-card-hover"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bosque-50 text-bosque-700 transition group-hover:bg-mostaza/15 group-hover:text-mostaza-500">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="mt-5 font-display text-xl font-medium text-bosque-900">
                  {c.titulo}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-bosque-700/80">
                  {c.detalle}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-medium text-bosque-900 md:text-4xl">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-eyebrow text-bosque-500">{label}</p>
    </div>
  );
}
