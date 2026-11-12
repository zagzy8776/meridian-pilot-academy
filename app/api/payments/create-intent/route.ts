import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { createComplianceIntent, receiptPath } from '@/lib/payments';
import { FEE_PAYER_MODE, feeDisclosure } from '@/lib/config';
import { currentFee } from '@/lib/fee';
import { notifyAdmin } from '@/lib/email';
import { formatMoney } from '@/lib/money';

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const candidateId = String(b?.candidateId ?? '');
  if (!candidateId) return NextResponse.json({ error: 'Candidate is required' }, { status: 400 });
  if (!hasDb && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Applications are temporarily closed' }, { status: 503 });
  }

  let email = '';
  if (hasDb) {
    const rows: any = await sql`select email, status from candidates where id = ${candidateId}`;
    if (!rows?.[0]) return NextResponse.json({ error: 'Unknown candidate' }, { status: 404 });
    email = rows[0].email ?? '';
    if (rows[0].status !== 'pending_payment') {
      return NextResponse.json({ status: rows[0].status, alreadyPaid: true });
    }
  }

  const fee = currentFee();
  const intent = await createComplianceIntent(candidateId, email);

  if (hasDb) {
    const paymentId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      await sql`insert into payments (id, candidate_id, provider, amount_cents, currency, intent_id, status, payer_mode, fee_version, receipt_url)
        values (${paymentId}, ${candidateId}, ${intent.mode === 'live' ? 'stripe' : 'mock-stripe'},
          ${intent.amountCents}, ${intent.currency}, ${intent.intentId}, 'requires_payment',
          ${FEE_PAYER_MODE}, ${intent.feeVersion}, ${receiptPath(candidateId, intent.intentId)})
        on conflict (intent_id) do nothing`;
    } catch (e) { console.error('[create-intent] payment insert failed:', e); }
  }

  await notifyAdmin(
    'Payment initiated',
    `<p>Candidate <code>${candidateId}</code> started the compliance fee (${formatMoney(fee.amountCents, fee.currency)}).</p>`,
  );

  return NextResponse.json({ ...intent, label: fee.label, disclosure: feeDisclosure() });
}
