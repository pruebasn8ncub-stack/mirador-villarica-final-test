import { cn } from '@/lib/utils';

interface AssistantAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
} as const;

const STATUS_SIZE = {
  xs: 'h-2 w-2 border',
  sm: 'h-2.5 w-2.5 border-2',
  md: 'h-3 w-3 border-2',
  lg: 'h-3.5 w-3.5 border-2',
} as const;

/**
 * Avatar del asistente — círculo con gradient bosque→mostaza
 * y la inicial "L" (Lucía). Punto de estado "online" opcional.
 */
export function AssistantAvatar({
  size = 'md',
  showStatus = false,
  className,
}: AssistantAvatarProps) {
  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gradient-avatar font-semibold text-crema ring-1 ring-bosque-900/10',
          SIZE_CLASSES[size]
        )}
        aria-hidden="true"
      >
        <span className="drop-shadow-sm">L</span>
      </div>
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-white bg-emerald-400 status-dot',
            STATUS_SIZE[size]
          )}
          aria-label="En línea"
        />
      )}
    </div>
  );
}
