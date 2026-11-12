import Nav from '@/app/Nav';
import SiteFooter from '@/components/SiteFooter';

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ receipt?: string; candidate?: string }> }) {
  const sp = await searchParams;
  return (
    <>
      <Nav />
      <main>
        <div className="wrap-narrow center success-hero">
          <span className="eyebrow">Application received</span>
          <h1>Fee received - your file is with our recruitment team</h1>
          {sp?.receipt && <p className="sub">Payment reference: <code>{sp.receipt}</code></p>}
          <p className="sub">
            This is not an offer of a place. A senior recruiter reviews your profile, then instructs the
            screening partner. You will be emailed at each stage, and interview booking unlocks on approval.
          </p>
          <ol className="success-steps">
            <li><strong>Fee received</strong> - recorded against your file.</li>
            <li><strong>Manual review</strong> - a recruiter reads your profile and documents.</li>
            <li><strong>Screening instructed</strong> - identity, right-to-work and record check begin.</li>
            <li><strong>Interview</strong> - booking opens once you are approved.</li>
          </ol>
          <div className="cta" style={{ justifyContent: 'center' }}>
            <a href={sp?.candidate ? `/schedule?candidate=${sp.candidate}` : '/schedule'} className="btn btn-dark">View application status</a>
            <a href="/" className="btn btn-ghost" style={{ color: '#0a2342', borderColor: '#b9c7d6' }}>Return home</a>
          </div>
          <p className="sub">
            Need a refund before screening starts? Email <a href="mailto:admissions@meridianaviationacademy.com">admissions@meridianaviationacademy.com</a> with your reference.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}