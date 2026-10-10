import { createClient } from '@libsql/client';
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const { rows } = await client.execute(`
  select name as table_name, type as data_type
  from sqlite_master
  where type = 'table'
  order by name`);
for (const c of rows) {
  console.log(`${c.table_name} | ${c.data_type}`);
}

