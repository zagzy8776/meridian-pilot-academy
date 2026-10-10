import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
// Legacy endpoint kept for backwards compatibility.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const name = String(b?.name ?? '').trim();
  const email = String(b?.email ?? '').trim();
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Enter your name and a valid email.' }, { status: 400 });
  }
  try {
    await sql`insert into applications (name,email,phone,program_slug,start_window,notes)
      values (${name.slice(0, 120)},${email.slice(0, 200)},${String(b?.phone ?? '').slice(0, 40) || null},${String(b?.program ?? '').slice(0, 40) || null},${String(b?.start ?? '').slice(0, 40) || null},${String(b?.notes ?? '').slice(0, 2000) || null})`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Database not connected. Add TURSO_DATABASE_URL and run db:setup.' }, { status: 500 });
  }
}
