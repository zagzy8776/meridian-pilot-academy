import Nav from '@/app/Nav';
import SiteFooter from '@/components/SiteFooter';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ receipt?: string }> }) {
  const sp = await searchParams;
  return (
    <>
      <Nav />
      <main>
        <div className="wrap-narrow center success-hero">
          <span className="eyebrow">Application received</span>
          <h1>Payment received — your file is with our recruitment team</h1>
          {sp?.receipt && (
            <p className="sub">
              Payment reference: <code>{sp.receipt}</code>
            </p>
          )}
          <p className="sub">
            This is not yet an offer of a place. A senior partner will now review your profile and
            compliance documents. You will receive an email as soon as your application is approved, and
            interview scheduling will unlock at that point.
          </p>
          <ol className="success-steps">
            <li><strong>Payment received</strong> — your compliance fee has been captured.</li>
            <li><strong>Manual review</strong> — a senior partner checks your profile and documents.</li>
            <li><strong>Approval email</strong> — we email you the moment your file is approved.</li>
            <li><strong>Interview booked</strong> — scheduling opens and we confirm your slot.</li>
          </ol>
          <div className="cta" style={{ justifyContent: 'center' }}>
            <a href="/schedule" className="btn btn-dark">Check Application Status</a>
            <a href="/" className="btn btn-ghost" style={{ color: '#0a2342', borderColor: '#b9c7d6' }}>Return Home</a>
          </div>
          <p className="sub">
            Questions in the meantime? Email <a href="mailto:admissions@meridianaviationacademy.com">admissions@meridianaviationacademy.com</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

