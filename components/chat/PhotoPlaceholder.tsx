import { cn } from '@/lib/utils';

type Tone =
  | 'forest'
  | 'meadow'
  | 'lake'
  | 'volcano'
  | 'sunset'
  | 'default';

const toneGradients: Record<Tone, string> = {
  forest: 'from-[#2d5a3e] via-[#4a7c5c] to-[#6b9b7d]',
  meadow: 'from-[#7a9b5c] via-[#9cb871] to-[#c5d68f]',
  lake: 'from-[#3a6b8c] via-[#5c8aa8] to-[#8cb0c7]',
  volcano: 'from-[#3a2818] via-[#7a4c2e] to-[#c78a4e]',
  sunset: 'from-[#c77a4a] via-[#e6a567] to-[#f4c99b]',
  default: 'from-bosque-500 via-bosque-400 to-bosque-300',
};

interface PhotoPlaceholderProps {
  tone?: Tone | string;
  label?: string;
  url?: string;
  alt?: string;
  className?: string;
}

export function PhotoPlaceholder({
  tone = 'forest',
  label,
  url,
  alt,
  className,
}: PhotoPlaceholderProps) {
  const gradient =
    toneGradients[(tone as Tone)] ?? toneGradients.forest;

  return (
    <div
      className={cn(
        'relative flex h-full w-full items-end overflow-hidden bg-gradient-to-br',
        gradient,
        className
      )}
      role={url ? undefined : 'img'}
      aria-label={alt ?? label}
    >
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt ?? ''}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      )}
      {label && !url && (
        <span className="relative z-[1] w-full px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
          {label}
        </span>
      )}
    </div>
  );
}
