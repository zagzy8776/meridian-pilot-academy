// Fee is a versioned constant, NOT a live-read setting. Changing it means
// bumping FEE_VERSION so a payment row can always be traced to a price.
export const FEE_VERSION = 'gbp-39-v1';
export const COMPLIANCE_FEE_CENTS = 3900;
export const CURRENCY = 'gbp' as const;
export const FEE_EFFECTIVE_FROM = '2026-11-01';

// Who pays. 'deferred' is a lie at checkout time, so it is no longer the default.
export const FEE_PAYER_MODE = process.env.FEE_PAYER_MODE ?? 'candidate';

export const STRIPE_MODE = process.env.STRIPE_MODE ?? 'mock';
export const MOCK_WEBHOOK_SECRET = process.env.MOCK_WEBHOOK_SECRET ?? 'dev-mock-secret';
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? '';
export const PRIVACY_VERSION = '2026-10-10';

// Tolerated difference between what we asked for and what the processor captured.
export const AMOUNT_TOLERANCE_CENTS = 0;

// Resolve the public site URL used in metadata, sitemap, robots and emails.
// An env var that is present but blank must NOT win over the default, otherwise
// `new URL('')` throws ERR_INVALID_URL and crashes the build during page-data
// collection (Next.js evaluates metadataBase at build time).
export function appUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL ?? '').trim();
  return (raw || 'http://localhost:3000').replace(/\/+$/, '');
}

export function feeDisclosure() {
  return {
    amountCents: COMPLIANCE_FEE_CENTS,
    currency: CURRENCY,
    feeVersion: FEE_VERSION,
    purpose:
      'Third-party identity, right-to-work and criminal-record screening, commissioned from our screening partner only after payment clears.',
    payerMode: FEE_PAYER_MODE,
    refundNote:
      'Refundable in full until screening is commissioned. See the Refund Policy.',
  };
}
