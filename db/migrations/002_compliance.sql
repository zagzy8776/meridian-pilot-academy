-- 002_compliance.sql — consent + fee-version audit + document storage status.
-- Run once against Turso. SQLite does not support "add column if not exists",
-- so a re-run will error on the alter lines. Back up first, or wrap in your
-- migration runner's "already applied" guard.

alter table candidates add column consent_identity integer default 0;
alter table candidates add column consent_reference integer default 0;
alter table candidates add column consent_retention integer default 0;
alter table candidates add column consent_at text;
alter table candidates add column consent_version text;
alter table candidates add column ip_hash text;

alter table documents add column storage_status text default 'recorded';
alter table payments add column fee_version text;
alter table payments add column checkout_url text;

-- Status column for webhook triage (processing/done/ignored/orphan/amount_mismatch).
-- Without this the Stripe handler's `update webhook_events set status=...` lines
-- throw on live traffic.
alter table webhook_events add column status text default 'received';

-- Immutable audit of every fee the admin has saved. Checkout never reads from
-- here — it uses the frozen constant in lib/config.ts. This is provenance only.
create table if not exists fee_versions (
  id text primary key,
  amount_cents integer not null,
  currency text not null,
  version text not null unique,
  actor text,
  effective_from text not null,
  created_at text not null default (datetime('now'))
);

-- webhook_events.status is used for idempotency + triage. The unique constraint
-- on event_id is what makes the ON CONFLICT DO NOTHING upsert safe under Stripe
-- retries; if the base schema did not already enforce it, this index does.
create unique index if not exists webhook_events_event_id on webhook_events(event_id);
create index if not exists candidates_email on candidates(email);
create index if not exists payments_candidate on payments(candidate_id);