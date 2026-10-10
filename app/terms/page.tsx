import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Terms & Conditions | ${BRAND.name}`,
  description: `The terms governing your use of the ${BRAND.name} website and application process.`,
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      updated="10 October 2026"
      intro={`These terms govern your use of the ${BRAND.name} website and the application process. By applying, you agree to them.`}
    >
      <h2>1. About these terms</h2>
      <p>
        This website is operated by {BRAND.legalEntity}, registered office{' '}
        {BRAND.registeredOffice}. These terms form a legal agreement between you and us.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 16 years old (or the age of majority in your jurisdiction) to apply. Where a
        programme requires specific licences, medicals or right-to-work status, you are responsible for
        providing accurate information and evidence.
      </p>

      <h2>3. Applications are not offers or guarantees</h2>
      <p>
        Submitting an application, and paying the Third Party Compliance Fee, does not guarantee
        acceptance onto any programme, nor an interview, nor employment. All applications are reviewed by
        our recruitment team and acceptance decisions are made at our discretion.
      </p>

      <h2>4. The Third Party Compliance Fee</h2>
      <p>
        The fee stated at checkout covers third-party identity, right-to-work and background screening. It
        is separate from any tuition or training cost, which is quoted separately. Payment does not itself
        approve your application; it initiates the review and screening process. Please see our{' '}
        <a href="/refund-policy">Refund Policy</a> for when the fee is refundable.
      </p>

      <h2>5. Your information</h2>
      <p>
        You confirm that all information and documents you provide are accurate and complete, and that you
        have the right to share them. Providing false information may result in your application being
        rejected. We handle your data as described in our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>6. Acceptable use</h2>
      <ul>
        <li>Do not submit unlawful, misleading or infringing content.</li>
        <li>Do not attempt to interfere with, probe or gain unauthorised access to the website or its data.</li>
        <li>Do not submit the personal data of others without their consent.</li>
      </ul>

      <h2>7. Availability</h2>
      <p>
        We aim to keep the website available but do not guarantee uninterrupted access. We may suspend,
        withdraw or change any part of the service, including programmes and pricing, at any time.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        Nothing in these terms excludes liability that cannot lawfully be excluded. Subject to that, we are
        not liable for indirect or consequential loss, or for lost profits, arising from your use of the
        website.
      </p>

      <h2>9. Intellectual property</h2>
      <p>
        All content on this website (text, graphics, logos and media) is owned by or licensed to us and may
        not be reproduced without permission. Regulatory body names and marks referenced on this site are
        the property of their respective owners.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws of {BRAND.jurisdiction}, and the courts of{' '}
        {BRAND.jurisdiction} have exclusive jurisdiction over any dispute.
      </p>
    </LegalLayout>
  );
}
