import { cookies } from 'next/headers';
import { timingSafeEqual } from 'node:crypto';
import { ADMIN_TOKEN } from '@/lib/config';

const COOKIE = 'meridian_admin';

// Constant-time comparison so the token can't be recovered by timing attacks.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// Fail closed: without an ADMIN_TOKEN configured nobody is an admin. This
// replaces the earlier "dev convenience" that left the dashboard wide open.
export async function isAdmin(): Promise<boolean> {
  if (!ADMIN_TOKEN) return false;
  const store = await cookies();
  const value = store.get(COOKIE)?.value ?? '';
  return value.length > 0 && safeEqual(value, ADMIN_TOKEN);
}

export function verifyToken(token: string): boolean {
  if (!ADMIN_TOKEN) return false;
  return safeEqual(token, ADMIN_TOKEN);
}

export function adminCookieHeader(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=${ADMIN_TOKEN}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${secure}`;
}

export function clearCookieHeader(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

