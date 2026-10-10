import { sql, hasDb } from '@/lib/db';
import {
  fallbackPrograms,
  fallbackRates,
  fallbackFaqs,
  fallbackTrainingSteps,
  type Program,
  type Rate,
  type Faq,
  type TrainingStep,
} from '@/lib/content';

// Every reader falls back to the curated list in lib/content.ts when the
// database is unreachable, so the marketing pages cannot 500 on a cold DB.
// A timeout also keeps `next build` from hanging on a slow/paused database.
const DB_TIMEOUT_MS = 4000;

function withTimeout<T>(p: Promise<T>, ms = DB_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('db timeout')), ms)),
  ]);
}

async function load<T>(run: () => Promise<any>, fallback: T): Promise<T> {
  if (!hasDb) return fallback;
  try {
    const rows = await withTimeout(run());
    return rows?.length ? (rows as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getPrograms(): Promise<Program[]> {
  return load(
    async () => {
      const rows: any[] = await sql`select id, slug, name, summary, min_hours, typical_hours, price_low, price_high, price_note, featured, sort from programs order by sort`;
      // SQLite has no boolean type; normalise the 0/1 flag to a real boolean.
      return rows.map((r) => ({ ...r, featured: Boolean(r.featured) }));
    },
    fallbackPrograms,
  );
}

export function getRates(): Promise<Rate[]> {
  return load(
    () => sql`select id, label, low, high, unit, sort from rates order by sort`,
    fallbackRates,
  );
}

export function getFaqs(): Promise<Faq[]> {
  return load(
    () => sql`select id, question, answer, sort from faqs order by sort`,
    fallbackFaqs,
  );
}

export function getTrainingSteps(): Promise<TrainingStep[]> {
  return load(
    () => sql`select id, title, body, sort from training_steps order by sort`,
    fallbackTrainingSteps,
  );
}

export function priceRange(p: Pick<Program, 'price_low' | 'price_high'>): string | null {
  if (p.price_low == null || p.price_high == null) return null;
  return `$${p.price_low.toLocaleString('en-US')} to $${p.price_high.toLocaleString('en-US')}`;
}

export function rateRange(r: Pick<Rate, 'low' | 'high'>): string {
  return `$${r.low.toLocaleString('en-US')} to $${r.high.toLocaleString('en-US')}`;
}
