import { NextResponse } from 'next/server';
import { currentFee, recordFeeVersion } from '@/lib/fee';
import { STRIPE_MODE, feeDisclosure } from '@/lib/config';
import { isAdmin } from '@/lib/auth';

// GET /api/fee — public: current third-party compliance fee (used by the wizard).
// The value is a frozen constant so an admin edit mid-session cannot move the
// price of an open funnel. POST writes an immutable audit row only.
export async function GET() {
  const fee = currentFee();
  return NextResponse.json({ ...fee, mode: STRIPE_MODE, disclosure: feeDisclosure() });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => null);
  const cents = Number(b?.amountCents);
  if (!Number.isFinite(cents) || cents < 0 || cents > 1_000_000) {
    return NextResponse.json({ error: 'amountCents must be between 0 and 1,000,000' }, { status: 400 });
  }
  // Audit only. Checkout keeps using the frozen constant.
  await recordFeeVersion(cents, 'admin');
  return NextResponse.json(currentFee());
}