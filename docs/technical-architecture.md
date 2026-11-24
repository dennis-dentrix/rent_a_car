# Technical Architecture Document

**Purpose:** Defines how the application is built, deployed, secured, and operated. Read with the database design (data), the API spec (contracts), and the coding standards in section 14 of the pack.

## 1. Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Language | Javascript, strict mode (confirm before first commit) | Catches errors in pricing and access code |
| Framework | Next.js, App Router | Server rendering for search; one project for site, account, and staff |
| UI | React, Tailwind CSS, shadcn/ui as a base | Widely used; accessible primitives |
| Data and auth | Supabase: Postgres, Auth, Storage, RLS | One vendor for data, identity, and files; RLS enforced in the database |
| Data access | Supabase JavaScript client; SQL migrations in the repo | Mainstream, documented, reviewable |
| Validation | Zod | One schema shared by API and forms |
| Hosting | Oracle Cloud Docker container (app), Cloudflare (DNS, firewall, rate limits) | Full Node.js runtime; edge security through Cloudflare |
| Payments | Tingg by Cellulant (card, M-PESA, bank) | One integration for several methods |
| Email and SMS | ZeptoMail; Mobile Sasa | Local SMS delivery |
| Maps | Google Maps Embed and directions links | Familiar to customers |
| Analytics | PostHog (proposed, pending privacy review) | Product funnels; self-serve |
| Errors | Sentry | Server and browser errors |
| Scheduled jobs | Cloudflare Cron Triggers | Expiry, reminders, rate refresh |
| CI | GitHub Actions | Lint, type check, tests, Lighthouse |

## 2. Application structure

- `app/`: routes for public site, `/account`, `/company`, `/staff`, `/admin`, `/auth`, and `/api/v1`.
- `services/`: business logic (pricing, bookings, payments, documents, tax receipts). Pure functions where possible.
- `domain/`: status transition table and pure rules with no framework imports.
- `schemas/`: Zod schemas for each endpoint and form.
- `lib/`: Supabase clients, money, dates, logger, feature flags.
- `components/`: UI components (see the component library document).
- `supabase/`: migrations, policies, seed data.
- `tests/`: end-to-end tests.

Dependency direction: routes call services; services call `domain`, `lib`, and the database client. `domain` imports nothing from the framework.

## 3. Rendering strategy

| Page type | Method | Revalidation |
| --- | --- | --- |
| Homepage, service pages, FAQ, about | Static generation | On deploy, plus on content change |
| City, airport, office, and class pages | Incremental static regeneration | Every 6 hours, and on rate change |
| Vehicle page | Incremental static regeneration with availability fetched on the client | Availability not cached |
| Quote, booking, account, company, staff | Dynamic, server-rendered | Never cached |
| Sitemap | Generated from the database | Daily |

Availability and prices shown in the quote are always fetched fresh. Static pages show a "from" price with the date it was set.

## 4. Request path

Browser to Cloudflare (TLS, WAF, rate limits), then Oracle VM (Caddy), then the Next.js server. The server checks the Supabase session, calls a service function, and reads or writes through Supabase with RLS. Writes that touch money or status run inside a database transaction.

## 5. Payment flow

1. Server creates a payment session with Tingg for the deposit amount from the stored quote.
2. Customer pays on Tingg's hosted checkout.
3. Tingg sends a webhook to `/api/v1/webhooks/tingg`.
4. Handler verifies the signature, stores the event in `payment_events` by provider event id, and skips it if already present.
5. In one transaction: record the payment, move the booking to `confirmed`, and write the status event.
6. Confirmation email and SMS sent after the transaction commits.
7. Failed or late webhooks are retried by Tingg; a daily reconciliation job compares Tingg records with bookings and reports differences to staff.

The browser never reports that a payment succeeded. It only reads the booking status.

## 6. Background jobs

| Job | Schedule | Action |
| --- | --- | --- |
| Expire holds | Every 5 minutes | Quotes and pending bookings past their expiry become `expired` |
| Reminders | Hourly | Pickup reminders 24 hours ahead; delivery windows |
| Review requests | Hourly | Requests one day after handover or return |
| Exchange rates | Daily | Refresh display rates from the approved source |
| Reconciliation | Daily | Compare payments with Tingg records |
| Tax receipts (when enabled) | Every 10 minutes | Retry pending submissions with backoff |
| Backup check | Weekly | Confirm backup status; report |

Each job is idempotent and logs its result. A failing job alerts through Sentry.

## 7. Caching and performance

- Static assets cached at the Cloudflare edge with long lifetimes and content hashes.
- Images served in WebP or AVIF with responsive sizes.
- Fonts loaded with `font-display: swap`; system font stack as the base.
- Map loads lazily below the fold.
- Database queries for lists are indexed (see the database document) and paginated.
- Targets: LCP under 2 seconds, INP under 150 ms, CLS under 0.05 (see the pack, section 20.6).

## 8. Security

- Row Level Security on every table; policies follow the access control matrix.
- `service_role` key used only in server code and scheduled jobs; each use logged.
- Security headers: Content Security Policy, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, and frame restrictions.
- Rate limits on login, OTP, quote, and booking endpoints at Cloudflare and in the app.
- Document files in a private bucket; access by short-lived signed URL (10 minutes).
- Uploads are checked for what they are, not what the browser says. Each purpose has its own allowed types in `packages/shared/src/file-purposes.js` (a car photo is a JPEG or PNG only; an inspection document is a PDF only; an ID or licence is a JPEG, PNG, or PDF). The API refuses a declaration outside the purpose, then reads the stored file's first bytes after upload (`apps/api/src/lib/file-sniff.js`) and deletes a file that does not match. For identity documents it saves the stored file's version tag when it passes, and refuses to open a file whose tag has changed, so a signed upload link cannot swap a file after review. Download links force the verified content type and are marked private and not cacheable. Not covered: malware scanning (an open item) and the version tag for inspection files.
- Who can open which file: an identity document, only its owner and staff (staff give a reason, which is logged); corporate users see a booking's signed agreement but never the ID or licence; operators see no identity document; inspection files, the renter, the operator whose vehicle it was, and staff. File paths never appear in an API answer.
- Secrets in Oracle VM environment variables, separate for test and live. Pre-commit scan for keys.
- Dependency updates through Dependabot; security review before each major release.
- MFA required for staff and admin accounts.

## 9. Environments

| Environment | Purpose | Database | Payments |
| --- | --- | --- | --- |
| Local | Development | Local Supabase with seed data | Tingg test keys |
| Preview | Each pull request | Supabase branch with seed data | Tingg test keys |
| Staging | Client testing | Anonymised copy of seed data | Tingg sandbox |
| Production | Live | Supabase Pro, daily backups | Tingg live keys |

## 10. Observability

- Sentry for errors, with releases tagged by commit.
- PostHog events (see the analytics document).
- Uptime check on the homepage and the booking endpoint every minute.
- Weekly review of job logs and error trends.
- Alerts for failed payments, failed webhooks, and jobs with repeated failures go to the developer.

## 11. Backup and recovery

- Supabase daily backups (Pro plan); point-in-time recovery to be confirmed on the chosen plan.
- A restore is tested before launch and each quarter.
- Recovery targets: a restore within one working day; loss of no more than one day of data.

## 12. Feature flags

Flags live in the `settings` table: currency selector, eTIMS, reviews display, referral programme. Flags are read on the server and passed to the client; they are not hard-coded.

## 13. Open decisions

1. TypeScript or JavaScript.
2. Decided 22 November 2026: Supabase in Ireland (eu-west-1). See the Oracle compute notes for the latency this adds.
3. Analytics tool (PostHog proposed).
4. Supabase point-in-time recovery plan.

## Hosting Split: Cloudflare and Oracle Cloud (decided 15 November 2026)

Each component runs where it fits best. Vercel is not used. Supabase remains the managed database and auth service.

| Component | Platform | Reason |
| --- | --- | --- |
| DNS, TLS, WAF, rate limits, bot protection | Cloudflare | Edge protection before traffic reaches the servers |
| Public site, customer account, staff workspace, API | Oracle Cloud, Docker container (Next.js standalone build) | Full Node.js runtime; long-running server; no Workers limits |
| Reverse proxy and TLS to the app | Oracle Cloud VM, Caddy container | Automatic certificates; simple configuration |
| Static assets and cached pages | Cloudflare cache | Fast delivery across Kenya |
| Scheduled jobs | Cloudflare Cron Triggers, which call a protected internal job endpoint on the app | Schedules managed at the edge; the job logic stays in the app |
| Retries for email, SMS, and tax receipts | Cloudflare Queues, consumed by a Worker that calls the app | Failed messages retry without blocking bookings |
| Private documents and vehicle photos | Cloudflare R2, private bucket, signed URLs | No egress fees on document views; private by default |
| Blog and guide images | Cloudflare R2, public bucket on the media domain, uploaded on signed links | Search engines and share previews must fetch them; the key prefix `blog/` is the only thing that selects this bucket |
| Payment webhook receiver | Oracle app endpoint, behind the Cloudflare WAF | Signature check and idempotency stay in one codebase |
| Database, auth, row-level security | Supabase (managed) | Unchanged from the earlier decision |
| Off-site backup copy | Oracle Cloud Object Storage | Second copy of database exports, outside the primary provider |
| Errors and uptime | Sentry; Cloudflare health checks | Alerts for failed payments and failed jobs |

**Traffic path.** Browser to Cloudflare (WAF, rate limits), to the Oracle VM (Caddy), to the Next.js container. Payment webhooks follow the same path.

**Oracle compute notes.**

- Reported change: the Always Free Ampere A1 allowance was reduced to 2 OCPUs and 12 GB RAM from 15 June 2026. Confirm the current figures in the Oracle console before sizing the VM.
- Instances above the free allowance, or left running after a trial ends without an upgrade, can be disabled and then deleted. Production uses a paid account, so the server is not at risk of deletion.
- The Nairobi Oracle region is not yet live. The VM is placed in Johannesburg until it opens, and the lawyer confirms that this is acceptable under the Data Protection Act before launch. The same review covers the database, which is in Ireland.
- The VM (Johannesburg) and Supabase (Ireland) are in different regions, about 170 ms apart. Each sequential query adds that delay, so writes that touch money or status run as a single Postgres function (one round trip), and request times are watched in Sentry from the first deploy.

**Risks.** Two providers and an origin server mean more to operate. Mitigations: infrastructure defined in code, the Docker images tested in preview, and the restore test in section 11 repeated for the Oracle backup.

**Open decisions.** Cloudflare plan level for Cron Triggers and Queues (production needs the paid tier). Oracle VM size, after the console check. Whether the public marketing pages are served from Cloudflare cache only, or also rebuilt on a schedule.

## Repository Hygiene and Security Controls (added 15 November 2026)

**Clean structure**

- One top-level folder per concern, as in the repository layout in section 14 of the pack. No files outside those folders except the standard project files: `package.json`, `README.md`, configuration files, and the lockfile.
- No scratch files, notes, or sample data committed. Local experiments go in an ignored `scratch/` folder that is never pushed.
- Each folder holds one kind of code. Shared logic lives in `services/` or `lib/` and nowhere else.
- Generated output (`.next`, build folders, coverage reports) is ignored.

**Git ignore, always**

- `.env`, `.env.*` (except a committed `.env.example` with placeholder values only)
- Key and certificate files (`*.pem`, `*.key`, `*.p12`), service account files, and Supabase local config holding secrets
- Build output, dependency folders, logs, editor and operating-system files
- Any file containing a Tingg, ZeptoMail, Mobile Sasa, or Supabase key

A pre-commit hook scans staged files for key patterns and blocks the commit. CI runs the same scan on every push.

**Secrets**

- Production secrets live in the Oracle VM's environment and the Cloudflare secret store, never in the repository.
- Test and live keys are separate. The live keys are held by the owner and the developer only.
- Keys are rotated every quarter and immediately after any suspected exposure.

**Security controls**

| Area | Control |
| --- | --- |
| Access to data | Row Level Security on every table (access control matrix, section 13 of the pack) |
| Privileged keys | The Supabase service key is used only in server code and scheduled jobs; each use is logged |
| Sessions | Short-lived tokens; staff sessions expire sooner; multi-factor authentication for staff and admin |
| Input | Zod validation on every API route and webhook |
| Payments | Amounts calculated on the server; webhook signatures checked; duplicate events ignored |
| Documents | Private storage; signed links that expire after 10 minutes; every staff view logged |
| Traffic | Cloudflare WAF and rate limits on login, OTP, quotes, and bookings |
| Web headers | Content Security Policy, HSTS, frame restrictions, `Referrer-Policy`, `X-Content-Type-Options` |
| Dependencies | Lockfile committed; Dependabot alerts; exact versions pinned; each new package recorded in the third-party register |
| Containers | Minimal base image; the container runs as a non-root user; image scanned in CI before deployment |
| Backups | Daily database backups; restore tested quarterly; copy held in Oracle Object Storage |
| Logging | No personal data or keys in logs; errors sent to Sentry with personal fields removed |
| Incidents | Written plan with named owners; customers and the data protection regulator notified within the legal period |

**Checks before launch**

- An external penetration test of the login, booking, payment, and document paths.
- A review of every RLS policy against the access control matrix.
- A test that a customer cannot read another customer's document by changing an identifier in the URL.
- A test that a webhook with a bad signature is rejected and logged.

## Frontend and Backend Separation (decided 15 November 2026)

The frontend and the backend are separate applications, each with its own code, container, and release.

**Frontend (`web`)**

- Next.js, for server-rendered public pages (SEO), the customer account, and the staff workspace.
- Calls the backend only through the API contract in the API specification. It never queries the database directly.
- Runs as one Docker container on the Oracle VM.

**Backend (`api`)**

- Express, the framework the developer knows best, running as its own Docker container on the Oracle VM.
- Owns all business rules, pricing, status transitions, payments, document access, role checks, and the Supabase service key.
- Receives the Tingg webhooks and the scheduled job calls from Cloudflare Cron Triggers, protected by a shared secret.

**Routing at the edge**

- Caddy on the Oracle VM routes `/api/*` to the `api` container and everything else to the `web` container.
- Because both sit on one domain, the browser makes same-site calls, and cookies and CORS stay simple.

**Login between the two**

- The web server holds the Supabase session in two `httpOnly` cookies (`rc_access`, `rc_refresh`), so scripts in the browser can never read it, and sends the access token to the backend in the `Authorization` header on each request. The web proxy renews the session before a page is drawn.
- Sign-in is at `/auth` (email and password), sign-up at `/auth/sign-up` (with a confirm-password field, then a six-digit code emailed to confirm the address at `/auth/verify-email`), and "forgot password" at `/auth/forgot`. Email links open `/auth/confirm`, which uses the one-time link only when the person presses a button, because mail scanners open links on their own. Resetting a password ends every session of the account. Staff and admin (and anyone who turned it on in Settings) then pass `/auth/verify` (a code from an authenticator app), or `/auth/enrol` the first time for staff and admin. A page that needs a role calls `requireRole` (`apps/web/lib/auth/session.js`); the API still checks the token, the role, and the second factor on every call, so the web check is only for sending people to the right screen.
- The backend verifies the token on every protected route, using the access rules in section 13 of the pack.

**Rental companies sign themselves up.** `/operators` ("For rental companies") leads to `/auth/operator`: one form creates the account and, once the email is confirmed, the company. The database function `register_operator` (not the browser) sets the role and the company, and only for a plain customer account. The company starts `pending` and is shown to renters only after an admin approves it at `/admin/operators` (the `review_operator` function checks the move and that a "no" has a reason). A company's people sign in at the same `/auth` pages and land on `/console`; they must use an authenticator code once the company is approved, not before.

**Settings and the second step.** `/settings` (profile, picture, offers and news, appearance, security) is where a signed-in person manages their account. Two-step sign-in (an authenticator app) is a setting: required and not removable for staff and admin (`isSecondFactorRequired`), optional and off by default for everyone else. Once someone has turned it on, a password alone is not enough anywhere: the website sends them to the code step, and the API refuses a first-step session on every route except "who am I" (`authenticateFirstStep`, `GET /me`, which reports `has_second_factor`). Turning it off asks for a code. Changing the password asks for the current one and signs out other devices; "sign out of all devices" ends every session. The authenticator secret is made once per visit (in the browser side of the page), because making it while the page is drawn replaced it after every wrong code.

**The header shows who is signed in.** A flag cookie tells the browser someone is signed in; the header then asks `/auth/session` for their name, picture, and area, and offers a small menu with their account, their own area (`/admin` or `/console`), and Sign out. The public pages stay the same for everyone. A profile picture is uploaded straight to the public bucket under `avatars/{user id}/` on a signed link (`POST /me/avatar-upload`, then `PUT /me/avatar`; `DELETE /me/avatar` removes it). The database column only accepts a path in the person's own folder.

**The sign-in pages have their own frame** (`apps/web/components/AuthShell.js`): no site menu, search, currency switch, footer, or phone tab bar, because a person there has one job. A logo, a way back, and on wide screens a brand panel are all that surround the form.

**DRY within each end**

- Frontend: one button, table, status badge, money formatter, and date formatter, each used by every screen.
- Backend: one pricing service, one status transition table, one error handler, one role-check middleware, and one notification sender.

**Open decision: shared validation.** The frontend and backend both validate the same inputs. Either the Zod schemas are shared through a small common package, which keeps one source of truth, or each end keeps its own copy. Recommendation: a small shared package for schemas and money rules only, since duplicated validation is the most likely cause of a form accepting input the server then rejects.

**Repository layout.** A monorepo with two applications and one shared package:

```
apps/web/       Next.js frontend
apps/api/       Express backend
packages/shared/  Zod schemas and money and date rules (if approved)
```
