# Operator Console

What a rental company (an operator) does in its own area, `/console`, and how its data is kept apart from every other company's. This document owns those facts. The marketplace rules are in `product-pack.md` section 25.

## Test sign-in

- Local stack: the seeded company account `operator@example.test` (`supabase/seed.sql`).
- Owner's operator account: `DEV_OPERATOR_EMAIL` and `DEV_OPERATOR_PASSWORD` in `apps/web/.env.local`, which git ignores. A password is never written in a committed file.

## 1. Who and what

The console is for the people of one approved (or still pending) rental company. They see and change only their company's records. Carvo staff and admin keep their own area, `/admin`, and read an operator's private records only with a logged reason.

A pending company may set up its fleet before approval (`operator_can_write`); renters see nothing of it until an admin approves it.

## 2. Screens

| Screen | Route | What the operator does |
| --- | --- | --- |
| Today | `/console` | Sees what needs them: bookings starting and returning today, a vehicle or class with no rate, review status of the company. |
| Bookings | `/console/bookings` | Reads their bookings with the customer, vehicle, dates, and history. Read-only until request-and-accept is built. |
| Fleet | `/console/fleet` | Adds and edits vehicles; sets class and home place; opens a vehicle for trackers and owner agreements. |
| Owners | `/console/owners` | Records the individuals or companies whose cars they manage. |
| Classes and prices | `/console/classes` | Picks from Carvo's class list or adds a class of their own, and sets the daily price of a class (section 12). |
| Places | `/console/places` | Chooses the airports and airstrips they serve, and adds airstrips and pick-up places of their own. |
| Policies | `/console/policies` | Sets rental rules, for all cars or one class. |
| Services | `/console/services` | Chooses which services they offer (self-drive, chauffeur-driven, transfers, events). |
| Company | `/console/company` | Edits their name, registration number, KRA PIN, address, phone, and email. Status and plan are admin-only. |

## 3. Decisions

| Decision | Ruling | Why |
| --- | --- | --- |
| Classes | Carvo keeps a list (`vehicle_classes.operator_id` is null). An operator may add its own (`operator_id` set). An operator's class starts private (`is_public` false) and is shown to renters only when an admin makes it public. | Renters search by a small, clean set of classes. A free-text class would break filters and search pages. |
| Rates | `rates.operator_id` is null for Carvo's own rate and set for an operator's. Two rates of one class and one owner cannot cover the same day. **Renter prices keep reading Carvo's rates only** until the request-and-accept flow (section 25.9) prices a booking from the operator's rate. | A price defect blocks release. Changing which rate a renter is charged is a pricing change and needs the owner's say. |
| Places | Every airport and airstrip is served by default. An operator switches one off (a row in `operator_excluded_locations`) and may add its own (`locations.operator_id` set, never shown to renters). | "Default is all" means a new airstrip added to the list is served by every operator without anyone doing anything. |
| Airport list | The 21 public aerodromes of the Kenya Airports Authority (kaa.go.ke/airports, read 24 November 2026): four international, four domestic, 13 airstrips. The safari strips already in the list stay. | KAA publishes the list on its website; it has no feed, so a change there is a new migration. |
| Writing | An operator never deletes. A vehicle is retired, a rate is ended, a place is switched off. | History and audit stay whole. |
| Second factor | Optional for operators, required for staff and admin. | Owner ruling, `docs/CLAUDE.md`. |

## 4. Data added (migration `20261125000002_operator_console.sql`)

- `vehicle_classes.operator_id`, `rates.operator_id`, `locations.operator_id`, each nullable and indexed.
- `operator_excluded_locations (operator_id, location_id)`.
- The rate overlap rule now includes the owner, so two operators can price one class on the same dates.
- Row Level Security: an operator reads its own rows, adds and changes them while it may write (`operator_can_write`), and cannot make a class public or a place served.
- Twelve KAA airports and airstrips added to `locations`.

## 5. API

Everything is under `/operator` and needs the `operator` role. Each call acts as the signed-in operator, so Row Level Security is the access rule and the API adds only validation.

- `GET /operator/overview`
- `GET`, `POST`, `PATCH` for `vehicles`, `vehicle-owners` (no PATCH), `classes`, `rates`, `places`
- `GET /operator/vehicles/{id}`, `POST /operator/vehicles/{id}/trackers`, `PATCH /operator/trackers/{id}`, `POST /operator/vehicle-owners/{id}/agreements`
- `PUT /operator/places/{id}/served` (on or off for a platform airport or airstrip)
- `GET /operator/bookings`, `GET /operator/bookings/{id}`
- `GET`, `PATCH /operator/company`
- `GET`, `PUT /operator/services`

## 6. Status

Built and checked in the browser on 24 November 2026: every screen in section 2. The API, the migration, and the tests (`operators-api.test.js`) are in place.

## 7. Not built yet

Request-and-accept booking, payment recording at handover, drivers, per-vehicle rates and terms, discounts and extras per operator, owner private details (national ID, payout account), reviews. Each is in section 25.9 of the product pack.

## 8. Phase A: photos, car rates, policies (built 25 November 2026)

| Topic | Ruling |
| --- | --- |
| Car photos | Up to 8 per car, JPEG, PNG, or WebP, uploaded straight to the public bucket under `vehicles/{vehicle_id}/` on signed links, checked by content before they are saved. The first is the cover. Kept in `vehicles.photo_paths`. |
| Own daily rate | `vehicles.daily_rate_kes`, optional. Saved now; **it changes no renter price until a renter can choose a particular car**. |
| Policies | `operator_policies`: one general row per company and optionally one per class, which overrides the general row field by field. Fields: minimum hire days, minimum age, cross-border travel, daily distance limit, fuel rule, and free-text rules. Shown to the company and later printed on inspection reports; **not enforced at booking**. |

## 9. Phase B: handover inspections (built 25 November 2026)

| Topic | Ruling |
| --- | --- |
| Record | The company records a pickup or return inspection from a booking: mileage, fuel, eight checks each marked fine or a problem, damage and notes, and at least four photos. The browser shrinks photos to 1600 px before upload. A saved report cannot be edited. |
| Signing | The company signs. The renter signs on the company's screen with a six-digit code emailed to them (ten minutes, five tries, only its hash kept), or later from their own account. Both must have seen the same report: each signature carries its SHA-256 fingerprint, which covers the readings, checks, notes, and the stored version of every photo. |
| Sealing | When both have signed, the API builds the PDF (up to 20 MB of photos are placed in it), stores it privately, and records its SHA-256 with the server's time. Signatures and sealed reports cannot be changed or removed. A sealing that failed is retried when the report is next opened. |
| Copy | The renter is emailed the PDF, and both sides can open it from the report page. |
| Checking a copy | `GET /verify/inspections/{sha256}` says whether a PDF with that fingerprint was sealed here, when, and for which booking. |
| Rules shown | The company's rules for the class are printed on the report. |

Screens: `/console/inspections`, `/console/inspections/{id}`, the Inspections panel on a booking and `/console/bookings/{id}/inspection`, and for renters `/account` and `/account/inspections/{id}`.

Needs, per environment: email set up (`ZEPTOMAIL_TOKEN`, `ZEPTOMAIL_FROM`) for the on-screen code and the emailed copy (without it the renter signs from their account, and the copy waits in the queue), and CORS on the private bucket allowing `PUT` with `content-type` from the site.

Not decided: whether a booking may move to `active` only once the pickup report is signed by both. The status rules are unchanged.

## 10. Phase C: the renters' fleet page (planned, not built)

The owner asked for the Stitch "Executive Motorpool" screen as what renters see (25 November 2026): a filter rail beside large photo cards.

- Keep: the layout, photo cards with the company's name, year, class and seats, the price per day with the total for the dates, and filters for dates, service, class and price.
- Change to match the rulings: no WhatsApp (a question is asked in the app), no escrow or deposit wording, and no claim the platform does not check (certification, armour grade, insurance, chauffeur vetting).
- Needs first: a public list of cars of approved companies with availability, booking a particular car, and pricing it from the car's or the company's rate. That pricing change is what puts the per-car rate and the policies into effect.

## 11. Car details and the renters' view (built 25 November 2026)

- A car records seats, luggage, gearbox, fuel, drive, engine size, colour, description, features, how it is hired, and a chauffeur price (migration `20261125000004_vehicle_details.sql`). All are optional.
- The car's page shows everything, edits it in a drawer, and changes the daily rate in place (pencil, tick, cross). The figure shown without an own rate is the company's rate for the class, or else Carvo's.
- Renters also see them on the home page and on the car type's page, and each car has its own page, `/cars/[type]/[car]` (`GET /vehicles/{id}`), with every photo and detail. A car type with no photo of its own shows the newest of its cars.
- Renters see approved companies' active cars on `/cars` before dates are chosen, through the `public_vehicles` view and `GET /vehicles`. Registration, chassis, mileage, owner, and the company's own rates are never in it. The price shown is the Carvo class rate, which is what is charged. Booking a particular car is still Phase C.


## 12. Classes and prices on one page (built 25 November 2026)

- `/console/classes` replaces the separate Classes and Daily rates pages (owner request). Each class shows the company's price per day, changed in place, and what a renter pays today. Dated prices (planned, ended, earlier) sit under "Future prices and history".
- A price changed in place starts today: the old one ends the day before, and a second change the same day corrects it. A new class can be given its price as it is added. Each is one database function (`set_operator_class_rate`, `create_operator_class`, migration `20261125000008_operator_class_rate.sql`).
- API: `PUT /operator/classes/{id}/rate`, and `price_kes` on `POST /operator/classes`.
- Renter prices still read Carvo's rates only (section 3).
