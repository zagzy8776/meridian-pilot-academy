import { COMPLIANCE_FEE_CENTS, CURRENCY, FEE_VERSION, FEE_EFFECTIVE_FROM } from './config';
import { formatMoney } from './money';
import { sql, hasDb } from './db';

export type Fee = { amountCents: number; currency: string; label: string; version: string };

export function currentFee(): Fee {
  return {
    amountCents: COMPLIANCE_FEE_CENTS,
    currency: CURRENCY,
    label: formatMoney(COMPLIANCE_FEE_CENTS, CURRENCY),
    version: FEE_VERSION,
  };
}

// Called by the admin save handler. Writes an immutable audit row; checkout keeps
// using the constant, so a mid-session admin edit cannot change an open price.
export async function recordFeeVersion(amountCents: number, actor: string) {
  if (!hasDb) return;
  await sql`insert into fee_versions (id, amount_cents, currency, version, actor, effective_from)
    values (${`fee_${Date.now().toString(36)}`}, ${amountCents}, ${CURRENCY}, ${FEE_VERSION}, ${actor}, ${FEE_EFFECTIVE_FROM})
    on conflict (version) do nothing`;
}