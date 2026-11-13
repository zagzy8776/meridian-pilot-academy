import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';

const url = (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '').trim();
if (!url) {
  console.error('[db:setup] Set DATABASE_URL in .env.local first (Neon connection string).');
  process.exit(1);
}
if (!/^postgres(ql)?:\/\//i.test(url)) {
  console.error('[db:setup] DATABASE_URL must start with postgresql:// or postgres://');
  process.exit(1);
}

const sql = neon(url);

async function runFile(file) {
  const raw = readFileSync(file, 'utf8');
  const cleaned = raw
    .split(';')
    .map((s) => s.trim())
    .filter((s) => {
      if (!s) return false;
      const withoutComments = s
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim();
      return withoutComments.length > 0;
    });
  for (const s of cleaned) {
    await sql(s);
  }
  console.log('ran', file, cleaned.length, 'statements');
}

await runFile('db/schema.sql');
await runFile('db/seed.sql');
console.log('Database ready (Neon / Postgres).');
