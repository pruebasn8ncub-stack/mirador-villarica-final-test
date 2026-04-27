export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `hace ${days} d`;
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

export function formatExact(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function shortSession(uuid: string | null | undefined): string {
  return (uuid || '').slice(0, 8);
}

export function initials(name: string | null | undefined): string {
  if (!name) return '·';
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || '·'
  );
}

export function scoreColor(score: string | null | undefined) {
  switch (score) {
    case 'CALIENTE':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        ring: 'ring-red-200',
        dot: 'bg-red-500',
      };
    case 'TIBIO':
      return {
        bg: 'bg-mostaza/10',
        text: 'text-mostaza-500',
        ring: 'ring-mostaza-200',
        dot: 'bg-mostaza-300',
      };
    case 'FRIO':
    default:
      return {
        bg: 'bg-bosque-50',
        text: 'text-bosque-700',
        ring: 'ring-bosque-200',
        dot: 'bg-bosque-300',
      };
  }
}
