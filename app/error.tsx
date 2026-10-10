'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main>
      <div className="wrap-narrow center error-hero">
        <span className="eyebrow">Something went wrong</span>
        <h1>We hit unexpected turbulence</h1>
        <p className="sub">
          An unexpected error occurred while loading this page. Please try again — if the problem
          persists, contact us at <a href="mailto:admissions@meridianaviationacademy.com">admissions@meridianaviationacademy.com</a>.
        </p>
        <div className="cta" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-dark" onClick={() => reset()}>Try Again</button>
          <a href="/" className="btn btn-ghost" style={{ color: '#0a2342', borderColor: '#b9c7d6' }}>Return Home</a>
        </div>
      </div>
    </main>
  );
}
