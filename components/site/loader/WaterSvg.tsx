type Props = { className?: string };

export function WaterSvg({ className }: Props) {
  return (
    <svg
      viewBox="0 0 600 60"
      className={className}
      fill="none"
      stroke="#f4a84b"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path data-draw="water" d="M 0 15 Q 50 5 100 15 T 200 15 T 300 15 T 400 15 T 500 15 T 600 15" opacity="0.7" />
      <path data-draw="water" d="M 0 35 Q 50 25 100 35 T 200 35 T 300 35 T 400 35 T 500 35 T 600 35" opacity="0.55" />
      <path data-draw="water" d="M 0 50 Q 50 42 100 50 T 200 50 T 300 50 T 400 50 T 500 50 T 600 50" opacity="0.4" />
    </svg>
  );
}
