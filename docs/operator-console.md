# Operator Console

What a rental company (an operator) does in its own area, `/console`, and how its data is kept apart from every other company's. This document owns those facts. The marketplace rules are in `product-pack.md` section 25.

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
| Classes | `/console/classes` | Picks from Carvo's class list, or adds a class of their own. |
| Daily rates | `/console/rates` | Sets the daily price of a class from a date. |
| Places | `/console/places` | Chooses the airports and airstrips they serve, and adds airstrips and pick-up places of their own. |
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
