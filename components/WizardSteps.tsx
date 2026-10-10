'use client';
import type { WizForm } from './wizardState';
type S = (k: keyof WizForm, v: any) => void;
export function StepProfile({ f, set, jobs }: { f: WizForm; set: S; jobs: { id: string; title: string }[] }) {
  return (
    <section aria-label="Professional profile">
      <h2>Step 1: Professional profile</h2>
      <div className="row2">
        <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" value={f.fullName} onChange={(e) => set('fullName', e.target.value)} autoComplete="name" /></div>
        <div className="field"><label htmlFor="email">Work email</label><input id="email" type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></div>
      </div>
      <div className="row2">
        <div className="field"><label htmlFor="phone">Phone</label><input id="phone" type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></div>
        <div className="field"><label htmlFor="linkedin">LinkedIn URL</label><input id="linkedin" placeholder="https://" value={f.linkedin} onChange={(e) => set('linkedin', e.target.value)} /></div>
      </div>
      <div className="row2">
        <div className="field"><label htmlFor="title">Current title</label><input id="title" value={f.title} onChange={(e) => set('title', e.target.value)} /></div>
        <div className="field"><label htmlFor="years">Years at executive level</label><input id="years" type="number" min={0} max={60} value={f.years} onChange={(e) => set('years', Number(e.target.value))} /></div>
      </div>
      <div className="field"><label htmlFor="jobId">Target mandate</label>
        <select id="jobId" value={f.jobId} onChange={(e) => set('jobId', e.target.value)}>
          <option value="">General consideration</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>
      <div className="row2">
        <div className="field"><label htmlFor="workAuth">Right to work (UK)</label>
          <select id="workAuth" value={f.workAuth} onChange={(e) => set('workAuth', e.target.value)}>
            <option value="citizen">British / Irish citizen</option>
            <option value="settled">Settled status</option>
            <option value="visa">Valid work visa</option>
            <option value="sponsorship-required">Require sponsorship</option>
          </select>
        </div>
        <div className="field"><label htmlFor="salary">Compensation expectation</label><input id="salary" placeholder="e.g. £220k + bonus" value={f.salary} onChange={(e) => set('salary', e.target.value)} /></div>
      </div>
      {f.workAuth === 'sponsorship-required' && (
        <div className="field"><label htmlFor="sponsorshipDetails">Sponsorship details (conditional)</label><textarea id="sponsorshipDetails" rows={3} value={f.sponsorshipDetails} onChange={(e) => set('sponsorshipDetails', e.target.value)} /></div>
      )}
      {f.years < 3 && (
        <label className="consent"><input type="checkbox" checked={f.mentorship} onChange={(e) => set('mentorship', e.target.checked)} /> Fast-track mentorship opt-in for under 3 years at executive level.</label>
      )}
      <div className="field"><label htmlFor="notes">Mandate fit / notes</label><textarea id="notes" rows={4} value={f.notes} onChange={(e) => set('notes', e.target.value)} /></div>
    </section>
  );
}
export function StepDocs({ f, set }: { f: WizForm; set: S }) {
  return (
    <section aria-label="Document vault">
      <h2>Step 2: Document vault</h2>
      <p className="sub">Refer your CV or resume and any credentials. PDF or DOC up to 10MB. Our team reviews these securely before your interview.</p>
      <label className="drop" htmlFor="resumeFile"><strong>{f.resumeName ? `Selected: ${f.resumeName}` : 'Drop your CV / resume here or click to browse'}</strong><br /><span className="sub">Select the file you want to send. Our recruitment team will request and review it securely during the approval stage.</span>
        <input id="resumeFile" type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          set('resumeName', file.name);
          set('resumeSize', file.size);
        }} />
      </label>
      <div className="field"><label htmlFor="credentialName">Credentials (optional filename)</label><input id="credentialName" placeholder="e.g. FCA-approval.pdf" value={f.credentialName} onChange={(e) => set('credentialName', e.target.value)} /></div>
    </section>
  );
}
export function StepGate({ f, set, status, intentId, feeLabel }: { f: WizForm; set: S; status: string; intentId: string | null; feeLabel?: string }) {
  return (
    <section aria-label="Compliance gate">
      <h2>Step 3: Compliance gate</h2>
      <p className="sub">Pay the compliance fee and our recruitment team reviews your file. You'll be emailed once it's approved.</p>
      <label className="consent"><input type="checkbox" checked={f.backgroundConsent} onChange={(e) => set('backgroundConsent', e.target.checked)} /> I consent to third-party identity and background screening.</label>
      <label className="consent"><input type="checkbox" checked={f.referenceConsent} onChange={(e) => set('referenceConsent', e.target.checked)} /> I consent to confidential reference outreach upon shortlisting.</label>
      <label className="consent"><input type="checkbox" checked={f.retentionConsent} onChange={(e) => set('retentionConsent', e.target.checked)} /> I consent to 24-month secure retention of my data, as described in the Privacy Policy.</label>
      <div className="fee">
        <h3>Third Party Compliance Fee: {feeLabel ?? '$49.00'}</h3>
        <p>This fee covers third-party identity, right-to-work and background screening. It is refundable before screening begins — see our <a href="/refund-policy">Refund Policy</a>. A receipt is issued on payment.</p>
        {status && <p style={{ margin: 0 }}>State: <strong style={{ color: '#e8c96a' }}>{status}</strong>{intentId ? ` (${intentId})` : ''}</p>}
      </div>
    </section>
  );
}
