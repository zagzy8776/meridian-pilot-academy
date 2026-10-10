import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

// Admin-only CRUD for team members shown on the public /team page.
// POST   { id?, name, role, bio, photoDataUrl? }  create or update
// DELETE { id }                                    remove
// Photos are stored as data URLs (base64) in the photo_url column — no external
// blob store required. Capped well under Postgres limits.

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB decoded

function validatePhoto(dataUrl: unknown): string | null | { error: string } {
  if (dataUrl == null || dataUrl === '') return null;
  const s = String(dataUrl);
  if (!s.startsWith('data:image/')) return { error: 'Photo must be an image file' };
  const base64 = s.split(',')[1] ?? '';
  const size = Math.floor((base64.length * 3) / 4);
  if (size > MAX_PHOTO_BYTES) return { error: 'Photo must be under 2MB' };
  return s;
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => null);
  const name = String(b?.name ?? '').trim();
  const role = String(b?.role ?? '').trim();
  const bio = b?.bio != null ? String(b.bio).trim() : null;
  const id = b?.id ? String(b.id) : null;

  if (!name || !role) return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });

  const photo = validatePhoto(b?.photoDataUrl);
  if (photo && typeof photo === 'object') return NextResponse.json(photo, { status: 400 });
  const photoUrl = photo as string | null;

  if (!hasDb) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });

  try {
    if (id) {
      const rows: any = await sql`update team_members
        set name=${name}, role=${role}, bio=${bio},
            photo_url=coalesce(${photoUrl}, photo_url), updated_at=datetime('now')
        where id=${id}
        returning id, name, role, bio, photo_url, sort`;
      if (!rows?.length) return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
      return NextResponse.json({ ok: true, member: rows[0] });
    }
    const newId = crypto.randomUUID();
    const rows: any = await sql`insert into team_members (id, name, role, bio, photo_url, sort)
      values (${newId}, ${name}, ${role}, ${bio}, ${photoUrl}, (select coalesce(max(sort), 0) + 1 from team_members))
      returning id, name, role, bio, photo_url, sort`;
    return NextResponse.json({ ok: true, member: rows[0] });
  } catch (e) {
    console.error('[admin:team] save failed:', e);
    return NextResponse.json({ error: 'Could not save team member' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => null);
  const id = String(b?.id ?? '');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  if (!hasDb) return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  try {
    await sql`delete from team_members where id=${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin:team] delete failed:', e);
    return NextResponse.json({ error: 'Could not delete team member' }, { status: 500 });
  }
}
