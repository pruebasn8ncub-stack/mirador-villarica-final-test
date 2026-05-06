'use client';

import type { ReactNode } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { openChatWith, type ChatOpenContext } from '@/lib/chat-events';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse';
type Size = 'sm' | 'md' | 'lg';

interface ChatCtaProps extends ChatOpenContext {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: 'sparkle' | 'arrow' | 'none';
}

const variants: Record<Variant, string> = {
  primary:
    'bg-mostaza text-bosque-900 hover:bg-mostaza-400 shadow-card hover:shadow-card-hover',
  secondary:
    'bg-bosque-900 text-crema hover:bg-bosque-700 shadow-card hover:shadow-card-hover',
  ghost:
    'bg-transparent text-current hover:bg-current/5 border border-current/25',
  inverse:
    'bg-crema text-bosque-900 hover:bg-crema-200 shadow-card hover:shadow-card-hover',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm gap-2',
  md: 'h-12 px-6 text-[15px] gap-2.5',
  lg: 'h-14 px-8 text-base sm:text-lg gap-3',
};

export function ChatCta({
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon = 'sparkle',
  ...ctx
}: ChatCtaProps) {
  return (
    <button
      type="button"
      onClick={() => openChatWith(ctx)}
      className={cn(
        'group inline-flex items-center justify-center font-medium tracking-tight rounded-full transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mostaza focus-visible:ring-offset-2 focus-visible:ring-offset-crema',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {icon === 'sparkle' && (
        <Sparkles className="size-4 shrink-0 transition-transform group-hover:rotate-12" aria-hidden />
      )}
      <span>{children}</span>
      {icon === 'arrow' && (
        <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
      )}
    </button>
  );
}
