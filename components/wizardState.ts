'use client';
import { useState } from 'react';
export type WizForm = {
  fullName: string; email: string; phone: string; linkedin: string; title: string;
  years: number; salary: string; jobId: string; workAuth: string;
  sponsorshipDetails: string; mentorship: boolean; notes: string;
  resumeName: string; resumeSize: number; credentialName: string;
  backgroundConsent: boolean; referenceConsent: boolean; retentionConsent: boolean;
};
export const initForm = (job: string): WizForm => ({
  fullName: '', email: '', phone: '', linkedin: '', title: '', years: 10,
  salary: '', jobId: job, workAuth: 'citizen', sponsorshipDetails: '',
  mentorship: false, notes: '', resumeName: '', resumeSize: 0,
  credentialName: '', backgroundConsent: false, referenceConsent: false, retentionConsent: false,
});
export function validateStep(f: WizForm, s: number): string[] {
  if (s === 0) {
    const e: string[] = [];
    if (f.fullName.trim().length < 2) e.push('Enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.push('Enter a valid work email.');
    // title is optional — never block continue when the field is absent from an older deploy
    if (f.linkedin && !/^https?:\/\//.test(f.linkedin)) e.push('LinkedIn must start with http(s)://.');
    return e;
  }
  if (s === 1) {
    const e: string[] = [];
    if (!f.resumeName) e.push('Upload your CV / resume (Step 2).');
    if (f.resumeSize > 10 * 1024 * 1024) e.push('Resume must be under 10MB.');
    return e;
  }
  const e: string[] = [];
  if (!f.backgroundConsent) e.push('Background screening consent is required.');
  if (!f.referenceConsent) e.push('Reference consent is required.');
  if (!f.retentionConsent) e.push('Data retention consent is required.');
  return e;
}
export function useWizState(initialJob: string) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<WizForm>(initForm(initialJob));
  const [errs, setErrs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [status, setStatus] = useState('draft');
  const set = (k: keyof WizForm, v: any) => setF((p) => ({ ...p, [k]: v }));
  return { step, setStep, f, set, errs, setErrs, busy, setBusy, error, setError, candidateId, setCandidateId, intentId, setIntentId, status, setStatus };
}
