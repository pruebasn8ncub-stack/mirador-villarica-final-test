'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  MessagesSquare,
  StickyNote,
  DollarSign,
  LogOut,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabDef = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const TABS: TabDef[] = [
  { href: '/panel', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/panel/leads', label: 'Leads', icon: Users },
  { href: '/panel/conversaciones', label: 'Conversaciones', icon: MessagesSquare },
  { href: '/panel/anotaciones', label: 'Anotaciones', icon: StickyNote },
  { href: '/panel/costos', label: 'Costos', icon: DollarSign },
];

export function PanelShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname?.startsWith(href);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/feedback/auth', { method: 'DELETE' });
    router.replace('/panel/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-bosque-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-mostaza" />
            <span className="text-[10.5px] font-semibold uppercase tracking-eyebrow text-bosque-700">
              Mirador · Panel
            </span>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 rounded-lg border border-bosque-200 bg-white px-3 py-1.5 text-xs font-medium text-bosque-700 transition-colors hover:bg-bosque-50 disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            Salir
          </button>
        </div>
        <nav className="border-t border-bosque-100">
          <div className="mx-auto flex max-w-[1400px] items-center gap-1 overflow-x-auto px-4 md:px-8">
            {TABS.map((tab) => {
              const active = isActive(tab.href, tab.exact);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'group flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors',
                    active
                      ? 'border-bosque-800 text-bosque-900'
                      : 'border-transparent text-bosque-600 hover:text-bosque-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5 transition-colors',
                      active ? 'text-mostaza-400' : 'text-bosque-400 group-hover:text-bosque-600'
                    )}
                  />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
