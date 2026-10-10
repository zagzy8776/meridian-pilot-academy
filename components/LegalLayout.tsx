import Nav from '@/app/Nav';
import SiteFooter from '@/components/SiteFooter';
import { BRAND } from '@/lib/brand';

// Shared shell for the legal/trust pages so Privacy, Terms, Refund and Cookie
// documents share identical typography, navigation and footer treatment.
export default function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main>
        <section className="page-hero legal-hero">
          <div className="wrap">
            <p className="badge">Legal</p>
            <h1>{title}</h1>
            <p className="sub">{intro}</p>
            <p className="sub legal-updated">Last updated: {updated}</p>
          </div>
        </section>
        <section>
          <div className="wrap-narrow legal-body">
            {children}
            <hr className="legal-rule" />
            <p className="sub">
              Questions about this document? Contact {BRAND.legalEntity} at{' '}
              <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> or{' '}
              <a href={`mailto:${BRAND.privacyEmail}`}>{BRAND.privacyEmail}</a>.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
