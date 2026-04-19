import type { LeadGateData } from './types';

export class LeadGateError extends Error {
  readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'LeadGateError';
  }
}

export async function ensureSession(session_id: string): Promise<void> {
  try {
    await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      }),
    });
  } catch {
    // No bloqueamos el widget si Supabase no está configurado o hay red caída.
  }
}

export async function submitLeadGate(
  session_id: string,
  lead: LeadGateData
): Promise<{ lead_id?: string }> {
  const res = await fetch('/api/lead-gate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, ...lead }),
  });
  if (!res.ok) {
    const code =
      res.status === 400 ? 'validation' : res.status === 502 ? 'upstream' : 'unknown';
    throw new LeadGateError(`Lead gate ${res.status}`, code);
  }
  return (await res.json()) as { lead_id?: string };
}
