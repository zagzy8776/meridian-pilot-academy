import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Contact | ${BRAND.name}`,
  description: `Contact ${BRAND.name} — admissions, privacy and general enquiries.`,
};

export default function ContactPage() {
  return (
    <LegalLayout
      title="Contact Us"
      updated="10 October 2026"
      intro={`We're here to help with admissions, applications and any questions about our programmes.`}
    >
      <h2>Admissions</h2>
      <p>
        Programme enquiries, applications and interview scheduling:{' '}
        <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
      </p>

      <h2>Privacy &amp; data requests</h2>
      <p>
        Access, correction or deletion requests:{' '}
        <a href={`mailto:${BRAND.privacyEmail}`}>{BRAND.privacyEmail}</a>
      </p>

      <h2>Registered office</h2>
      <p>
        {BRAND.legalEntity}
        <br />
        {BRAND.registeredOffice}
      </p>

      <h2>Telephone</h2>
      <p>{BRAND.phone}</p>

      <h2>Opening hours</h2>
      <p>Monday to Friday, 09:00–18:00 (UK time). We aim to reply to all enquiries within one business day.</p>
    </LegalLayout>
  );
}
