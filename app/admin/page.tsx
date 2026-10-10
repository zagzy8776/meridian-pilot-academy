import Nav from '@/app/Nav';
import { sql, hasDb } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { getFee } from '@/lib/settings';
import { getTeam } from '@/lib/team';
import AdminDashboard from '@/components/AdminDashboard';
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authed = await isAdmin();
  if (!authed) {
    return (
      <>
        <Nav />
        <main><div className="wrap-narrow">
          <h1>Recruiter sign-in</h1>
          <p className="sub">Enter the recruiter access token (ADMIN_TOKEN) to open the dashboard.</p>
          <form method="POST" action="/api/admin/login" className="card">
            <div className="field"><label htmlFor="token">Access token</label><input id="token" name="token" type="password" autoComplete="current-password" /></div>
            <button className="btn btn-dark" style={{ width: '100%' }}>Unlock Dashboard</button>
          </form>
          <p className="sub" style={{ marginTop: '1rem' }}>Access is restricted to the recruitment team. Sessions expire after 24 hours.</p>
        </div></main>
      </>
    );
  }

  let rows: any[] = [];
  let slots: any[] = [];
  if (hasDb) {
    try {
      // No LATERAL in SQLite: use a correlated subselect for the latest payment.
      rows = await sql`select c.id as id, c.full_name, c.email, c.phone, c.status, c.created_at,
        j.title as job_title,
        (select p.status from payments p where p.candidate_id = c.id order by p.created_at desc limit 1) as pay_status,
        (select p.intent_id from payments p where p.candidate_id = c.id order by p.created_at desc limit 1) as intent_id,
        s.starts_at as interview_at, s.partner as panel
        from candidates c
        left join jobs j on j.id = c.job_id
        left join interviews i on i.candidate_id = c.id
        left join slots s on s.id = i.slot_id
        order by c.created_at desc limit 200`;
    } catch {
      try {
        // Simplified query if the joins aren't supported.
        rows = await sql`select c.id as id, c.full_name, c.email, c.phone, c.status, c.created_at,
          j.title as job_title, p.status as pay_status, p.intent_id
          from candidates c
          left join jobs j on j.id = c.job_id
          left join payments p on p.candidate_id = c.id
          order by c.created_at desc limit 200`;
      } catch { rows = []; }
    }
    try {
      slots = await sql`select id, starts_at, ends_at, partner, taken_by from slots order by starts_at`;
    } catch { slots = []; }
  }

  const fee = await getFee();
  const team = await getTeam();

  return (
    <>
      <Nav />
      <main style={{ background: '#071a31', color: '#cfdcea' }}><div className="wrap">
        <div className="admin-topbar">
          <div>
            <span className="eyebrow">Recruiter Dashboard</span>
            <h1 style={{ color: '#fff' }}>Applications &amp; scheduling</h1>
            <p>Approve paid applicants, then schedule or reschedule their interviews. Nothing is verified automatically.</p>
          </div>
          <form method="POST" action="/api/admin/logout">
            <button className="btn btn-ghost btn-sm" style={{ color: '#cfdcea', borderColor: '#37506d' }}>Sign out</button>
          </form>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <AdminDashboard candidates={rows} slots={slots} feeCents={fee.amountCents} team={team} />
        </div>
      </div></main>
    </>
  );
}
