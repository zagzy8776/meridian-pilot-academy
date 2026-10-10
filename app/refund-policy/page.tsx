import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Refund Policy | ${BRAND.name}`,
  description: `When and how the ${BRAND.name} Third Party Compliance Fee is refunded.`,
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Refund Policy"
      updated="10 October 2026"
      intro={`This policy explains when the Third Party Compliance Fee is refundable. It should be read alongside our Terms & Conditions.`}
    >
      <h2>1. What the fee covers</h2>
      <p>
        The Third Party Compliance Fee is charged once you submit your application, to initiate third-party
        identity, right-to-work and background screening. It is not a tuition fee and it does not guarantee
        acceptance onto a programme or an interview.
      </p>

      <h2>2. Full refund before screening begins</h2>
      <p>
        If you request a refund <strong>before we initiate screening</strong>, we will refund the fee in
        full. Screening normally begins once our team approves your file, so in practice you can request a
        full refund any time before you are approved.
      </p>

      <h2>3. Refunds after screening begins</h2>
      <p>
        Once third-party screening has been initiated, the fee covers work already performed on your behalf
        and becomes <strong>non-refundable</strong>. This is because our screening providers charge us for
        checks that have already started.
      </p>

      <h2>4. Refunds where we cancel</h2>
      <p>
        If we cancel your application or the screening process for a reason within our control, we will
        refund any fee paid for work not yet performed.
      </p>

      <h2>5. How to request a refund</h2>
      <p>
        Email <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> with your full name, the email address
        used to apply, and your payment reference. We aim to respond within <strong>5 business days</strong>{' '}
        and to process approved refunds within <strong>10 business days</strong> to the original payment
        method.
      </p>

      <h2>6. Your statutory rights</h2>
      <p>
        Nothing in this policy affects any statutory right to a refund you may have under the consumer law
        of your country of residence.
      </p>
    </LegalLayout>
  );
}
