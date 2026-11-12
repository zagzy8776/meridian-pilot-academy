import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql, hasDb } from '@/lib/db';
import { sendMail, notifyAdmin, paymentReceivedEmail } from '@/lib/email';
import { formatMoney } from '@/lib/money';

export const runtime = 'nodejs'; // signature check needs the raw body + node crypto

function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY!;
  // No pinned apiVersion — use whatever the installed SDK ships with.
  return new Stripe(key);
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });

  const raw = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(raw, sig, secret);
  } catch (e: any) {
    return NextResponse.json({ error: `Bad signature: ${e.message}` }, { status: 400 });
  }

  if (!hasDb) return NextResponse.json({ received: true });

  // Idempotency: Stripe retries. First writer wins, the rest no-op.
  const seen: any = await sql`insert into webhook_events (id, provider, event_id, event_type, payload, status)
    values (${`wh_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`}, 'stripe', ${event.id}, ${event.type}, ${raw.slice(0, 4000)}, 'processing')
    on conflict (event_id) do nothing returning id`;
  if (!seen?.length) return NextResponse.json({ received: true, duplicate: true });

  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
    await sql`update webhook_events set status='ignored' where event_id=${event.id}`;
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const candidateId = session.client_reference_id ?? session.metadata?.candidateId ?? '';
  const intentId = session.id;

  const pay: any = await sql`select id, amount_cents, currency from payments where intent_id = ${intentId}`;
  const row = pay?.[0];
  if (!row) {
    await sql`update webhook_events set status='orphan' where event_id=${event.id}`;
    return NextResponse.json({ received: true, orphan: true });
  }

  // Assert against what we asked for, not what arrived.
  if (Number(session.amount_total) !== Number(row.amount_cents) || String(session.currency) !== String(row.currency)) {
    await sql`update payments set status='amount_mismatch' where intent_id=${intentId}`;
    await sql`update webhook_events set status='amount_mismatch' where event_id=${event.id}`;
    await notifyAdmin(
      'Amount mismatch on payment',
      `<p>Expected ${formatMoney(row.amount_cents, row.currency)}, captured ${formatMoney(Number(session.amount_total), String(session.currency))}. Candidate <code>${candidateId}</code>.</p>`,
    );
    return NextResponse.json({ received: true, mismatch: true });
  }

  await sql`update payments set status='succeeded', updated_at=datetime('now') where intent_id=${intentId} and status <> 'succeeded'`;
  const c: any = await sql`update candidates set status='payment_received', updated_at=datetime('now')
    where id=${candidateId} and status='pending_payment' returning full_name, email`;
  await sql`update webhook_events set status='done' where event_id=${event.id}`;

  const name = c?.[0]?.full_name ?? '';
  const email = c?.[0]?.email ?? '';
  if (email) {
    const m = paymentReceivedEmail(name.split(' ')[0] || 'there', formatMoney(row.amount_cents, row.currency));
    await sendMail({ to: email, subject: m.subject, html: m.html });
  }
  await notifyAdmin(
    'Payment received - awaiting approval',
    `<p>Candidate <code>${candidateId}</code> cleared the fee. Approve from the dashboard.</p>`,
  );

  return NextResponse.json({ received: true });
}