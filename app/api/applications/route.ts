import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { profileSchema } from '@/lib/schemas';
import { PRIVACY_VERSION } from '@/lib/config';
import { limited, ipOf } from '@/lib/ratelimit';

const memory: any[] = (globalThis as any).__meridianCandidates ?? ((globalThis as any).__meridianCandidates = []);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const ip = ipOf(req);
  if (limited(`apply:${ip}`)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  // Honeypot: stripped before validation so the schema stays untouched.
  const { website, ...rest } = body as any;
  if (typeof website === 'string' && website.trim() !== '') {
    return NextResponse.json({ candidateId: 'cand_bot', status: 'pending_payment' });
  }

  const parsed = profileSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid profile' }, { status: 400 });
  }
  const v = parsed.data;
  const email = String(v.email).trim().toLowerCase();
  const jobId = UUID_RE.test(String(v.jobId ?? '')) ? String(v.jobId) : null;

  if (!hasDb) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Applications are temporarily closed' }, { status: 503 });
    }
    const id = `cand_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    memory.push({ id, status: 'pending_payment', profile: v });
    return NextResponse.json({ candidateId: id, status: 'pending_payment' });
  }

  try {
    // Same person retrying after a refresh should land back on their file, not fork one.
    const dup: any = await sql`select id, status from candidates where lower(email) = ${email} and status = 'pending_payment' limit 1`;
    if (dup?.[0]) return NextResponse.json({ candidateId: dup[0].id, status: dup[0].status, resumed: true });

    const id = `cand_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    await sql`insert into candidates
      (id, job_id, full_name, email, phone, profile, status,
       consent_identity, consent_reference, consent_retention, consent_at, consent_version, ip_hash)
      values (${id}, ${jobId}, ${v.fullName}, ${email}, ${v.phone || null}, ${JSON.stringify(v)}, 'pending_payment',
       ${v.backgroundConsent ? 1 : 0}, ${v.referenceConsent ? 1 : 0}, ${v.retentionConsent ? 1 : 0},
       ${new Date().toISOString()}, ${PRIVACY_VERSION}, ${ip})`;
    return NextResponse.json({ candidateId: id, status: 'pending_payment' });
  } catch (e) {
    console.error('[applications] insert failed:', e);
    return NextResponse.json({ error: 'Could not save application' }, { status: 500 });
  }
}
