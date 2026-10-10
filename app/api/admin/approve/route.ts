import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { sendMail, notifyAdmin, approvalEmail } from '@/lib/email';

// POST { candidateId } — approve a paid candidate. Flips status
// 'payment_received' -> 'verified', unlocking interview scheduling, and emails
// the applicant. This is the deliberate human gate; payment alone never verifies.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => null);
  const candidateId = String(b?.candidateId ?? '');
  if (!candidateId) return NextResponse.json({ error: 'candidateId required' }, { status: 400 });

  let name = '';
  let email = '';

  if (hasDb) {
    try {
      const before: any = await sql`select status, full_name, email from candidates where id=${candidateId}`;
      if (!before?.length) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
      if (before[0].status === 'verified' || before[0].status === 'scheduled') {
        return NextResponse.json({ ok: true, status: before[0].status, already: true });
      }
      name = before[0].full_name ?? '';
      email = before[0].email ?? '';
      await sql`update candidates set status='verified', updated_at=datetime('now') where id=${candidateId}`;
    } catch (e) {
      console.error('[admin:approve] failed:', e);
      return NextResponse.json({ error: 'Approve failed' }, { status: 500 });
    }
  } else {
    const cands: any[] = (globalThis as any).__meridianCandidates ?? [];
    const c = cands.find((x) => x.id === candidateId);
    if (!c) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    c.status = 'verified';
    name = c.profile?.fullName ?? '';
    email = c.profile?.email ?? '';
    (globalThis as any).__meridianVerified ??= new Set<string>();
    (globalThis as any).__meridianVerified.add(candidateId);
  }

  if (email) {
    const m = approvalEmail(name.split(' ')[0] || 'there');
    sendMail({ to: email, subject: m.subject, html: m.html });
  }
  await notifyAdmin('Candidate approved', `<p>You approved <strong>${name || candidateId}</strong>. Scheduling is now unlocked.</p>`);

  return NextResponse.json({ ok: true, status: 'verified' });
}