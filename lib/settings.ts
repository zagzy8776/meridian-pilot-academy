import { sql, hasDb } from '@/lib/db';
import { COMPLIANCE_FEE_CENTS, CURRENCY } from '@/lib/config';
import { formatMoney } from '@/lib/money';
import { recordFeeVersion } from '@/lib/fee';

// Key-value settings stored so the admin can edit the compliance fee at runtime
// for audit. Checkout still uses the frozen constant in lib/config.ts — this
// only affects the audit trail and the number the admin sees on the dashboard.
export type FeeSettings = { amountCents: number; label: string; currency: string };

const KEY = 'compliance_fee_cents';
const memory = new Map<string, string>();
(globalThis as any).__meridianSettings ??= memory;
const store: Map<string, string> = (globalThis as any).__meridianSettings;

// Retained for callers that still expect a label helper.
export function labelFor(cents: number, currency: string = CURRENCY): string {
  return formatMoney(cents, currency);
}

export async function getFee(): Promise<FeeSettings> {
  let cents: number | null = null;
  if (hasDb) {
    try {
      const rows: any = await sql`select value from settings where key=${KEY}`;
      if (rows?.[0]?.value != null) cents = Number(rows[0].value);
    } catch { /* fall through */ }
  }
  if (cents == null || Number.isNaN(cents)) cents = Number(store.get(KEY) ?? COMPLIANCE_FEE_CENTS);
  return { amountCents: cents, label: formatMoney(cents, CURRENCY), currency: CURRENCY };
}

export async function setFee(cents: number, actor = 'admin'): Promise<FeeSettings> {
  const clamped = Math.max(0, Math.round(cents));
  store.set(KEY, String(clamped));
  if (hasDb) {
    try {
      await sql`insert into settings (key, value) values (${KEY}, ${String(clamped)})
        on conflict (key) do update set value=excluded.value, updated_at=datetime('now')`;
      // Audit row for every admin save. Checkout keeps using the constant, so
      // the number a live session pays is never changed mid-funnel.
      await recordFeeVersion(clamped, actor);
    } catch (e) { console.error('[settings] fee save failed:', e); }
  }
  return { amountCents: clamped, label: formatMoney(clamped, CURRENCY), currency: CURRENCY };
}