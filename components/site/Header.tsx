'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { ChatCta } from './ChatCta';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '#proyecto', label: 'Proyecto' },
  { href: '#ubicacion', label: 'Ubicación' },
  { href: '#financiamiento', label: 'Financiamiento' },
  { href: '#faq', label: 'FAQ' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 bg-none',
        scrolled
          ? 'bg-crema/75 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_32px_-12px_rgba(26,61,46,0.18)]'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex h-20 sm:h-24 items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <a
              href="https://terrasegura.cl/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Terra Segura Inmobiliaria — Sitio oficial"
              className="shrink-0 transition-opacity hover:opacity-100"
            >
              <Image
                src="/assets/terra-segura-logo.png"
                alt="Terra Segura Inmobiliaria"
                width={400}
                height={83}
                priority
                className={cn(
                  'h-7 sm:h-9 w-auto object-contain transition-all duration-500',
                  scrolled ? 'invert opacity-80 hover:opacity-100' : 'opacity-95 hover:opacity-100',
                )}
              />
            </a>

            <span
              className={cn(
                'hidden sm:inline text-[10px] tracking-[0.32em] uppercase font-medium whitespace-nowrap transition-colors duration-500',
                scrolled ? 'text-bosque-900/55' : 'text-crema/65',
              )}
            >
              presenta
            </span>

            <span
              className={cn(
                'hidden sm:block h-12 w-px transition-colors duration-500',
                scrolled ? 'bg-bosque-900/15' : 'bg-crema/25',
              )}
              aria-hidden
            />

            <Link
              href="#top"
              aria-label="Mirador de Villarrica — Inicio"
              className="shrink-0"
            >
              <span
                role="img"
                aria-hidden
                className={cn(
                  'block h-16 sm:h-20 w-16 sm:w-20 transition-colors duration-500',
                  scrolled ? 'bg-bosque-900' : 'bg-mostaza',
                )}
                style={{
                  WebkitMaskImage: 'url(/assets/mirador-mark.png)',
                  maskImage: 'url(/assets/mirador-mark.png)',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                }}
              />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-9">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'text-[13px] tracking-tight font-medium transition-colors',
                  scrolled
                    ? 'text-bosque-900/75 hover:text-bosque-900'
                    : 'text-crema/85 hover:text-crema',
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ChatCta
                size="sm"
                variant={scrolled ? 'primary' : 'inverse'}
                intent="general"
                icon="sparkle"
              >
                Habla con un ejecutivo / Lucía
              </ChatCta>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              className={cn(
                'lg:hidden inline-flex items-center justify-center size-10 rounded-full border transition-colors',
                scrolled
                  ? 'text-bosque-900 border-bosque-900/15 hover:bg-bosque-900/5'
                  : 'text-crema border-crema/30 hover:bg-crema/10',
              )}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden absolute inset-x-0 top-full bg-crema border-b border-bosque-900/8 shadow-card">
          <nav className="px-6 py-6 flex flex-col gap-1">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 text-bosque-900 text-base font-medium tracking-tight border-b border-bosque-900/5 last:border-0"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-4">
              <ChatCta
                size="md"
                variant="primary"
                intent="general"
                className="w-full"
                icon="sparkle"
              >
                Habla con un ejecutivo / Lucía
              </ChatCta>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
