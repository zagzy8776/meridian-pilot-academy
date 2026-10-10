import { COMPLIANCE_FEE_CENTS, STRIPE_MODE } from '@/lib/config';

export type PaymentIntent = {
  intentId: string;
  clientSecret: string;
  amountCents: number;
  currency: string;
  mode: string;
};

function mockId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

// Payment provider adapter. Currently a mock; swap in the live Stripe SDK by
// implementing the same interface — no wizard or admin change required.
export async function createComplianceIntent(candidateId: string, amountCents: number = COMPLIANCE_FEE_CENTS): Promise<PaymentIntent> {
  const intentId = mockId('pi_mock');
  return {
    intentId,
    clientSecret: `${intentId}_secret_mock`,
    amountCents,
    currency: 'usd',
    mode: STRIPE_MODE,
  };
}

export function mockReceiptUrl(intentId: string) {
  return `/apply/success?receipt=${encodeURIComponent(intentId)}`;
}
