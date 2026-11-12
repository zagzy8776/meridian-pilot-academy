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

// Keep existing Turso databases compatible with the current application. The
// base schema contains these columns for new databases; this additive repair is
// safe to run repeatedly on an already-initialized database.
const additions = {
  candidates: [
    ['consent_identity', 'integer not null default 0'],
    ['consent_reference', 'integer not null default 0'],
    ['consent_retention', 'integer not null default 0'],
    ['consent_at', 'text'],
    ['consent_version', 'text'],
    ['ip_hash', 'text'],
  ],
  documents: [['storage_status', "text default 'recorded'"]],
  payments: [['fee_version', 'text'], ['checkout_url', 'text']],
  webhook_events: [['status', "text not null default 'received'"]],
};

for (const [table, columns] of Object.entries(additions)) {
  const existing = await client.execute(`pragma table_info(${table})`);
  const names = new Set(existing.rows.map((row) => String(row.name)));
  for (const [name, definition] of columns) {
    if (!names.has(name)) {
      await client.execute(`alter table ${table} add column ${name} ${definition}`);
      console.log('added', `${table}.${name}`);
    }
  }
}

await client.execute(`create table if not exists fee_versions (
  id text primary key, amount_cents integer not null, currency text not null,
  version text not null unique, actor text, effective_from text not null,
  created_at text not null default (datetime('now'))
)`);
await client.execute('create unique index if not exists webhook_events_event_id on webhook_events(event_id)');

console.log('Database ready.');

