import { sql, hasDb } from '@/lib/db';
import Nav from './Nav';
import SiteFooter from '@/components/SiteFooter';
import { fallbackPartners, processSteps, programMedia, defaultProgramMedia } from '@/lib/content';
import { getPrograms, priceRange } from '@/lib/queries';
export const revalidate = 300;

export default async function Home() {
  let partners = fallbackPartners;
  if (hasDb) {
    try {
      const partnersData = await sql`select * from partners order by sort`;
      if (partnersData?.length) partners = partnersData;
    } catch { /* fallback */ }
  }
  const programs = await getPrograms();
  return (
    <>
      <Nav />
      <main id="top">
        <section className="hero">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/media/cockpit-poster.jpg"
            aria-hidden="true"
          >
            <source src="/media/cockpit.mp4" type="video/mp4" />
          </video>
          <div className="hero-inner">
            <div className="reveal">
              <p className="badge">Aviation Careers, Est. 2026</p>
              <h1>Train for a career in aviation, from cabin crew to flight deck.</h1>
              <p className="lead">
                We select and train cabin crew, pilots and ground operations professionals
                for airlines worldwide, to international safety and service standards.
              </p>
              <div className="cta">
                <a className="btn" href="/programs">Explore Programs</a>
                <a className="btn btn-ghost" href="/apply">Apply Now</a>
              </div>
            </div>
            <aside className="facts reveal d1" aria-label="At a glance">
              <h2>At a glance</h2>
              <ul>
                <li><span>Career tracks</span><b>{programs.length}</b></li>
                <li><span>Partner airlines</span><b>40+</b></li>
                <li><span>Safety framework</span><b>EASA / FAA / ICAO</b></li>
                <li><span>Placement support</span><b>12 months</b></li>
              </ul>
            </aside>
          </div>
          <div className="gold-bar" aria-hidden="true" />
        </section>

        <section id="partners">
          <div className="wrap">
            <div className="section-head center">
              <span className="eyebrow">Our Partners</span>
              <h2>Trusted by Aviation Authorities Worldwide</h2>
              <p>Our curriculum is aligned to the standards set by the world&apos;s leading aviation bodies.</p>
            </div>
            <div className="grid4">
              {partners.map((p: any) => (
                <div key={p.id ?? p.name} className="partner">
                  <img
                    src={`/partners/${String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, '')}.svg`}
                    alt={`${String(p.name)} logo`}
                    title={String(p.name)}
                    className="partner-logo"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="programs" className="alt">
          <div className="wrap">
            <div className="section-head center">
              <span className="eyebrow">Our Training Programs</span>
              <h2>Choose your path into aviation</h2>
              <p>Every track is built with airline partners and delivered by active flight crew.</p>
            </div>
            <div className="grid3">
              {programs.map((prog) => {
                const media = programMedia[prog.slug] ?? defaultProgramMedia;
                const price = priceRange(prog);
                return (
                  <article key={prog.id} className="prog-card">
                    <div className="prog-media">
                      <img src={media.img} alt={prog.name} loading="lazy" />
                      <span className="chip">{media.chip}</span>
                    </div>
                    <div className="prog-body">
                      <h3>{prog.name}</h3>
                      <p className="sub">{prog.summary}</p>
                      <ul className="prog-tags">
                        {prog.typical_hours && <li className="tag">{prog.typical_hours}</li>}
                        {price && <li className="tag">{price}</li>}
                      </ul>
                      <div className="prog-actions">
                        <a href="/program-details" className="btn btn-dark btn-sm">Learn More</a>
                        <a href="/apply" className="btn btn-sm">Apply Now</a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="wrap split">
            <div className="split-media">
              <video autoPlay muted loop playsInline preload="metadata" poster="/media/climb-poster.jpg" aria-hidden="true">
                <source src="/media/climb.mp4" type="video/mp4" />
              </video>
              <span className="frame-tag">In-flight training environment</span>
            </div>
            <div className="split-body">
              <span className="eyebrow">Why Meridian</span>
              <h2>Training on airline-grade aircraft</h2>
              <p className="sub">
                From the first simulator session to your final type rating, you train on
                airline-grade equipment with instructors who still fly the line.
              </p>
              <ul className="list-check">
                <li>Simulator and full-flight training with active captains</li>
                <li>Curriculum mapped to EASA, FAA and ICAO competency frameworks</li>
                <li>Personal mentorship and performance tracking throughout</li>
                <li>Direct placement pathway into partner airline fleets</li>
              </ul>
              <div className="cta">
                <a href="/about" className="btn btn-dark">About the Academy</a>
              </div>
            </div>
          </div>
        </section>

        <section className="alt">
          <div className="wrap">
            <div className="statband">
              <div className="grid3">
                <div className="stat"><b>40+</b><span>Partner airlines worldwide</span></div>
                <div className="stat"><b>3</b><span>Career tracks to choose from</span></div>
                <div className="stat"><b>97%</b><span>Graduate placement rate</span></div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">How It Works</span>
              <h2>A clear route from enquiry to the flight deck</h2>
            </div>
            <div className="steps">
              {processSteps.map((s) => (
                <article key={s.title} className="step">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="band">
              <span className="eyebrow" style={{ color: '#e8c96a' }}>Ready for take-off?</span>
              <h2>Start your aviation career today</h2>
              <p>Applications are reviewed by a senior partner. Submission stays pending until compliance is verified.</p>
              <div className="cta">
                <a href="/apply" className="btn">Apply Now</a>
                <a href="/programs" className="btn btn-ghost">View Programs</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

