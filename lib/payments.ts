import Stripe from 'stripe';
import { STRIPE_MODE, appUrl, CURRENCY, feeDisclosure } from './config';
import { currentFee } from './fee';

export type PaymentIntent = {
  intentId: string;
  checkoutUrl: string | null;
  clientSecret: string | null;
  amountCents: number;
  currency: string;
  feeVersion: string;
  mode: 'mock' | 'live';
};

let stripe: Stripe | null = null;
function client(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is required when STRIPE_MODE=live');
  // No pinned apiVersion — use whatever the installed SDK ships with, so the
  // build does not break on a version string the current types do not declare.
  stripe ??= new Stripe(key);
  return stripe;
}

function mockId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createComplianceIntent(candidateId: string, email: string): Promise<PaymentIntent> {
  const fee = currentFee();

  if (STRIPE_MODE === 'live') {
    const session = await client().checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      client_reference_id: candidateId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: fee.currency,
            unit_amount: fee.amountCents,
            product_data: {
              name: 'Third Party Compliance Fee',
              description: feeDisclosure().purpose,
            },
          },
        },
      ],
      metadata: { candidateId, feeVersion: fee.version },
      payment_intent_data: { metadata: { candidateId, feeVersion: fee.version } },
      success_url: `${appUrl()}/apply/success?candidate=${candidateId}&receipt={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl()}/apply?payment=cancelled`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });
    return {
      intentId: session.id,
      checkoutUrl: session.url,
      clientSecret: null,
      amountCents: fee.amountCents,
      currency: fee.currency,
      feeVersion: fee.version,
      mode: 'live',
    };
  }

  const intentId = mockId('pi_mock');
  return {
    intentId,
    checkoutUrl: null,
    clientSecret: `${intentId}_secret_mock`,
    amountCents: fee.amountCents,
    currency: fee.currency,
    feeVersion: fee.version,
    mode: 'mock',
  };
}

export function receiptPath(candidateId: string, receipt: string) {
  return `/apply/success?candidate=${encodeURIComponent(candidateId)}&receipt=${encodeURIComponent(receipt)}`;
}

export { CURRENCY };
