import {
  Droplet,
  Zap,
  Route,
  Shield,
  FileCheck2,
  Mountain,
  type LucideIcon,
} from 'lucide-react';
import { CARACTERISTICAS, PROYECTO } from '@/data/content';

const ICONS: Record<string, LucideIcon> = {
  Droplet,
  Zap,
  Route,
  Shield,
  FileCheck2,
  Mountain,
};

export function Descripcion() {
  return (
    <section className="bg-crema py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-mostaza-500">
            El proyecto
          </p>
          <h2 className="text-3xl font-bold text-bosque-800 md:text-4xl">
            80 hectáreas en el corazón de la Araucanía
          </h2>
          <p className="mt-4 text-lg text-bosque-700">
            Mirador de Villarrica es un proyecto de {PROYECTO.desarrolladora} ubicado en{' '}
            {PROYECTO.ubicacion}. {PROYECTO.totalParcelas} parcelas con vistas al volcán y al lago,
            con {PROYECTO.estadoLegal.toLowerCase()}.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARACTERISTICAS.map((c) => {
            const Icon = ICONS[c.icon] ?? Mountain;
            return (
              <li
                key={c.titulo}
                className="rounded-2xl border border-bosque-100 bg-white p-6 shadow-sm"
              >
                <Icon className="h-8 w-8 text-mostaza-500" aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-bosque-800">{c.titulo}</h3>
                <p className="mt-1 text-sm text-bosque-700">{c.detalle}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
