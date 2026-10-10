'use client';
import { useState } from 'react';

type Cand = {
  id: string; full_name: string; email: string; phone: string | null;
  status: string; created_at: string; job_title: string | null;
  pay_status: string | null; intent_id: string | null;
  interview_at?: string | null; panel?: string | null;
};
type Slot = { id: string; starts_at: string; ends_at: string; partner: string; taken_by: string | null };
type TeamMember = { id: string; name: string; role: string; bio: string | null; photo_url: string | null; sort: number };
type Props = { candidates: Cand[]; slots: Slot[]; feeCents: number; team: TeamMember[] };

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const STATUS_META: Record<string, { label: string; bg: string; fg: string }> = {
  pending_payment: { label: 'Awaiting payment', bg: '#eef3f8', fg: '#5b6b7d' },
  payment_received: { label: 'Paid · awaiting approval', bg: '#fff4e0', fg: '#8a5b00' },
  verified: { label: 'Approved · ready to schedule', bg: '#e3f5ec', fg: '#0a6b46' },
  scheduled: { label: 'Interview scheduled', bg: '#e4eeff', fg: '#1b4fa0' },
  rejected: { label: 'Rejected', bg: '#fdecec', fg: '#9b1c1c' },
};

function StatusPill({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, bg: '#eef3f8', fg: '#5b6b7d' };
  return <span className="pill" style={{ background: m.bg, color: m.fg }}>{m.label}</span>;
}

export default function AdminDashboard({ candidates, slots, feeCents, team }: Props) {
  const [rows, setRows] = useState<Cand[]>(candidates);
  const [fee, setFee] = useState((feeCents / 100).toFixed(2));
  const [feeMsg, setFeeMsg] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [openSchedule, setOpenSchedule] = useState<string | null>(null);

  const freeSlots = slots.filter((s) => !s.taken_by);
  const stats = {
    paidAwaiting: rows.filter((r) => r.status === 'payment_received').length,
    approved: rows.filter((r) => r.status === 'verified').length,
    scheduled: rows.filter((r) => r.status === 'scheduled').length,
    total: rows.length,
  };

  async function post(url: string, body: any) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? 'Request failed');
    return data;
  }

  function patch(id: string, status: string) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  async function approve(c: Cand) {
    setBusy(c.id); setMsg('');
    try {
      await post('/api/admin/approve', { candidateId: c.id });
      patch(c.id, 'verified');
      setMsg(`Approved ${c.full_name}. Scheduling is now unlocked and they've been emailed.`);
    } catch (e: any) { setMsg(e.message); }
    setBusy('');
  }

  async function schedule(c: Cand, slotId: string) {
    setBusy(c.id + slotId); setMsg('');
    try {
      const d = await post('/api/admin/schedule', { candidateId: c.id, slotId });
      const slot = slots.find((s) => s.id === slotId);
      setRows((r) => r.map((x) => (x.id === c.id ? { ...x, status: 'scheduled', interview_at: slot?.starts_at ?? null, panel: slot?.partner ?? null } : x)));
      setMsg(`Interview confirmed for ${c.full_name}${d.when ? ` on ${d.when}` : ''}. Calendar invitation and NDA pack have been emailed.`);
      setOpenSchedule(null);
    } catch (e: any) { setMsg(e.message); }
    setBusy('');
  }

  async function saveFee() {
    setFeeMsg('');
    const cents = Math.round(parseFloat(fee) * 100);
    if (!Number.isFinite(cents) || cents < 0) { setFeeMsg('Enter a valid amount.'); return; }
    try {
      const res = await fetch('/api/fee', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amountCents: cents }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? 'Could not save');
      setFeeMsg(`Saved — new applicants will now be charged $${(d.amountCents / 100).toFixed(2)}.`);
    } catch (e: any) { setFeeMsg(e.message); }
  }
  return (
    <div>
      <div className="admin-stats">
        {[
          { k: 'Paid · awaiting approval', v: stats.paidAwaiting, tone: '#e8c96a' },
          { k: 'Approved', v: stats.approved, tone: '#5fd39b' },
          { k: 'Interviews scheduled', v: stats.scheduled, tone: '#7fb2ff' },
          { k: 'Total candidates', v: stats.total, tone: '#cfdcea' },
        ].map((s) => (
          <div key={s.k} className="stat-card">
            <span className="stat-num" style={{ color: s.tone }}>{s.v}</span>
            <span className="stat-label">{s.k}</span>
          </div>
        ))}
      </div>

      {msg && <p role="status" className="okmsg">{msg}</p>}

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Third-party compliance fee</h2>
            <p className="sub">Changes apply to all new applicants immediately. Existing payments are unaffected.</p>
          </div>
        </div>
        <div className="fee-editor">
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="fee">Fee amount (USD)</label>
            <div className="fee-row">
              <input id="fee" type="number" min="0" step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} />
              <button type="button" className="btn btn-dark" onClick={saveFee}>Save fee</button>
            </div>
          </div>
          {feeMsg && <p className="sub" style={{ marginTop: '.6rem' }}>{feeMsg}</p>}
        </div>
      </section>

      <TeamManager initial={team} />

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>Candidates</h2>
            <p className="sub">Approve paid applicants to unlock scheduling, then book or reschedule their interview.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Candidate</th><th>Programme</th><th>Payment</th><th>Status</th><th>Interview</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.full_name}</strong><br /><span className="sub">{r.email}{r.phone ? `, ${r.phone}` : ''}</span></td>
                  <td>{r.job_title ?? 'General'}</td>
                  <td>{r.pay_status ? <span className="paychip">{r.pay_status}</span> : <span className="sub">—</span>}<br />{r.intent_id && <code style={{ fontSize: '.7rem' }}>{r.intent_id}</code>}</td>
                  <td><StatusPill status={r.status} /></td>
                  <td>{r.status === 'scheduled' && r.interview_at ? <>{fmt(r.interview_at)}<br /><span className="sub">{r.panel ?? ''}</span></> : <span className="sub">Not booked</span>}</td>
                  <td className="actions-cell">
                    {r.status === 'payment_received' && (
                      <button className="btn btn-dark btn-sm" disabled={busy === r.id} onClick={() => approve(r)}>{busy === r.id ? 'Approving…' : 'Approve'}</button>
                    )}
                    {(r.status === 'verified' || r.status === 'scheduled') && (
                      <button className="btn btn-ghost btn-sm" style={{ color: '#0a2342', borderColor: '#b9c7d6' }} onClick={() => setOpenSchedule(openSchedule === r.id ? null : r.id)}>
                        {r.status === 'scheduled' ? 'Reschedule' : 'Schedule'}
                      </button>
                    )}
                    {r.status === 'pending_payment' && <span className="sub">Awaiting payment</span>}
                    {openSchedule === r.id && (
                      <div className="slot-picker">
                        {freeSlots.length === 0 && <p className="sub" style={{ margin: 0 }}>No free slots available right now.</p>}
                        {freeSlots.map((s) => (
                          <button key={s.id} type="button" className="slot-option" disabled={busy === r.id + s.id} onClick={() => schedule(r, s.id)}>
                            <strong>{fmt(s.starts_at)}</strong>
                            <span>{s.partner}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr><td colSpan={6} className="center sub" style={{ padding: '2.5rem' }}>No candidates yet. Connect TURSO_DATABASE_URL, run <code>npm run db:setup</code>, then receive an application.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// Admin editor for the public /team page. Lets the team add members, edit
// details and upload a headshot (stored as a data URL — no blob store needed).
function TeamManager({ initial }: { initial: TeamMember[] }) {
  const [people, setPeople] = useState<TeamMember[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', role: '', bio: '', photo: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  function reset() {
    setEditing(null);
    setForm({ name: '', role: '', bio: '', photo: '' });
  }

  function startEdit(m: TeamMember) {
    setEditing(m.id);
    setForm({ name: m.name, role: m.role, bio: m.bio ?? '', photo: m.photo_url ?? '' });
    setMsg('');
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setMsg('Photo must be under 2MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  async function save() {
    if (!form.name.trim() || !form.role.trim()) { setMsg('Name and role are required.'); return; }
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing, name: form.name, role: form.role, bio: form.bio, photoDataUrl: form.photo }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? 'Could not save');
      const member: TeamMember = d.member;
      setPeople((list) => (editing ? list.map((x) => (x.id === editing ? member : x)) : [...list, member]));
      setMsg(editing ? 'Team member updated.' : 'Team member added.');
      reset();
    } catch (e: any) { setMsg(e.message); }
    setBusy(false);
  }

  async function remove(id: string) {
    if (!confirm('Remove this team member from the public page?')) return;
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/admin/team', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? 'Could not delete');
      setPeople((list) => list.filter((x) => x.id !== id));
      setMsg('Team member removed.');
    } catch (e: any) { setMsg(e.message); }
    setBusy(false);
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div>
          <h2>Team &amp; instructors</h2>
          <p className="sub">Shown on the public <a href="/team">/team</a> page. Upload a headshot and short bio.</p>
        </div>
      </div>

      <div className="team-admin-grid">
        {people.map((m) => (
          <div key={m.id} className="team-admin-card">
            {m.photo_url
              ? <img className="team-admin-photo" src={m.photo_url} alt={m.name} />
              : <div className="team-admin-photo team-photo-fallback" aria-hidden="true">{m.name.charAt(0)}</div>}
            <div className="team-admin-meta">
              <strong>{m.name}</strong>
              <span className="sub">{m.role}</span>
            </div>
            <div className="team-admin-actions">
              <button type="button" className="btn btn-ghost btn-sm" style={{ color: '#0a2342', borderColor: '#b9c7d6' }} onClick={() => startEdit(m)}>Edit</button>
              <button type="button" className="btn btn-ghost btn-sm" style={{ color: '#9b1c1c', borderColor: '#e6b4b4' }} disabled={busy} onClick={() => remove(m.id)}>Remove</button>
            </div>
          </div>
        ))}
        {!people.length && <p className="sub">No team members yet. Add the first below.</p>}
      </div>

      <div className="team-admin-form">
        <h3>{editing ? 'Edit team member' : 'Add team member'}</h3>
        <div className="row2">
          <div className="field"><label htmlFor="tm-name">Full name</label><input id="tm-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="tm-role">Role</label><input id="tm-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
        </div>
        <div className="field"><label htmlFor="tm-bio">Short bio</label><textarea id="tm-bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
        <div className="field"><label htmlFor="tm-photo">Headshot (JPG or PNG, max 2MB)</label><input id="tm-photo" type="file" accept="image/png,image/jpeg,image/webp" onChange={onPhoto} /></div>
        {form.photo && <img className="team-admin-preview" src={form.photo} alt="Preview" />}
        <div className="cta">
          <button type="button" className="btn btn-dark" disabled={busy} onClick={save}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add member'}</button>
          {editing && <button type="button" className="btn btn-ghost" style={{ color: '#cfdcea', borderColor: '#37506d' }} onClick={reset}>Cancel</button>}
        </div>
        {msg && <p className="sub">{msg}</p>}
      </div>
    </section>
  );
}
