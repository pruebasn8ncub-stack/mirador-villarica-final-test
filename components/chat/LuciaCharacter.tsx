import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LuciaCharacterProps {
  size?: number;
  className?: string;
}

/**
 * Caricatura de Lucía (asesora virtual de Mirador).
 * Ilustración flat vector generada con Gemini 3 Pro Image (nano-banana 2).
 * Crop circular para ajustar dentro del launcher.
 */
export function LuciaCharacter({
  size = 72,
  className,
}: LuciaCharacterProps) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full',
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/avatars/lucia-v2-flat.png"
        alt=""
        fill
        sizes={`${size}px`}
        priority
        className="object-cover object-center scale-110"
      />
    </div>
  );
}
