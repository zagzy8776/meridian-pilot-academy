import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get('candidateId') ?? '';
  if (!candidateId) return NextResponse.json({ status: 'unknown' });
  if (hasDb) {
    try {
      const rows: any = await sql`select status from candidates where id=${candidateId}`;
      const status = rows?.[0]?.status ?? 'unknown';
      let interview: { when: string; panel: string } | null = null;
      if (status === 'scheduled') {
        const iv: any = await sql`select s.starts_at, s.partner from interviews i join slots s on s.id = i.slot_id where i.candidate_id=${candidateId} limit 1`;
        if (iv?.length) {
          interview = {
            when: new Date(iv[0].starts_at).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }),
            panel: iv[0].partner ?? 'Senior Partner Panel',
          };
        }
      }
      return NextResponse.json({ status, interview });
    } catch { return NextResponse.json({ status: 'unknown' }); }
  }
  const cands: any[] = (globalThis as any).__meridianCandidates ?? [];
  const c = cands.find((x) => x.id === candidateId);
  return NextResponse.json({ status: c?.status ?? 'pending_payment', interview: null });
}
