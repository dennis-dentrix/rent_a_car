# Documentation Map, Rulings, and Build Plan

## 1. Documents and what each one owns

| File                          | Owns                                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `product-pack.md`             | Business rules (§8), status table (§5), access matrix (§13), coding standards (§14), owner decisions (§21, §23, §24) |
| `prd.md`                      | Scope, requirements FR-01 to FR-15, success metrics, decisions on open questions                                     |
| `ux-spec.md`                  | Flows, states, notifications, guided choice                                                                          |
| `information-architecture.md` | Routes, navigation                                                                                                   |
| `design-system.md`            | Tokens, type scale, motion, logo, mobile patterns (adapted from the Stitch designs)                                  |
| `ui-build-plan.md`            | UI build order and gates, screen-to-phase map, where the Stitch designs differ from the rulings                      |
| `ui-component-library.md`     | Component definitions                                                                                                |
| `database-design.md`          | Tables, columns, constraints, indexes, buckets                                                                       |
| `api-spec.md`                 | Endpoints, request shapes, error codes, rate limits                                                                  |
| `technical-architecture.md`   | Stack, hosting split, security controls, jobs                                                                        |
| `analytics-events.md`         | Event names and properties                                                                                           |
| `growth-seo.md`               | SEO, page templates, structured data                                                                                 |
| `content-management.md`       | Blog and guides: storage, admin API, images, publishing rules                                                        |

## 2. Precedence when documents conflict

1. `product-pack.md` §25, then §24, then §23, then §21 (the newest decision wins). §25 is the Carvo marketplace direction.
2. The owning document in the table above, for its own facts.
3. Older text in pack sections 1 to 20, PRD, UX spec, which still show earlier wording.

Do not edit the docs to resolve a conflict without the owner's say-so. Report it.

## 3. Working rulings (confirmed by §23 and §24)

- Cancellation: more than 24 hours before pickup refunds the deposit; within 24 hours, no refund.
- Minimum hire: 2 days for rentals (a shorter rental is charged as 2 days); airport transfers can be 1 day. Pack §24.9.
- Private owners, chassis number, trackers, and inspection reports with files: captured from day one. Pack §24.10. Payouts and escrow are not built.
- Late-return grace: 1 hour. Minimum age: 21. Licence years: per class, not yet set.
- The deposit is labelled "Refundable deposit" on every surface.
- E-signature at launch. eTIMS at launch if feasible; customer may choose "Request tax receipt (eTIMS)".
- Currency: KES default in Kenya, USD elsewhere (country header from Cloudflare, switchable, remembered on device). Staff price in KES; USD is converted at a rate fixed when the quote is created; admin may override with an audit entry. Until Tingg confirms USD, all charges are KES.
- Security deposit: separate line, switchable system-wide, per class, or per vehicle (vehicle wins); off until Tingg confirms how it is held or refunded.
- Discounts: admin-set, dated, percent or fixed, for weekly, monthly, quarterly and longer hire. Best qualifying discount applies as a named line. Never on the security deposit or delivery fees.
- Guests do not pay online. A guest submits an enquiry (vehicle, dates, name, phone, email); staff convert it and send a payment link.
- Company admin role: deferred.
- Frontend and backend are separate apps in one monorepo: Next.js (`apps/web`) and Express (`apps/api`), with a shared package. Pack §24.11 and the architecture doc.
- Payments (Tingg) and SMS (Mobile Sasa) are deferred. Staff confirm bookings by hand for now; email only for notifications; customers sign in by email. Pack §24.12.
- Phone numbers: any country, written with the country code; stored as +digits. A website enquiry needs an email, the phone is optional.
- Accounts: sign-up and sign-in are Supabase Auth (email). A database trigger creates every profile as a customer; only an admin sets staff or admin. Staff and admin need a second factor (authenticator app); `REQUIRE_STAFF_MFA=false` is for local development only.
- Cancellation: more than 24 hours before pickup the deposit is refundable in full; inside 24 hours nothing, and the customer must acknowledge it. The refund owed is recorded on the booking until payments exist. Pack §23.1.
- Date change: once, up to 24 hours before pickup, re-priced from the rate table; a deposit already received is kept. UX spec §3 (the free change reading is an assumption).
- Documents: ID and driving licence uploaded by the customer, the signed agreement scanned by staff; JPG, PNG, or PDF up to 10 MB. Files go straight to the private bucket on signed links; staff must give a reason to open one, and it is logged. The rental agreement is a PDF built from the booking and the settings; the customer signs it online (tick, typed name, optional drawing) once the booking is confirmed, which stores the signed PDF as a verified agreement with the evidence of the signature. Office signing stays: print the PDF and staff upload the scan. The wording is a draft for lawyer review.
- Hosting: Supabase in Ireland (eu-west-1); Oracle VM in Johannesburg (the account's home region, which holds the Always Free allowance). Owner ruling, 22 November 2026. The API and the database are about 170 ms apart, so a request that touches money or status runs as one database function call, not a chain of queries.
- Languages: English first; all copy as message keys.
- Typeface: Nunito Sans, one family for the whole app, loaded with `next/font` and falling back to the system sans stack. Owner ruling, 23 November 2026; this replaces the monospace (JetBrains Mono) ruling of the same day, the Inter ruling before it, and the system-font line in `design-system.md`. Tokens, logo, and mobile patterns: `design-system.md`. The logo is the "C" transit arc with an amber arrival dot (Stitch brand screen); its colours live in `brand.js`.
- No deposits for now (owner, 23 November 2026). Nothing is held when a renter books, and the site says so. This pauses the refundable-deposit and security-deposit rulings above and the deposit-based cancellation refund; the pages no longer mention a deposit. To switch it off in pricing, set `deposit_percent` to 0 in settings (a quote then has no deposit line). Cancellation and date-change rules need the owner's wording before they are shown again.
- Chats stay in the app (owner, 23 November 2026). No WhatsApp links. Visitors send a question from the site, which saves an enquiry. A full in-app conversation (signed-in renter and rental company or staff) is still to build.
- No default pick-up or drop-off places (owner, 23 November 2026). The renter types a location; it is used as typed, or matched through a maps service when one is connected. Not built yet.
- Car hire lets a renter choose the vehicle class (SUV, executive, small, and so on) and a specific car (owner, 23 November 2026). Not built yet; a specific car needs a public vehicles listing.
- Design direction: Apple HIG as the base, with selected Material 3 ideas (tonal surfaces, state layers, tonal button, chips, segmented control, pill active indicator). See `design-system.md`. Owner request, 15 November 2026.

## 4. Working assumptions (owner has not ruled; flag if they matter)

- Display currencies are KES and USD only (§24 over §23.1, which also lists EUR).
- Security deposit is built per §24.4, replacing "remove it" in §23.3 #6.
- `rates` holds the daily rate only; weekly and longer hire are discount rules.
- File storage: Cloudflare R2 (architecture doc), not Supabase Storage as in `database-design.md`.
- A booking in `pending_payment` holds the vehicle for 30 minutes, enforced in the database; `pending_payment` may move to `expired`.
- City pages need a way to represent a city in `locations`.
- `config/brand.js` is the brand source; Tailwind reads it. Accent colour defaults to option A (#0A5CC8) until the owner chooses.

## 5. Open items (do not build around these)

Tingg USD support and security-amount method (payments deferred); licence years per class; R2 location (Cloudflare has no Africa location; the EU jurisdiction would keep files with the database); lawyer view on hosting outside Kenya (Johannesburg VM, Ireland database); logo and final brand colour; retention periods; PostHog privacy review.

## 6. Known drift to align when its phase starts

Supabase Auth settings to set on the hosted project at launch (local values are looser): require email confirmation, minimum password length 8 or more, authenticator-app MFA enabled, SMTP through ZeptoMail for sign-in and invitation emails, and the site URL and redirect URLs for the web app.

Additions to the API spec: `GET /bookings/{id}/cancellation`, `POST /documents/{id}/complete`, `GET /documents`, `GET /documents/{id}/url`, `GET /inspection-files/{id}/url`, `/staff/documents` routes, `POST /staff/bookings/{id}/documents`, `POST /staff/bookings/{id}/inspection-uploads`; `PATCH /bookings/{id}` changes dates only; `PATCH /me` (spec has only `GET /me`), `GET`/`POST`/`PATCH /admin/staff`; admin data: `/admin/classes`, `/admin/rates`, `/admin/discounts`, `/admin/extras`, `/admin/delivery-zones`, `/admin/locations` (list, get, create, patch), `GET /admin/settings`, `PUT /admin/settings/{key}`, `GET /admin/exchange-rates`, `PUT /admin/exchange-rates/USD`; `POST /internal/jobs/send-notifications` (the email queue); `GET /bookings/{id}/agreement`, `GET /bookings/{id}/agreement/pdf`, `POST /bookings/{id}/agreement/sign`, `GET /staff/bookings/{id}/agreement` and its `/pdf`; `POST /enquiries` has no `source`; new error code `INSPECTION_REQUIRED` (422); `POST /staff/bookings` creates the customer account when needed; `GET`/`POST /staff/enquiries` and `GET /staff/bookings` are new; `GET /exchange-rates` (public, display rates for the currency switch); `GET /services` (public) and a `service` filter on `GET /classes`; `GET`/`PUT /admin/operators/{id}/services`; guides: `GET /posts`, `GET /posts/{slug}` (public) and, for admin, `GET`/`POST /admin/posts`, `GET`/`PATCH`/`DELETE /admin/posts/{id}`, `POST /admin/posts/{id}/image-uploads`, `POST /admin/posts/{id}/images`, `PATCH`/`DELETE /admin/posts/{id}/images/{imageId}` (`content-management.md`); rental companies: `POST /me/operator` (a customer starts a company), `GET /admin/operators`, `GET /admin/operators/{id}`, `POST /admin/operators/{id}/review`; `POST /me/avatar-upload`, `PUT`/`DELETE /me/avatar` (a profile picture); `GET /admin/overview` (counts for the admin's first page), `GET /admin/audit` (the audit log, newest first, with the actor's name); `GET /staff/bookings/{id}` now includes `next_statuses`; `GET /me` now includes `avatar_path`, `has_second_factor` and `operator` (and is the only route a password-only session of someone who uses an authenticator may call) (`id`, `business_name`, `slug`, `status`, `status_reason`).

Column names (`reviewed_by` vs `verified_by`, `window_*` vs `time_window_*`, `is_active` vs `active`), `etims_reference` (use this, not `etr_reference`), API paths (`/admin/refunds/{id}/approve`), public URLs (IA routes win), event names (analytics doc wins), and enquiry fields (§24.6 adds vehicle, dates, email to table and endpoint).

## 7. Build plan

Each phase ends at a gate. Do not start the next until it passes. Phases follow pack §20.2.

| Phase             | Build                                                                                                                                                                                                                                                                 | Gate                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 0. Foundation     | Monorepo (`apps/web`, `apps/api`, `packages/shared`), Dockerfiles, `.env.example`, git ignore, brand file in the shared package, tokens, Supabase migrations for core tables, email sign-in (SMS deferred), RLS from the §13 matrix, logger, money and date libs, Sentry, PostHog with consent, sitemap and robots, CI with secret scan | RLS tests pass for every role and table; analytics events fire on a preview |
| 1. Acquisition    | Shared components, homepage, class and vehicle pages, location, city and airport pages, service pages, FAQ, structured data, availability counts, guest enquiry form                                                                                                  | Pages server-rendered; Lighthouse targets in §20.6 met                      |
| 2. Booking engine | Pricing service with tests, quote, booking with 30-minute hold, documents upload (Tingg payments deferred, staff confirm by hand), agreement with e-sign, handover choice                                                                                                     | Double-booking and pricing tests pass                             |
| 3. Operations     | Staff inbox, enquiry to booking, fleet calendar, drivers, deliveries, document review with access log, handover records, refunds, dashboard                                                                                                                           | Staff use the inbox for every pilot booking                                 |
| 4. Growth         | Review requests, reminders, abandoned-quote reminders, offers                                                                                                                                                                                                         | Opt-in rules approved                                                       |
| 5. B2B            | Corporate dashboard, approvals, invoices                                                                                                                                                                                                                              | First corporate client                                                      |
| 6 and 7           | Recommendations; partner fleet                                                                                                                                                                                                                                        | Later                                                                       |

Within a phase: write the migration and its RLS and tests first, then the service, then the route, then the UI. Pricing, status transitions, overlap, and webhooks are unit tested before merge.

## 8. First session checklist (Phase 0)

1. Owner rules on section 4 above.
2. Done: the project is scaffolded to the layout in the root `CLAUDE.md`. Done so far, in the API with tests: quotes, bookings, owners, chassis, trackers, inspections, and the staff booking workflow (enquiries, walk-in bookings, inbox, status changes with rules, vehicle and driver assignment), accounts (profile on sign-up, `/me`, staff second factor, team management), cancellation and date changes, and document uploads with staff review.
3. Write migrations in the order: enums, identity, fleet and pricing, locations, quotes and bookings, payments, documents, audit.
4. Set up the pre-commit secret scan and CI before the first feature.
