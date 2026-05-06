'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, MessageCircle, Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DIEGO } from '@/data/content';
import { openChatWith } from '@/lib/chat-events';

const NAV = [
  { href: '#proyecto', label: 'Proyecto' },
  { href: '#master-plan', label: 'Master Plan' },
  { href: '#galeria', label: 'Galería' },
  { href: '#tour-360', label: 'Tour 360°' },
  { href: '#ubicacion', label: 'Ubicación' },
  { href: '#cotizar', label: 'Cotizar' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-30 transition-all duration-300',
          scrolled
            ? 'bg-bosque-900/90 backdrop-blur-md shadow-[0_4px_24px_-12px_rgba(0,0,0,0.5)]'
            : 'bg-gradient-to-b from-bosque-950/60 to-transparent'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10 md:py-5">
          <a href="#inicio" className="group flex items-center gap-3" aria-label="Mirador de Villarrica — inicio">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mostaza text-bosque-900 font-display text-xl font-bold ring-2 ring-mostaza/30 md:h-11 md:w-11">
              M
            </div>
            <div className="leading-tight">
              <p className="font-display text-base font-semibold tracking-display text-crema md:text-lg">
                Mirador de Villarrica
              </p>
              <p className="text-[10.5px] uppercase tracking-eyebrow text-crema/70">
                Terra Segura
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13.5px] font-medium text-crema/85 transition-colors hover:text-mostaza"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={`https://wa.me/${DIEGO.whatsappRaw}`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 rounded-full border border-crema/25 px-4 py-2 text-[13px] font-medium text-crema/90 transition hover:border-mostaza hover:text-mostaza"
              aria-label={`WhatsApp ${DIEGO.nombre}`}
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={2.4} />
              WhatsApp
            </a>
            <button
              onClick={() => openChatWith({ intent: 'general' })}
              className="group flex items-center gap-2 rounded-full bg-mostaza px-5 py-2.5 text-[13.5px] font-semibold text-bosque-900 shadow-md transition hover:-translate-y-0.5 hover:bg-mostaza-400 hover:shadow-lg"
            >
              <MessageCircle className="h-4 w-4 transition-transform group-hover:rotate-12" strokeWidth={2.4} />
              Hablar con Lucía
            </button>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-crema/25 text-crema lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-bosque-950/85 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-bosque-900 p-6 text-crema shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-semibold">Menú</p>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-bosque-800/50"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" strokeWidth={2.4} />
                </button>
              </div>

              <nav className="mt-8 flex flex-col">
                {NAV.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.04 }}
                    className="border-b border-crema/10 py-4 font-display text-2xl tracking-display text-crema transition hover:text-mostaza"
                  >
                    {item.label}
                  </motion.a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3 pt-8">
                <button
                  onClick={() => { setOpen(false); openChatWith({ intent: 'general' }); }}
                  className="flex items-center justify-center gap-2 rounded-full bg-mostaza px-5 py-3.5 text-sm font-semibold text-bosque-900 shadow-md"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2.4} />
                  Hablar con Lucía
                </button>
                <a
                  href={`https://wa.me/${DIEGO.whatsappRaw}`}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center justify-center gap-2 rounded-full border border-crema/30 px-5 py-3.5 text-sm font-medium text-crema"
                >
                  <Phone className="h-4 w-4" strokeWidth={2.4} />
                  WhatsApp · {DIEGO.nombre.split(' ')[0]}
                </a>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
