import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { DIEGO, PROYECTO } from '@/data/content';

const FOOTER_NAV = [
  { href: '#proyecto', label: 'Proyecto' },
  { href: '#ubicacion', label: 'Ubicación' },
  { href: '#financiamiento', label: 'Financiamiento' },
  { href: '#tour', label: 'Tour 360°' },
  { href: '#faq', label: 'FAQ' },
];

const SOCIAL = [
  { href: 'https://instagram.com/terra.segura', icon: Instagram, label: 'Instagram' },
  {
    href: 'https://facebook.com/profile.php?id=61578113903295',
    icon: Facebook,
    label: 'Facebook',
  },
  { href: 'https://youtube.com/@PortalTerrenocom', icon: Youtube, label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="relative bg-bosque-950 text-crema/85">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Image
              src="/assets/mirador-logo-amarillo.png"
              alt="Mirador de Villarrica"
              width={320}
              height={320}
              className="h-24 sm:h-28 w-auto object-contain mb-7"
            />
            <p className="text-crema/65 text-[15px] leading-relaxed max-w-md">
              {PROYECTO.totalParcelas} parcelas en {PROYECTO.superficieTotal} de bosque
              nativo. SAG aprobado. Crédito directo con Terra Segura Inmobiliaria.
            </p>
            <div className="mt-9 pt-7 border-t border-crema/10 max-w-md">
              <p className="text-[10px] tracking-eyebrow uppercase text-crema/45 mb-4">
                Un proyecto de
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <a
                  href="https://terrasegura.cl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Terra Segura Inmobiliaria — Sitio oficial"
                  className="inline-flex shrink-0 transition-opacity hover:opacity-100"
                >
                  <Image
                    src="/assets/terra-segura-logo.png"
                    alt="Terra Segura Inmobiliaria"
                    width={400}
                    height={83}
                    className="h-9 sm:h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                  />
                </a>
                <span className="hidden sm:block h-8 w-px bg-crema/15" aria-hidden />
                <div className="flex items-center gap-2">
                  {SOCIAL.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label} de Terra Segura`}
                      className="size-10 rounded-full border border-crema/15 hover:border-mostaza hover:text-mostaza flex items-center justify-center transition-colors"
                    >
                      <s.icon className="size-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="text-[11px] tracking-eyebrow uppercase text-mostaza mb-5">
              Navegar
            </p>
            <ul className="space-y-3">
              {FOOTER_NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="text-crema/70 hover:text-mostaza text-[15px] transition-colors"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <p className="text-[11px] tracking-eyebrow uppercase text-mostaza mb-5">
              Contacto
            </p>
            <ul className="space-y-4 text-[15px]">
              <li>
                <p className="font-medium text-crema">{DIEGO.nombre}</p>
                <p className="text-crema/55 text-xs mt-0.5">Broker · Terra Segura</p>
              </li>
              <li>
                <a
                  href={`tel:${DIEGO.whatsappRaw}`}
                  className="inline-flex items-center gap-3 text-crema/70 hover:text-crema transition-colors"
                >
                  <Phone className="size-4 text-mostaza" /> {DIEGO.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${DIEGO.email}`}
                  className="inline-flex items-center gap-3 text-crema/70 hover:text-crema transition-colors"
                >
                  <Mail className="size-4 text-mostaza" /> {DIEGO.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-crema/65">
                <MapPin className="size-4 text-mostaza mt-1 shrink-0" />
                <span>{DIEGO.oficina}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-crema/10 flex flex-wrap items-center justify-between gap-4 text-xs text-crema/50">
          <p>© {new Date().getFullYear()} Terra Segura Inmobiliaria. Todos los derechos reservados.</p>
          <p>
            Diseño y desarrollo · <span className="italic">in-house</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
