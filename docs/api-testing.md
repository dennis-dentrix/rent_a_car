# API Testing Guide

How to run the API locally and test it, in Postman and from the terminal.

## 1. Start the local stack

The project has two applications: the API (Express, port 4000) and the web app (Next.js, port 3000). Postman talks to the API.

Docker Desktop must be open. From the project folder:

```bash
npm install
npm run db:start
```

`db:start` starts the local Supabase and applies the migrations in `supabase/migrations/`. To reload the sample data from `supabase/seed.sql` (three classes, four vehicles, rates, locations, delivery zones, extras, discounts, a USD rate, test accounts, a sample owner and trackers), run:

```bash
npm run db:reset
```

Create the API's environment file from the template, then fill in the Supabase values printed by `npx supabase status`:

```bash
cp apps/api/.env.example apps/api/.env.local
```

Needed for the API so far: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INTERNAL_JOB_SECRET`.

The seed also creates five local test accounts, all with the password `Passw0rd!local`: `customer@example.test`, `customer2@example.test`, `staff@example.test`, `admin@example.test`, and `operator@example.test` (the person of an approved company, "Seed Fleet"). They exist only in the local database. Staff, admin, and an approved company's person set up an authenticator app the first time they sign in on the website.

Start the API:

```bash
npm run dev:api
```

The API is at `http://localhost:4000/api/v1`. Check it with `http://localhost:4000/api/v1/health`. The web app (`npm run dev:web`) is not needed for API testing.

## 2. Postman

1. In Postman choose **Import** and select both files in `docs/postman/`:
   - `carvo.postman_collection.json`
   - `local.postman_environment.json`
2. Pick the environment **Car Rental: local** (top right).
3. In the environment, set `supabase_anon_key` to the `ANON_KEY` printed by `npx supabase status`. Everything else is already filled in.
4. Open the collection and press **Run** to send everything, or send requests one at a time. Run **Auth > Sign in** first when you want the booking requests; it saves the access token, which the collection sends as a bearer token on every request.

Each request has checks (the **Tests** tab). A green result means the response was what we expect. The folder **Errors** holds requests that must fail, and they pass when they do. Dates are generated automatically, 30 days ahead, so quotes never expire in the past.

Endpoints in the collection:

| Request | Shows |
| --- | --- |
| List classes, with dates, in USD | Rates, live availability count, display-only USD |
| Get one class, List locations, Check availability | Catalogue reads |
| Quote: office pickup, 3 days | Price from the rate table, 30 percent refundable deposit |
| Quote: delivery with chauffeur | The pack's worked example: KES 45,000 total, KES 13,500 deposit |
| Quote: 7 days in USD | Weekly discount applied; USD amount and rate fixed on the quote |
| Quote: 1-day rental, airport transfer | A rental shorter than 2 days is charged as 2 days; an airport transfer (`"service": "airport_transfer"`) can be 1 day |
| Sign in (local test customer) | Gets an access token from the local Supabase and stores it for the other requests |
| Create booking from the last quote | Turns the 3-day quote into a `pending_payment` booking that holds a vehicle for 30 minutes |
| Create booking without signing in | 401 UNAUTHENTICATED |
| List my bookings, one per page | Only your own bookings, newest first, with a cursor for the next page |
| Get one booking | The booking with its timeline (Quote done, Deposit paid current), documents, payments, handover |
| Admin: add a vehicle, add a duplicate chassis number | Chassis number is required and unique (409 on a repeat) |
| Admin: add a private owner, agreement, tracker | Owner records, the commission agreement that makes a partner vehicle, and the vehicle's tracker |
| Staff: view the vehicle | Partner flag, owner (no private details), trackers. Staff can read but not write |
| Staff: record a pickup inspection | A report with photos and a document, saved together; file paths never returned |
| Guest: send an enquiry | A visitor's enquiry; only an id comes back, and the source is always `form` |
| Staff: book the enquiry for a walk-in | Staff create a booking for a customer without an account (one is created), from quote fields; no 30-minute expiry; the enquiry is marked converted |
| Staff: inbox, view the booking | Bookings with customer and vehicle, filters for status, date and handover type; full status history with who made each change |
| Staff: confirm by hand, try ready, assign, cancel | Status changes with their rules: a note to confirm by hand, verified documents before ready, an inspection before active and returned |
| Sign up (a brand new customer), Me | Sign-up goes to Supabase Auth, which creates the profile automatically; `/me` shows and updates your own profile |
| Admin: invite, list, switch off a team member | Team accounts are managed by an admin; the role cannot be set by the person themselves |
| Cancel and change a booking | See the refund before confirming (24-hour rule), one date change that re-prices from the rate table, cancel, and the refusals |
| Documents | Start an upload, send the file to the signed link, confirm it, then staff review, open (with a logged reason), and verify |
| Agreement | Read the terms, get the PDF, sign (typed name, tick, optional drawing), see the refusals, and staff see who signed and from where |
| Admin data | An admin adds a class, its daily rate, a discount, an extra, a delivery zone; changes a setting; sets the USD rate. Overlapping rates and bad values are refused |
| Expire unpaid holds, Send queued emails | The jobs Cloudflare will run every 5 minutes; they need the `x-job-secret` header |
| Errors | Past dates, a client-sent total, an unknown class |

## 3. Automated tests from the terminal

| Command | What it runs | Needs |
| --- | --- | --- |
| `npm test` | Unit tests in the API and shared package: pricing, status table, money, dates, errors | Nothing |
| `npm run test:db` | Database tests and API tests against the local stack | `npm run db:start` and `apps/api/.env.local` |
| `npm run lint` | Code style rules | Nothing |

## 4. Notes

- A quote is stored in the local database each time you send one, and each booking holds a vehicle for 30 minutes. The seed has two executive sedans, so a third booking for the same dates returns 409 BOOKING_OVERLAP. Run `npm run db:reset` to clear quotes and bookings.
- The collection must run in order: the booking request uses the quote saved by the first quote request.
- `POST /bookings` returns `payment_url: null` for now. The Tingg checkout link arrives with the payment module.
- A guest cannot book: bookings need a signed-in account (pack §24.6). Guests send an enquiry instead.
- Customer phone numbers must be in international format, for example `+254700000001`.
- The `x-job-secret` value is `INTERNAL_JOB_SECRET` from `.env.local`.
- `GET /classes` accepts `city` in the spec but ignores it for now, because classes are not tied to a city yet.
- `POST /quotes` takes three additions to the API spec: `delivery_zone_id` (needed for the delivery fee), `currency` (`KES` or `USD`, display only), and `service` (`rental` by default, or `airport_transfer`).
- Staff-created bookings never expire on their own, because staff manage them. With payments skipped, staff confirm a booking by hand and must give a note, for example the M-PESA reference.
- A walk-in customer gets an account with no password. They can claim it later with a password reset, once sign-in is built.
- Moving a booking to `ready` needs the customer's ID and driving licence verified and the booking's agreement verified. Customers upload their ID and licence, staff verify them, and the customer signs the agreement online, so a booking can reach `ready` through the API.
- `POST /enquiries` takes no `source` (it is always `form`), and `INSPECTION_REQUIRED` (422) is a new error code. Both are additions to the API spec.
- Sign-up and sign-in are done against Supabase Auth, not the API: the browser (and Postman) call `{{supabase_url}}/auth/v1/...` with the anon key, then send the access token to the API. Every account gets a customer profile automatically; only an admin can give a staff or admin role.
- Staff and admin must sign in with an authenticator app (second factor) on the API. For local development `apps/api/.env.local` sets `REQUIRE_STAFF_MFA=false`, because the seeded staff have no authenticator. Everywhere else it is true. The automated tests turn it on and use a real authenticator flow.
- Team invitations are emailed through the local Supabase mail catcher at `http://127.0.0.1:54324`.
- **Storage.** Files never pass through the API. The API gives a signed link (ten minutes, exact size and type), the browser uploads to the private bucket, then asks the API to confirm it. Locally the bucket is Supabase Storage (an S3-compatible stand-in for Cloudflare R2); `supabase/config.toml` creates it, and `npm run db:reset` makes sure it exists. Put the S3 URL and keys from `npx supabase status` in `apps/api/.env.local` as `R2_ENDPOINT`, `R2_REGION`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
- **Cancellation.** More than 24 hours before pickup the deposit is refundable in full; inside 24 hours nothing is refunded and the customer must acknowledge it. A booking whose deposit was never received has nothing to refund. The refund owed is recorded on the booking (`refund_due_kes`) until payments and refunds are built.
- **Changing dates.** Once, up to 24 hours before pickup, for a booking that is pending payment, confirmed, or ready. The price is worked out again from the rate table. A deposit already received stays as it was and the difference moves to the balance. Changing the pickup or delivery details is not supported yet.
- **Uploads are not scanned.** The API checks the declared type and exact size, not the file's contents. Scanning for malware is not built.
- Inspection files use the same signed-link upload: staff ask for links for a booking (`POST /staff/bookings/{id}/inspection-uploads`), upload, then save the report with the returned paths. The API only accepts paths under that booking's folder that really exist in storage.
- Staff and admin routes check the role from the user's profile. Required MFA for staff and admin is added with the account module.
- **Agreement and e-signature.** After staff confirm a booking, the customer reads it (`GET /bookings/{id}/agreement`: summary, numbered terms, a fingerprint, `can_sign`) and signs with `POST /bookings/{id}/agreement/sign`: `signed_name`, `accept_terms: true`, the `terms_sha256` they were shown (if the booking or the rules changed since, it is refused and they read it again), and optionally `signature_image` (a PNG as base64, no `data:` prefix, under about 60 KB). The API builds the signed PDF, stores it privately, and saves the signature and a verified `agreement` document together, which is what a booking needs before it can become `ready`. The customer opens the signed copy with `GET /documents/{id}/url`. `GET /bookings/{id}/agreement/pdf` is the unsigned copy to read or to print and sign at the office (staff then upload the scan as before). The signature records who, when, the address and device, and a snapshot of the terms and booking details, which staff see at `GET /staff/bookings/{id}/agreement`. Changing the dates voids the signature (the customer signs again); once a booking is `ready` its dates can no longer be changed online. Names with letters the PDF's standard fonts lack (for example Chinese) print as `?` in the PDF, while the exact name is kept in the record. The wording is a draft for the lawyer to review: it lives in `apps/api/src/services/agreement-terms.js`, and changing it means changing `AGREEMENT_VERSION`.
- **Phone numbers and enquiries.** A phone number is accepted from any country as long as it has the country code (`+44 20 7946 0958`, `+1 (415) 555-0132`, or `0044...`); spaces and dashes are removed and the number is saved as `+442079460958`. A number with no country code, such as `0712 345 678`, is refused because we cannot tell the country. The website enquiry needs an email address and the phone is optional; staff logging an enquiry from WhatsApp or a call need a phone or an email.
- **Admin data.** An admin enters everything the business runs on through `/admin/classes`, `/admin/rates`, `/admin/discounts`, `/admin/extras`, `/admin/delivery-zones`, `/admin/locations`, `/admin/settings/{key}` and `/admin/exchange-rates/USD`. Each kind has list, get, create and change (`PATCH`) routes. Nothing is deleted: switch a class off with `is_public`, a location with `is_served`, and extras, zones and discounts with `is_active`; end a rate with `effective_to`. To clear an optional value, send `null`. Prices are whole KES. Two rates for one class cannot cover the same day (409). A setting only accepts the kind of value it takes (a percent, a number of hours, on or off). Every change is in the audit log with who made it.
- **Emails.** Something happening (booking received, confirmed, ready, cancelled, expired, dates changed, a document rejected, an enquiry sent) saves a row in `notifications` in the same step, so no email is lost. `POST /internal/jobs/send-notifications` (every minute or two, from Cloudflare cron) sends them through ZeptoMail with a 10-second limit. A failed email is tried again later (see `apps/api/src/services/notification-retry.js`) and marked `failed` after the last attempt. With no `ZEPTOMAIL_TOKEN` (local development) emails simply stay queued and the job answers `skipped: true`. The wording is in `apps/api/src/services/notification-templates.js`. The address for new-enquiry alerts is the setting `staff_alert_email`; empty means no alert. Sign-in and invitation emails are Supabase's own and use ZeptoMail through Supabase's SMTP setting.
- Rate limiting is applied at Cloudflare and will be added in the app before launch.
