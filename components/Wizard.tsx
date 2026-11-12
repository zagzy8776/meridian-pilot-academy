'use client';
import { useEffect, useState } from 'react';
import { useWizState, validateStep } from './wizardState';
import { StepProfile, StepDocs, StepGate } from './WizardSteps';
type Props = { jobs: { id: string; title: string }[]; initialJob: string };

const stepIcons = [
  <svg key="ic1" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.2 3.8-6.5 8-6.5s8 2.3 8 6.5" /></svg>,
  <svg key="ic2" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h6" /></svg>,
  <svg key="ic3" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9.5 12l1.8 1.8L15 10" /></svg>,
];

export default function Wizard({ jobs, initialJob }: Props) {
  const s = useWizState(initialJob);
  const { step, setStep, f, set } = s;
  const [feeLabel, setFeeLabel] = useState('');
  const [receipt, setReceipt] = useState('');
  const [mode, setMode] = useState<'mock' | 'live'>('mock');

  useEffect(() => {
    fetch('/api/fee').then((r) => r.json()).then((d) => {
      if (d?.label) setFeeLabel(d.label);
      if (d?.mode) setMode(d.mode);
    }).catch(() => {});
  }, []);

  async function next() {
    s.setError('');
    const e = validateStep(f, step);
    s.setErrs(e);
    if (e.length) return;
    s.setBusy(true);
    try {
      if (step === 0) {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...f, website: '' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Could not save profile');
        s.setCandidateId(data.candidateId);
        s.setStatus(data.status);
      } else {
        const files = (f as any).__files ?? {};
        const form = new FormData();
        form.set('candidateId', s.candidateId ?? '');
        if (files.resume) form.set('resume', files.resume);
        if (files.credential) form.set('credential', files.credential);
        const res = await fetch('/api/documents', { method: 'POST', body: form });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? 'Could not upload documents');
      }
      setStep(Math.min(2, step + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) { s.setError(e.message); }
    s.setBusy(false);
  }
  async function pay() {
    s.setError('');
    const e = validateStep(f, 2);
    s.setErrs(e);
    if (e.length) return;
    s.setBusy(true);
    try {
      const r1 = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: s.candidateId }),
      });
      const d1 = await r1.json();
      if (!r1.ok) throw new Error(d1.error ?? 'Could not start payment');
      s.setIntentId(d1.intentId);

      // Live mode: hand off to Stripe Checkout. The webhook does the confirming.
      if (d1.checkoutUrl) { window.location.href = d1.checkoutUrl; return; }

      // Mock mode: local confirm endpoint only exists in mock; it refuses in live.
      const r2 = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentId: d1.intentId }),
      });
      const d2 = await r2.json().catch(() => ({}));
      if (!r2.ok) throw new Error(d2.error ?? 'Payment failed');
      s.setStatus(d2.status ?? 'payment_received');
      setReceipt(
        d2.candidateId
          ? `/apply/success?candidate=${encodeURIComponent(d2.candidateId)}&receipt=${encodeURIComponent(d1.intentId)}`
          : '',
      );
    } catch (e: any) { s.setError(e.message); }
    s.setBusy(false);
  }

  const titles = ['Your details', 'Documents', 'Compliance check'];
  const paid = ['payment_received', 'verified', 'scheduled'].includes(s.status);

  return (
    <div>
      <ol className="progress" aria-label="Progress">
        {titles.map((t, i) => (
          <li key={t} className={i === step ? 'on' : i < step ? 'done' : ''}>
            <span className="stepicon">{stepIcons[i]}</span>
            <span>{i + 1}. {t}</span>
          </li>
        ))}
      </ol>
      {s.error && <p role="alert" className="alert">{s.error}</p>}
      {!!s.errs.length && <ul className="alert">{s.errs.map((e) => <li key={e}>{e}</li>)}</ul>}

      {step === 0 && <StepProfile f={f} set={set} jobs={jobs} />}
      {step === 1 && <StepDocs f={f} set={set} />}
      {step === 2 && <StepGate f={f} set={set} status={s.status} intentId={s.intentId} feeLabel={feeLabel} />}

      <div className="wiznav">
        <button type="button" className="btn btn-ghost" style={{ color: '#0a2342', borderColor: '#b9c7d6' }} disabled={step === 0 || s.busy} onClick={() => setStep(step - 1)}>Back</button>
        {step < 2 && <button type="button" className="btn" disabled={s.busy} onClick={next}>{s.busy ? 'Saving…' : 'Continue'}</button>}
        {step === 2 && !paid && <button type="button" className="btn btn-dark" disabled={s.busy || !feeLabel} onClick={pay}>{s.busy ? 'Processing…' : `Pay ${feeLabel}`}</button>}
        {step === 2 && paid && <a className="btn" href={`/schedule?candidate=${s.candidateId}`}>View application status</a>}
      </div>

      {paid && (
        <p className="statusline">
          Payment received{mode === 'live' ? '' : ' (test mode)'}.
          {receipt && <> <a href={receipt}>View receipt</a>.</>} We email you once your file is reviewed.
        </p>
      )}
    </div>
  );
}