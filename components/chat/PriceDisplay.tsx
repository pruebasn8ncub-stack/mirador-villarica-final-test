'use client';

import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  /** Ej. "UF 520", "$14.490.000", "UF 9,8 /mes" */
  value: string;
  /** Sub-label opcional debajo (ej. "UF", "/mes", "contado") */
  suffix?: string;
  /** hero = 20px bold ; default = 16px semibold ; compact = 14px semibold */
  size?: 'hero' | 'default' | 'compact';
  /** Si true, pinta el valor en tono mostaza para énfasis comercial */
  accent?: boolean;
  className?: string;
}

/**
 * Display de precio unificado — usar en PropertyCard, Carousel, CompareTable, Mortgage.
 * Centraliza el patrón "text-XXpx font-semibold tracking-tight tabular-nums" con jerarquía.
 */
export function PriceDisplay({
  value,
  suffix,
  size = 'default',
  accent = false,
  className,
}: PriceDisplayProps) {
  const sizeCls =
    size === 'hero'
      ? 'text-[20px] leading-none'
      : size === 'compact'
      ? 'text-[14px] leading-tight'
      : 'text-[16px] leading-tight';

  return (
    <div className={cn('flex items-baseline gap-1.5', className)}>
      <span
        className={cn(
          'font-semibold tracking-tight tabular-nums',
          sizeCls,
          accent ? 'text-mostaza-500' : 'text-bosque-900'
        )}
      >
        {value}
      </span>
      {suffix && (
        <span className="text-[11px] font-medium uppercase tracking-wider text-bosque-400">
          {suffix}
        </span>
      )}
    </div>
  );
}
