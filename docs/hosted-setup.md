# Hosted Setup Checklist: Supabase and Cloudflare R2

What to set up before running the API against real services. Everything so far has been tested only against the local stack (local Supabase, with its storage standing in for R2). Do the proper tests on a staging project first, never production.

## 1. Supabase project

1. Create the project (staging first, then production). Pick the region closest to Johannesburg that offers what we need, and record the decision (open item in `docs/CLAUDE.md`). Production needs the Pro plan for daily backups.
2. Apply the schema from the repository, not by hand:

   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   This applies every file in `supabase/migrations/` in order. Do not run `supabase/seed.sql` on a hosted project: it creates fake accounts with a known password. It is for the local stack only.

3. Auth settings (Dashboard, Authentication):
   - Email sign-in on, and **confirm email** on.
   - Minimum password length 8 or more.
   - Multi-factor: enable the authenticator app (TOTP). Staff and admin cannot use the API without it.
   - SMTP: set the sender to ZeptoMail so sign-in, invitation, and password-reset emails are delivered.
   - Site URL and redirect URLs: the web app's address.
4. Keys (Dashboard, Settings, API): the project URL, the `anon` key (public), and the `service_role` key (secret: server only, never in the web app or the repository).
5. The first admin. Every new account is a customer, and only an admin can make staff. For the very first admin: sign up normally, then in the SQL editor run:

   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```

   Then enrol an authenticator app for that account. Everyone after that is invited through `POST /admin/staff`.

6. Real data. Enter it through the admin API (Postman folder **Admin data**), signed in as the admin with the second factor: vehicle classes, daily rates, locations, delivery zones, extras, discounts, settings, and the USD rate (`PUT /admin/exchange-rates/USD`; there is no automatic rate refresh yet). Then add vehicles with `POST /admin/vehicles`. Set `staff_alert_email` to the address that should hear about new enquiries. `supabase/seed.sql` is a guide to the fields, not something to run.

## 2. Cloudflare R2

1. Create a **private** bucket (no public access, no custom public domain).
2. Create an API token limited to that bucket with Object Read and Write.
3. Add a CORS rule to the bucket so the browser can upload straight to it:
   - Allowed origins: the web app's address (and the staging address while testing).
   - Allowed methods: `PUT`, `GET`, `HEAD`.
   - Allowed headers: `Content-Type`, `Content-Length`.
   - Max age: 3600.
4. Note the account ID, the token's access key ID and secret, and the bucket name.

## 3. Environment values for the API

Set these on the Oracle VM (or in `apps/api/.env.local` while testing). The template is `apps/api/.env.example`.

| Value | Where it comes from |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase, Settings, API |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Cloudflare R2 |
| `ZEPTOMAIL_TOKEN`, `ZEPTOMAIL_FROM` | ZeptoMail: the Send Mail token, and a sender address on a verified domain. Without them emails stay queued. |
| `INTERNAL_JOB_SECRET` | A long random string. The cron call must send it as `x-job-secret`. |
| `REQUIRE_STAFF_MFA` | `true`. Only the local file sets it to `false`. |

Leave `R2_ENDPOINT` and `R2_REGION` out: they are only for the local stand-in. The API then uses `https://<account>.r2.cloudflarestorage.com`.

## 4. Testing against hosted services

The automated tests (`npm run test:db`) empty tables and create fake accounts. They refuse to run against anything but the local stack. For a **throwaway staging** project only, set `ALLOW_REMOTE_TESTS=true`. They also expect the seeded test accounts, so they cannot run against a project with real data. Use Postman for manual checks against staging: point `base_url`, `supabase_url`, and `supabase_anon_key` in the environment file at it, and create the test accounts by signing up.

A short first test on staging:

1. `GET /api/v1/health`, then `GET /api/v1/classes` (needs real data from step 1.6).
2. Sign up, `GET /me`, then upload a document: start, PUT to the signed link, confirm. If the PUT fails in a browser but works in Postman, the bucket's CORS rule (step 2.3) is the cause.
3. Sign in as the admin with the second factor, invite a staff member, and open a document as staff.

## 5. Not covered by this checklist

Tingg payments and SMS are still to be built. The Caddy and Compose files for the Oracle VM are in `deploy/` (see `docs/deployment.md`). Cloudflare cron triggers must be created by you, each a `POST` with the header `x-job-secret`: `/api/v1/internal/jobs/expire-holds` every 5 minutes and `/api/v1/internal/jobs/send-notifications` every minute or two. Also not built: an automatic exchange-rate refresh.
