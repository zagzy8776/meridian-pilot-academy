import Nav from '@/app/Nav';
import SiteFooter from '@/components/SiteFooter';
import { getTeam } from '@/lib/team';

// Team members are admin-editable, so render per request rather than at build.
export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const team = await getTeam();
  return (
    <>
      <Nav />
      <main>
        <section className="page-hero" style={{ backgroundImage: "url('/media/city-plane.jpg')" }}>
          <div className="wrap">
            <p className="badge">Our Team</p>
            <h1>Meet the people behind the academy</h1>
            <p className="sub">
              Our instructors, trainers and recruiters bring decades of real airline and flight-deck
              experience to every programme we run.
            </p>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="grid3 team-grid">
              {team.map((m) => (
                <article key={m.id} className="card team-card">
                  {m.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="team-photo" src={m.photo_url} alt={m.name} loading="lazy" />
                  ) : (
                    <div className="team-photo team-photo-fallback" aria-hidden="true">{m.name.charAt(0)}</div>
                  )}
                  <h3>{m.name}</h3>
                  <p className="team-role">{m.role}</p>
                  {m.bio && <p className="sub">{m.bio}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="alt">
          <div className="wrap">
            <div className="band">
              <span className="eyebrow" style={{ color: '#e8c96a' }}>Ready to begin?</span>
              <h2>Start your aviation career today</h2>
              <p>Applications are reviewed by a senior partner. Submission stays pending until compliance is verified.</p>
              <div className="cta">
                <a href="/apply" className="btn">Apply Now</a>
                <a href="/contact" className="btn btn-ghost">Contact Us</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
