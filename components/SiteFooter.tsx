import { BRAND, LEGAL_LINKS } from '@/lib/brand';

// Shared footer used across marketing and legal pages so the brand name,
// contact details and legal links are identical everywhere on the site.
export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <span className="footer-brand">{BRAND.name}</span>
          <p className="sub footer-line">
            {BRAND.legalEntity} · {BRAND.registeredOffice}
          </p>
          <p className="sub footer-line">
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a> · {BRAND.phone}
          </p>
        </div>
        <nav aria-label="Legal">
          <ul className="footer-links">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</span>
        <span><a href="/admin">Recruiter Sign-in</a> · <a href="/schedule">Scheduling</a></span>
      </div>
    </footer>
  );
}
