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
2. Create an API token limited to that bucket with Object Read and Write. Write includes delete, which the API uses to remove an uploaded file that is not what it claimed to be.
3. Add a CORS rule to the bucket so the browser can upload straight to it:
   - Allowed origins: the web app's address (and the staging address while testing).
   - Allowed methods: `PUT`, `GET`, `HEAD`.
   - Allowed headers: `Content-Type`, `Content-Length`.
   - Max age: 3600.
4. Note the account ID, the token's access key ID and secret, and the bucket name.
5. Create a second bucket for blog and guide images, and make it **public** through a custom domain (for example `media.example.com`). The same API token must cover it. Give it the same CORS rule, with only `PUT` and `HEAD` allowed from the web app's address. Only files under `blog/` are ever written to it.

## 3. Environment values for the API

Set these on the Oracle VM (or in `apps/api/.env.local` while testing). The template is `apps/api/.env.example`.

| Value | Where it comes from |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase, Settings, API |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BUCKET` | Cloudflare R2: the private bucket, and the public one for guide images |
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

## 5. Supabase Auth on the hosted project

Local values are looser (`supabase/config.toml`). On the hosted project, set these in the dashboard:

1. Site URL: the web app's address. Redirect URLs: the same address with `/**`.
2. Require email confirmation, a minimum password length of 8, and authenticator-app multi-factor.
3. Email templates: paste `supabase/templates/recovery.html` into "Reset password" and `supabase/templates/confirmation.html` into "Confirm signup". The reset email links to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`, a page that uses the link only when the person presses its button. The sign-up email carries a six-digit code (`{{ .Token }}`) that the person types on `/auth/verify-email`; keep the code length at 6.
4. Sending: SMTP through ZeptoMail, or reset and confirmation emails will not arrive at any volume.
5. Rate limits for sign-in and reset emails are set in the dashboard and at Cloudflare.

## 6. Web app on Cloudflare Workers (staging)

The web app runs as its own Worker, `carvo-web-staging`, built by `@opennextjs/cloudflare` from `apps/web`. The API stays its own Worker. The browser calls `/api/...` on the site's own address; the web Worker passes those calls to the API (`next.config.mjs`), so there is no cross-site call and no CORS rule to add.

1. The API Worker must already answer at `https://stage.api.carvo.co.ke`. Sign in to Cloudflare once with `npx wrangler login`.
2. Copy `apps/web/.env.example` to `apps/web/.env.production.local` and fill in the hosted values: `NEXT_PUBLIC_SITE_URL=https://stage.carvo.co.ke`, the hosted Supabase URL and anon key, the media base address, the Maps and PostHog keys, and `API_URL=https://stage.api.carvo.co.ke`. Every value here is public. If the web app later needs a server-side secret, set it with `npx wrangler secret put NAME --env staging` (run in `apps/web`).
3. Try it locally first: `npm run preview -w @carvo/web` serves the built Worker on http://localhost:8787.
4. Deploy: `npm run deploy:staging -w @carvo/web`. The first deploy creates the custom domain `stage.carvo.co.ke`, which needs the domain's DNS to be on Cloudflare. Change the name in `apps/web/wrangler.toml` if you use another address.
5. In Supabase Auth (section 5), set the Site URL to `https://stage.carvo.co.ke` and add `https://stage.carvo.co.ke/**` as a redirect URL. In the R2 CORS rules (section 2), allow the same address.
6. Check: the home page, `https://stage.carvo.co.ke/api/v1/health`, a car photo (served through Cloudflare Images), sign in and out, and an enquiry.

Good to know: the Worker is about 2.7 MiB compressed, under the free plan's 3 MiB limit but close, and production needs the paid plan anyway. There is no incremental cache yet, so pages that ask to `revalidate` read from the API each time. The adapter calls Node middleware (`proxy.js`) experimental, so test sign-in and the currency cookie again after upgrading Next.js or the adapter. Production needs its own `[env.production]` block and domain.

