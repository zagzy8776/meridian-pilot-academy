# Meridian Aviation Academy

Elite aviation training & recruitment platform — Next.js 15 + resilient vanilla CSS + Turso (libSQL).

## Quick start
1. `npm install`
2. Copy `.env.example` to `.env.local` and add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` (from the Turso dashboard). Curated fallback content renders until the DB is connected.
3. `npm run db:setup` — runs `db/schema.sql` then `db/seed.sql` (both idempotent).
4. `npm run dev` — open `/`, `/apply`, `/schedule`, `/admin`, `/team`.

## Flows
- **Landing (`/`)**: cinematic video hero (`public/media/cockpit.mp4` + `cockpit-poster.jpg`), regulatory-alignment wall (EASA/FAA/ICAO/IATA), program cards with imagery, a "why Meridian" split section (`public/media/climb.mp4`), stat band, process steps and a closing CTA band.
- **About (`/about`)**, **Programs (`/programs`)**, **Curriculum (`/program-details`)**, **Team (`/team`)**: image page-heroes, icon feature cards, split media sections, stats and FAQ — all themed aviation. The Team page is driven by `team_members` and editable from `/admin`.
- **Wizard (`/apply`)**: native React state + server validators. Step 1 profile (conditional sponsorship/mentorship) creates `candidates.status='pending_payment'`. Step 2 vault records `documents` metadata (filename/type/size). Step 3 gate creates a payment intent, confirms it, which sets `candidates.status='payment_received'` — it is **not** auto-verified.
- **Scheduling (`/schedule?candidate=ID`)**: 403-locked until an admin approves the candidate (`status='verified'`). Books `slots` into `interviews`.
- **Admin (`/admin`)**: approve paid applicants, schedule or reschedule interviews, edit the compliance fee and manage the public team page (including headshot uploads). Gated by the `ADMIN_TOKEN` cookie; the site fails closed (denies everyone) when the token is unset.

## Legal & trust pages
`/privacy`, `/terms`, `/refund-policy`, `/cookies` and `/contact` share a single `LegalLayout` and are linked from every page footer. Brand name, registered office and contact details live in `lib/brand.ts` — update them there and they propagate site-wide.

## Database
`npm run db:setup` runs `db/schema.sql` (`create table if not exists`, so it is safe to re-run) and then `db/seed.sql`.

App tables: `partners`, `jobs`, `candidates`, `documents`, `payments`, `webhook_events`, `slots`, `interviews`, `applications`, `settings`, `team_members`.

- `db/seed.sql` seeds the partners wall with **EASA, FAA, ICAO, IATA**. `partners.name` must match a logo in `public/partners/`; `app/page.tsx` slugifies the name (lowercase, non-alphanumerics stripped) before building `/partners/<slug>.svg`, and falls back to the curated list in `lib/content.ts` if the query fails.
- `candidates.job_id` is a FK to `jobs(id)`. The wizard submits a program id such as `"1"`, which is not a uuid, so `app/api/applications/route.ts` stores `null` in the FK and keeps the choice in the `profile` JSON. Without that guard the insert would fail the moment the DB is connected.

> **Note:** the libSQL schema stores ids as `text` (uuid strings generated in application code),
> timestamps as ISO-8601 `text`, booleans as `integer` 0/1 and JSON as `text`. `lib/db.ts` exposes
> a `sql` tagged-template helper that returns an array of row objects, so all query call sites read
> like the previous Postgres code.

## Payments
`lib/payments.ts` uses a pluggable intent interface. `FEE_PAYER_MODE=deferred|employer|candidate` selects who pays the Third Party Compliance Fee. Swap `lib/payments.ts` for the live Stripe SDK later — same interface, no wizard change.

## Deploy
Push to GitHub, import into host, set `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `STRIPE_MODE`, `MOCK_WEBHOOK_SECRET`, `FEE_PAYER_MODE`, `ADMIN_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL` and `NEXT_PUBLIC_APP_URL`. The last four are required for a trustworthy launch: without `ADMIN_TOKEN` the dashboard denies everyone (fail-closed), and without `RESEND_API_KEY` applicants receive no confirmation emails.

## Media assets
Place artwork in `public/media/` and authority logos in `public/partners/`:
- `cockpit.mp4` + `cockpit-poster.jpg` — hero background video and poster (airline cockpit).
- `climb.mp4` + `climb-poster.jpg` — "why Meridian" section video and poster.
- `city-plane.jpg`, `plane-clouds.jpg` — page-hero and program-card imagery.
- `partners/easa.svg`, `faa.svg`, `icao.svg`, `iata.svg` — official EASA, FAA, ICAO and IATA logos (full colour), sourced from Wikimedia Commons. Swap in your own licensed files if you hold brand rights.

Swap any file for your own keeping the same filename to restyle the site instantly. All
sections use `object-fit: cover` with tuned focal points, so both portrait and landscape
media work.

