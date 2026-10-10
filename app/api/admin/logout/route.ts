import { NextResponse } from 'next/server';
import { clearCookieHeader } from '@/lib/auth';

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/', req.url));
  res.headers.set('Set-Cookie', clearCookieHeader());
  return res;
}
