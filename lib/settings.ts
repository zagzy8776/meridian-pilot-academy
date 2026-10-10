import { sql, hasDb } from '@/lib/db';
import { COMPLIANCE_FEE_CENTS, COMPLIANCE_FEE_LABEL } from '@/lib/config';

// Key-value settings stored in Postgres so the admin can edit the compliance
// fee at runtime. Falls back to lib/config.ts defaults when no DB / no override.
export type FeeSettings = { amountCents: number; label: string };

const KEY = 'compliance_fee_cents';
const memory = new Map<string, string>();
(globalThis as any).__meridianSettings ??= memory;
const store: Map<string, string> = (globalThis as any).__meridianSettings;

export function labelFor(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
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
  return { amountCents: cents, label: labelFor(cents) };
}

export async function setFee(cents: number): Promise<FeeSettings> {
  const clamped = Math.max(0, Math.round(cents));
  store.set(KEY, String(clamped));
  if (hasDb) {
    try {
      await sql`insert into settings (key, value) values (${KEY}, ${String(clamped)})
        on conflict (key) do update set value=excluded.value, updated_at=datetime('now')`;
    } catch (e) { console.error('[settings] fee save failed:', e); }
  }
  return { amountCents: clamped, label: labelFor(clamped) };
}

export { COMPLIANCE_FEE_LABEL };