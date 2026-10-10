import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { labelFor } from '@/lib/settings';
import { sendMail, notifyAdmin, paymentReceivedEmail } from '@/lib/email';

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const intentId = String(b?.intentId ?? '');
  if (!intentId) return NextResponse.json({ error: 'intentId required' }, { status: 400 });
  await new Promise((r) => setTimeout(r, 1200)); // processor latency

  const store: Map<string, any> = (globalThis as any).__meridianIntents ?? new Map();
  const rec = store.get(intentId);
  if (rec) rec.status = 'succeeded';

  let candidateId = rec?.candidateId ?? '';
  let name = '';
  let email = '';
  let amountCents = 0;

  if (hasDb) {
    try {
      const rows: any = await sql`update payments set status='succeeded', updated_at=datetime('now') where intent_id=${intentId} returning candidate_id, amount_cents`;
      const cid = rows?.[0]?.candidate_id;
      amountCents = Number(rows?.[0]?.amount_cents ?? 0);
      if (cid) {
        candidateId = String(cid);
        // Mark payment received — approval is a deliberate admin action, so we
        // do NOT flip the candidate straight to 'verified' here.
        const c: any = await sql`update candidates set status='payment_received', updated_at=datetime('now') where id=${candidateId} returning full_name, email`;
        name = c?.[0]?.full_name ?? '';
        email = c?.[0]?.email ?? '';
      }
    } catch (e) {
      console.error('[payments:confirm] db update failed:', e);
    }
  } else {
    const cands: any[] = (globalThis as any).__meridianCandidates ?? [];
    const c = cands.find((x) => x.id === candidateId);
    if (c) { c.status = 'payment_received'; name = c.profile?.fullName ?? ''; email = c.profile?.email ?? ''; }
    amountCents = Number(rec?.amountCents ?? 4900);
  }

  // Tell the applicant their payment landed and is awaiting review, and alert the recruiter.
  if (email) {
    const m = paymentReceivedEmail(name.split(' ')[0] || 'there', labelFor(amountCents));
    sendMail({ to: email, subject: m.subject, html: m.html });
  }
  await notifyAdmin(
    'Payment received — awaiting your approval',
    `<p><strong>${name || 'A candidate'}</strong> has paid the compliance fee (${labelFor(amountCents)}).</p>
     <p>Their application is now <strong>awaiting approval</strong>. Approve from the dashboard to unlock scheduling.</p>
     <p>Candidate ID: <code>${candidateId}</code></p>`,
  );

  return NextResponse.json({ intentId, status: 'payment_received', candidateId });
}
