import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { sendMail, notifyAdmin, interviewConfirmedEmail } from '@/lib/email';

// POST { candidateId, slotId } — admin books (or reschedules) a candidate into
// an interview slot. Only 'verified' candidates can be scheduled. On success the
// applicant receives the professional confirmation email (calendar invite + NDA).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => null);
  const candidateId = String(b?.candidateId ?? '');
  const slotId = String(b?.slotId ?? '');
  if (!candidateId || !slotId) return NextResponse.json({ error: 'candidateId and slotId required' }, { status: 400 });

  if (hasDb) {
    try {
      const c: any = await sql`select status, full_name, email from candidates where id=${candidateId}`;
      if (!c?.length) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
      if (c[0].status !== 'verified' && c[0].status !== 'scheduled') {
        return NextResponse.json({ error: `Approve the candidate first (current status: "${c[0].status}").` }, { status: 409 });
      }
      const s: any = await sql`select id, starts_at, ends_at, partner, taken_by from slots where id=${slotId}`;
      if (!s?.length) return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
      if (s[0].taken_by && String(s[0].taken_by) !== candidateId) {
        return NextResponse.json({ error: 'Slot already taken — pick another or reschedule the other candidate first.' }, { status: 409 });
      }

      // Reschedule: free this candidate's previous slot, if any.
      const prev: any = await sql`select slot_id from interviews where candidate_id=${candidateId}`;
      const prevSlot = prev?.[0]?.slot_id ? String(prev[0].slot_id) : null;
      if (prevSlot && prevSlot !== slotId) {
        await sql`update slots set taken_by=null where id=${prevSlot}`;
        await sql`delete from interviews where candidate_id=${candidateId}`;
      }

      await sql`update slots set taken_by=${candidateId} where id=${slotId}`;
      const interviewId = `int_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      await sql`insert into interviews (id, candidate_id, slot_id) values (${interviewId}, ${candidateId}, ${slotId})
        on conflict (slot_id) do update set candidate_id=excluded.candidate_id, slot_id=excluded.slot_id`;
      await sql`update candidates set status='scheduled', updated_at=datetime('now') where id=${candidateId}`;

      const name = c[0].full_name ?? '';
      const email = c[0].email ?? '';
      const whenLabel = new Date(s[0].starts_at).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
      const panel = s[0].partner ?? 'Senior Partner Panel';
      if (email) {
        const m = interviewConfirmedEmail(name.split(' ')[0] || 'there', whenLabel, panel);
        sendMail({ to: email, subject: m.subject, html: m.html });
      }
      await notifyAdmin('Interview scheduled', `<p><strong>${name || candidateId}</strong> scheduled for ${whenLabel} (${panel}).</p>`);

      return NextResponse.json({ ok: true, status: 'scheduled', when: whenLabel, panel });
    } catch (e) {
      console.error('[admin:schedule] failed:', e);
      return NextResponse.json({ error: 'Scheduling failed' }, { status: 500 });
    }
  }

  // In-memory fallback (no DB).
  const cands: any[] = (globalThis as any).__meridianCandidates ?? [];
  const c = cands.find((x) => x.id === candidateId);
  if (!c) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
  if (c.status !== 'verified' && c.status !== 'scheduled') {
    return NextResponse.json({ error: `Approve the candidate first (current status: "${c.status}").` }, { status: 409 });
  }
  c.status = 'scheduled';
  const name = c.profile?.fullName ?? '';
  const email = c.profile?.email ?? '';
  if (email) {
    const m = interviewConfirmedEmail(name.split(' ')[0] || 'there', 'to be confirmed', 'Senior Partner Panel');
    sendMail({ to: email, subject: m.subject, html: m.html });
  }
  return NextResponse.json({ ok: true, status: 'scheduled' });
}