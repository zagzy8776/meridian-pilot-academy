import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

// Neon Postgres. Prefer DATABASE_URL (Neon dashboard connection string).
// NEON_DATABASE_URL is accepted as an alias.
const url = (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '').trim();

function tryCreateSql(): NeonQueryFunction<false, false> | null {
  if (!url) {
    console.warn('[db] DATABASE_URL is not set. Pages will use fallback data until configured.');
    return null;
  }
  if (!/^postgres(ql)?:\/\//i.test(url)) {
    console.error(
      '[db] DATABASE_URL must be a Postgres connection string starting with postgresql:// or postgres://. ' +
        `Got: ${JSON.stringify(url.slice(0, 24))}…`,
    );
    return null;
  }
  try {
    return neon(url);
  } catch (e: any) {
    console.error('[db] Failed to initialise Neon client:', e?.message ?? e);
    return null;
  }
}

const client = tryCreateSql();
export const hasDb = client !== null;

/**
 * Tagged-template SQL helper. Returns an array of row objects.
 * Write statements should use RETURNING when the caller needs the new row.
 * Mirrors the previous libSQL helper so route call sites stay unchanged.
 */
export const sql: any = hasDb
  ? client
  : new Proxy(
      {},
      {
        get: (_t, prop) => {
          if (prop === 'then') return undefined;
          throw new Error(
            'DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string.',
          );
        },
      },
    );

/** Escape hatch for raw parameterised statements when a tagged template is awkward. */
export async function q<T = any>(statement: string, params: any[] = []): Promise<T[]> {
  if (!client) throw new Error('DATABASE_URL is not set.');
  const rows = await (client as any)(statement, params);
  return rows as T[];
}
