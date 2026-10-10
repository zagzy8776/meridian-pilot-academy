import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
const bookings: any[] = (globalThis as any).__meridianBookings ?? ((globalThis as any).__meridianBookings = []);
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const candidateId = String(b?.candidateId ?? '');
  const slotId = String(b?.slotId ?? '');
  if (!candidateId || !slotId) return NextResponse.json({ error: 'Candidate and slot required' }, { status: 400 });
  if (hasDb) {
    try {
      const c: any = await sql`select status from candidates where id=${candidateId}`;
      if (c?.[0]?.status !== 'verified' && c?.[0]?.status !== 'scheduled') {
        return NextResponse.json({ error: `Scheduling locked (status: "${c?.[0]?.status ?? 'unknown'}"). Complete verification first.` }, { status: 403 });
      }
      const s: any = await sql`select taken_by from slots where id=${slotId}`;
      if (!s?.length || s[0].taken_by) return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 });
      await sql`update slots set taken_by=${candidateId} where id=${slotId}`;
      const interviewId = `int_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      await sql`insert into interviews (id, candidate_id, slot_id) values (${interviewId}, ${candidateId}, ${slotId}) on conflict (slot_id) do nothing`;
      await sql`update candidates set status='scheduled', updated_at=datetime('now') where id=${candidateId}`;
    } catch { return NextResponse.json({ error: 'Booking failed' }, { status: 500 }); }
  } else {
    const verified: Set<string> = (globalThis as any).__meridianVerified ?? new Set();
    const cands: any[] = (globalThis as any).__meridianCandidates ?? [];
    const c = cands.find((x) => x.id === candidateId);
    if (!verified.has(candidateId) && c?.status !== 'verified') {
      return NextResponse.json({ error: 'Scheduling locked. Complete verification first.' }, { status: 403 });
    }
    bookings.push({ candidateId, slotId, at: new Date().toISOString() });
  }
  return NextResponse.json({ ok: true });
}
