import Nav from '@/app/Nav';
import SiteFooter from '@/components/SiteFooter';
import { getPrograms, priceRange } from '@/lib/queries';
import { programMedia, defaultProgramMedia } from '@/lib/content';

export const revalidate = 300;

export default async function ProgramsPage() {
  const programs = await getPrograms();
  return (
    <>
      <Nav />
      <main>
        <section className="page-hero" style={{ backgroundImage: "url('/media/climb-poster.jpg')" }}>
          <div className="wrap">
            <p className="badge">Our Training Programs</p>
            <h1>Choose your path into aviation</h1>
            <p className="sub">
              Compare duration, entry requirements and indicative cost for every track we run.
            </p>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="grid3">
              {programs.map((p) => {
                const media = programMedia[p.slug] ?? defaultProgramMedia;
                const price = priceRange(p);
                return (
                  <article key={p.id} className="prog-card">
                    <div className="prog-media">
                      <img src={media.img} alt={p.name} loading="lazy" />
                      <span className="chip">{media.chip}</span>
                    </div>
                    <div className="prog-body">
                      <h3>{p.name}</h3>
                      <p className="sub">{p.summary}</p>
                      <ul className="prog-tags">
                        {p.typical_hours && <li className="tag">{p.typical_hours}</li>}
                        {price && <li className="tag">{price}</li>}
                      </ul>
                      <div className="prog-actions">
                        <a href="/apply" className="btn btn-sm">Apply Now</a>
                        <a href="/program-details" className="btn btn-dark btn-sm">Curriculum</a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="alt">
          <div className="wrap">
            <div className="section-head center">
              <span className="eyebrow">Full Breakdown</span>
              <h2>Requirements and indicative cost</h2>
              <p>Hours and budget ranges are reviewed as aircraft and instructor rates move.</p>
            </div>
            <div className="grid3">
              {programs.map((p) => {
                const price = priceRange(p);
                return (
                  <article key={p.id} className="card">
                    <h3>{p.name}</h3>
                    {p.min_hours && <p className="sub"><strong>Minimum:</strong> {p.min_hours}</p>}
                    {p.typical_hours && <p className="sub"><strong>Typical:</strong> {p.typical_hours}</p>}
                    <p className="sub"><strong>Indicative cost:</strong> {price ?? 'On request'}</p>
                    {p.price_note && <p className="sub">{p.price_note}</p>}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <div className="band">
              <span className="eyebrow" style={{ color: '#e8c96a' }}>Ready to begin?</span>
              <h2>Select your program and apply</h2>
              <p>Applications stay pending until the compliance stage is verified by a senior partner.</p>
              <div className="cta">
                <a href="/apply" className="btn">Apply Now</a>
                <a href="/program-details" className="btn btn-ghost">See the Curriculum</a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
