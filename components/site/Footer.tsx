import { Mail, MapPin, Phone, Instagram, Facebook, Youtube } from 'lucide-react';
import { DIEGO, PROYECTO } from '@/data/content';

export function Footer() {
  return (
    <footer className="bg-bosque-900 py-12 text-crema-100/90">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 md:grid-cols-3 md:px-6">
        <div>
          <h3 className="text-lg font-semibold text-crema">{PROYECTO.nombre}</h3>
          <p className="mt-2 text-sm">
            {PROYECTO.desarrolladora}
            <br />
            {PROYECTO.ubicacion}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-crema">Contacto</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-mostaza" aria-hidden="true" />
              <a href={`https://wa.me/${DIEGO.whatsappRaw}`} className="hover:text-mostaza">
                {DIEGO.whatsapp}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-mostaza" aria-hidden="true" />
              <a href={`mailto:${DIEGO.email}`} className="hover:text-mostaza">
                {DIEGO.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-mostaza" aria-hidden="true" />
              <span>{DIEGO.oficina}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-crema">Síguenos</h3>
          <ul className="mt-3 flex gap-3">
            <li>
              <a
                href="https://instagram.com/terra.segura"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="https://facebook.com/terra.segura"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <Facebook className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="https://youtube.com/@PortalTerrenocom"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              >
                <Youtube className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          </ul>

          <a
            href={PROYECTO.brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full border border-mostaza px-4 py-2 text-sm text-mostaza hover:bg-mostaza hover:text-bosque-900"
          >
            Descargar brochure
          </a>
        </div>
      </div>

      <div className="mt-10 border-t border-bosque-700 pt-6 text-center text-xs text-crema-100/60">
        © {new Date().getFullYear()} {PROYECTO.desarrolladora}. Todos los derechos reservados.
      </div>
    </footer>
  );
}
