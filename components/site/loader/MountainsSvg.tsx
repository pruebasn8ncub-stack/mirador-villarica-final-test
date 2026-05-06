type Props = { className?: string };

export function MountainsSvg({ className }: Props) {
  return (
    <svg
      viewBox="0 0 600 140"
      className={className}
      fill="none"
      stroke="#f4a84b"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path data-draw="mountain" d="M 0 140 L 50 90 L 90 110 L 130 95 L 170 105 L 200 100 Z" opacity="0.55" />
      <path data-draw="mountain" d="M 180 140 L 230 80 L 270 100 L 310 70 L 350 95 L 400 88 Z" opacity="0.7" />
      <path data-draw="mountain" d="M 380 140 L 420 95 L 460 110 L 500 90 L 540 100 L 580 92 L 600 100 L 600 140 Z" opacity="0.6" />
      <path data-draw="mountain" d="M 60 140 L 110 70 L 145 90 L 180 65 L 220 90 L 250 80 Z" />
      <path data-draw="mountain" d="M 290 140 L 340 60 L 375 85 L 410 55 L 450 80 L 480 70 Z" />
    </svg>
  );
}
