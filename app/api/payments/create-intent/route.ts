import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { createComplianceIntent, mockReceiptUrl } from '@/lib/payments';
import { FEE_PAYER_MODE, feeDisclosure } from '@/lib/config';
import { getFee } from '@/lib/settings';
import { notifyAdmin } from '@/lib/email';

const intents = new Map<string, { candidateId: string; status: string }>();
(globalThis as any).__meridianIntents ??= intents;
const store: Map<string, { candidateId: string; status: string }> = (globalThis as any).__meridianIntents;

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const candidateId = String(b?.candidateId ?? '');
  if (!candidateId) return NextResponse.json({ error: 'Candidate is required' }, { status: 400 });
  // The fee is admin-editable, so read the live value rather than the build-time constant.
  const fee = await getFee();
  const intent = await createComplianceIntent(candidateId, fee.amountCents);
  store.set(intent.intentId, { candidateId, status: 'requires_payment' });
  if (hasDb) {
    try {
      const paymentId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      await sql`insert into payments (id, candidate_id, provider, amount_cents, currency, intent_id, status, payer_mode, receipt_url)
        values (${paymentId}, ${candidateId}, 'mock-stripe', ${fee.amountCents}, 'usd', ${intent.intentId}, 'requires_payment', ${FEE_PAYER_MODE}, ${mockReceiptUrl(intent.intentId)})
        on conflict (intent_id) do nothing`;
    } catch { /* demo continues in memory */ }
  }
  await notifyAdmin(
    'New payment initiated',
    `<p>A candidate started a compliance fee payment of <strong>${fee.label}</strong>.</p><p>Candidate ID: <code>${candidateId}</code></p>`,
  );
  return NextResponse.json({ ...intent, label: fee.label, disclosure: { ...feeDisclosure(), amountCents: fee.amountCents, label: fee.label } });
}
