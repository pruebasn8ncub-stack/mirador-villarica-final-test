'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#galeria', label: 'Galería' },
  { href: '#tour', label: 'Tour 360°' },
  { href: '#lugares', label: 'Lugares' },
  { href: '#plano', label: 'Master Plan' },
  { href: '#cotizar', label: 'Conversemos' },
];

export function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-bosque-100 bg-crema/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <a href="#inicio" className="flex items-center gap-2 font-semibold text-bosque-800">
          <span className="inline-block h-8 w-8 rounded-full bg-bosque-800 text-center text-crema leading-8">
            M
          </span>
          <span className="hidden sm:inline">Mirador de Villarrica</span>
        </a>

        <nav className="hidden md:block" aria-label="Navegación principal">
          <ul className="flex items-center gap-6 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-bosque-800 hover:text-mostaza transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="#cotizar"
          className="hidden md:inline-flex rounded-full bg-bosque-800 px-4 py-2 text-sm font-medium text-crema hover:bg-bosque-700"
        >
          Cotizar
        </a>

        <button
          type="button"
          onClick={() => setIsMobileOpen((v) => !v)}
          className="md:hidden rounded p-2 text-bosque-800"
          aria-label={isMobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          'md:hidden border-t border-bosque-100 bg-crema transition-all overflow-hidden',
          isMobileOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <nav aria-label="Navegación móvil">
          <ul className="flex flex-col gap-1 px-4 py-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="block rounded px-2 py-2 text-bosque-800 hover:bg-crema-200"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
