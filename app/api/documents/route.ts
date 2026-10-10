import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { createHash } from 'node:crypto';

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const candidateId = String(b?.candidateId ?? '');
  const resumeName = String(b?.resumeName ?? '');
  const resumeSize = Number(b?.resumeSize ?? 0);
  if (!candidateId || !resumeName) return NextResponse.json({ error: 'Candidate and resume are required' }, { status: 400 });
  if (resumeSize > 10 * 1024 * 1024) return NextResponse.json({ error: 'Resume must be under 10MB' }, { status: 400 });
  const key = `vault/${candidateId}/${Date.now()}-${resumeName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const sha = createHash('sha256').update(`${candidateId}:${resumeName}`).digest('hex');
  const docId = `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  if (hasDb) {
    try {
      await sql`insert into documents (id, candidate_id, kind, filename, mime, size_bytes, storage_key, sha256)
        values (${docId}, ${candidateId}, 'resume', ${resumeName.slice(0, 200)}, 'application/pdf', ${resumeSize || 0}, ${key}, ${sha})`;
      if (b?.credentialName) {
        const credId = `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        await sql`insert into documents (id, candidate_id, kind, filename, mime, size_bytes, storage_key)
          values (${credId}, ${candidateId}, 'credential', ${String(b.credentialName).slice(0, 200)}, 'application/pdf', 0, ${key + '-cred'})`;
      }
    } catch { return NextResponse.json({ error: 'Could not record documents' }, { status: 500 }); }
  }
  return NextResponse.json({ ok: true, storageKey: key, sha256: sha });
}
