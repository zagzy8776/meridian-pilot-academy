-- Meridian Aviation Academy schema (libSQL / Turso)
-- SQLite dialect: ids are TEXT (uuid strings), timestamps are TEXT ISO-8601,
-- booleans are INTEGER 0/1 and JSON is stored as TEXT.

create table if not exists partners (
  id integer primary key autoincrement,
  name text not null,
  tier text not null default 'platinum',
  sort integer not null default 0
);

create table if not exists jobs (
  id text primary key,
  title text not null,
  firm_alias text not null,
  location text not null,
  comp_band text not null,
  engagement text not null default 'Retained',
  clearance text not null default 'Executive',
  status text not null default 'active',
  sort integer not null default 0,
  created_at text not null default (datetime('now'))
);

create table if not exists candidates (
  id text primary key,
  job_id text references jobs(id),
  full_name text not null,
  email text not null,
  phone text,
  profile text not null default '{}',
  status text not null default 'draft',
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);
create index if not exists candidates_email_idx on candidates (email);
create index if not exists candidates_status_idx on candidates (status);

create table if not exists documents (
  id text primary key,
  candidate_id text not null references candidates(id) on delete cascade,
  kind text not null,
  filename text not null,
  mime text not null,
  size_bytes integer not null,
  storage_key text not null,
  sha256 text,
  created_at text not null default (datetime('now'))
);

create table if not exists payments (
  id text primary key,
  candidate_id text not null references candidates(id) on delete cascade,
  provider text not null default 'mock-stripe',
  amount_cents integer not null,
  currency text not null default 'usd',
  intent_id text unique not null,
  status text not null default 'requires_payment',
  payer_mode text not null default 'deferred',
  receipt_url text,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

create table if not exists webhook_events (
  id text primary key,
  provider text not null,
  event_id text unique not null,
  event_type text not null,
  payload text not null,
  received_at text not null default (datetime('now'))
);

create table if not exists slots (
  id text primary key,
  starts_at text not null,
  ends_at text not null,
  partner text not null default 'Senior Partner Panel',
  taken_by text references candidates(id),
  created_at text not null default (datetime('now'))
);

create table if not exists interviews (
  id text primary key,
  candidate_id text not null references candidates(id) on delete cascade,
  slot_id text not null references slots(id),
  notes text,
  created_at text not null default (datetime('now')),
  unique (slot_id)
);

-- Legacy table kept for backwards compatibility
create table if not exists applications (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  program_slug text,
  start_window text,
  notes text,
  created_at text not null default (datetime('now'))
);

-- Academy catalogue. Read by lib/queries.ts and seeded by db/seed.sql.
create table if not exists programs (
  id integer primary key,
  slug text not null unique,
  name text not null,
  summary text not null,
  min_hours text,
  typical_hours text,
  price_low integer,
  price_high integer,
  price_note text,
  featured integer not null default 0,
  sort integer not null default 0
);

create table if not exists rates (
  id integer primary key,
  label text not null,
  low integer not null,
  high integer not null,
  unit text not null,
  sort integer not null default 0
);

create table if not exists faqs (
  id integer primary key,
  question text not null,
  answer text not null,
  sort integer not null default 0
);

create table if not exists training_steps (
  id integer primary key,
  title text not null,
  body text not null,
  sort integer not null default 0
);

-- Admin-editable key/value settings (e.g. the third-party compliance fee).
create table if not exists settings (
  key text primary key,
  value text not null,
  updated_at text not null default (datetime('now'))
);

-- Team members shown on the public /team page and managed from /admin.
create table if not exists team_members (
  id text primary key,
  name text not null,
  role text not null,
  bio text,
  photo_url text,
  sort integer not null default 0,
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now'))
);

