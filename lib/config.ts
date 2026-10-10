export const COMPLIANCE_FEE_CENTS = 4900;
export const COMPLIANCE_FEE_LABEL = '$49.00';
export const FEE_PAYER_MODE = process.env.FEE_PAYER_MODE ?? 'deferred';
export const STRIPE_MODE = process.env.STRIPE_MODE ?? 'mock';
export const MOCK_WEBHOOK_SECRET = process.env.MOCK_WEBHOOK_SECRET ?? 'dev-mock-secret';
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? '';

export function feeDisclosure() {
  return {
    amountCents: COMPLIANCE_FEE_CENTS,
    label: COMPLIANCE_FEE_LABEL,
    purpose: 'Third-party identity, right-to-work and background screening initiated only after payment confirmation.',
    payerMode: FEE_PAYER_MODE,
    refundNote: 'Refundable before screening begins. See our Refund Policy for full details.',
  };
}
