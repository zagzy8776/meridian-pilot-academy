import Nav from '@/app/Nav';
import SiteFooter from '@/components/SiteFooter';
import { getFaqs } from '@/lib/queries';

export const revalidate = 300;

export default async function AboutPage() {
  const faqs = await getFaqs();
  return (
    <>
      <Nav />
      <main>
        <section className="page-hero" style={{ backgroundImage: "url('/media/city-plane.jpg')" }}>
          <div className="wrap">
            <p className="badge">About Us</p>
            <h1>How we train aviation professionals</h1>
            <p className="sub">
              Learn about our safety standards, global reach, and dedication to developing the
              next generation of aviation professionals.
            </p>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="section-head center">
              <span className="eyebrow">What We Stand For</span>
              <h2>Safety, reach and crew development</h2>
              <p>Every programme we run is built around three non-negotiables.</p>
            </div>
            <div className="grid3">
              <article className="card">
                <div className="ico" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9.5 12l1.8 1.8L15 10" /></svg>
                </div>
                <h3>Safety First</h3>
                <p>Our training programmes adhere to the highest international safety standards set by EASA, FAA and ICAO. We continuously update our curriculum to reflect the latest regulations and best practices.</p>
              </article>
              <article className="card">
                <div className="ico" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.6 3 2.6 15 0 18" /><path d="M12 3c-2.6 3-2.6 15 0 18" /></svg>
                </div>
                <h3>Global Reach</h3>
                <p>With training centres in major aviation hubs worldwide, we prepare candidates for careers with leading international airlines, corporate flight departments and cargo operators.</p>
              </article>
              <article className="card">
                <div className="ico" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.2 3.8-6.5 8-6.5s8 2.3 8 6.5" /></svg>
                </div>
                <h3>Crew Development</h3>
                <p>From initial selection to advanced type rating, we provide personalised mentorship, performance tracking and career placement support to ensure every graduate succeeds.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="alt">
          <div className="wrap split rev">
            <div className="split-media">
              <img src="/media/plane-clouds.jpg" alt="Airliner climbing through cloud" loading="lazy" />
              <span className="frame-tag">Training in the air, not just on paper</span>
            </div>
            <div className="split-body">
              <span className="eyebrow">Our Approach</span>
              <h2>Airline-grade training, every single day</h2>
              <p className="sub">
                We combine classroom theory, simulator sessions and live aircraft experience so
                that graduates step onto the line already confident and crew-ready.
              </p>
              <ul className="list-check">
                <li>Full-flight simulators matched to airline type ratings</li>
                <li>Instructors drawn from active airline captain and purser roles</li>
                <li>Continuous assessment with individual performance reports</li>
                <li>Dedicated placement team connected to 40+ partner airlines</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="statband">
              <div className="grid3">
                <div className="stat"><b>12</b><span>Global training centres</span></div>
                <div className="stat"><b>40+</b><span>Partner airlines</span></div>
                <div className="stat"><b>97%</b><span>Graduate placement rate</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="alt">
          <div className="wrap-narrow">
            <div className="section-head center">
              <span className="eyebrow">FAQ</span>
              <h2>Frequently Asked Questions</h2>
            </div>
            {faqs.map((f) => (
              <details key={f.id}>
                <summary>{f.question}</summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
