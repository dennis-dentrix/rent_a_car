# UI Build Plan (Carvo web app)

**Source designs:** ten Stitch screens and `DESIGN.md` in `Desktop/Car-rental/stitch_carvo_brand_and_ui_design`. They are a visual reference to adapt, not a spec. Tokens, logo, and mobile patterns: `design-system.md`. Components: `ui-component-library.md`. Business rules: `product-pack.md` §25, then §24, §23. Routes: `information-architecture.md`.

**Starting point (23 November 2026):** `apps/web` was reset to the base Next.js skeleton. The earlier build used the wrong colours and design system and is discarded.

**Positioning (owner):** Carvo is for everyone who needs a car: a Demio for a weekend, a family SUV for a month, a van for an event, or a car with a driver for an airport run. Any approved operator can list any vehicle. Short and long stays get equal weight (weekly, monthly, and longer through the discount rules in `docs/CLAUDE.md` §3). The designs lean on executive, diplomatic, and VIP language; all of it is rewritten to a plain, welcoming tone.

## 1. Where the designs and the product disagree

Where a design conflicts with our rulings, the rulings win.

| Design shows | Ruling | What we do |
| --- | --- | --- |
| Escrow ("SafeReserve"), M-PESA STK push, card, wire at checkout | Payments deferred; pay at handover, recorded by the operator (§25.3, §25.5, §24.12) | Price breakdown and a "Refundable deposit" line. No payment picker, no escrow wording; copy says how the deposit is handled |
| Armoured B6, armed escort, diplomatic convoy | Out of scope; claims we cannot verify | Drop from classes, filters, badges |
| NTSA, DCI, eCitizen API match, RSA-4096 and SHA-256 claims | Documents stored and reviewed by hand (§25.1, §25.7); no registry integrations | Admin sees uploaded documents beside entered details, with approve or reject and a required reason |
| Ratings, "314 missions", named testimonials, live stats | No reviews until completed bookings exist (§25.3) | No ratings or testimonials at launch; stat strips show only real API numbers |
| Live telematics, speed, fuel, GPS map | Trackers recorded, not integrated (§24.10) | Show tracker presence only |
| Flight number and ADS-B tracking | Not planned | Optional "flight number" text field |
| Escrow bonds, custody limits, owner yield settlement | Payouts and escrow not built (§24.10) | Omit. Owner records keep the commission percent as a stored figure |
| WhatsApp as the main CTA | Allowed as contact; guests submit an enquiry (§24.6) | WhatsApp is secondary; the primary action is the enquiry or request |
| Plus Jakarta Sans (PRD), Inter (`DESIGN.md`) | Nunito Sans, owner ruling | Nunito Sans only |
| Nav: Explore Fleet, Chauffeur, Airport Transfer, B2B Corporate | B2B deferred | Cars, Airport transfers, Chauffeur, How it works |
| Executive, VIP, diplomatic wording; 4x4, S-Class, Alphard fleet | Carvo serves all renters and operators | Classes run from economy and compact (Demio, Vitz, Note) through sedans, SUVs, vans, pickups, premium |
| Fixed hubs (JKIA VIP, Gigiri, Karen) | Locations come from the `locations` table | Pickup choices read from the API |
| Daily rate and "3 days" framing | Weekly, monthly, longer discounts are rules (§3) | Per-day price plus a "weekly and monthly rates" line; the quote shows the named discount |

The PRD in the design folder is a design-tool brief. It does not replace `prd.md`.

## 2. Method (applies to every screen)

1. Check `ui-component-library.md` first; extend a component before writing one.
2. Draw or build the 390 px layout first and check 360 px, then tablet (768) and desktop (1280). Staff screens are phone-usable and desktop-optimised.
3. Lift layout, hierarchy, and spacing from the Stitch screen; write every string as a message key in `apps/web/copy/`.
4. Tokens only: no raw colour or size outside `styles/tokens` and `brand.js`. Every amount through `Price`, every status through `StatusBadge`.
5. The web app calls the API only. A screen is built after its route exists: migration, service, route, UI.
6. Click actions update optimistically, show "saving", and roll back with a plain message. Price, status, and availability come from the server.
7. Before writing Next.js code, read the guides in `node_modules/next/dist/docs/`; this version differs from older releases.
8. Every public page ships with its SEO from the first commit (`docs/growth-seo.md` §2): metadata from `lib/seo.js` (unique title and description, one canonical, Open Graph and Twitter), JSON-LD from `lib/structured-data.js` built from the same data the page shows, one `h1` and ordered headings, descriptive link text, accessible names on every graphic, server-rendered content, and an entry in `app/sitemap.js`. A filtered or dated variation of a page is `noindex, follow` and points at the main page. Private areas are in `app/robots.js` and carry `noindex`.
9. Each phase ends at a gate. `npm run check` stays green.

## 3. Phases

### Phase 0: Foundation

1. **Tokens.** Light and dark colour set, Nunito Sans via `next/font`, type scale, spacing, radius, elevation, motion, z-index. `brand.js` holds the accent, dark accent, and mark colour; the Tailwind config and `styles/tokens` read from it. Raw-colour lint rule.
2. **Logo.** The SVG set in `design-system.md` §8: mark, favicon variant without the dot (checked at 16 px), single-colour, wordmark, app icon.
3. **Shells.** Public (header, tab bar, footer), account, operator console (tab bar on phone, side rail on desktop), admin.
4. **Core components,** in this order: `Button`, `Field` and `TextField`, `Chip`, `SegmentedControl`, `Badge` and `StatusBadge`, `Card`, `InsetList`, `Sheet`, `ActionSheet`, `Dialog`, `Toast`, `Alert`, `Skeleton`, `EmptyState`, `Price`, `QuoteBreakdown`, `DateRangePicker`, `Select`, `ProgressSteps`, `DataTable`.
5. **`/dev/components`** page showing every state in light and dark at 360 and 1280 px, excluded from production.

Gate: every component renders in light and dark; contrast checks pass for every token pair; Lighthouse accessibility 95 or better on the shells; the logo is legible at 16 px; no raw colours outside the token files.

### Phase 1: Public site (renter, not signed in)

**Services and currency (owner, 23 November 2026):** the service model is three lines, each with services (`packages/shared/src/services.js`, and the `services` table): car hire (self-drive, chauffeur-driven), transfers (airport, corporate), and events (wedding cars, video shoots, convoys, corporate transport), with room for more. A rental company chooses which services it offers and a renter can filter by them. **Built:** the `services` and `operator_services` tables with RLS, `set_operator_services` and `classes_offering_service`, public `GET /services`, a `service` filter on `GET /classes`, and admin `GET`/`PUT /admin/operators/{id}/services` (migration `20261123000001_services.sql`; its database and API tests have not been run, as no local database was available). **Still to build:** the operator's own services screen (Phase 4, using `set_operator_services`, which already lets an operator set its own). Currency: KES or USD in the header, defaulting by country (`CF-IPCountry`, set once by `proxy.js`), saved in a cookie, display only; it uses the public `GET /exchange-rates`.

**Search UX rules (from review, 23 November 2026):** the strip holds only the trip details and is one aligned row (2 cells for car hire, 4 for transfers, 3 for events) from desktop width, stacked on a phone; the service is a compact dropdown beside the tabs, not a field in the strip; every cell has an icon, a small label, and one value at one height; a choice that needs typing ("Somewhere else") swaps the dropdown for a box in the same cell and never changes the row height; dates and times use our own picker sheet, never the browser's raw date field; searching without a date opens the picker and says why; the three tabs share the width on a phone; the hero artwork stays a thin watermark and never crosses the text; suggestion lists are wide enough not to truncate.

**Search:** tabs per service line with dropdown fields (service, pick-up, drop-off or event location with a "Somewhere else" option, passengers, cars needed, times) and a date sheet; a header search box that suggests services, car types and places and takes free text as a name search (`/cars?q=`).

**Service pages: built (23 November 2026).** `/car-hire`, `/transfers`, and `/events` exist, each with its own content (`copy/service-pages.js`), `Service`, `FAQPage` and `BreadcrumbList` markup, a canonical and share image, a sitemap entry, links from the header, footer, and home service cards, and the search preset to that line. What each must contain is below, as built. **Still open:** per-page images and real photos, the services each page lists coming from the operators who offer them, and live "from" prices on the transfer and event pages (only car hire shows rates today). One page per service line, each with its own content, structured data, and place in the sitemap, modelled on how the Abboss site gives each service its own page. Each answers one intent (`docs/growth-seo.md` §4), links into the search with the service preselected, and shows only what is true of this product.

| Page | Address | Intent | Must contain | Markup |
| --- | --- | --- | --- | --- |
| Car hire | `/car-hire` | Hire a car by the day, week, or month, self-drive or with a driver | What is included; self-drive vs chauffeur-driven; the price lines (hire, longer-hire discount, delivery, refundable deposit); documents needed; cancellation and date-change rules; live "from" prices per car type; FAQ | `Service`, `FAQPage`, `BreadcrumbList` |
| Transfers | `/transfers` | Airport and corporate transfers with a driver | Airport pickup steps, corporate transfers, what to tell us (flight number, passengers, drop-off); the search preset to transfers; FAQ | `Service`, `FAQPage`, `BreadcrumbList` |
| Events | `/events` | Wedding cars, video-shoot vehicles, convoys, corporate transport | Each event service in its own section with what it covers; how many cars and how far ahead to ask; the search preset to events; FAQ | `Service`, `FAQPage`, `BreadcrumbList` |

Rules for these pages: no invented prices, ratings, or testimonials; a rental company's services appear only if it has chosen them; each page has a unique title, description, canonical, and share image through `lib/seo.js`; add the three addresses to `app/sitemap.js` and link them from the header, the footer, and the service cards on the home page; the top navigation shows Airport transfers and Events once these pages exist.


**Photos (owner, 23 November 2026):** car types show a real photograph wherever one exists, and the drawing only where it does not. A photo is found in this order: the first path stored on the car type (`photo_paths`, which the API returns as `image_url`), joined to `NEXT_PUBLIC_MEDIA_BASE_URL` when it is a storage path; then a file named after the car type's slug in `apps/web/public/car-photos/` (`sedan.jpg`, `suv.webp`; webp, jpg, jpeg, or png). Photos are served through `next/image`, sized for the screen, lazy except the car type page's main photo. They appear on the cards, the car type page, and the car type dropdown. **Not built:** uploading photos (an admin or operator screen, and image hosting, which is the open R2 item), and per-vehicle photos (`/vehicles/[id]`). Real vehicle photos should come from the rental companies, and class photos must show a real car of that type, not an illustration passed off as a fleet photo. **Example images (owner, 23 November 2026):** until companies supply photos, `public/example-photos/` holds an AI-generated example (`minibus`; a generic van, no brands or plates); real photos go in `public/car-photos/` (`economy`, `sedan`, `suv`, `van`, `luxury` and `tour-van` are real photos supplied by the owner, named after the slugs the owner's data uses; `tour-van` waits for an admin to create that car type) and win over an example of the same name. Any photo served from the examples folder carries an "Example image" badge (`CarPhoto`, text in `copy.cars.exampleImage`); a real photo, from `car-photos`, the API or the media base address, does not. Replace an example by adding the real photo to the car type, or deleting the file.

**Dropdowns (owner, 23 November 2026):** a dropdown opens under its control and is a plain list (`components/Dropdown.js`, drawn above the page so rounded or clipped parents cannot cut it off). The car type picker lists every type with a drawing beside it; the place box is a typed text field with suggestions under it, and what is typed is the final location. Date and time pickers keep their sheet (a bottom sheet on phones, a centred dialog on wide screens). **Tour van:** the drawing and the match words ("tour", "safari") are built; the car type itself is data, so an admin adds it with `POST /admin/classes` (for example name "Tour van", slug "tour-van", seats 7, best for Safaris and Groups) and a rate with `POST /admin/rates`. It was not added to `supabase/seed.sql` because the API tests assert the seeded classes.

**Operators page: built (23 November 2026).** `/operators` for rental companies: what is on offer, why join, how joining works, the documents asked for, an application form, a "talk to our team" action, and an FAQ, with `FAQPage` and `BreadcrumbList` markup, a sitemap entry, and a footer link. The application is sent as an enquiry whose message begins "Operator application." (the enquiry route takes no category), so staff can filter on it; replies go to the applicant's email. Operator sign-in, document upload, and the console are Phase 4 and not built; the page says tools open in stages. Its claims follow product pack section 25 (free in the early stage, listed after review, owner details private, operator verifies chauffeurs). The documents list is a working assumption from 25.1.

**Car type pages: built (23 November 2026).** `/cars/[slug]` for every car type: breadcrumbs, the drawing, seats, luggage, best-for tags, the description from the API, a price card with the daily rate and the refundable-deposit note, a dates check that opens `/cars` with the type chosen, a WhatsApp question, "Good to know", the price lines, and other car types. It is static (no query read), with `Product` markup priced per day (no rating or review count), `BreadcrumbList`, a unique title and description, a canonical, a sticky "Check dates" button on phones, and an entry in the sitemap read from the API. An unknown type is a 404 with `noindex`. Cards, suggestions, and service pages now link to it. **Not yet:** per-vehicle pages (`/vehicles/[id]`), real photos, and live availability on the page itself (it is on `/cars`, which keeps this page fast to serve).

**SEO built so far:** `robots.txt`, `sitemap.xml`, share image, per-page metadata, Organization, FAQPage and BreadcrumbList markup, and `NEXT_PUBLIC_SITE_URL`. **Still to do:** `Product` markup and a page per car type, city, airport and office pages (only for places served), service pages, and the content plan in `growth-seo.md`. The Organization markup leaves out a phone number until a real one is set in `brand.js`.

**Built (23 November 2026):** the home page (search, popular car types, how it works, why hire with us, WhatsApp help), `/cars` (live availability for dates, best-for filters, loading, empty, and API-down states), and the API layer (`lib/api.js`, five-second timeout, never throws). **Next:** class pages, vehicle pages, city and airport pages, service pages, FAQ and the rest below. Car photos stay as a placeholder until image hosting is decided (`image_url` is a storage path; R2 location is an open item). The pickup place is carried in the address but the API does not filter by it yet.

Homepage, `/cars` results with filters (sheet on phone), `/cars/[class-slug]`, `/vehicles/[id]` (operator card with verified badge, chauffeur option, cancellation policy, sticky price bar), `/car-hire/[city]`, `/airports/[slug]`, `/services/*`, `/how-it-works`, `/faq`, `/about`, `/contact`, `/locations`, `/privacy`, `/terms`, guest enquiry form, consent banner, structured data, sitemap and robots (exist).

API first: catalogue listing with operator and chauffeur fields, and pricing per vehicle (today per class). This is the first backend change the UI forces.

Gate: pages server-rendered; Lighthouse targets in pack §20.6; enquiry submits end to end; currency switch works and is remembered.

### Phase 2: Accounts and renter area

`/auth` (sign in, sign up, confirm, reset), `/account`, `/account/bookings` and `[id]`, `/account/documents`, `/account/profile`. Document upload straight to the private bucket on signed links. API exists; operator-aware booking fields to add.

Gate: sign-up to booking list works on staging; upload and access rules verified.

### Phase 3: Quote and booking

`/quote` (dates, delivery, extras, breakdown with a separate "Refundable deposit"), `/book/[quote-id]/details`, agreement and e-signature, request status (waiting, accepted, declined, expired, alternatives), cancellation with the required acknowledgement, date change, confirmed timeline. One step per screen on phone with the sticky total bar.

API first: request and accept flow, new statuses, cancellation policies, operator as lessor in the agreement (§25.9, not built).

Gate: pricing and double-booking tests pass; a renter completes request to confirmed on staging.

### Phase 4: Operator console

Onboarding with documents and pending approval; dashboard; fleet list and add-vehicle (company-owned or individual owner, chassis, tracker, photos); vehicle owners (private to the operator); drivers with the operator's attestation (§25.6); bookings inbox with swipe accept and decline and a response timer; calendar (day view on phone); handover inspection on mobile with photos and signature; team and settings.

API first: operator routes for each area, `operator_id` set by the API, owner routes moved from `/admin` to the operator and admin access to private owner data removed (§25.2), onboarding documents. The migration exists.

Gate: an operator can onboard, be approved, list a car, accept a request, and record a handover on staging; RLS tests cover each role.

### Phase 5: Staff and admin

Operator review queue with documents beside entered details and a required reason; staff booking inbox and detail; enquiries; fleet calendar; document review with the access log; refunds; rates and settings; audit log; dashboard with real numbers only. Operator review is a database function with no route yet.

Gate: staff run every pilot booking from the inbox; admin approves a real operator end to end.

### Phase 6: Polish and launch

Dark-mode and reduced-motion pass, keyboard and screen-reader pass, empty and error states, skeletons on slow connections, analytics events with consent, Sentry, Lighthouse CI, Playwright journeys for the three main flows, copy review, lawyer review of agreement and terms wording.

Gate: pack §20.6 performance targets; Playwright journeys green in CI.

## 4. Screen-to-phase map

| Stitch screen | Phase | Notes |
| --- | --- | --- |
| Brand and logo system | 0 | Logo set and colour roles, simplified per `design-system.md` §8 and §14 |
| Core component spec sheet | 0 | Checked against `ui-component-library.md` |
| Renter homepage | 1 | Remove escrow and escort copy |
| Fleet search and discovery | 1 | Drop armoured filters; keep chauffeur toggle, budget, category |
| Vehicle detail and checkout | 1 (detail), 3 (checkout) | Detail page first, then quote and booking steps |
| Operator fleet management | 4 | Remove live telematics and yield settlement |
| Operator bookings inbox | 4 | Keep accept and decline with timer; drop escrow lock |
| Chauffeur and driver registry | 4 | Operator-entered checklist and attestation replace the "5-pillar engine" |
| Admin operator review queue | 5 | Documents plus entered details, reason required |

## 5. Working assumptions (change if you disagree)

1. Corporate stays out of navigation until its phase.
2. Operator console navigation: tab bar on phone, side rail on desktop, replacing the design's top tab strip.
3. Launch vehicle classes: economy, compact, sedan, SUV, van, pickup, premium. Admin adds more through `/admin/classes`.
4. Search leads with dates, pickup place, and the "with a driver" toggle. The first filter row is class, price per day, transmission, and seats.
5. Internal `/dev/components` page instead of Storybook.
