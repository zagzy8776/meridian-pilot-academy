import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { profileSchema } from '@/lib/schemas';

const memory: any[] = (globalThis as any).__meridianCandidates ?? ((globalThis as any).__meridianCandidates = []);

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid profile' }, { status: 400 });
  const v = parsed.data;
  const id = `cand_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  // candidates.job_id is a FK to jobs(id) and holds a uuid string in libSQL. The
  // wizard submits the academy programme (e.g. "1"), which is not a uuid, so we
  // store null in the FK. The choice is already preserved in the profile JSON.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const jobId = UUID_RE.test(String(v.jobId ?? '')) ? String(v.jobId) : null;
  if (hasDb) {
    try {
      await sql`insert into candidates (id, job_id, full_name, email, phone, profile, status)
        values (${id}, ${jobId}, ${v.fullName}, ${v.email}, ${v.phone || null}, ${JSON.stringify(v)}, 'pending_payment')`;
      return NextResponse.json({ candidateId: id, status: 'pending_payment' });
    } catch (e) {
      console.error('[applications] insert failed:', e);
      return NextResponse.json({ error: 'Could not save application' }, { status: 500 });
    }
  }
  memory.push({ id, status: 'pending_payment', profile: v });
  return NextResponse.json({ candidateId: id, status: 'pending_payment' });
}
