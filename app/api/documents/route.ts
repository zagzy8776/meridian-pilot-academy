import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { storeDocument } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 });

  const candidateId = String(form.get('candidateId') ?? '');
  const resume = form.get('resume');
  const credential = form.get('credential');

  if (!candidateId) return NextResponse.json({ error: 'Candidate is required' }, { status: 400 });
  if (!(resume instanceof File)) return NextResponse.json({ error: 'A CV file is required' }, { status: 400 });

  const docs: { id: string; kind: string; filename: string; mime: string; bytes: number; key: string; sha: string; status: string }[] = [];

  try {
    for (const [kind, f] of [['resume', resume], ['credential', credential]] as const) {
      if (!(f instanceof File) || f.size === 0) continue;
      const stored = await storeDocument(candidateId, kind, f);
      docs.push({
        id: `doc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        kind,
        filename: f.name.slice(0, 200),
        mime: '', bytes: f.size, key: stored.storageKey, sha: stored.sha256, status: stored.status,
      });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Upload failed' }, { status: 400 });
  }

  if (hasDb) {
    try {
      for (const d of docs) {
        await sql`insert into documents (id, candidate_id, kind, filename, mime, size_bytes, storage_key, sha256, storage_status)
          values (${d.id}, ${candidateId}, ${d.kind}, ${d.filename}, ${d.mime || 'application/octet-stream'},
            ${d.bytes}, ${d.key}, ${d.sha}, ${d.status})`;
      }
    } catch (e) {
      console.error('[documents] insert failed:', e);
      return NextResponse.json({ error: 'Could not record documents' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, documents: docs.map(({ key, sha, ...rest }) => ({ ...rest, storageKey: key, sha256: sha })) });
}