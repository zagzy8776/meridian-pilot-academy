import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Cookie Policy | ${BRAND.name}`,
  description: `The cookies and similar technologies used by the ${BRAND.name} website.`,
};

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      updated="10 October 2026"
      intro={`This policy explains how ${BRAND.name} uses cookies and similar technologies, and how you can control them.`}
    >
      <h2>1. What cookies are</h2>
      <p>
        Cookies are small text files stored on your device by your browser. They help websites remember your
        actions and preferences between visits.
      </p>

      <h2>2. Cookies we use</h2>
      <ul>
        <li>
          <strong>Strictly necessary cookies.</strong> For example, the recruiter session cookie
          (<code>meridian_admin</code>) that keeps our team signed in to the dashboard. These cannot be
          switched off because the site cannot function without them.
        </li>
        <li>
          <strong>Preference storage.</strong> We may store small amounts of data locally in your browser to
          remember your consent choices on this site.
        </li>
      </ul>
      <p>
        We do not currently use advertising or third-party tracking cookies. If that changes, we will update
        this policy and ask for your consent where required.
      </p>

      <h2>3. Managing cookies</h2>
      <p>
        You can block or delete cookies through your browser settings. Blocking strictly necessary cookies
        may prevent parts of the site (such as the recruiter dashboard) from working correctly.
      </p>

      <h2>4. Contact</h2>
      <p>
        For any questions about our use of cookies, contact{' '}
        <a href={`mailto:${BRAND.privacyEmail}`}>{BRAND.privacyEmail}</a>.
      </p>
    </LegalLayout>
  );
}
