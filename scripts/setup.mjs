import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) {
  console.error('[db:setup] Set TURSO_DATABASE_URL (or DATABASE_URL) in .env.local first.');
  process.exit(1);
}

const client = createClient({ url, authToken });

for (const file of ['db/schema.sql', 'db/seed.sql']) {
  const statements = readFileSync(file, 'utf8')
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const s of statements) await client.execute(s);
  console.log('ran', file, statements.length, 'statements');
}

console.log('Database ready.');

