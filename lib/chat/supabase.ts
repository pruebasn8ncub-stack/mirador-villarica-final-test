export interface SupabaseRestConfig {
  url: string;
  serviceRoleKey: string;
}

export function getSupabaseConfig(): SupabaseRestConfig | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return { url: url.replace(/\/+$/, ''), serviceRoleKey };
}

interface UpsertOptions {
  onConflict?: string;
  returnRepresentation?: boolean;
}

export async function supabaseUpsert<T>(
  table: string,
  rows: Record<string, unknown> | Record<string, unknown>[],
  options: UpsertOptions = {},
  config = getSupabaseConfig()
): Promise<T[]> {
  if (!config) throw new Error('Supabase not configured');

  const params = new URLSearchParams();
  if (options.onConflict) params.set('on_conflict', options.onConflict);
  const qs = params.toString() ? `?${params.toString()}` : '';

  const prefer = [
    'resolution=merge-duplicates',
    options.returnRepresentation === false ? 'return=minimal' : 'return=representation',
  ].join(',');

  const res = await fetch(`${config.url}/rest/v1/${table}${qs}`, {
    method: 'POST',
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    body: JSON.stringify(rows),
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Supabase ${table} upsert ${res.status}: ${body}`);
  }

  if (options.returnRepresentation === false) return [] as T[];
  return (await res.json()) as T[];
}
