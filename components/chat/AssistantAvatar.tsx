import Image from 'next/image';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssistantAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  /** Si true, muestra la foto de Lucía (v4 editorial pro) en vez de la inicial. */
  photo?: boolean;
  /** Si true, muestra un icono de robot en vez de la inicial "L". */
  robot?: boolean;
  className?: string;
}

const ROBOT_SIZE = { xs: 14, sm: 16, md: 20, lg: 24 } as const;

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
} as const;

const SIZE_PX = { xs: 24, sm: 32, md: 40, lg: 48 } as const;

const STATUS_SIZE = {
  xs: 'h-2 w-2 border',
  sm: 'h-2.5 w-2.5 border-2',
  md: 'h-3 w-3 border-2',
  lg: 'h-3.5 w-3.5 border-2',
} as const;

/**
 * Avatar del asistente.
 * - Default (gradient + inicial "L"): ideal para sizes xs/sm donde la foto no se lee.
 * - photo=true: reemplaza el gradient por la foto de Lucía. Ideal para el header
 *   del chat donde quieres identidad humana reconocible.
 */
export function AssistantAvatar({
  size = 'md',
  showStatus = false,
  photo = false,
  robot = false,
  className,
}: AssistantAvatarProps) {
  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full ring-1 ring-bosque-900/10',
          photo
            ? 'bg-crema'
            : robot
            ? 'bg-gradient-avatar text-crema'
            : 'bg-gradient-avatar font-semibold text-crema',
          SIZE_CLASSES[size],
          className
        )}
        aria-hidden="true"
      >
        {photo ? (
          <Image
            src="/avatars/lucia-v4-editorial-pro.png"
            alt=""
            width={SIZE_PX[size]}
            height={SIZE_PX[size]}
            sizes={`${SIZE_PX[size]}px`}
            className="h-full w-full scale-110 object-cover object-center"
            priority={size === 'md' || size === 'lg'}
          />
        ) : robot ? (
          <Bot size={ROBOT_SIZE[size]} strokeWidth={2.2} className="drop-shadow-sm" />
        ) : (
          <span className="drop-shadow-sm">L</span>
        )}
      </div>
      {showStatus && (
        <span
          className={cn(
            'status-dot absolute bottom-0 right-0 rounded-full border-white bg-emerald-400',
            STATUS_SIZE[size]
          )}
          aria-label="En línea"
        />
      )}
    </div>
  );
}
