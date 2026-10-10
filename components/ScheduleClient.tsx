'use client';
import { useEffect, useState } from 'react';
type Slot = { id: string; starts_at: string; ends_at: string; partner: string };
const COPY: Record<string, { title: string; body: string; tone: string }> = {
  pending_payment: { title: 'Complete your application', body: 'Your interview scheduling unlocks once your compliance fee is paid and our team approves your file.', tone: '#8a5b00' },
  payment_received: { title: 'Payment received — under review', body: "Thank you. Your payment has landed and your application is with our recruitment team. You'll be emailed as soon as it's approved and your interview slot is confirmed.", tone: '#8a5b00' },
  verified: { title: 'Approved — scheduling your interview', body: 'Your application has been approved. Our team is confirming your interview slot now and will email you the calendar invitation and NDA pack.', tone: '#0a6b46' },
  scheduled: { title: 'Interview confirmed', body: 'Interview confirmed. Calendar invitation and NDA pack will follow by email.', tone: '#1b4fa0' },
  unknown: { title: 'Checking your status…', body: 'One moment while we retrieve your application.', tone: '#5b6b7d' },
};
export default function ScheduleClient({ candidate }: { candidate: string; initialSlots: Slot[] }) {
  const [status, setStatus] = useState<string>('unknown');
  const [interview, setInterview] = useState<{ when: string; panel: string } | null>(null);
  useEffect(() => {
    if (!candidate) { setStatus('unknown'); return; }
    fetch(`/api/me/status?candidateId=${encodeURIComponent(candidate)}`)
      .then((r) => r.json())
      .then((d) => { setStatus(d.status ?? 'unknown'); setInterview(d.interview ?? null); })
      .catch(() => setStatus('unknown'));
  }, [candidate]);
  const c = COPY[status] ?? COPY.unknown;
  return (
    <div>
      <div className="status-hero" style={{ borderColor: c.tone }}>
        <span className="status-dot" style={{ background: c.tone }} />
        <div>
          <h2 style={{ color: c.tone }}>{c.title}</h2>
          <p className="sub">{c.body}</p>
          {interview && <p style={{ marginTop: '.6rem' }}><strong>{interview.when}</strong> · {interview.panel}</p>}
        </div>
      </div>
      {!candidate && <p className="sub" style={{ marginTop: '1rem' }}>Add ?candidate=YOUR_ID to view your application status.</p>}
    </div>
  );
}
