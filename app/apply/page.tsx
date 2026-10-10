import Nav from '@/app/Nav';
import Wizard from '@/components/Wizard';
import { getPrograms } from '@/lib/queries';
export const dynamic = 'force-dynamic';
export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ job?: string }> }) {
  const sp = await searchParams;
  const programs = (await getPrograms()).map((p) => ({ id: String(p.id), title: p.name }));
  return (
    <>
      <Nav />
      <main className="apply">
        <div className="wrap apply-grid">
          <div>
            <span className="eyebrow">Confidential Application</span>
            <h2>Your route to the shortlist</h2>
            <p>Three simple stages. Submit once and our recruitment team takes it from there.</p>
            <div className="card" style={{ color: '#10202f', marginBottom: '1rem' }}><strong>Secure handling</strong> of your documents and data</div>
            <div className="card" style={{ color: '#10202f' }}><strong>Confidential</strong>. Never shared with a third party without your consent.</div>
          </div>
          <div className="wizard">
            <Wizard jobs={programs} initialJob={sp?.job ?? ''} />
          </div>
        </div>
      </main>
    </>
  );
}
