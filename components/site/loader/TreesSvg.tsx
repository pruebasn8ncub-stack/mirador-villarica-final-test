type Props = { className?: string };

export function TreesSvg({ className }: Props) {
  return (
    <svg
      viewBox="0 0 400 100"
      className={className}
      fill="none"
      stroke="#f4a84b"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path data-draw="tree" d="M 60 100 L 60 60 M 50 70 L 60 60 L 70 70 M 47 80 L 60 67 L 73 80 M 44 90 L 60 75 L 76 90" />
      <path data-draw="tree" d="M 130 100 L 130 50 M 117 62 L 130 50 L 143 62 M 113 75 L 130 58 L 147 75 M 109 88 L 130 67 L 151 88" />
      <path data-draw="tree" d="M 230 100 L 230 65 M 222 73 L 230 65 L 238 73 M 219 82 L 230 70 L 241 82 M 216 92 L 230 78 L 244 92" />
      <path data-draw="tree" d="M 320 100 L 320 55 M 308 65 L 320 55 L 332 65 M 304 78 L 320 62 L 336 78 M 300 90 L 320 70 L 340 90" />
    </svg>
  );
}
