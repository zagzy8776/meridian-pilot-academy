import { createClient, type Client } from '@libsql/client';

// Turso / libSQL connection. Two env styles are supported so the same code works
// with the Turso dashboard and with plain libSQL:
//   TURSO_DATABASE_URL + TURSO_AUTH_TOKEN   (recommended, matches Turso docs)
//   DATABASE_URL (+ optional TURSO_AUTH_TOKEN)
// A local file URL (file:local.db) also works for offline development.
const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

// Validate the URL before handing it to libSQL. `createClient` calls `new URL()`
// internally, so a malformed value (e.g. a truncated dashboard string still
// containing a "…" ellipsis, or a copy/paste with the wrong scheme) would throw
// ERR_INVALID_URL during Next.js page-data collection and fail the entire build.
// We'd rather log loudly and fall back to the no-database path.
function isValidDbUrl(value: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'libsql:' || parsed.protocol === 'http:' ||
      parsed.protocol === 'https:' || parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
  } catch {
    return false;
  }
}

const dbEnabled = isValidDbUrl(url);
if (url && !dbEnabled) {
  console.error(
    '[db] TURSO_DATABASE_URL is not a valid URL, so the database is disabled. ' +
      'Copy the exact value from the Turso dashboard — it should look like ' +
      'libsql://<database>-<org>.turso.io (note the libsql:// scheme, and make sure ' +
      'the string is not truncated with a "…"). Using fallback data until fixed.',
  );
}
if (!url) {
  console.warn('[db] TURSO_DATABASE_URL is not set. Pages will use fallback data until configured.');
}

export const client: Client | null = dbEnabled ? createClient({ url, authToken }) : null;
export const hasDb = dbEnabled;

// Normalise a returned row object: libSQL already gives us plain objects, so we
// only need to strip BigInt values (which JSON.stringify rejects) and coerce
// them to numbers.
function normaliseRow(row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = typeof v === 'bigint' ? Number(v) : v;
  }
  return out;
}

/**
 * Tagged-template SQL helper that mirrors the previous `neon()` call style:
 *
 *   const rows = await sql`select * from programs where id = ${id}`;
 *   if (rows[0]) { ... }
 *
 * It returns an ARRAY of row objects (not a ResultSet) so every existing call
 * site keeps working unchanged after the move from Postgres to libSQL.
 */
export const sql: any = dbEnabled
  ? (strings: TemplateStringsArray, ...values: any[]) => {
      const text = strings.reduce(
        (acc, part, i) => acc + part + (i < values.length ? '?' : ''),
        '',
      );
      return client!.execute({ sql: text, args: values as any[] }).then((res) => {
        if (res.rows && res.rows.length) {
          return res.rows.map((r) => normaliseRow(r as Record<string, any>));
        }
        // Return an array that still exposes write metadata (non-enumerable) for
        // any caller that wants rowsAffected / lastInsertRowid.
        const rows: any[] = [];
        Object.defineProperty(rows, 'rowsAffected', { value: res.rowsAffected, enumerable: false });
        Object.defineProperty(rows, 'lastInsertRowid', { value: res.lastInsertRowid, enumerable: false });
        return rows;
      });
    }
  : new Proxy(
      {},
      {
        get: (_t, prop) => {
          if (prop === 'then') return undefined;
          throw new Error('TURSO_DATABASE_URL is not set. Copy .env.example to .env.local and add your Turso URL and auth token.');
        },
      },
    );

/** Escape hatch for raw, parameterised statements when a tagged template is awkward. */
export async function q<T = any>(statement: string, args: any[] = []): Promise<T[]> {
  if (!client) throw new Error('TURSO_DATABASE_URL is not set.');
  const res = await client.execute({ sql: statement, args });
  return res.rows.map((r) => normaliseRow(r as Record<string, any>)) as T[];
}
