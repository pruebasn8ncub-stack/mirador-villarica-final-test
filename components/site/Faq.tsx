import { Plus } from 'lucide-react';
import { ChatCta } from './ChatCta';

const FAQS = [
  {
    q: '¿La parcela queda a mi nombre con rol propio?',
    a: 'Sí. Cada parcela tiene rol único asignado por el SII y se inscribe a tu nombre en el Conservador de Bienes Raíces de Cunco la misma semana de la escritura.',
  },
  {
    q: '¿Cómo funciona el agua si no hay red pública?',
    a: 'Cada propietario hace su pozo profundo. Estudios hidrológicos confirman napa accesible entre 30 y 60 metros en toda el área, con caudales suficientes para uso doméstico y riego básico.',
  },
  {
    q: '¿Hay luz eléctrica en cada parcela?',
    a: 'Sí. Postación trifásica en la entrada del proyecto. La conexión final se realiza por empalme con la distribuidora local (Frontel), siguiendo el procedimiento estándar de cualquier propiedad rural.',
  },
  {
    q: '¿Qué incluye exactamente la reserva de $500.000?',
    a: 'Cubre los gastos operacionales: notaría, Conservador de Bienes Raíces, certificados, asesoría legal de la inmobiliaria y firma de promesa. No es un costo adicional al precio publicado, aplica al total.',
  },
  {
    q: '¿Qué significa SAG aprobado y por qué importa?',
    a: 'El Servicio Agrícola y Ganadero validó formalmente la subdivisión rural. Sin esa aprobación, la subdivisión sería irregular y no podrías inscribir tu parcela. Es la única vía legal para parcelaciones rurales en Chile.',
  },
  {
    q: '¿Puedo construir mi casa en la parcela?',
    a: 'Sí. Uso rural permite construcción residencial bajo permisos de la Municipalidad de Cunco. La parcelación no impone restricciones más allá de las leyes vigentes y el respeto al bosque nativo protegido.',
  },
];

export function Faq() {
  return (
    <section id="faq" className="relative py-24 sm:py-32 lg:py-40 bg-crema">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl mb-14 sm:mb-16">
          <p className="inline-flex items-center gap-2.5 text-[11px] tracking-eyebrow uppercase text-bosque-700/80 mb-6">
            <span className="size-1.5 rounded-full bg-mostaza" /> Preguntas frecuentes
          </p>
          <h2 className="font-display text-bosque-900 tracking-display leading-[1.05] text-[clamp(2rem,4.5vw,3.75rem)] font-light">
            Lo que todos preguntan
            <br />
            <span className="italic">antes de reservar</span>.
          </h2>
        </div>

        <div className="divide-y divide-bosque-900/10 border-y border-bosque-900/10">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group py-7 sm:py-8 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-start justify-between gap-6 cursor-pointer list-none">
                <h3 className="font-display text-bosque-900 text-xl sm:text-2xl tracking-display leading-snug font-normal">
                  {f.q}
                </h3>
                <span className="size-9 shrink-0 rounded-full border border-bosque-900/15 flex items-center justify-center text-bosque-900 transition-all duration-300 group-open:rotate-45 group-open:bg-bosque-900 group-open:text-crema group-open:border-bosque-900">
                  <Plus className="size-4" />
                </span>
              </summary>
              <div className="overflow-hidden">
                <p className="mt-4 text-bosque-900/70 text-base sm:text-[17px] leading-relaxed max-w-3xl">
                  {f.a}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 p-8 rounded-3xl bg-crema-200">
          <div>
            <p className="font-display italic text-bosque-900 text-2xl sm:text-3xl leading-tight">
              ¿Tu pregunta no está acá?
            </p>
            <p className="text-bosque-900/65 text-sm mt-1">
              Lucía responde al instante. Diego te llama si lo prefieres.
            </p>
          </div>
          <ChatCta size="md" variant="secondary" intent="general" icon="arrow">
            Pregúntale a Lucía
          </ChatCta>
        </div>
      </div>
    </section>
  );
}
