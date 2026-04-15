import { PROYECTO } from '@/data/content';

export function Tour360() {
  return (
    <section id="tour" className="bg-bosque-900 py-16 text-crema md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-mostaza">Tour virtual</p>
          <h2 className="text-3xl font-bold md:text-4xl">Recorre Mirador de Villarrica</h2>
          <p className="mx-auto mt-3 max-w-2xl text-crema-100/90">
            Explora el proyecto en 360° sin moverte de tu casa.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-bosque-700 shadow-xl">
          <iframe
            src={PROYECTO.tour360Url}
            title="Tour 360° Mirador de Villarrica"
            className="aspect-video w-full"
            loading="lazy"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; xr-spatial-tracking"
          />
        </div>
      </div>
    </section>
  );
}
