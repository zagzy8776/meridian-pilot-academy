import Nav from '@/app/Nav';
import ScheduleClient from '@/components/ScheduleClient';
import { sql, hasDb } from '@/lib/db';
export const dynamic = 'force-dynamic';
export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ candidate?: string }> }) {
  const sp = await searchParams;
  let slots: any[] = [];
  if (hasDb) {
    try {
      slots = await sql`select id, starts_at, ends_at, partner from slots where taken_by is null order by starts_at limit 12`;
    } catch { slots = []; }
  }
  return (
    <>
      <Nav />
      <main className="alt"><div className="wrap">
        <span className="eyebrow">Interview Status</span>
        <h1>Your application &amp; interview</h1>
        <p className="sub">Track your compliance approval and interview. {sp?.candidate ? 'Your interview is confirmed by our recruitment team.' : 'Add ?candidate=YOUR_ID to view your status.'}</p>
        <div style={{ marginTop: '2rem' }}>
          <ScheduleClient candidate={sp?.candidate ?? ''} initialSlots={slots} />
        </div>
      </div></main>
    </>
  );
}
