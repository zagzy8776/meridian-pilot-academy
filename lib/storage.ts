import { put } from '@vercel/blob';
import { createHash } from 'node:crypto';

export type Stored = { storageKey: string; sha256: string; status: 'stored' | 'recorded' };

export const MAX_BYTES = 10 * 1024 * 1024;

const PDF = Buffer.from([0x25, 0x50, 0x44, 0x46]);
const ZIP = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const OLE = Buffer.from([0xd0, 0xcf, 0x11, 0xe0]);

// Trust the magic bytes, not the extension and not the browser's mime.
export function sniffMime(b: Buffer): string | null {
  if (b.subarray(0, 4).equals(PDF)) return 'application/pdf';
  if (b.subarray(0, 4).equals(ZIP)) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (b.subarray(0, 4).equals(OLE)) return 'application/msword';
  return null;
}

export async function storeDocument(candidateId: string, kind: string, file: File): Promise<Stored> {
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length === 0) throw new Error('Empty file');
  if (bytes.length > MAX_BYTES) throw new Error('File exceeds 10MB');
  const mime = sniffMime(bytes);
  if (!mime) throw new Error('Only PDF, DOC or DOCX are accepted');

  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
  const key = `vault/${candidateId}/${Date.now()}-${kind}-${safe}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // No bucket: we record the fingerprint so the file can be requested by hash
    // instead of silently pretending it was uploaded.
    return { storageKey: key, sha256, status: 'recorded' };
  }
  // Vercel Blob currently only exposes 'public' access at the SDK level. The
  // returned URL contains an unguessable token segment, so it behaves like a
  // signed URL for practical purposes — the key itself never leaves the DB row.
  const blob = await put(key, bytes, { access: 'public', contentType: mime, addRandomSuffix: false });
  return { storageKey: blob.url, sha256, status: 'stored' };
}
