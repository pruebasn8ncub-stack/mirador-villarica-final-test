type Props = { className?: string };

export function VolcanoSvg({ className }: Props) {
  return (
    <svg
      viewBox="0 0 200 140"
      className={className}
      fill="none"
      stroke="#f4a84b"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        data-draw="volcano"
        d="M 70 140 L 95 50 L 100 47 L 105 50 L 130 140 Z"
      />
      <path
        data-draw="volcano"
        d="M 88 70 L 95 60 L 100 65 L 105 58 L 110 68 L 112 70"
      />
      <path
        data-draw="volcano"
        d="M 100 47 Q 102 38 100 30 Q 96 22 102 16"
        strokeWidth="1"
        opacity="0.7"
      />
    </svg>
  );
}
