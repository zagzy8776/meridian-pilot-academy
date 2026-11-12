import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { STRIPE_MODE } from '@/lib/config';
import { sendMail, notifyAdmin, paymentReceivedEmail } from '@/lib/email';
import { formatMoney } from '@/lib/money';

export async function POST(req: Request) {
  // In live mode only the Stripe webhook is allowed to say "paid". Reject the
  // mock confirmation endpoint so a scripted client cannot self-mark as paid.
  if (STRIPE_MODE === 'live') {
    return NextResponse.json({ error: 'In live mode the webhook confirms payment' }, { status: 409 });
  }
  const b = await req.json().catch(() => null);
  const intentId = String(b?.intentId ?? '');
  if (!intentId) return NextResponse.json({ error: 'intentId required' }, { status: 400 });

  await new Promise((r) => setTimeout(r, 600));

  if (!hasDb) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Applications are temporarily closed' }, { status: 503 });
    }
    const cands: any[] = (globalThis as any).__meridianCandidates ?? [];
    return NextResponse.json({ status: 'payment_received', candidateId: cands[0]?.id ?? '' });
  }

  const rows: any = await sql`update payments set status='succeeded', updated_at=datetime('now')
    where intent_id=${intentId} and status <> 'succeeded'
    returning candidate_id, amount_cents, currency`;
  const r = rows?.[0];
  if (!r) {
    const existing: any = await sql`select candidate_id, amount_cents, currency, status from payments where intent_id=${intentId}`;
    if (!existing?.[0]) return NextResponse.json({ error: 'Unknown intent' }, { status: 404 });
    return NextResponse.json({ status: 'payment_received', candidateId: existing[0].candidate_id, alreadyPaid: true });
  }

  const c: any = await sql`update candidates set status='payment_received', updated_at=datetime('now')
    where id=${r.candidate_id} and status='pending_payment' returning full_name, email`;

  const name = c?.[0]?.full_name ?? '';
  const email = c?.[0]?.email ?? '';
  if (email) {
    const m = paymentReceivedEmail(name.split(' ')[0] || 'there', formatMoney(r.amount_cents, r.currency));
    await sendMail({ to: email, subject: m.subject, html: m.html });
  }
  await notifyAdmin(
    'Payment received (mock) - awaiting approval',
    `<p>Candidate <code>${r.candidate_id}</code> cleared the fee in test mode. Approve from the dashboard.</p>`,
  );

  return NextResponse.json({ intentId, status: 'payment_received', candidateId: r.candidate_id });
}