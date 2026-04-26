export const REVIEWERS = [
  'Manuel Figueroa',
  'Andrea Leon',
  'Alonso Valero',
  'Nicole Troncoso',
  'Dassna Romero',
  'Francisco Fuentes',
  'Andres Sadler',
  'Diego',
] as const;

export type Reviewer = (typeof REVIEWERS)[number];

export function isValidReviewer(name: string): name is Reviewer {
  return (REVIEWERS as readonly string[]).includes(name);
}
