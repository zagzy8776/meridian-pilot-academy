'use client';
import { useState } from 'react';
import type { WizForm } from './wizardState';
import { SCREENER } from '@/lib/brand';
type S = (k: keyof WizForm, v: any) => void;

export function StepProfile({ f, set, jobs }: { f: WizForm; set: S; jobs: { id: string; title: string }[] }) {
  return (
    <section aria-label="Applicant profile">
      <h2>Step 1: Your details</h2>
      <div className="row2">
        <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" value={f.fullName} onChange={(e) => set('fullName', e.target.value)} autoComplete="name" /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
      </div>
      <div className="field">
        <label htmlFor="title">Current title <span className="sub">(optional)</span></label>
        <input
          id="title"
          value={f.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="e.g. First Officer, Cabin Supervisor, Student pilot"
          autoComplete="organization-title"
        />
      </div>
      <div className="row2">
        <div className="field"><label htmlFor="phone">Phone</label><input id="phone" type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></div>
        <div className="field"><label htmlFor="jobId">Programme</label>
          <select id="jobId" value={f.jobId} onChange={(e) => set('jobId', e.target.value)}>
            <option value="">Not sure yet</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
      </div>
      <div className="field"><label htmlFor="linkedin">LinkedIn <span className="sub">(optional)</span></label>
        <input id="linkedin" type="url" value={f.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/…" />
      </div>
      <div className="field"><label htmlFor="workAuth">Right to work (UK)</label>
        <select id="workAuth" value={f.workAuth} onChange={(e) => set('workAuth', e.target.value)}>
          <option value="citizen">British / Irish citizen</option>
          <option value="settled">Settled status</option>
          <option value="visa">Valid work visa</option>
          <option value="sponsorship-required">Require sponsorship</option>
        </select>
        <p className="sub" style={{ marginTop: '.4rem' }}>
          Training does not require a work visa, but airlines do, and the check runs now so your file is airline-ready.
        </p>
      </div>
      {f.workAuth === 'sponsorship-required' && (
        <div className="field"><label htmlFor="sponsorshipDetails">Sponsorship details</label><textarea id="sponsorshipDetails" rows={3} value={f.sponsorshipDetails} onChange={(e) => set('sponsorshipDetails', e.target.value)} /></div>
      )}
      <div className="field"><label htmlFor="notes">Anything we should know</label><textarea id="notes" rows={4} value={f.notes} onChange={(e) => set('notes', e.target.value)} /></div>
      {/* Honeypot — visible only to bots. Server strips it before validation. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />
    </section>
  );
}

export function StepDocs({ f, set }: { f: WizForm; set: S }) {
  const [resume, setResume] = useState<File | null>(null);
  const [cred, setCred] = useState<File | null>(null);
  (f as any).__files = { resume, credential: cred };

  return (
    <section aria-label="Documents">
      <h2>Step 2: Your documents</h2>
      <p className="sub">PDF, DOC or DOCX, up to 10MB. These are uploaded now - not just named.</p>
      <label className="drop" htmlFor="resumeFile">
        <strong>{resume ? `Attached: ${resume.name}` : 'Attach your CV / resume'}</strong>
        <input id="resumeFile" type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => {
          const file = e.target.files?.[0]; if (!file) return;
          setResume(file); set('resumeName', file.name); set('resumeSize', file.size);
        }} />
      </label>
      <label className="drop" htmlFor="credFile" style={{ marginTop: '.75rem' }}>
        <strong>{cred ? `Attached: ${cred.name}` : 'Attach a certificate or credential (optional)'}</strong>
        <input id="credFile" type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => {
          const file = e.target.files?.[0]; if (!file) return;
          setCred(file); set('credentialName', file.name);
        }} />
      </label>
    </section>
  );
}

export function StepGate({ f, set, status, intentId, feeLabel }: { f: WizForm; set: S; status: string; intentId?: string | null; feeLabel?: string }) {
  return (
    <section aria-label="Compliance fee">
      <h2>Step 3: Compliance check</h2>
      <p className="sub">
        The fee covers {SCREENER.checks}, run by <strong>{SCREENER.name}</strong>. Typically {SCREENER.turnaround}.
        We do not do this in-house - it is a real cost we pass through at cost.
      </p>
      <label className="consent"><input type="checkbox" checked={f.backgroundConsent} onChange={(e) => set('backgroundConsent', e.target.checked)} /> I consent to identity and criminal-record screening.</label>
      <label className="consent"><input type="checkbox" checked={f.referenceConsent} onChange={(e) => set('referenceConsent', e.target.checked)} /> I consent to confidential reference outreach if shortlisted.</label>
      <label className="consent"><input type="checkbox" checked={f.retentionConsent} onChange={(e) => set('retentionConsent', e.target.checked)} /> I consent to 24-month retention, as described in the Privacy Policy.</label>
      <div className="fee">
        <h3>Third Party Compliance Fee: {feeLabel ?? '—'}</h3>
        <p>Refundable in full until {SCREENER.name} is instructed. After that it covers work already done. See the <a href="/refund-policy">Refund Policy</a>.</p>
        {status && <p style={{ margin: 0 }}>State: <strong>{status}</strong>{intentId ? ` (${intentId})` : ''}</p>}
      </div>
    </section>
  );
}
