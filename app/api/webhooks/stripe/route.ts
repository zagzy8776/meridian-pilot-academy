import { NextResponse } from 'next/server';
import { sql, hasDb } from '@/lib/db';
import { MOCK_WEBHOOK_SECRET } from '@/lib/config';

// Provider webhook. Payment success alone never grants access — the candidate
// is set to 'payment_received' and stays there until an admin approves them.
export async function POST(req: Request) {
  const secret = req.headers.get('x-mock-webhook-secret');
  if (secret !== MOCK_WEBHOOK_SECRET && secret !== 'dev-mock-secret') {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
  }
  const b = await req.json().catch(() => null);
  const intentId = String(b?.intentId ?? '');
  if (!intentId) return NextResponse.json({ error: 'intentId required' }, { status: 400 });
  const eventId = `evt_mock_${intentId}`;
  if (hasDb) {
    try {
      const eventRowId = `whk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      await sql`insert into webhook_events (id, provider, event_id, event_type, payload)
        values (${eventRowId}, 'mock-stripe', ${eventId}, 'payment_intent.succeeded', ${JSON.stringify({ intentId })})
        on conflict (event_id) do nothing`;
      const rows: any = await sql`update payments set status='succeeded', updated_at=datetime('now') where intent_id=${intentId} returning candidate_id`;
      const cid = rows?.[0]?.candidate_id;
      // Only mark payment received. Admin approval flips to 'verified'.
      if (cid) await sql`update candidates set status='payment_received', updated_at=datetime('now') where id=${String(cid)} and status in ('pending_payment','payment_received')`;
    } catch (e) { return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 }); }
  } else {
    const store: Map<string, any> = (globalThis as any).__meridianIntents ?? new Map();
    const rec = store.get(intentId);
    if (rec) rec.status = 'succeeded';
    const cands: any[] = (globalThis as any).__meridianCandidates ?? [];
    const c = cands.find((x) => x.id === rec?.candidateId);
    if (c) c.status = 'payment_received';
  }
  return NextResponse.json({ ok: true, intentId, status: 'payment_received' });
}
