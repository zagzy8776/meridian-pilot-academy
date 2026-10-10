import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRAND.name}`,
  description: `How ${BRAND.name} collects, uses, stores and protects personal data submitted through our application process.`,
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="10 October 2026"
      intro={`This policy explains what personal data ${BRAND.legalEntity} ("we") collects when you apply, how we use it, and the rights you have under UK GDPR and the EU GDPR.`}
    >
      <h2>1. Who we are</h2>
      <p>
        {BRAND.legalEntity} is the data controller for the personal data described in this policy. Our
        registered office is {BRAND.registeredOffice}. You can reach our data protection contact at{' '}
        <a href={`mailto:${BRAND.privacyEmail}`}>{BRAND.privacyEmail}</a>.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li><strong>Identity and contact data:</strong> your name, email address and telephone number.</li>
        <li><strong>Professional data:</strong> current title, years of experience, LinkedIn profile, compensation expectations and any notes you provide.</li>
        <li><strong>Application data:</strong> the programme or track you apply for, right-to-work status and sponsorship details where relevant.</li>
        <li><strong>Document data:</strong> the name, type and size of any CV or credential you reference during the application.</li>
        <li><strong>Payment data:</strong> a payment reference, amount, currency and status. Card details are handled entirely by our payment processor; we never store full card numbers.</li>
        <li><strong>Consent records:</strong> the screening, reference and retention consents you grant (including the time you grant them).</li>
      </ul>

      <h2>3. Why we use it and our lawful basis</h2>
      <ul>
        <li><strong>To assess and process your application</strong> — performance of a contract or steps taken at your request before entering one.</li>
        <li><strong>To arrange interviews and scheduling</strong> — performance of a contract.</li>
        <li><strong>To carry out identity, right-to-work and background screening</strong> — your explicit consent, which you may withdraw at any time.</li>
        <li><strong>To take payment of the Third Party Compliance Fee</strong> — performance of a contract.</li>
        <li><strong>To send transactional emails</strong> about your application — performance of a contract.</li>
        <li><strong>To meet legal, accounting and fraud-prevention obligations</strong> — compliance with a legal obligation and our legitimate interests.</li>
      </ul>

      <h2>4. Who we share it with</h2>
      <p>
        We share personal data only with processors that help us run the service: our hosting and database
        provider, our email delivery provider, our payment processor and, where you have consented,
        third-party screening providers. We do not sell your data, and we do not share it with prospective
        employers without your separate consent.
      </p>

      <h2>5. International transfers</h2>
      <p>
        Some providers may process data outside the UK/EEA. Where this happens we rely on appropriate
        safeguards such as the UK International Data Transfer Addendum or the European Commission&apos;s
        Standard Contractual Clauses.
      </p>

      <h2>6. How long we keep it</h2>
      <p>
        We retain application and supporting data for <strong>24 months</strong> from your last interaction,
        unless you ask us to delete it sooner or we are required to keep it longer for legal or accounting
        reasons. Payment records are retained for the period required by tax law.
      </p>

      <h2>7. Your rights</h2>
      <p>
        You have the right to access, correct, delete, restrict or object to our processing of your data,
        to data portability, and to withdraw consent at any time. To exercise any of these rights, email{' '}
        <a href={`mailto:${BRAND.privacyEmail}`}>{BRAND.privacyEmail}</a>. You also have the right to
        complain to your local supervisory authority (in the UK, the Information Commissioner&apos;s Office).
      </p>

      <h2>8. Security</h2>
      <p>
        We use encryption in transit, access controls, and role-based access to our dashboard. Access to
        applicant files is limited to the recruitment team on a need-to-know basis. No system is perfectly
        secure, but we work to recognised standards to keep your data safe.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be reflected by a new
        &ldquo;last updated&rdquo; date at the top of this page.
      </p>
    </LegalLayout>
  );
}
