import { NextResponse } from 'next/server';
import { getFee, setFee } from '@/lib/settings';
import { isAdmin } from '@/lib/auth';

// GET  /api/fee — public: current third-party compliance fee (used by the wizard).
// POST /api/fee — admin only: change the fee shown to all future applicants.
export async function GET() {
  return NextResponse.json(await getFee());
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => null);
  const cents = Number(b?.amountCents);
  if (!Number.isFinite(cents) || cents < 0 || cents > 1_000_000) {
    return NextResponse.json({ error: 'amountCents must be between 0 and 1,000,000' }, { status: 400 });
  }
  return NextResponse.json(await setFee(cents));
}