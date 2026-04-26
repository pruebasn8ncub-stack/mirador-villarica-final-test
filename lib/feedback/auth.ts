import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'mirador_admin';
export const ADMIN_COOKIE_VALUE = 'ok';
export const ADMIN_USER = 'admin';
export const ADMIN_PASS = 'admin';

export function isAuthed(): boolean {
  return cookies().get(ADMIN_COOKIE)?.value === ADMIN_COOKIE_VALUE;
}

export function isAuthedFromCookieHeader(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader
    .split(';')
    .map((c) => c.trim())
    .some((c) => c === `${ADMIN_COOKIE}=${ADMIN_COOKIE_VALUE}`);
}
