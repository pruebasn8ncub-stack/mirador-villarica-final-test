'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatRowProps {
  icon?: LucideIcon;
  label: string;
  value: string;
  /** inline = horizontal compacto ; stacked = label arriba, value abajo (para grids) */
  variant?: 'inline' | 'stacked';
  className?: string;
}

/**
 * Fila de atributo (icono + label + value). Dos variantes:
 * - inline: flex horizontal, label a la izq y value a la der (útil en listas).
 * - stacked: label uppercase pequeño arriba, value bold abajo (útil en grids 3-col).
 */
export function StatRow({ icon: Icon, label, value, variant = 'inline', className }: StatRowProps) {
  if (variant === 'stacked') {
    return (
      <div className={cn('flex flex-col gap-0.5', className)}>
        <span className="text-[11px] font-medium uppercase tracking-wider text-bosque-400">
          {label}
        </span>
        <span className="text-[13px] font-semibold text-bosque-900 tabular-nums">{value}</span>
      </div>
    );
  }
  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      <span className="flex items-center gap-1.5 text-[13px] text-bosque-600">
        {Icon && <Icon className="h-3.5 w-3.5 text-bosque-400" aria-hidden="true" />}
        {label}
      </span>
      <span className="text-[13px] font-semibold text-bosque-900 tabular-nums">{value}</span>
    </div>
  );
}
