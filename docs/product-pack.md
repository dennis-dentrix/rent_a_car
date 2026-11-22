# Car Rental Platform — Product Documentation Pack

Nov 4, 2026 · @Dirant

## 1. Overview

A web platform that lets Kenyan customers find, quote, book, and manage car hire online, with executive rides as the lead offering. The office visit for signing and key handover, and home or office delivery, stay as options in the flow.

**The problem.** Good car hire companies are hard to find. Customers discover them through social media or word of mouth, then confirm everything by WhatsApp or phone before visiting an office.

**Target customers.**

- Executives and professionals who need chauffeur-driven or self-drive executive cars for days, airport transfers, or events.
- Companies that hire cars for staff, with monthly invoicing and named approvers.
- Individuals who book a car for a weekend or a short trip.

**What stays offline.**

- Signing the rental agreement at the office, with the customer present.
- Key handover and a physical vehicle inspection.
- Home or office delivery, with the driver completing the checklist with the customer.
- WhatsApp and phone enquiries, which feed into the same booking record.

**Product principle.** Online booking adds to the existing process. It does not replace the office or the driver.

**Languages.** English first, with Swahili as a later addition.

**Currency.** Kenyan shillings (KES). All prices include VAT where applicable; confirm the VAT position with the company's accountant.

**Open question.** Whether the company owns its whole fleet or also lists cars from independent owners. This changes the data model and the payout rules.

## 2. Product Requirements

**Goal.** Increase online bookings for executive rides by letting customers quote and book without a phone call, while keeping the office and delivery options.

**Success metrics (first 6 months after launch).**

| Metric                                            | Target             |
| ------------------------------------------------- | ------------------ |
| Online bookings per month                         | 60 by month 6      |
| Quote-to-booking conversion                       | 25%                |
| Bookings completed without a staff phone call     | 60%                |
| Share of bookings using office pickup or delivery | Tracked, no target |
| Average time from quote to confirmed booking      | Under 15 minutes   |
| Customer rating after return                      | 4.5 out of 5       |

**Personas.**

- **Executive customer (Amina):** books a chauffeur for two days, wants a price quote in one screen, and pays by M-PESA.
- **Corporate admin (Kevin):** books cars for six staff, needs one monthly invoice and an approval step.
- **Front-desk staff (Grace):** handles walk-ins and phone calls, needs to see every booking in one place.
- **Operations manager (Peter):** assigns vehicles and drivers, and plans deliveries.

**In scope for MVP.**

1. Public listings of vehicle classes with prices, filtered by city, airport, and dates.
2. Instant quote with duration, extras, and delivery options.
3. Booking and deposit payment through Tingg (M-PESA, card, bank).
4. Customer account, with upload of national ID and driving licence.
5. Rental agreement generated as a PDF and signed electronically or at the office.
6. Office pickup and delivery to home or office, with a time window.
7. Staff dashboard for bookings, documents, fleet, and drivers.
8. Booking changes, cancellations, and refunds within the policy in section 8.
9. Email and SMS notifications at each booking stage.

**Out of scope for MVP.**

- Peer-to-peer listings from private car owners.
- Native mobile apps (the web app is mobile-responsive).
- Automated damage detection from photos.
- Loyalty programme.
- Swahili interface.

**Key user flows.** Detailed in section 3 and section 8.

1. Browse, quote, pay deposit, verify documents, sign agreement, collect or receive delivery, return.
2. Corporate account: invite staff, approve bookings, receive monthly statement.
3. Staff: confirm a WhatsApp enquiry, convert it into a booking, record payment, assign a vehicle.

**Non-functional requirements.**

- Page load under 2.5 seconds on a 4G connection in Nairobi.
- Booking availability checked in real time before payment.
- Uptime target of 99.5 percent a month.
- All customer data stored in Supabase in an AWS region with a documented data-residency decision (see section 6).
- Accessible to WCAG 2.1 AA.

**Dependencies.** Tingg merchant account, M-PESA approval through Tingg, ZeptoMail and Mobile Sasa accounts, and a lawyer to review the rental agreement template.

## 3. Design Principles

The interface borrows Apple's approach: clarity first, deference to content, and calm, confident motion. The customer should always know the price, the next step, and what they owe.

**Five principles.**

1. **Clarity.** One primary action per screen. Prices, dates, and deposits are large and unambiguous.
2. **Deference.** The vehicle photos and listings lead. Chrome (navigation, buttons, panels) stays quiet.
3. **Depth.** Subtle layers and blur show what is secondary, such as a quote summary sheet over a listing.
4. **Consistency.** The same component does the same thing everywhere. A date picker looks the same on the homepage and in the staff app.
5. **Respect.** Clear language, no dark patterns, no hidden fees, and a visible way to talk to a person.

**Visual language.**

| Element             | Guideline                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typography          | System font stack (SF Pro on Apple devices, system UI elsewhere). Clear hierarchy: one large title per screen, body at 16px minimum.                   |
| Colour              | Neutral base (near-white and near-black), one accent colour for primary actions, and semantic colours for success, warning, and error. Full dark mode. |
| Corners and spacing | Generous whitespace. Consistent corner radii (12px for cards, 8px for controls). An 8px spacing grid.                                                  |
| Imagery             | Real photos of the cars, cropped consistently, on a neutral background. Show the actual vehicle, not stock images.                                     |
| Motion              | Short, purposeful transitions (150 to 250 ms). Respect the reduced-motion setting.                                                                     |
| Icons               | One consistent line-icon set. Icons support text labels; they do not replace them on key actions.                                                      |
| Sheets and dialogs  | Bottom sheets on mobile, centred panels on desktop. Confirm irreversible actions with a clear summary.                                                 |

**Writing style.**

- Short sentences. Plain Kenyan English.
- Say what happens next: "We will send your agreement by email within 10 minutes."
- Avoid jargon such as "KYC" in customer-facing text; use "Verify your identity."
- Money is always shown as "KES 12,500 per day" with the total before payment.

**Accessibility.** WCAG 2.1 AA contrast, full keyboard navigation, visible focus states, and labels on every form field.

**Design deliverables.** A Figma file with the components and the tokens (colour, type, spacing), reviewed against these principles before development starts.

**Open question.** Whether the brand has its own accent colour and logo. The design system will be built around them.

## 4. Information Architecture and Screens

There are three areas: a public site, a customer account, and a staff workspace. Each has its own navigation.

**Public site**

| Screen                 | Purpose                | Key content                                                     |
| ---------------------- | ---------------------- | --------------------------------------------------------------- |
| Home                   | Entry point and search | Search by city, airport, and dates; featured executive vehicles |
| Vehicle classes        | Browse                 | Filters for class, seats, transmission, driver included         |
| Vehicle detail         | Decide                 | Photos, specs, price per day, included items, "Get a quote"     |
| City and airport pages | Search visibility      | Local intro, vehicle classes, FAQs; server-rendered for SEO     |
| How it works           | Trust                  | Steps, office and delivery options, what to bring               |
| Contact                | Human help             | WhatsApp button, phone, office hours, map                       |

**Booking flow (customer)**

| Step | Screen       | Notes                                                            |
| ---- | ------------ | ---------------------------------------------------------------- |
| 1    | Quote        | Pick dates, pickup point, and extras; price updates live         |
| 2    | Details      | Name, phone, email; company option                               |
| 3    | Verify       | Upload ID and driving licence (can be done later, before pickup) |
| 4    | Pay deposit  | Tingg checkout: M-PESA, card, or bank                            |
| 5    | Agreement    | Read and sign the rental agreement; or choose "sign at office"   |
| 6    | Handover     | Choose office pickup or delivery; time window; confirmation      |
| 7    | Booking page | Status, documents, change or cancel, contact driver              |

**Customer account**

- My bookings: upcoming, active, past.
- Documents: uploaded IDs and licences, signed agreements, receipts.
- Payments: deposits, balances, refunds.
- Profile and saved company details.

**Corporate account**

- Company profile and billing details.
- Staff list with roles: requester, approver, admin.
- Approval queue for bookings above a set amount.
- Monthly statement and invoice downloads.

**Staff workspace**

| Screen                 | Users                  | Purpose                                                         |
| ---------------------- | ---------------------- | --------------------------------------------------------------- |
| Booking inbox          | Front desk             | All bookings by status, with filters for today and tomorrow     |
| Booking detail         | Front desk, operations | Customer, vehicle, documents, payments, timeline of changes     |
| Quick booking          | Front desk             | Create a booking from a WhatsApp or phone enquiry               |
| Fleet calendar         | Operations             | Vehicle availability, maintenance blocks, drop-offs             |
| Drivers and deliveries | Operations             | Assign drivers, print the day's delivery list                   |
| Document review        | Front desk             | Approve or reject uploaded ID and licence                       |
| Customers              | Front desk             | Search, history, notes; no document download without permission |
| Reports                | Management             | Utilisation, revenue by class, repeat customers                 |
| Settings               | Admin                  | Prices, deposit rules, office hours, staff roles                |

**Navigation rules.**

- Navigation is at most two levels deep. Sub-items sit one level below their parent and are indented under its label.
- On desktop, the staff sidebar collapses to an icon rail by default. It is hidden only on narrow screens (below 768 px), opened from a menu button. Hidden navigation gets used about half as often as a visible rail.
- Rows are 32 px tall, labels 14 px, section headings 12 px. An 8 px grid sets the spacing.
- Links navigate and change the URL. Buttons toggle, and never change the URL.
- An active item gets a second signal besides fill: a 2 px accent bar on its leading edge, plus a bold label.
- Customers on mobile use a bottom bar with three items: Search, Bookings, Account.
- Every booking in the staff workspace is reachable from one search box.

**Open question.** Whether drivers need their own login. For the MVP, the operations manager can share a delivery list by print or WhatsApp.

## 5. Data Model

All tables live in one Supabase Postgres database. Every table has `id` (uuid), `created_at`, and `updated_at`. Row Level Security is on for every table.

**Core tables**

| Table                   | Key fields                                                                                                                                            | Relationships                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `profiles`              | user\_id, full\_name, phone, role (customer, staff, admin), company\_id                                                                               | One per auth user                           |
| `companies`             | name, kra\_pin, billing\_email, credit\_terms\_days                                                                                                   | Has many profiles and bookings              |
| `vehicle_classes`       | name (Executive, SUV, Minibus), seats, description                                                                                                    | Has many vehicles and rates                 |
| `vehicles`              | registration, make, model, class\_id, status (active, maintenance, retired), mileage                                                                  | Belongs to a class; has many bookings       |
| `rates`                 | class\_id, duration\_type (day, week), price\_kes, effective\_from, effective\_to                                                                     | Belongs to a class                          |
| `extras`                | name (driver, child seat, airport meet), price\_kes, pricing\_type                                                                                    | Used by quotes and bookings                 |
| `locations`             | name, type (office, airport, custom), address, delivery\_zone                                                                                         | Pickup and return points                    |
| `quotes`                | customer\_id or email, vehicle\_class\_id, start\_at, end\_at, pickup\_location\_id, total\_kes, expires\_at                                          | Converts into a booking                     |
| `bookings`              | reference, customer\_id, company\_id, vehicle\_id, class\_id, start\_at, end\_at, status, handover\_type (office, delivery), total\_kes, deposit\_kes | Has many payments, documents, status events |
| `booking_status_events` | booking\_id, from\_status, to\_status, actor\_id, note, created\_at                                                                                   | Audit trail; append-only                    |
| `payments`              | booking\_id, provider (tingg), provider\_reference, method (mpesa, card, bank), amount\_kes, status, paid\_at                                         | Belongs to a booking                        |
| `refunds`               | payment\_id, amount\_kes, reason, status, approved\_by                                                                                                | Belongs to a payment                        |
| `documents`             | owner\_id, booking\_id, type (national\_id, driving\_licence, agreement, receipt), storage\_path, verified\_by, verified\_at, status                  | Private storage objects                     |
| `deliveries`            | booking\_id, address, time\_window\_start, time\_window\_end, driver\_id, status, checklist\_json                                                     | Belongs to a booking                        |
| `drivers`               | name, phone, licence\_number, active                                                                                                                  | Has many deliveries                         |
| `enquiries`             | source (whatsapp, phone, form), name, phone, message, converted\_booking\_id                                                                          | Turns into a quote or booking               |
| `invoices`              | company\_id, period\_start, period\_end, total\_kes, status, etr\_reference                                                                           | Monthly for companies                       |

**Booking status**

| Status            | Meaning                                 | Next statuses                |
| ----------------- | --------------------------------------- | ---------------------------- |
| `quoted`          | Quote created, not paid                 | `pending_payment`, `expired` |
| `pending_payment` | Booking held, waiting for deposit       | `confirmed`, `cancelled`     |
| `confirmed`       | Deposit paid, documents pending         | `ready`, `cancelled`         |
| `ready`           | Documents verified and agreement signed | `active`, `cancelled`        |
| `active`          | Vehicle handed over                     | `returned`                   |
| `returned`        | Vehicle back, final checks done         | `closed`                     |
| `closed`          | Balance settled, invoice issued         | none                         |
| `cancelled`       | Cancelled under the policy in section 8 | none                         |
| `expired`         | Quote or held booking not paid in time  | none                         |

**Rules**

- A vehicle cannot have two overlapping bookings in `confirmed`, `ready`, or `active`. Enforce this with a Postgres exclusion constraint on the date range.
- Prices are stored at booking time. Later rate changes do not alter existing bookings.
- Documents are never deleted; they are replaced and the old version is kept with its status.
- Staff changes write a row to `booking_status_events` in the same transaction.

**Storage buckets**

- `documents-private`: IDs, licences, agreements, receipts. Private. Accessed through signed URLs that expire after 10 minutes.
- `vehicle-photos`: public read, staff write.

**Open question.** Whether ETR (eTIMS) receipts are needed at launch. The `invoices` table has a placeholder field so it can be added without a migration of existing data.

## 6. Technical Architecture and Integrations

One Next.js application on Vercel, with Supabase for data, auth, and file storage. Cloudflare sits in front for DNS and firewall rules. Each external service is reached from the server, never directly from the browser.

**Components**

| Component                  | Provider                           | Role                                                                  |
| -------------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| Web app and API routes     | Vercel (Next.js, TypeScript)       | Public site, customer account, staff workspace, webhooks              |
| Database, auth, storage    | Supabase (Postgres, Auth, Storage) | Data with RLS, login, private documents                               |
| DNS, firewall, rate limits | Cloudflare                         | Domain, DDoS protection, rate limiting on login and booking endpoints |
| Payments                   | Tingg by Cellulant                 | Card, M-PESA, and bank deposits and balances; refunds                 |
| Email                      | ZeptoMail                          | Booking confirmations, agreements, receipts                           |
| SMS                        | Mobile Sasa                        | Pickup reminders, delivery time windows, one-time codes               |
| Scheduled jobs             | Vercel Cron                        | Expire unpaid holds, return reminders, daily reconciliation           |
| Error tracking             | Sentry                             | Server and browser errors                                             |
| Source and CI              | GitHub, GitHub Actions             | Code, tests, type checks, preview deployments                         |

**Request path.** Browser to Cloudflare, then Vercel, then Next.js server code, which talks to Supabase with the user's session. Payment webhooks arrive at a dedicated API route and are verified before any change to a booking.

**Integration rules**

- Store every provider reference (Tingg transaction ID, email message ID) on the matching row.
- Verify webhook signatures before reading the payload.
- Make webhook handlers idempotent. Store each provider event ID and skip repeats.
- Put provider keys in Vercel environment variables. Keep test and live keys separate.
- Never call a payment API from the browser.

**Environments**

| Environment | Purpose                           | Data                                |
| ----------- | --------------------------------- | ----------------------------------- |
| Local       | Development                       | Seed data only                      |
| Preview     | Each pull request                 | Supabase branch database, seed data |
| Staging     | Client testing with Tingg sandbox | Anonymised copy of seed data        |
| Production  | Live bookings                     | Real data, backups on               |

**Backups and recovery.** Supabase daily backups on the Pro plan. Restore tested once before launch, and again every quarter.

**Open questions**

- Supabase region. Confirm the closest region to Nairobi that offers the features needed, and record the decision.
- Whether Tingg's sandbox supports deposits, refunds, and payouts the way production does. Confirm with Cellulant before development of the payment module.

## 7. Security, Privacy, and Data Protection

The platform holds national ID numbers, driving licence scans, and payment references. Security decisions favour the built-in protections of the platform over custom code.

**Legal baseline.** Kenya's Data Protection Act, 2019 applies. Before launch, confirm with a lawyer: registration as a data controller with the Office of the Data Protection Commissioner, a privacy notice, consent wording at sign-up, and a retention schedule.

**Access control**

- Row Level Security on every table. Customers read only their own bookings, documents, and payments.
- Staff roles are stored in `profiles.role`. Policies check the role; the browser never decides access.
- The Supabase `service_role` key is used only in server code and never shipped to the browser.
- Staff and admin accounts require multi-factor authentication.
- Sessions expire after a set idle period. Staff sessions expire sooner.
- Every staff read of a national ID or licence is logged with the user, time, and reason.

**Document handling**

- Uploads are checked for file type and size before storage. Accept JPG, PNG, and PDF up to 10 MB.
- Files go to the private bucket and are never linked publicly.
- Viewing uses a signed URL that expires after 10 minutes.
- Document review (approve or reject) is recorded with the reviewer and date.
- Retention: keep identity and rental records for the period the law requires; confirm the period with the lawyer. Delete or anonymise after that.

**Payments**

- Card data never touches the platform. Tingg's hosted checkout handles card and M-PESA entry.
- Amounts are calculated on the server from the rate table. The browser's amount is never trusted.
- Webhooks are verified and idempotent (see section 6).
- Refunds need approval from a second staff member above a set amount.

**Application security**

- Input validation with Zod on every API route.
- Rate limits on login, OTP, quote, and booking endpoints, enforced at Cloudflare and in the app.
- Dependency updates through Dependabot, and a security review before each major release.
- Secrets only in Vercel environment variables. Nothing committed to Git. A pre-commit scan checks for keys.
- A security headers policy (Content Security Policy, HSTS, no framing).

**Privacy in the product**

- Collect only what a booking needs.
- Customers can download their data and request deletion. Deletion is blocked while a booking or legal record is open.
- No marketing messages without explicit opt-in.
- Privacy notice linked from every form that collects personal data.

**Incident response.** Written plan with named owners: contain, assess, notify the regulator within the period the law sets, notify affected customers, and record the lessons.

**Open questions.** Whether customers need a password or only one-time codes by SMS. Recommendation: one-time codes for the MVP, with passkeys later.

## 8. Booking, Pricing, and Cancellation Rules

These are proposed defaults. The owner confirms each number before launch; the system reads them from the Settings screen, so changing a value needs no code change.

**Pricing**

| Rule                   | Proposed default                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| Daily rate             | Set per vehicle class, in KES                                                                      |
| Weekly rate            | Seven daily rates less a discount of 10 percent                                                    |
| Minimum hire           | 1 day                                                                                              |
| Late return            | Charged per hour after a 30-minute grace period, up to one day's rate                              |
| Fuel policy            | Return with the same fuel level; otherwise the difference is charged at a set fuel price per litre |
| Mileage                | Unlimited within Kenya, unless the class says otherwise                                            |
| Delivery               | Fixed fee per zone (for example, Nairobi CBD, Nairobi suburbs, Airport)                            |
| Airport meet and greet | Fixed fee per booking                                                                              |
| Driver                 | Per day, added to the class rate when chosen                                                       |
| VAT                    | Shown separately; confirm treatment with the accountant                                            |

**Worked example.** An executive sedan at KES 12,500 per day, booked for 3 days, with a driver at KES 2,000 per day and delivery to Westlands at KES 1,500:

- Vehicle: 3 × KES 12,500 = KES 37,500
- Driver: 3 × KES 2,000 = KES 6,000
- Delivery: KES 1,500
- Total before VAT: KES 45,000
- Deposit at 30 percent of total: KES 13,500

The worked example is illustrative. The real numbers come from the rate table.

**Deposits and payment**

- Deposit is due within 30 minutes of quote acceptance, or the hold expires.
- Balance is due before handover, or at the office for corporate accounts on credit terms.
- Companies with approved credit pay on invoice (net 14 to 30 days, to be agreed).
- Security deposit (refundable hold on the card or M-PESA): owner to decide; optional for the MVP.

**Cancellation (customer)**

| Time before pickup | Refund of deposit |
| ------------------ | ----------------- |
| More than 72 hours | 100 percent       |
| 24 to 72 hours     | 50 percent        |
| Less than 24 hours | None              |
| No-show            | None              |

**Changes.** A date change is free once, up to 24 hours before pickup, if the vehicle is free. Other changes are priced again from the rate table.

**Business rules**

- Age and licence: minimum age and years of licence held are set per class (proposed: 25 years and 3 years of licence for executive cars).
- Only the named driver may drive, unless an additional driver is added and verified.
- Cars leave only after documents are verified and the agreement is signed.
- Damage and excess follow the agreement. The system records the amount; it does not decide liability.

**Open questions for the owner**

- Confirm each rate and the VAT treatment.
- Confirm the cancellation table.
- Confirm the minimum age and licence years, and whether a security deposit applies.

## 9. Testing and Quality

The booking flow and money logic are tested before anything else. A wrong price or a double-booked car is the failure that matters most.

**Test layers**

| Layer         | Tool                                                    | What it covers                                                                  |
| ------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Unit          | Vitest                                                  | Pricing engine, date and overlap rules, status transitions, refund calculations |
| Integration   | Vitest with a Supabase test branch                      | RLS policies per role, booking creation, constraint on overlapping bookings     |
| Webhook       | Vitest with recorded payloads                           | Tingg signature check, idempotent repeat handling, status updates               |
| End to end    | Playwright                                              | Quote to booking, deposit, document upload, staff confirmation                  |
| Accessibility | axe in Playwright, manual screen-reader check           | WCAG 2.1 AA on key screens                                                      |
| Performance   | Lighthouse CI                                           | Page load budget on 4G simulation                                               |
| Security      | Dependency scan, RLS review, manual test of role access | Access control and secrets                                                      |

**Acceptance criteria for the MVP**

- A quote for any class and date range matches the rate table to the shilling, including extras and delivery.
- Two customers cannot book the same vehicle for overlapping dates; the second attempt fails with a clear message.
- A deposit payment marks the booking `confirmed` once, even if Tingg sends the webhook twice.
- A customer cannot read another customer's document through any URL or API call.
- A staff member without the admin role cannot change prices.
- A cancellation inside 24 hours produces no refund and an audit entry.
- Booking confirmation email and SMS are sent within 2 minutes of payment.
- The office pickup and delivery options both produce a correct handover record.

**Test data.** A seed script creates vehicles, classes, rates, customers, and bookings in each status. No real national ID numbers are used in test data.

**Test devices.** Latest iOS and Android browsers, Chrome and Safari on desktop, and one low-end Android phone on a throttled connection.

**Pilot.** Two weeks with real staff and five to ten real customers, with bookings taken in parallel with the phone and WhatsApp process. Compare errors and time to confirm.

**Defect rule.** Any defect in pricing, availability, payment, or document access blocks release. Cosmetic defects can ship with a ticket.

**Definition of done.** Code reviewed, tests passing, RLS policy written and tested for the feature, copy checked against the style guide, and the feature working on a preview deployment.

## 10. Launch, Operations, and Support

The launch runs alongside the current process for the first two weeks. No customer is turned away from the office or the phone.

**Launch checklist**

- [ ] Legal: rental agreement template reviewed by a lawyer.
- [ ] Legal: privacy notice, consent wording, and data retention schedule approved.
- [ ] Legal: data controller registration with the Data Protection Commissioner, if required.
- [ ] Payments: Tingg live account approved; M-PESA and card tested with small real amounts.
- [ ] Payments: refund and cancellation flow tested in live mode with a staff member.
- [ ] Data: vehicle list, classes, rates, and office locations entered and checked by the owner.
- [ ] Data: Supabase Pro plan active; backup restore tested.
- [ ] Security: RLS review passed; admin accounts use MFA.
- [ ] Notifications: email and SMS templates approved; sender names registered.
- [ ] Monitoring: Sentry alerts and an on-call rota set.
- [ ] Staff: training done on the booking inbox and manual booking.
- [ ] Support: WhatsApp support number and hours published on the site.
- [ ] Pilot: two weeks of parallel running completed, with issues closed.

**Rollout**

1. Internal: staff only, with real bookings taken in parallel.
2. Pilot: invite-only link for ten existing customers.
3. Public: listing live, with the company's social media pointing to the site.
4. Growth: city and airport pages, and corporate sign-up campaign.

**Operations runbook**

| Task                                            | Frequency                         | Owner               |
| ----------------------------------------------- | --------------------------------- | ------------------- |
| Check booking inbox for new and unpaid bookings | Every 2 hours during office hours | Front desk          |
| Review uploaded documents                       | Same day                          | Front desk          |
| Print or send the next day's delivery list      | Daily, 5pm                        | Operations          |
| Reconcile Tingg payments against bookings       | Daily                             | Finance or owner    |
| Review failed webhooks and jobs                 | Daily                             | Developer           |
| Check backups and restore status                | Weekly                            | Developer           |
| Rotate keys and review staff accounts           | Quarterly                         | Owner and developer |
| Test incident plan                              | Twice a year                      | Owner and developer |

**Support**

- Customers: WhatsApp for quick questions, phone during office hours, email for documents and disputes.
- Response targets: WhatsApp within 1 hour in office hours; email within 1 working day.
- Staff can answer from the booking page without switching tools.

**Ownership after launch.** One named developer owns the platform. The owner signs off on prices, policies, and any change to the agreement.

**Success review.** Monthly review of the metrics in section 2, with decisions recorded in the roadmap.

## 11. Roadmap, Risks, and Open Questions

The MVP targets the 4 to 6 week build in the earlier plan, followed by a pilot. Dates depend on when the owner confirms the open questions below.

**Roadmap**

| Phase                      | Scope                                                         | Gate to next phase                                      |
| -------------------------- | ------------------------------------------------------------- | ------------------------------------------------------- |
| 0. Foundations             | Repo, CI, Supabase project, design tokens, auth               | Login works for three roles; RLS tests pass             |
| 1. Catalogue and quotes    | Listings, pricing engine, quote flow, city pages              | Pricing tests pass against the rate table               |
| 2. Booking and payment     | Booking records, Tingg checkout, webhooks, overlap rule       | Double-booking test and webhook test pass               |
| 3. Documents and agreement | Uploads, verification, agreement PDF, e-sign or office sign   | Document access test passes                             |
| 4. Handover and staff      | Staff workspace, delivery lists, office and delivery handover | Pilot runs two weeks with no pricing or payment defects |
| 5. Launch and growth       | Public launch, notifications, corporate accounts              | Launch checklist complete (section 10)                  |
| 6. After launch            | Corporate invoicing, reports, reviews, passkeys               | Monthly metrics reviewed                                |

**Risks**

| Risk                                                       | Likelihood | Impact | Mitigation                                                                     |
| ---------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------ |
| Staff do not use the booking inbox and keep using WhatsApp | Medium     | High   | Quick booking screen from enquiries; owner requires all bookings in the system |
| Pricing errors before rate table is complete               | Medium     | High   | Owner signs off rate table; pricing tests; launch only after pilot             |
| Tingg sandbox behaves differently from production          | Medium     | Medium | Test with small live amounts before launch                                     |
| Customers abandon at document upload                       | High       | Medium | Let customers verify later, before pickup; office can verify in person         |
| Legal or data protection gaps                              | Medium     | High   | Lawyer review before launch; retention schedule approved                       |
| Supply of vehicles changes faster than listings            | High       | Medium | Staff can mark a vehicle unavailable; nightly availability sync reminder       |
| Overlapping bookings from phone and online                 | Medium     | High   | Single booking record; overlap constraint in the database                      |
| Supabase or Vercel outage                                  | Low        | High   | Status page monitoring; clear customer message; office process continues       |

**Open questions (blocking)**

- [ ] Owned fleet only, or independent owners also listed?
- [ ] Final rates, VAT treatment, and cancellation policy.
- [ ] Minimum driver age and licence years.
- [ ] Security deposit: yes or no.
- [ ] Does the rental agreement need e-signature at launch, or is a signed upload enough?
- [ ] ETR (eTIMS) receipts required at launch?
- [ ] Brand colour and logo.
- [ ] Supabase region and data residency decision.

**Open questions (non-blocking)**

- [ ] Driver logins, or shared delivery lists for the MVP?
- [ ] Swahili interface timing.
- [ ] Loyalty programme for repeat customers.

**Document owners**

The owner approves product, pricing, and policy sections. The developer owns architecture, security, and operations. Both review this pack before development starts, and again before launch.

## 12. API Contract

All endpoints live under `/api/v1`. Responses are JSON. Every request that changes data needs a valid Supabase session, except the public read endpoints in the table.

**Conventions**

- Authentication: `Authorization: Bearer <supabase access token>`. The server checks the token on every protected route.
- Money is an integer in KES. There are no decimals in the API.
- Dates are ISO 8601 in UTC, with the timezone offset (for example `2026-11-10T06:00:00+03:00`). The server converts to Nairobi time for display.
- Lists use cursor pagination: `?limit=20&cursor=<opaque>`. Default limit 20, maximum 100.
- Every write accepts an `Idempotency-Key` header. Repeating a request with the same key returns the first response.
- Errors use one shape:

```json
{
  "error": {
    "code": "BOOKING_OVERLAP",
    "message": "This vehicle is already booked for those dates.",
    "details": {}
  }
}
```

- Status codes: 200 read or update, 201 created, 400 invalid input, 401 not signed in, 403 role not allowed, 404 not found, 409 conflict, 422 business rule failed, 429 rate limited.

**Error codes**

| Code                        | HTTP | Meaning                                                                            |
| --------------------------- | ---- | ---------------------------------------------------------------------------------- |
| `VALIDATION_FAILED`         | 400  | Input did not match the schema; `details` lists the fields                         |
| `UNAUTHENTICATED`           | 401  | No valid session                                                                   |
| `FORBIDDEN`                 | 403  | Signed in, but the role cannot do this                                             |
| `NOT_FOUND`                 | 404  | No record, or the caller cannot see it (same response, to avoid leaking existence) |
| `BOOKING_OVERLAP`           | 409  | Vehicle is already booked for the dates                                            |
| `QUOTE_EXPIRED`             | 422  | Quote is older than its expiry time; request a new quote                           |
| `INVALID_STATUS_TRANSITION` | 422  | Status change not allowed from the current status                                  |
| `DOCUMENTS_NOT_VERIFIED`    | 422  | Booking cannot move to `ready` until documents are verified                        |
| `PAYMENT_FAILED`            | 422  | Provider declined or cancelled the payment                                         |
| `RATE_LIMITED`              | 429  | Too many requests; `Retry-After` header set                                        |

**Public endpoints (no login)**

| Method and path     | Purpose                               | Request                                                                        | Response                                            |
| ------------------- | ------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| `GET /classes`      | List vehicle classes with daily rates | `?city=`, `?from=`, `?to=`                                                     | Array of classes with `price_per_day_kes`           |
| `GET /classes/{id}` | One class with included items         | none                                                                           | Class detail and photos                             |
| `GET /locations`    | Offices, airports, and delivery zones | none                                                                           | Array of locations                                  |
| `POST /quotes`      | Create a quote (rate-limited)         | `class_id`, `start_at`, `end_at`, `pickup_location_id`, `extras[]`, `delivery` | Quote with `total_kes`, `deposit_kes`, `expires_at` |
| `GET /availability` | Check a class for dates               | `class_id`, `start_at`, `end_at`                                               | `{available: true or false, count}`                 |
| `POST /enquiries`   | WhatsApp, phone, or form enquiry      | `name`, `phone`, `message`, `source`                                           | `201` with enquiry id                               |

**Customer endpoints (role: customer)**

| Method and path                | Purpose                                           | Notes                                                              |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------ |
| `POST /bookings`               | Turn an unexpired quote into a booking            | Holds the vehicle; returns `pending_payment` and a payment session |
| `GET /bookings`                | List own bookings                                 | Filter by `status`                                                 |
| `GET /bookings/{id}`           | Booking detail, status events, documents          | Own bookings only                                                  |
| `POST /bookings/{id}/cancel`   | Cancel under the policy in section 8              | Returns the refund amount                                          |
| `PATCH /bookings/{id}`         | Change dates or handover type                     | Re-prices; may return `QUOTE_EXPIRED`                              |
| `POST /bookings/{id}/payments` | Start a Tingg checkout for the deposit or balance | Returns a redirect URL                                             |
| `POST /documents`              | Request an upload URL                             | Body: `type`, `booking_id` (optional); returns a signed upload URL |
| `GET /documents/{id}/url`      | Short-lived view URL                              | Expires in 10 minutes                                              |
| `GET /me`                      | Current profile and company                       | none                                                               |

**Staff endpoints (role: staff or admin)**

| Method and path                     | Purpose                                      | Notes                                                    |
| ----------------------------------- | -------------------------------------------- | -------------------------------------------------------- |
| `GET /staff/bookings`               | Booking inbox                                | Filters: `status`, `date`, `handover_type`               |
| `POST /staff/bookings`              | Create a booking from an enquiry             | Records the actor on the status event                    |
| `PATCH /staff/bookings/{id}/status` | Move a booking to the next status            | Body: `to_status`, `note`; enforces the transition table |
| `POST /staff/bookings/{id}/assign`  | Assign a vehicle and, for delivery, a driver | Runs the overlap check                                   |
| `PATCH /staff/documents/{id}`       | Approve or reject a document                 | Body: `status`, `reason`; records the reviewer           |
| `GET /staff/documents/{id}/url`     | View a customer document                     | Logs the reader, time, and reason                        |
| `GET /staff/deliveries`             | Delivery list for a day                      | Filter: `date`                                           |
| `PATCH /staff/deliveries/{id}`      | Update delivery status and checklist         | Body: `status`, `checklist`                              |

**Admin endpoints (role: admin)**

| Method and path                  | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| `PUT /admin/rates`               | Replace the rate for a class with effect from a date |
| `POST /admin/refunds`            | Approve a refund above the threshold                 |
| `PATCH /admin/vehicles/{id}`     | Change vehicle status (active, maintenance, retired) |
| `GET /admin/reports/utilisation` | Utilisation by vehicle and class                     |

**Webhooks (no session; signature verified)**

| Method and path        | Source | Purpose                                                                  |
| ---------------------- | ------ | ------------------------------------------------------------------------ |
| `POST /webhooks/tingg` | Tingg  | Payment success, failure, or refund; idempotent on the provider event id |

**Rules**

- Every route validates input with the shared Zod schema for that endpoint. The same schema is used by the browser form.
- Route handlers call a service function. They do not query the database directly.
- Prices in responses come from the pricing service only.
- Changing a booking status always goes through the transition table in section 5.

**Open question.** Whether the public quote endpoint needs CAPTCHA at launch, or rate limits alone are enough.

## 13. Access Control Matrix

This matrix is the source for the Row Level Security policies. Write the policies from this table, then test each cell. Any cell not listed is denied.

**Roles**

| Role               | Who                                | How it is assigned                                      |
| ------------------ | ---------------------------------- | ------------------------------------------------------- |
| Guest              | Anyone without an account          | No session                                              |
| Customer           | Individual who books               | Self sign-up                                            |
| Corporate approver | Company staff who approve bookings | Invited by the company admin; `profiles.company_id` set |
| Staff              | Front desk and operations          | Invited by admin; MFA required                          |
| Admin              | Owner and trusted manager          | Set by the owner; MFA required                          |

**Codes**

- `R` read all rows
- `O` read and write only own rows (`customer_id = auth.uid()`)
- `C` read rows where `company_id` matches the caller's company
- `W` read and write
- `A` approve or reject (writes a decision row)
- `-` no access

**Matrix**

| Table                       | Guest | Customer                   | Corporate approver               | Staff           | Admin       |
| --------------------------- | ----- | -------------------------- | -------------------------------- | --------------- | ----------- |
| `vehicle_classes`           | R     | R                          | R                                | R               | W           |
| `rates`                     | R     | R                          | R                                | R               | W           |
| `extras`                    | R     | R                          | R                                | R               | W           |
| `locations`                 | R     | R                          | R                                | R               | W           |
| `vehicles`                  | -     | -                          | -                                | R               | W           |
| `quotes`                    | -     | O                          | C                                | R               | R           |
| `bookings`                  | -     | O                          | C                                | W               | W           |
| `booking_status_events`     | -     | O (read only)              | C (read only)                    | W (insert only) | R           |
| `payments`                  | -     | O (read only)              | C (read only)                    | W               | R           |
| `refunds`                   | -     | O (read only)              | -                                | W (request)     | A (approve) |
| `documents` (metadata)      | -     | O                          | C (read only)                    | R               | R           |
| `documents` (verify status) | -     | -                          | -                                | A               | A           |
| `deliveries`                | -     | O (read only)              | C (read only)                    | W               | R           |
| `drivers`                   | -     | -                          | -                                | R               | W           |
| `enquiries`                 | -     | -                          | -                                | W               | R           |
| `invoices`                  | -     | O (read only)              | C (read only)                    | R               | W           |
| `companies`                 | -     | O (own company, read only) | C (read; edit own staff list)    | W               | W           |
| `profiles`                  | -     | O                          | O (own; company staff list read) | R               | W           |

**Storage**

| Bucket              | Guest | Customer             | Corporate approver        | Staff                        | Admin                        |
| ------------------- | ----- | -------------------- | ------------------------- | ---------------------------- | ---------------------------- |
| `vehicle-photos`    | R     | R                    | R                         | W                            | W                            |
| `documents-private` | -     | O (upload, view own) | C (view company bookings) | R (view, with logged reason) | R (view, with logged reason) |

**Rules that go beyond the matrix**

- Customers cannot change `status`, `total_kes`, or `deposit_kes` on a booking. Those fields change only through the server services.
- Staff can update `bookings.status` only through the transition table; the database trigger rejects other changes.
- Corporate approvers can approve bookings under their company's approval limit. Approval above the limit goes to an admin.
- Document verification changes only `status`, `verified_by`, and `verified_at`. Staff cannot edit the stored file.
- Admin rate changes write a row to an audit table with the old and new value.
- A user with no matching row in `profiles` sees nothing, even if signed in.
- Service role access (server only) bypasses RLS and is used only for webhooks and scheduled jobs. Each use is logged.

**Tests for this matrix**

- For each role and table, a test asserts the allowed actions succeed and the denied actions return no rows or an error.
- A customer cannot read another customer's booking by guessing its id.
- A corporate approver cannot read another company's bookings.
- A staff member cannot approve their own refund.

**Open question.** Whether corporate approvers can view the documents of company staff, or only the booking status and vehicle.

## 14. Coding Standards

The goal is code that is short, plain, and easy to change. A reviewer should be able to read any file in one pass. Where a rule below conflicts with a shorter solution, the shorter solution wins if it still passes the tests.

**Language and tooling**

- Language: TypeScript, strict mode on. Confirm this with the owner before the first commit (see the open question at the end).
- Formatting: Prettier. Linting: ESLint with the TypeScript and React rule sets. Both run in CI and block merges.
- No `any`. Use `unknown` and narrow it with a Zod schema.
- No `console.log` in committed code. Use the logger module, which Sentry receives.
- No commented-out code. Git keeps the history.

**DRY: one source for each fact**

| Thing                            | Single source                                     | Used by                                        |
| -------------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| Prices and totals                | `services/pricing.ts`                             | Quote endpoint, booking, invoices, UI display  |
| Booking status and allowed moves | `domain/booking-status.ts` (one transition table) | API routes, database trigger tests, UI buttons |
| Input validation                 | `schemas/` (one Zod schema per endpoint)          | API routes and browser forms                   |
| Error codes and messages         | `errors/codes.ts`                                 | API responses and UI messages                  |
| Supabase client                  | `lib/supabase/` (server and browser factories)    | All data access                                |
| Money formatting (KES)           | `lib/money.ts`                                    | Every screen and email                         |
| Date and time zone handling      | `lib/dates.ts` (Nairobi display, UTC storage)     | Every screen, email, and report                |
| Design tokens                    | `styles/tokens`                                   | Components and Figma export                    |
| Copy strings                     | `copy/en.ts`                                      | UI, emails, SMS                                |
| Rates and fees                   | Database `rates`, `extras`, and `settings` tables | Pricing service; never hard-coded              |

- If the same logic appears twice, move it to one function before the third use. Two copies are allowed only while the second one is being written.
- A constant with a business meaning (a deposit percentage, a grace period) lives in the settings table, not in code.
- Copy-pasting a component to change a colour is not allowed. Add a prop or a token instead.

**Simplicity rules**

- Functions do one thing and fit on one screen (about 40 lines). Split longer functions.
- Maximum three levels of nesting. Use early returns instead of nested `if` blocks.
- No nested ternaries. A ternary is for one simple choice.
- Name things for what they do: `calculateDepositKes`, not `calc2`. Comments explain why, not what.
- No premature abstraction. Write the simple version first; generalise when a second real case appears.
- No clever one-liners that need a comment to explain them.
- Prefer plain functions over classes. Prefer data over inheritance.
- Keep files under 300 lines. Split by responsibility, not by line count.
- Dependencies: add a package only when the code would otherwise be long and risky to write. Record each new package in the decision log.

**Money and dates**

- Money is an integer number of shillings. Never use floating-point arithmetic for money.
- Round only once, at the final total, using the rule in the pricing service. Test the rounding.
- Store times in UTC. Convert to Africa/Nairobi only in display code.

**Errors**

- Never swallow an error. Either handle it with a clear result or let it reach the error boundary.
- Use the shared error types. A thrown string is not allowed.
- Every external call (Tingg, ZeptoMail, Mobile Sasa) has a timeout and a clear failure path.
- Webhook handlers return success only after the change is saved.

**Security in code**

- No secrets in code, logs, or error messages.
- Never trust a value from the browser for price, status, or role. Recalculate or re-check on the server.
- Use parameterised queries through the Supabase client. No string-built SQL.
- Escape or validate all user text before it reaches an email or SMS template.

**Testing standards**

- Pricing, status transitions, overlap rules, and webhooks have unit tests before the feature is merged.
- A test name states the behaviour: `returns deposit as 30 percent rounded down`.
- No tests that depend on the current date. Pass the date in.
- A bug fix starts with a failing test.

**Git and review**

- Branch from `main`. Branch names: `feature/`, `fix/`, `chore/`, followed by a short description.
- Commit messages: a short imperative summary, then a body if the reason is not obvious.
- Pull requests are small: aim for under 400 changed lines. Larger changes are split.
- Every pull request needs one approval and passing CI. The author does not merge their own change without review, except for documentation fixes.
- The reviewer checks: duplicated logic, nesting, naming, tests for money and access paths, and the access control matrix (section 13).

**Repository layout**

```
app/            routes and pages (Next.js App Router)
services/       business logic: pricing, bookings, payments, documents
domain/         status tables and pure rules, no framework imports
schemas/        Zod schemas shared by API and forms
lib/            Supabase clients, money, dates, logger
components/     reusable UI components
styles/tokens/  design tokens
copy/           user-facing text
supabase/       migrations, RLS policies, seed data
tests/          end-to-end tests
```

**Definition of done.** Code is formatted, lint passes, tests pass, the RLS policy is written and tested, copy comes from `copy/`, and the feature works on a preview deployment.

**Open questions**

- TypeScript or JavaScript. Your original preference was to avoid TypeScript. This document assumes TypeScript because it catches errors in pricing and access code before release. Decide before the first commit.
- Whether a second developer will join, which affects the review rules above.

## 15. eTIMS Receipts (Room for Later)

eTIMS (electronic tax invoice management) receipts are not part of the MVP launch. The design leaves room for them, so adding them later changes no existing booking, payment, or invoice record. Confirm the exact requirements, registration steps, and integration method with the company's accountant and KRA before development of this module.

**Design principles**

- Every payment and invoice has a stable internal number that exists whether or not a tax receipt is issued.
- Tax receipt submission is a separate step, triggered after a payment is confirmed. It never blocks a booking.
- A failed submission is retried from a queue. A customer never sees a payment as failed because a tax submission failed.
- The integration sits behind one interface, so the provider or method can change without touching booking code.

**Data reserved now**

| Table                                      | Field                                                                                                     | Purpose                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `payments`                                 | `tax_receipt_status` (none, pending, submitted, failed)                                                   | Shows whether a receipt is needed or sent; defaults to `none` |
| `invoices`                                 | `etims_reference`, `etims_submitted_at`                                                                   | Stores the tax reference once issued                          |
| `invoices`                                 | `customer_pin` (optional)                                                                                 | Customer KRA PIN for corporate receipts                       |
| `etims_submissions` (new, empty at launch) | id, payment\_id or invoice\_id, request\_json, response\_json, status, attempts, last\_error, created\_at | Full audit of every submission and retry                      |
| `settings`                                 | `etims_enabled` (boolean, default false)                                                                  | Turns the feature on without a deploy                         |

**Flow when enabled**

1. Tingg confirms a payment; the webhook handler saves it and sets `tax_receipt_status = pending`.
2. A queued job builds the receipt from the stored booking, payment, and customer data.
3. The job submits to the eTIMS integration and saves the response in `etims_submissions`.
4. On success, the reference is stored on the invoice and `tax_receipt_status` becomes `submitted`.
5. On failure, the job retries with a delay. After the retry limit, staff see the item in the operations list.

**Code rules**

- One module, `services/tax-receipts.ts`, owns all eTIMS logic. Other modules call its functions only.
- The integration is one adapter behind an interface. A test adapter runs in development and tests.
- Tax amounts come from the pricing service, so the receipt and the booking always agree.
- Receipts are never edited after submission. Corrections are issued as new records.

**Staff and customer impact at launch**

- Staff see the `tax_receipt_status` on the booking detail, greyed out while the feature is off.
- Customers see nothing about tax receipts until the feature is on.

**Open questions for the accountant**

- Does the company need eTIMS receipts for each payment, each invoice, or only corporate invoices?
- Is VAT charged on rentals with a driver, and on delivery fees?
- Which device or integration method does the company use for eTIMS submission?
- When can the company register for eTIMS, and what does the registration need?

## 16. Platform Rule: Mobile First

Unless a section says otherwise, every screen is designed and built for a phone first, then expanded for tablet and desktop. Most customers in Nairobi will book on a phone, often on a 4G connection.

**What this means in practice**

- Design starts at 360 px wide. Each screen is approved at phone size before any larger layout is designed.
- Build the CSS for the smallest screen first, then add layout rules at 768 px (tablet) and 1024 px (desktop). Do not write desktop styles and override them down for mobile.
- Touch targets are at least 44 px. Desktop rows in section 4 (32 px) apply to pointer-driven staff screens only; customer screens use the larger touch size on every device.
- The booking flow is one column with one primary action at the bottom of the screen, above the thumb zone.
- Forms use the right keyboard: numeric for phone and amounts, email for email, and date pickers that work with touch.
- Bottom sheets replace dropdown modals on phones.
- Images are responsive and compressed. The first screen loads under 2.5 seconds on a mid-range Android phone over 4G.
- No feature depends on hover, right-click, or keyboard alone. Every action works with a single tap.

**Navigation**

- Customers: a bottom bar with Search, Bookings, and Account (section 4).
- Staff on desktop: the sidebar rail rules in section 4. Staff on phones get the same bottom bar with the staff items.
- Corporate approvers on phones get a simple approval list, with approve and reject as large buttons.

**Testing**

- Every end-to-end test in section 9 runs first on a phone-sized viewport.
- Acceptance test: a customer completes a quote, deposit, and handover choice on a mid-range Android phone with no horizontal scrolling and no zooming needed to read any text.
- The low-end Android test device in section 9 is the main reference for performance.

**Exceptions.** Staff screens that are used only at the front desk, such as the fleet calendar and reports, are designed desktop-first, with a phone layout that shows the read-only view. Any other exception needs a written decision in this section.

## 17. Currency Display and Office Maps

Two optional features that help customers, neither of which changes how money is charged.

**17.1 Currency selector**

- A currency button sits in the header on public and customer screens. It is optional and can be hidden by a setting (`currency_selector_enabled`, default on).
- Supported display currencies at launch: KES (default), USD, and EUR. Add more later through settings, with no code change.
- The selector changes how prices are shown only. Every charge, deposit, invoice, receipt, and refund is in KES. The screen says so next to the converted price: "Charged in KES."
- Exchange rates are stored in an `exchange_rates` table (currency, rate to KES, updated\_at). A scheduled job refreshes them daily from a source the owner approves. The rate date is shown on the screen.
- Converted amounts are rounded for display only. They are never saved as a booking total.
- The customer's choice is saved on their device, not in the database.
- Staff screens and documents always show KES.

**Code rules**

- Conversion lives in `lib/money.ts` with the KES formatter. No screen converts a price on its own.
- A test checks that a booking total is identical whatever display currency is selected.

**Open question.** Whether the company accepts any foreign-currency payment at all. If not, the selector stays display-only, and this should be stated plainly on the page.

**17.2 Office location map**

A Google Map shows the office location wherever a customer is choosing or reaching a pickup point. It appears on these screens:

| Screen                         | Map content                                                                          | Why                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Contact                        | Office pin, office hours, "Get directions" link                                      | Customers looking for the office                                     |
| Quote (office pickup selected) | Office pin and walking-distance hint from the airport, if the location is an airport | Confirms the pickup point before paying                              |
| Handover (office pickup)       | Office pin and the entrance note                                                     | Customer knows where to go to sign and collect the car               |
| Booking detail (office pickup) | Same as handover, shown after the booking is confirmed                               | Reference for the day of pickup                                      |
| Delivery confirmation          | Not shown; the delivery address is shown as text instead                             | Privacy: customers' home or office location is not mapped in the app |
| City and airport pages         | Map of the location the page covers                                                  | Helps search visitors                                                |

**Rules**

- Coordinates are stored on the `locations` table (`latitude`, `longitude`, `entrance_note`). The map reads from there, so a new office needs no code change.
- Use the Google Maps Embed for display and a "Get directions" link that opens the Google Maps app on phones. This keeps the page light and avoids billing for interactive map features the MVP does not need.
- The Maps API key is restricted by website domain and by API. It is stored in Vercel environment variables, separate from other keys.
- The map loads lazily below the fold on mobile, so it does not slow the first screen.
- Map is a static placeholder with a text address if the browser blocks it, so the address is always visible.
- Customer delivery addresses are never shown on a map in the product.

**Accessibility.** Every map has the full address as text next to it and a directions link, so a screen-reader user gets the same information.

**Open question.** Whether the company has more than one office, and whether each needs its own map on the contact page.

## 18. SEO From Day One

The company's main problem today is that people cannot find it. SEO is therefore a launch requirement, not a later task. Every public page is built with search in mind, and search performance is reviewed monthly alongside the metrics in section 2.

**Honest expectations.** Search results take months to build and cannot be guaranteed. The plan below improves the odds and gives the company an asset that grows over time.

**18.1 Technical foundation (built in Phase 1)**

- Public pages are server-rendered or statically generated (Next.js). Search engines receive full HTML, not an empty app shell.
- Every public page has a unique title, meta description, canonical URL, and Open Graph image.
- `sitemap.xml` is generated from the database, so new vehicles and locations appear automatically. Submitted to Google Search Console at launch.
- `robots.txt` blocks account, staff, and checkout pages. Those pages carry `noindex`.
- Clean, readable URLs: `/car-hire/nairobi`, `/chauffeur-hire/jkia-airport`, `/vehicles/executive-sedan`. No query-string pages in the index.
- Structured data (schema.org JSON-LD): `Organization`, `LocalBusiness` or `AutoRental` for each office, `Vehicle` or `Product` for each class with price, `FAQPage` on FAQ blocks, and `BreadcrumbList` on every page.
- Core Web Vitals targets: largest contentful paint under 2.5 seconds on mobile, low layout shift, and fast interaction. Checked on the low-end Android device in section 9.
- HTTPS everywhere, with Cloudflare caching for static pages.
- Images in modern formats (WebP or AVIF), with width and height set, and descriptive alt text.
- Language: English metadata at launch. Add `hreflang` for Swahili when that interface is built.

**18.2 Local search (highest value for a Nairobi business)**

- Create and verify a Google Business Profile for each office and airport desk, with exact address, hours, phone, photos, and the service categories (car rental, chauffeur service).
- Use the same business name, address, and phone (NAP) everywhere: the website, the profile, directories, and social media.
- Ask every completed customer for a Google review, with a link sent by SMS after the handover. Reply to every review.
- List the company on reputable Kenyan directories and industry listings, with consistent details.
- Use the office map from section 17 on the contact page, with the same address.

**18.3 Content that matches how people search**

Keyword research is done in Google Search Console and a keyword tool before writing. The starting themes, to check against real search data, are:

| Page type     | Example target                                                      | Notes                                           |
| ------------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| Service       | car hire Nairobi; executive car hire Kenya; chauffeur hire Nairobi  | Main commercial pages                           |
| Airport       | airport transfer JKIA; car hire Nairobi airport                     | One page per airport desk                       |
| City          | car hire Mombasa; car hire Nakuru                                   | Only where the company actually serves the city |
| Vehicle class | executive sedan hire; SUV hire Kenya                                | Product-level pages                             |
| Corporate     | corporate car hire Nairobi; monthly car hire for companies          | Targets business buyers                         |
| Question      | how to hire a car in Kenya; documents needed to hire a car in Kenya | FAQ pages; answer clearly and honestly          |

**Content rules**

- Each page answers one search intent and is useful on its own. Do not create doorway pages that only swap a city name.
- Write in plain Kenyan English, following the style guide in section 3.
- Show real vehicle photos, real prices with the rules in section 8, and the actual office details.
- Update the prices and FAQs whenever the rate table changes. The page reads from the same data as the booking flow, so the price cannot drift.
- Publish one useful article a month, such as "What documents do I need to hire a car in Kenya?" Plan these with the owner.

**18.4 Trust signals search engines and customers both use**

- Clear company details: registered name, KRA PIN where appropriate, office addresses, phone, and email.
- Visible privacy notice and terms.
- Reviews shown on the site with their source, not invented or edited.
- Named staff or an "About" page with real people and the company history.

**18.5 Measurement**

| Tool                                     | What it tracks                                           | Owner     |
| ---------------------------------------- | -------------------------------------------------------- | --------- |
| Google Search Console                    | Indexing, queries, clicks, and position; sitemap status  | Developer |
| Google Business Profile insights         | Calls, direction requests, and website clicks per office | Owner     |
| Analytics (GA4 or PostHog, to be chosen) | Traffic by page, quote starts, and bookings              | Developer |
| Lighthouse CI                            | Speed and accessibility on every release                 | Developer |

The monthly review in section 10 includes search impressions, clicks, and the top pages, plus any broken links or crawl errors from Search Console.

**18.6 Prohibited practices**

- No paid links, link farms, or fake reviews.
- No hidden text, keyword stuffing, or cloaking.
- No copied content from competitors or directories.
- No pages created only to target a city the company does not serve.

**Build tasks added to Phase 1 (section 11)**

- Sitemap, robots, and canonical rules.
- Schema.org templates for office, vehicle class, and FAQ.
- Page templates for service, airport, city, and class pages, each reading from the database.
- Google Search Console and Business Profile set up before launch.

**Open questions**

- Which cities and airports the company actually serves. Pages are created only for those.
- Whether the owner will write or approve the monthly article.
- Which analytics tool to use, given the privacy notice in section 7.

## 19. Trust, Conversion, and Priorities (Review Decisions)

This section records which suggestions from the external review were adopted, adapted, or set aside, and why. Each adopted item is tied to a section above.

**Rule for all trust claims.** Any number, badge, or promise shown to customers must come from real data in the database. No placeholder figures reach production. Examples from the review, such as "1,000+ rentals", "4.8 rating", or "98% fulfilment", are shown only when the database supports them, and the page reads the figure live.

**19.1 Adopted for launch**

| Item                       | How it is built                                                                                                                                                                                                   | Where                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Reviews after each booking | Automatic review request by SMS and email after handover and return. Star rating and short text. Verified-booking label on each review. Ratings appear on vehicle pages only after 5 real reviews for that class. | Sections 4, 6, 10                                  |
| Real-time availability     | Vehicle counts per class for the chosen dates, from the overlap check. Shown as "3 executive sedans available for these dates". Counts update on each search.                                                     | Sections 5, 12                                     |
| Booking timeline           | Visual timeline in the booking page: Quote, Deposit paid, Documents verified, Ready, Handover, Active, Returned. Replaces plain status text.                                                                      | Section 5 status table                             |
| Booking reminders          | 24 hours before pickup: SMS, email, and WhatsApp link. Includes address, map, and driver contact for delivery.                                                                                                    | Sections 6, 17                                     |
| Sell-first homepage        | Hero with a clear promise, search widget, popular classes, why choose us, corporate services, service locations, reviews, FAQ, contact. Search is one section, not the whole page.                                | Section 4                                          |
| Sticky mobile booking bar  | On vehicle and quote screens, a bottom bar shows the daily price and a "Get quote" button. Always visible while scrolling.                                                                                        | Section 16                                         |
| Progressive forms          | Ask for one group at a time: contact, then dates, then documents, then payment. Each step saves before moving on.                                                                                                 | Section 4 booking flow                             |
| Funnel analytics           | Events tracked: vehicle viewed, quote started, quote completed, booking created, deposit paid, rental completed. Drop-off % per step, most viewed classes, highest converting class.                              | Section 18.5                                       |
| Digital handover checklist | Staff record fuel level, mileage, and photos of the vehicle at pickup and return. Customer signs on the staff device. Stored with the booking. Reduces disputes.                                                  | Section 4 deliveries; section 5 `deliveries`       |
| Vehicle "best for" tags    | Simple rule-based tags on each class (airport transfers, executive travel, long-distance) set by the owner. Not AI in the MVP.                                                                                    | Section 5 `vehicle_classes` (add `best_for` field) |

**19.2 Adopted, but later**

| Item                                        | Phase                                                 | Reason                                                                                                                       |
| ------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Referral programme                          | Phase 6, after launch                                 | Needs a clear rule for discounts and credits, approved by the owner and checked for tax treatment before it goes live        |
| Corporate spend view and approval workflows | Phase 6 (pull forward if corporate sales start early) | Corporate sales drive revenue; the MVP already has company accounts and invoicing                                            |
| Programmatic SEO pages                      | Phase 6, with real content only                       | Pages must each answer a real question with real information. Pages that only swap a place name are not built (section 18.6) |
| Travel dashboard and WhatsApp concierge     | Phase 6                                               | Valuable, but depends on enough bookings to justify the work                                                                 |
| Customer loyalty programme                  | Phase 6                                               | Depends on repeat-customer data                                                                                              |
| Driver app                                  | After launch                                          | Shared delivery lists work for the pilot                                                                                     |
| Partner fleet (phase 2 marketplace)         | After 6 months of owned-fleet trading                 | Requires owner onboarding, payouts, disputes, insurance, and damage claims. Build demand first, then supply                  |

**19.3 Set aside**

| Item                                                              | Reason                                                                                                                                                                                 |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Competitive comparison naming or implying competitors charge more | Claims about competitors need evidence and carry legal risk. Instead, show clearly what each price includes (insurance, delivery, support), which lets customers compare on their own. |
| "Never cancelled by provider" and similar guarantees              | Cannot be promised until the company has a track record. Shown only when true and measured.                                                                                            |
| Booking-confidence badges before data exists                      | Same rule as above; added once real response-time and fulfilment data exists.                                                                                                          |
| AI vehicle recommendation at launch                               | A rule-based "best for" tag gives most of the value for less risk. Revisit once there is booking data.                                                                                 |
| Partnership-style content such as diplomatic transport pages      | Keep out until the company has the service, the approvals, and the content to back it. Not a launch page.                                                                              |

**19.4 Revised launch priorities**

The review's tiers are adjusted for what can exist on launch day:

1. Real-time availability and the booking timeline (core to the booking flow).
2. Sell-first homepage and sticky mobile booking bar.
3. Funnel analytics and the review request flow, so reviews start collecting from the first booking.
4. Digital handover checklist.
5. Reviews displayed once the threshold in 19.1 is reached.

**19.5 Strategic direction**

The platform starts as a car rental business with owned fleet. Architecture keeps room for airport transfers, chauffeur services, corporate transport, and event transport, using the same vehicle, booking, and pricing models. Partner fleet and marketplace come only after the owned-fleet business is working.

**Open questions from this review**

- Whether the company will commit to review requests after every booking, including the customer consent needed under the privacy notice in section 7.
- Whether the referral discount and credit can be approved by the owner and checked for tax treatment before Phase 6.

## 20. Goals, Navigation, Booking Flow, and Performance Targets

This section takes the useful parts of a second external review. Trust figures and guarantees in that review are not used unless the company's own data supports them (see the rule in section 19).

**20.1 Three governing goals**

Every feature, page, and sprint is checked against these goals. A proposal that serves none of them waits.

1. **Booking conversion.** Visitors become quotes, and quotes become paid bookings.
2. **Local search growth.** The company is found for the places and services it serves, through Google and Google Business Profile.
3. **Marketplace readiness.** The data model, pricing, and payments can support partner fleets later without a rewrite.

**Positioning.** The product is described as Kenya's executive car hire and transport service, covering rentals, chauffeur services, airport transfers, and corporate transport. Fleet marketplace services come later, only after demand is proven.

**20.2 Phases (replaces the week estimates)**

Week estimates are dropped. Each phase ends at a gate, and the next phase starts only when its gate is passed. The earlier plan of 4 to 6 weeks for the MVP remains the planning assumption, not a promise.

| Phase             | Scope                                                                                                                                                                                                                     | Gate                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 0. Foundation     | Next.js, Supabase, auth, RLS, design system, SEO framework, analytics (PostHog), error monitoring, Google Search Console, Google Business Profile, sitemap, structured data                                               | RLS tests pass; analytics events fire on a preview deployment; Business Profile verified |
| 1. Acquisition    | Public site: homepage, vehicle listings (executive sedans, SUVs, luxury vehicles, minibuses), location pages, service pages, trust indicators, verified fleet badges (only where true), availability counters, FAQ schema | Pages indexed in Search Console; Lighthouse targets in 20.6 met                          |
| 2. Booking engine | Quote, customer details, payment, confirmation, document upload, agreement, pickup scheduling                                                                                                                             | Double-booking and payment tests pass; pilot bookings completed                          |
| 3. Operations     | Staff inbox, fleet calendar, driver assignment, customer profiles, analytics dashboard                                                                                                                                    | Staff use the inbox for all bookings during the pilot                                    |
| 4. Growth         | Review requests, referrals, abandoned-quote reminders, return-customer reminders, seasonal and corporate offers                                                                                                           | Reminder opt-in rules approved (section 7)                                               |
| 5. B2B            | Corporate dashboard: staff management, approvals, monthly invoices, budget controls, booking history, report export                                                                                                       | First corporate client onboarded                                                         |
| 6. Premium        | Rule-based recommendations, frequently booked together, advisor questions                                                                                                                                                 | Booking data shows demand                                                                |
| 7. Marketplace    | 7A partner fleet (vetted vendors); 7B independent owners with payouts, ratings, owner dashboards                                                                                                                          | Legal review of payouts and any escrow arrangement; section 19 conditions met            |

**Escrow and payouts.** Holding customer money for third-party owners raises regulatory questions. Confirm the approach with a lawyer and the payment provider before Phase 7B.

**Target segments for B2B (Phase 5)**

Banks, NGOs, government contractors, embassies, hotels, and multinationals. These are targets for sales outreach. No client is named on the site without written permission.

**20.3 Navigation**

- Public header: Logo, Home, Rentals, Airport Transfers, Corporate, Locations, How It Works, About, Contact, Login, and a Get Quote button.
- On phones, the header collapses into the bottom bar from section 16; the rest sits in a menu sheet.
- Staff workspace: Dashboard, Bookings, Fleet, Drivers, Customers, Payments, Invoices, Reports, Settings. Follows the rail rules in section 4.

**20.4 Homepage order**

1. Hero: headline, one line on what the company offers, and a quick search (dates, pickup location, vehicle type) with a Get Quote button.
2. Trust strip: figures shown only when they come from real data. Until then, the strip shows the verified-fleet statement only if it is true, and the support hours only if staffed.
3. Popular vehicles: photo, price per day, availability for the chosen dates, rating once the threshold in section 19 is met, and a Book button.
4. Services: executive hire, airport transfers, corporate rentals, event transport.
5. Why choose us: stated as the company's real practice. Example: transparent pricing, real vehicles, delivery and office options, a named contact for each booking.
6. Reviews: verified bookings only, with the source shown.
7. Locations: map and city and airport cards.
8. Corporate services: a dedicated section linking to the B2B page.
9. FAQ with FAQ schema.
10. Closing call to action: Get Quote, Call, WhatsApp.

**20.5 Vehicle page and booking flow**

_Vehicle page._ Gallery (hero and interior photos; 360 view later). Summary with name, price, availability for the chosen dates, and Book now. Specifications: seats, transmission, fuel, luggage, air conditioning, year. Best for (rule-based tags). Included items: insurance, support, roadside assistance, each stated exactly as the agreement says. Reviews. Related vehicles.

_Booking flow._ Six screens, one decision each.

1. Search: dates, location, class.
2. Vehicle selection, with live availability.
3. Quote summary: vehicle, extras, delivery, taxes, deposit, total. Every line matches the pricing service (section 14).
4. Customer information: asked in groups (progressive forms, section 19).
5. Payment: deposit through Tingg.
6. Confirmation: booking timeline, documents still needed, pickup instructions and map.

Document upload and agreement signing follow confirmation, as in section 4.

**20.6 Performance targets**

| Measure                                 | Target          |
| --------------------------------------- | --------------- |
| Homepage largest contentful paint (LCP) | Under 2 seconds |
| Cumulative layout shift (CLS)           | Under 0.05      |
| Interaction to next paint (INP)         | Under 150 ms    |
| Lighthouse performance, mobile          | 90 or higher    |
| Lighthouse performance, desktop         | 95 or higher    |

These targets are measured on the low-end Android test device in section 9 and on a mid-range phone. A release that misses a target is not merged until fixed or a documented exception is approved.

**Techniques.** Server Components for data-heavy pages; incremental static regeneration for location, service, and vehicle-class pages, so they are cached and refresh when rates change; edge caching through Cloudflare for static assets; image optimisation with responsive sizes; lazy loading below the fold, including the office map (section 17).

**20.7 Analytics events**

PostHog is the proposed analytics tool, replacing the open choice in section 18.5, subject to a privacy review under section 7. Core events: vehicle viewed, quote started, quote completed, booking created, deposit paid, rental completed, plus drop-off at each booking step. Consent is requested before tracking where the privacy notice requires it.

**20.8 Staff dashboard home**

- KPI cards: today's bookings, revenue today (KES), vehicles active, pending documents, pending payments.
- Activity feed: recent bookings, payments, and cancellations.
- Fleet availability calendar.

**Not adopted as written**

- "10,000+ trips", "4.8 rating", "98% booking success", and "confirmed within 5 minutes" are not published until the company's records show them. The page reads the figures from the database.
- "24/7 support" is shown only if the company staffs it around the clock.
- "100% verified fleet" is shown only if every vehicle has been verified under the process in section 4.

**Open questions**

- Does the company agree to PostHog as the analytics tool, subject to the privacy review?
- Which airports and cities it serves, which decides the location pages in 20.2.
- Whether Google reviews can be shown on the site under Google's terms, and how.

## 21. Owner Decisions Log (14 November 2026)

These decisions override any earlier proposal in this pack and in the ten companion documents. Where an older section still shows the previous wording, this log applies.

| Topic                 | Decision                                                                                                                                                                                                                                                                                        | Replaces                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Deposit               | The deposit is refundable. Customer screens, quotes, confirmations, receipts, and emails label it "Refundable deposit". Refunds follow the cancellation policy in section 8.                                                                                                                    | Deposit described without a refund label |
| Minimum age           | 21 years for all vehicle classes.                                                                                                                                                                                                                                                               | 25 years (proposed)                      |
| Minimum licence years | Still to confirm with the owner.                                                                                                                                                                                                                                                                | 3 years (proposed)                       |
| Programming language  | JavaScript. Runtime checks at every boundary use Zod schemas. JSDoc comments document the shape of key objects such as quotes, bookings, and payments.                                                                                                                                          | TypeScript                               |
| Styling               | Tailwind CSS. Design tokens are defined once in the Tailwind configuration and reused by all components.                                                                                                                                                                                        | Unspecified CSS approach                 |
| Visual design system  | Apple-inspired design system: system typography (SF Pro where the platform provides it), Apple-style spacing and corner radii, translucent materials for sheets and bars, and clear hierarchy. Icons use an open-licensed line set styled to match; Apple's SF Symbols are not used on the web. | Generic design language                  |

**Consequences**

- The coding standards (section 14) are updated: the TypeScript strict-mode rule is replaced by the JavaScript rules above.
- The API contract (section 12) validates every input with Zod, as before.
- The access control matrix, database, and business rules are unchanged except for the age limit and the deposit label.

## 22. Single-Home Rule for Documents (15 November 2026)

Each fact has one home. Other documents link to it and do not restate it.

| Fact                                                | Home                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| Owner decisions and their dates                     | Section 21 of this pack                                              |
| Business rules: pricing, deposit, cancellation, age | Section 8 of this pack                                               |
| Booking statuses and transitions                    | Section 5 of this pack (data model) and the database design document |
| Access rules by role                                | Section 13 of this pack                                              |
| API endpoints and error codes                       | Section 12 of this pack and the API specification                    |
| Security controls                                   | Section 7 of this pack and the technical architecture document       |
| Hosting and infrastructure split                    | Technical architecture document                                      |
| Visual tokens and type scale                        | Design system specification                                          |
| Component definitions                               | UI component library                                                 |
| Events and metrics                                  | Analytics and event tracking document                                |
| Navigation and routes                               | Information architecture document                                    |

**Rule for editing.** Change a fact in its home only. A document that needs the fact states it in one line with a link to the home, for example: "Deposit: refundable. See section 8 of the pack."

**Clean-up status.** Decision text has been recorded in more than one place, and the companion documents still contain some of it. Each copy will be replaced with a link to its home in the next pass.

## 23. Corrections Register (15 November 2026)

This register is the single list of changes to earlier text. Where another document conflicts with this register, this register wins until the document is corrected.

**23.1 Confirmed by the owner (apply everywhere)**

| Topic                      | Confirmed rule                                                                                                                              | Replaces                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Cancellation               | 24-hour window, subject to change. A cancellation more than 24 hours before pickup refunds the deposit in full; within 24 hours, no refund. | 72-hour and 50 percent tiers in section 8      |
| Late-return grace          | 1 hour, subject to change                                                                                                                   | 30 minutes in section 8                        |
| Instalments                | Not offered. Deposit up front; balance before handover, or on credit terms for approved corporate accounts                                  | Instalment question in the UX spec             |
| Minimum age                | 21 years                                                                                                                                    | 25 years in section 8                          |
| E-signature                | Included at launch                                                                                                                          | "Open" in section 11                           |
| eTIMS                      | Integrated at launch if technically possible. Checkout offers "Request tax receipt (eTIMS)"; otherwise a standard receipt                   | "Not in the MVP" in section 15                 |
| Fleet model                | Owned fleet first; partner vehicles later, labelled                                                                                         | Open question in section 11                    |
| Served cities and airports | Admin defines them in the admin area                                                                                                        | Fixed page lists                               |
| Languages                  | English primary. Then Swahili, Spanish, French, German, Chinese (Simplified). All copy as message keys                                      | English only                                   |
| Language of code           | JavaScript                                                                                                                                  | TypeScript in section 14                       |
| Styling                    | Tailwind CSS                                                                                                                                | Unspecified                                    |
| Visual system              | Apple-inspired; open-licensed icons; no SF Symbols                                                                                          | Generic design language                        |
| Hosting                    | Cloudflare (DNS, WAF, rate limits, cron, queues, R2) and a Docker container on Oracle Cloud for the app. Vercel is not used                 | Vercel in sections 6, 7 and 17                 |
| Deposit                    | Refundable, labelled "Refundable deposit" on every surface                                                                                  | Unlabelled deposit                             |
| Currency                   | Display: KES (default), USD and EUR. Charges are in KES                                                                                     | "Charges in KES only" in section 17 (see 23.2) |
| Phases                     | Numbering 0 to 7 as in section 20.2                                                                                                         | Phases 0 to 6 in section 11                    |
| Performance                | LCP under 2 seconds on the homepage                                                                                                         | 2.5 seconds in section 2                       |

**23.2 Currency (updated 15 November)**

- Primary currencies: KES and USD.
- Display: KES is the default. USD is shown alongside it.
- Charging in USD: **to be confirmed by the owner.** Until then, every charge, invoice, receipt and refund is in KES, and USD is display only.

**23.3 Still open, owner to decide**

| #   | Question                                                                      | Current working assumption            |
| --- | ----------------------------------------------------------------------------- | ------------------------------------- |
| 1   | Charge in USD, or display only?                                               | Display only until confirmed          |
| 2   | Minimum licence years for each class                                          | Not set                               |
| 3   | Confirm the 24-hour reading in 23.1                                           | As written                            |
| 4   | Will the lawyer approve Oracle hosting in Johannesburg before Nairobi opens?  | Pending legal review                  |
| 5   | Object storage for ID documents and photos: Cloudflare R2 or Supabase Storage | Cloudflare R2 (architecture document) |
| 6   | Remove the optional security deposit from section 8                           | Remove                                |
| 7   | Hold the vehicle for 30 minutes while a booking awaits payment                | Hold, enforced in the database        |
| 8   | Add a company admin role for corporate accounts                               | Add                                   |
| 9   | Allow guest bookings and guest cancellation by reference and phone            | Allow                                 |
| 10  | Store weekly rates as their own rows                                          | Store                                 |

**23.4 Where other documents are out of date**

The ten companion documents still contain some of the earlier text listed in 23.1, and they will be corrected next. Column names, route names and event names that differ between documents are listed in section 2 of the Claude Code session report and will be aligned once items 5 to 10 above are settled.

## 24. Decisions Round Two (15 November 2026, evening)

These decisions update section 23. Where they differ, section 24 wins.

**24.1 Currency by location**

- The currency is chosen by the customer's location. Kenya defaults to KES. Any other country defaults to USD. The customer can switch, and the choice is remembered on the device.
- Location is detected from the request's country header at Cloudflare. It is a default only, never a restriction.
- Inventory and pricing staff set prices in KES. The system converts them to USD using a stored exchange rate.
- The exchange rate and the converted amount are fixed at the moment the quote is created. The quote shows the rate date.
- Admin can override any USD price manually, with the override recorded in the audit log.
- A charge in USD needs Tingg to support USD for the company's account. This is to be confirmed with Tingg before the payment module is built. Until it is confirmed, a non-Kenyan customer sees the USD price and is charged in KES at the same rate shown, or is offered a USD charge only if Tingg supports it.

**24.2 Hosting location**

- All services that hold or process customer data sit in one region: the Oracle VM, the Supabase project, and the R2 bucket. Johannesburg is the working choice, as Oracle has no live Nairobi region yet.
- Cloudflare's network is global by design. Its DNS, WAF and caching run at the edge, and only R2 has a location setting. R2 is set to the region closest to Johannesburg that Cloudflare offers.
- If the company later chooses US East or US West, all services move there together, not one at a time.

**24.3 Licence years**

The minimum number of years a driver must have held a driving licence before hiring a class of car. For example, "3 years" means the driver must have held a licence for at least three years. This is set per class. Still to be confirmed by the owner.

**24.4 Security deposit**

- The security deposit is a separate amount from the booking deposit and the rental total.
- Admin switches it on or off system-wide, or per vehicle class or vehicle. A vehicle-level setting overrides the system setting.
- Admin sets its amount per class or vehicle, in KES, with USD shown as converted.
- It is collected at booking, shown as a separate line, and refunded after the return inspection, subject to any agreed damage or fuel charge. The refund is recorded against the booking.
- Tingg must confirm how a security amount can be held or refunded for card and M-PESA before the feature is built. If Tingg cannot hold it, it is taken as a payment and refunded.

**24.5 Pricing rules owned by the inventory owner**

- Admin, or whoever manages inventory, sets the daily KES rate for each class.
- Admin also sets discounts for weekly, monthly, quarterly and longer hire. Each discount is a percentage or a fixed amount per period, with a start and end date.
- The system applies the best discount the customer qualifies for, and shows it as a named line in the quote.
- Discounts never apply to the security deposit or to delivery fees.

**24.6 Guest enquiries**

- A visitor who has not signed up can submit an enquiry from the vehicle page, with the vehicle, dates, name, phone number and email.
- The enquiry creates a record that staff can convert into a quote or booking.
- An account is created later, if the customer needs one, and the enquiry is linked to it.
- A guest does not pay online. Payment is taken when a quote is accepted, through a payment link sent by the staff member or by the customer's own account.

**24.7 Corporate admin role**

Deferred until the company sees its corporate accounts in practice (section 23.3, item 8).

**24.8 Remaining open items**

| #   | Item                                                                                  | Owner              |
| --- | ------------------------------------------------------------------------------------- | ------------------ |
| 1   | Confirm Tingg supports USD charges for the company's account                          | Owner, with Tingg  |
| 2   | Confirm Tingg's method for holding or refunding security amounts                      | Owner, with Tingg  |
| 3   | Set minimum licence years per class                                                   | Owner              |
| 4   | Confirm the closest Supabase region to Johannesburg that offers the required features | Developer          |
| 5   | Lawyer's view on hosting in Johannesburg until Nairobi opens                          | Owner, with lawyer |

**24.9 Minimum hire (15 November 2026)**

- A rental has a minimum of 2 days. A shorter request is charged as 2 days, and the quote shows the 2 days it charges.
- An airport transfer is exempt and can be a single day.
- The minimum is the `minimum_hire_days` setting (2), so it changes without a code change. A quote carries a `service` of `rental` or `airport_transfer`, set by the customer's choice of service.
- This replaces the 1-day minimum in section 8.

**24.10 Private owners, chassis numbers, trackers, and inspection reports (15 November 2026)**

- **Private owners.** The company can rent out cars on behalf of private owners, and these records are captured from the start. An owner has contact details, a KRA PIN, and an owner type (individual or company). National ID number and payout details are kept apart and are readable by admin only. An ownership agreement ties an owner to a vehicle with a commission percent and dates. A vehicle with an owner is a partner vehicle and is labelled as one. Payouts and escrow are not built; they remain Phase 7 and need legal review (section 20.2).
- **Chassis number.** Every vehicle has a chassis number. It is required and unique, whatever the letter case. It is not shown on public pages.
- **Trackers.** Each vehicle can have trackers: provider, model, device ID or IMEI, SIM number, install and removal dates, status, and subscription expiry. A vehicle has at most one active tracker at a time, and old trackers stay on record. Tracker provider login details are never stored in the database. Live location is not built.
- **Inspection reports.** A pickup and a return inspection are recorded against each booking: fuel level, mileage, condition notes, whether damage was noted, a checklist, the customer's signature, and any number of photos and documents (JPG, PNG, or PDF, up to 10 MB each). A report is saved with its files in one step and is never edited; a correction is a new report. The customer can see the inspection files for their own rental. This is the handover record in section 5.

**24.11 Frontend and backend as separate applications (15 November 2026)**

- The frontend (Next.js) and the backend (Express) are separate applications, each with its own code, container, and release. The owner is more confident building them separately and in Express. The detail is in the technical architecture document, which is the home for this decision.
- The repository is a monorepo: `apps/web` (Next.js), `apps/api` (Express), and `packages/shared` (Zod schemas, money and date rules, error codes, brand settings). This replaces the single-project layout in section 14.
- Shared validation: the recommendation in the architecture document is adopted. The schemas and money rules live in the shared package so a form and the API cannot disagree.

**24.12 Payments and SMS deferred (15 November 2026)**

- Tingg payment integration (checkout, webhook, refunds) is skipped for now and will be revisited later. Until then a booking cannot be paid online, so staff move bookings forward by hand through the status workflow. The payment tables stay in the database, unused.
- SMS (Mobile Sasa) is skipped for now. Notifications go by email only, and customer sign-in cannot rely on SMS one-time codes (section 7), so email sign-in is used instead until SMS returns.
- The pricing, deposit, and cancellation rules are unchanged. Only the collecting of money is postponed.

## 25. Carvo Marketplace Direction (22 November 2026)

The owner reviewed the "Kenya Car Rental Marketplace" product spec (22 November 2026) and chose to build the platform as a marketplace of rental companies. Where this section differs from section 24 or earlier, section 25 wins. Each row is marked **Decided** (stated by the owner) or **Working assumption** (proposed in review, owner to confirm).

**25.1 Name and model**

| Topic | Ruling | Status | Replaces |
| --- | --- | --- | --- |
| Platform name | Carvo. The logo, domain, and support contacts are still to be supplied. | Decided | Placeholder "Car Rental" in `packages/shared/src/brand.js` |
| Legal owner | Carvo is a product of Dirant Technologies, the registered business, which also owns another product, Diraschool. The registered name's suffix (for example "Ltd") is still to be confirmed. | Decided | |
| Model | A marketplace that connects renters with operators. An operator is a rental company with its own fleet. The platform does not run its own fleet for the marketplace. | Decided | "Owned fleet first" (section 23.1, fleet model row; section 24.10 wording) |
| Operator onboarding | An operator is listed only after admin review of its registration, KRA PIN, address, insurance certificate, and vehicle logbooks, as in the spec. | Working assumption | |
| Renter view | Renters see the operator company's fleet. An individual owner behind a vehicle never appears to renters. The operator is the lessor on the rental agreement. | Decided | |

**25.2 Vehicle ownership and owner records**

- An operator's vehicles may be the company's own or managed for an individual owner. The operator states which when it onboards the vehicle. **Decided.**
- Owner details are still captured, and the operator sees them on its own pages to manage and track its fleet. **Decided.**
- Owner records, ownership agreements, and trackers belong to one operator. Only that operator's users can read or change them. Renters never see them, and Carvo admins do not read them by default; an admin who must open one gives a reason, and the access is logged, as for documents (section 22). **Working assumption.** This replaces the admin-only access in section 24.10.
- A vehicle with an owner is a managed vehicle. The operator uploads the owner's authorisation or management agreement when it links an owner, so "verified operator" is backed by proof the operator may rent the vehicle out. **Working assumption.**
- The commission percent on an ownership agreement is the operator's own figure. The platform stores it and does not calculate with it. **Working assumption.**
- National ID number and payout details for owners are optional, operator-only, and stored encrypted. Whether they belong on the platform at all is open. **Working assumption.**
- The operator agreement states that the operator is responsible for the owner's consent to the storage of their data, and that Carvo stores it on the operator's behalf. To go to the lawyer (section 25.7).

**25.3 How bookings work**

The owner asked that bookings work as they do on Booking.com and Airbnb. **Decided as the direction.** The mechanics below were proposed in review and are working assumptions.

| Pattern | Carvo rule |
| --- | --- |
| Confirmation | Per vehicle, the operator chooses Instant or Request. Instant creates a confirmed booking. Request waits for the operator to accept within a set response time (the spec suggests 2 hours, configurable) and expires if no answer comes. |
| Statuses | Add `requested`, `declined`, and `expired` (for requests), and `disputed`. The 30-minute payment hold in section 23.3 item 7 no longer applies to the default flow. |
| Date blocking | Only confirmed bookings block a vehicle's dates. The existing database overlap rule rejects a second confirmation. |
| Payment | Pay at handover by default, recorded by the operator (cash or M-PESA reference). Online booking fees or deposits come only with a payment partner (section 25.5). |
| Cancellation | The operator picks one of three platform policies (flexible, moderate, strict). The 24-hour rule in section 23.1 becomes the Flexible policy. Exact terms of the other two are open. |
| Reviews | From completed bookings only, shown after both sides review or a set window passes. |
| Contact details | Kept inside the platform until a booking is confirmed. |
| Disputes | Opened within a set window after return. The pickup and return inspection reports are the evidence. Payouts are not built, so the hold in the spec applies only once money flows through the platform. |
| Operator reliability | Response rate and operator cancellations feed search ranking and suspension. |

**25.4 Revenue**

- Operators use the platform free in the early stage. **Decided.**
- Later, once the platform has traction, operators get a 30-day trial and then pay a subscription. **Decided.**
- No commission is charged at launch. A small fee on bookings paid on the platform may be added after on-platform payments exist. **Working assumption.**
- Build now: only a plan field on the operator (starting value `free_launch`). Plans, subscriptions, billing, and the lapsed-subscription rule come later, with plan prices held in the database.
- Open: whether early operators stay free or start their 30 days when billing begins.

**25.5 Payments**

- The provider is Tingg for now, to be chosen finally later. **Decided.** This keeps section 24.12 and replaces the Daraja proposal in the spec.
- With a free launch and pay at handover, Phase 1 takes no online payments. The operator records payment on the booking, and `cash` is added as a payment method. **Working assumption.**
- Before booking deposits are built, confirm with Tingg whether it can settle to separate merchants, since deposits belong to operators and subscriptions to Carvo.

**25.6 Chauffeurs**

- Operators are responsible for verifying their chauffeurs. When listing a vehicle the operator states whether it offers a chauffeur and the cost. Carvo's terms say this plainly. **Decided.**
- When an operator offers a chauffeur, it records an attestation, with a timestamp, that the driver is licensed and the insurance covers chauffeur use. The driver's licence expiry is stored for alerts. **Working assumption.**
- The operator agreement carries the operator's warranties about drivers and insurance. To go to the lawyer.

**25.7 Legal checks before launch (not yet done)**

- Whether chauffeur-driven bookings bring Carvo under the ride-hailing rules, even with the operator-attested model. The spec's source says a business can count as a regulated transport network company whatever it calls itself.
- Marketplace terms, operator agreement, and renter terms, including the owner-data and driver points above.
- Data Protection Act registration and obligations for ID and licence images and owner details.
- Whether operators serving tourists need tourism licences.

**25.8 Still open**

| # | Item |
| --- | --- |
| 1 | Corporate accounts: the spec has them in its Phase 2; the build plan has them in Phase 5. Not decided. |
| 2 | How free-period operators move to paid (section 25.4). |
| 3 | Terms of the moderate and strict cancellation policies, and the default response time. |
| 4 | Registered-name suffix for Dirant Technologies, and the logo, domain, and support contacts for Carvo. |
| 5 | Whether the spec's Phase 1 table is adopted whole, or the build plan's phases still lead. |

**25.9 What this changes in the build**

The change list and order are in the review of 22 November 2026: operators and operator roles with row-level security, vehicle-level rates and terms, request and accept booking, both-party agreement signing and inspection confirmation, operator onboarding and the admin queue, then payments, disputes, reviews, and the interfaces. Phase 0 and phase 1 work already built stays, except where this section says otherwise. The documents that still describe a single company (PRD, UX spec, information architecture, database design, API spec) are out of date until corrected, and section 25 applies meanwhile.
