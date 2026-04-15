import { MapPin } from 'lucide-react';
import { LUGARES_CERCANOS, DISTANCIAS } from '@/data/content';

export function LugaresCercanos() {
  return (
    <section id="lugares" className="bg-crema py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-mostaza-500">Ubicación</p>
          <h2 className="text-3xl font-bold text-bosque-800 md:text-4xl">
            Conectado con todo lo que importa
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ul className="space-y-4">
            {LUGARES_CERCANOS.map((l) => (
              <li
                key={l.titulo}
                className="flex gap-4 rounded-2xl border border-bosque-100 bg-white p-5 shadow-sm"
              >
                <MapPin className="h-6 w-6 shrink-0 text-mostaza-500" aria-hidden="true" />
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-semibold text-bosque-800">{l.titulo}</h3>
                    <span className="text-sm font-medium text-mostaza-500">{l.tiempo}</span>
                  </div>
                  <p className="mt-1 text-sm text-bosque-700">{l.descripcion}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-bosque-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-bosque-800">Distancias aproximadas</h3>
            <dl className="divide-y divide-bosque-100">
              {DISTANCIAS.map((d) => (
                <div key={d.lugar} className="flex items-center justify-between py-2.5 text-sm">
                  <dt className="text-bosque-700">{d.lugar}</dt>
                  <dd className="font-medium text-bosque-800">
                    {d.tiempo}
                    {d.km && <span className="ml-2 text-bosque-400">· {d.km}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
