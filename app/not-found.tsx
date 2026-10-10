import Nav from '@/app/Nav';
import SiteFooter from '@/components/SiteFooter';

export default function NotFound() {
  return (
    <>
      <Nav />
      <main>
        <div className="wrap-narrow center error-hero">
          <span className="eyebrow">Error 404</span>
          <h1>This page has left the runway</h1>
          <p className="sub">
            The page you were looking for could not be found. It may have moved, or the link may be
            out of date.
          </p>
          <div className="cta" style={{ justifyContent: 'center' }}>
            <a href="/" className="btn btn-dark">Return Home</a>
            <a href="/apply" className="btn btn-ghost" style={{ color: '#0a2342', borderColor: '#b9c7d6' }}>Apply Now</a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
