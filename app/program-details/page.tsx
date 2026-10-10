import Nav from '@/app/Nav';
import SiteFooter from '@/components/SiteFooter';
import { getTrainingSteps, getRates, rateRange } from '@/lib/queries';

export const revalidate = 300;

const coreModules = [
  {
    title: 'Emergency Procedures',
    body: 'Evacuation, fire fighting, ditching, rapid decompression, emergency landings and use of safety equipment.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9.5 12l1.8 1.8L15 10" /></svg>
    ),
  },
  {
    title: 'Crew Resource Management',
    body: 'Communication, leadership, decision-making, situational awareness, and threat & error management.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><circle cx="17" cy="9" r="2.4" /><path d="M3 20c0-3.4 2.7-5.4 6-5.4s6 2 6 5.4" /><path d="M15.5 20c.2-2.4 1.6-3.9 3.5-3.9 1.4 0 2.3.7 2.9 1.6" /></svg>
    ),
  },
  {
    title: 'International Safety Protocol',
    body: 'Compliance with EASA, FAA and ICAO standards; SMS (Safety Management System); fatigue risk management; security procedures.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.6 3 2.6 15 0 18" /><path d="M12 3c-2.6 3-2.6 15 0 18" /></svg>
    ),
  },
];

const extraModules = [
  'Aviation Security',
  'First Aid & Medical',
  'Aircraft Type Systems',
  'Human Factors',
  'Radio Telephony',
  'Dangerous Goods',
];

export default async function ProgramDetailsPage() {
  const [steps, rates] = await Promise.all([getTrainingSteps(), getRates()]);
  return (
    <>
      <Nav />
      <main>
        <section className="page-hero" style={{ backgroundImage: "url('/media/plane-clouds.jpg')" }}>
          <div className="wrap">
            <p className="badge">Program Details</p>
            <h1>Training Modules &amp; Curriculum</h1>
            <p className="sub">
              The modules covered across our training programs.
            </p>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="grid3">
              {coreModules.map((m) => (
                <article key={m.title} className="card">
                  <div className="ico" aria-hidden="true">{m.icon}</div>
                  <h3>{m.title}</h3>
                  <p className="sub">{m.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="alt">
          <div className="wrap">
            <div className="section-head center">
              <span className="eyebrow">Also Included</span>
              <h2>Supporting competency modules</h2>
              <p>Delivered alongside every career track so graduates are fleet-ready from day one.</p>
            </div>
            <div className="grid3">
              {extraModules.map((m) => (
                <div key={m} className="card center">
                  <p className="tag" style={{ display: 'inline-block', margin: 0 }}>{m}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Training Pathway</span>
              <h2>From first flight to checkride</h2>
              <p className="sub">The route most students follow through a full pilot programme.</p>
            </div>
            <div className="steps">
              {steps.map((s) => (
                <article key={s.id} className="step">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="alt">
          <div className="wrap">
            <div className="section-head center">
              <span className="eyebrow">What It Costs</span>
              <h2>Indicative hourly rates</h2>
              <p>Typical market ranges. Ask us for a written estimate for your chosen track.</p>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Item</th><th>Range</th><th>Unit</th></tr></thead>
                <tbody>
                  {rates.map((r) => (
                    <tr key={r.id}>
                      <td>{r.label}</td>
                      <td><strong>{rateRange(r)}</strong></td>
                      <td className="sub">{r.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap split">
            <div className="split-media">
              <video autoPlay muted loop playsInline preload="metadata" poster="/media/cockpit-poster.jpg" aria-hidden="true">
                <source src="/media/cockpit.mp4" type="video/mp4" />
              </video>
              <span className="frame-tag">Simulator &amp; flight-deck training</span>
            </div>
            <div className="split-body">
              <span className="eyebrow">How You Learn</span>
              <h2>From the classroom to the flight deck</h2>
              <p className="sub">
                Each module blends theory, scenario-based simulation and live aircraft exposure,
                assessed continuously against airline competency frameworks.
              </p>
              <ul className="list-check">
                <li>Ground school with approved training organisations</li>
                <li>Full-flight simulator sessions on airline types</li>
                <li>Continuous assessment and personal performance reports</li>
                <li>Final competency review with a senior training captain</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="band">
              <span className="eyebrow" style={{ color: '#e8c96a' }}>Ready to begin?</span>
              <h2>Select the program that matches your career goals</h2>
              <p>Start your application and a senior partner will review it within one business day.</p>
              <div className="cta">
                <a href="/programs" className="btn">Explore Programs</a>
                <a href="/apply" className="btn btn-ghost">Apply Now</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
