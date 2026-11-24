# Information Architecture (IA)

**Purpose:** Defines every page and route, who can reach it, and how screens connect. Read with the UX spec (how users move) and the API spec (what each route calls).

## 1. Areas

| Area             | Path prefix           | Who                                       |
| ---------------- | --------------------- | ----------------------------------------- |
| Public site      | `/` and content paths | Anyone                                    |
| Customer account | `/account`            | Signed-in customer                        |
| Corporate        | `/company`            | Corporate approvers and company admins    |
| Staff workspace  | `/staff`              | Staff and admin                           |
| Admin            | `/admin`              | Admin                                     |
| Auth             | `/auth`               | Anyone                                    |
| Webhooks         | `/api/v1/webhooks`    | Provider servers only (signature checked) |

## 2. Public routes

| Route                         | Page               | Purpose                                              | Indexed |
| ----------------------------- | ------------------ | ---------------------------------------------------- | ------- |
| `/`                           | Homepage           | Sell first, then search                              | Yes     |
| `/cars`                       | Vehicle classes    | Browse all classes                                   | Yes     |
| `/cars/[class-slug]`          | Vehicle class page | Specs, best for, included items, price, reviews      | Yes     |
| `/vehicles/[vehicle-id]`      | Vehicle page       | Single vehicle photos and status                     | Yes     |
| `/car-hire/[city-slug]`       | City page          | Local landing page for each served city              | Yes     |
| `/airports/[airport-slug]`    | Airport page       | Transfers and pickup from each airport desk          | Yes     |
| `/services/airport-transfers` | Service page       | Airport transfer service                             | Yes     |
| `/services/chauffeur`         | Service page       | Chauffeur hire                                       | Yes     |
| `/services/executive-hire`    | Service page       | Executive rentals                                    | Yes     |
| `/services/corporate`         | Corporate page     | B2B offer and contact                                | Yes     |
| `/services/events`            | Event page         | Event transport, once content exists                 | Yes     |
| `/locations`                  | Locations          | Offices and map                                      | Yes     |
| `/locations/[office-slug]`    | Office page        | Address, map, hours, entrance note                   | Yes     |
| `/how-it-works`               | Process            | Steps, documents needed, office and delivery options | Yes     |
| `/faq`                        | FAQ                | Questions with FAQ schema                            | Yes     |
| `/about`                      | About              | Company, team, registration details                  | Yes     |
| `/contact`                    | Contact            | WhatsApp, phone, email, office map                   | Yes     |
| `/quote`                      | Quote builder      | Dates, class, extras, delivery; live price           | No      |
| `/book/[quote-id]`            | Booking steps      | Customer details, payment, confirmation              | No      |
| `/privacy`, `/terms`          | Legal              | Privacy notice, terms                                | Yes     |

## 3. Booking routes (guest or signed in)

| Route                        | Step                      |
| ---------------------------- | ------------------------- |
| `/book/[quote-id]/details`   | Customer information      |
| `/book/[quote-id]/payment`   | Deposit                   |
| `/book/[quote-id]/confirmed` | Confirmation and timeline |

A guest who pays is asked to create an account after confirmation, with the booking linked to the new account.

## 4. Customer routes (`/account`)

| Route                    | Purpose                                                       |
| ------------------------ | ------------------------------------------------------------- |
| `/account`               | Home: upcoming booking and quick actions                      |
| `/account/bookings`      | List with filters                                             |
| `/account/bookings/[id]` | Booking detail: timeline, documents, pickup, change or cancel |
| `/account/documents`     | ID and licence; signed agreements; receipts                   |
| `/account/payments`      | Deposits, balances, refunds                                   |
| `/account/profile`       | Name, phone, email, notification settings                     |

## 5. Corporate routes (`/company`)

| Route                | Purpose                                 |
| -------------------- | --------------------------------------- |
| `/company`           | Home: active rentals, pending approvals |
| `/company/bookings`  | Company bookings                        |
| `/company/approvals` | Approval queue                          |
| `/company/staff`     | Invite and manage staff; set roles      |
| `/company/invoices`  | Monthly statements and invoices         |
| `/company/profile`   | Billing details, KRA PIN, credit terms  |

## 6. Staff routes (`/staff`)

| Route                       | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `/staff`                    | Dashboard: KPI cards, activity feed, fleet availability |
| `/staff/bookings`           | Booking inbox                                           |
| `/staff/bookings/[id]`      | Booking detail and status changes                       |
| `/staff/bookings/new`       | Quick booking from an enquiry                           |
| `/staff/enquiries`          | WhatsApp, phone, and form enquiries                     |
| `/staff/fleet`              | Vehicles and fleet calendar                             |
| `/staff/fleet/[vehicle-id]` | Vehicle detail: status, maintenance, history            |
| `/staff/drivers`            | Drivers and day schedule                                |
| `/staff/deliveries`         | Delivery list by date                                   |
| `/staff/customers`          | Customer search and history                             |
| `/staff/customers/[id]`     | Customer profile, bookings, documents                   |
| `/staff/documents`          | Document review queue                                   |
| `/staff/payments`           | Payments and reconciliation                             |
| `/staff/invoices`           | Invoices                                                |
| `/staff/reports`            | Utilisation, revenue, conversion                        |

## 7. Admin routes (`/admin`)

Built (24 November 2026): `/admin` (what needs the admin, today's movement, latest changes), `/admin/bookings` and `/admin/bookings/{id}` (status moves), `/admin/enquiries`, `/admin/documents` (open with a logged reason, verify or reject), `/admin/operators` (company review), `/admin/posts` (guides), `/admin/team`, `/admin/audit`, and `/admin/menu` (the phone's list of sections). A side rail with Work, Content and Setup groups from tablet up; four tabs on phones, the last opening `/admin/menu`. Still to build below: prices, places, settings, and fleet screens (their API exists).

| Route              | Purpose                                               |
| ------------------ | ----------------------------------------------------- |
| `/admin/rates`     | Rate table by class and date                          |
| `/admin/extras`    | Extras and fees                                       |
| `/admin/locations` | Offices, airports, delivery zones, coordinates        |
| `/admin/policies`  | Deposit, cancellation, late-return rules              |
| `/admin/staff`     | Staff roles and access                                |
| `/admin/refunds`   | Refund approvals                                      |
| `/admin/settings`  | Feature flags: currency selector, eTIMS, reviews      |
| `/admin/audit`     | Audit log: rate changes, document reads, role changes |

## 8. Navigation by device

- **Public, phone:** bottom bar Search, Bookings, Account; header menu for the rest.
- **Public, desktop:** top header with the items in the PRD.
- **Staff, desktop:** sidebar rail that expands on hover or focus; two levels maximum; hidden below 768 px behind a menu button.
- **Staff, phone:** bottom bar with Inbox, Deliveries, Fleet, More.

## 9. Redirects and rules

- Trailing slashes removed; lowercase slugs.
- Old or renamed slugs redirect with a permanent redirect.
- City and airport pages exist only for places the company serves; others return a not-found page.
- Staff and admin routes return `noindex`.

## 10. Open questions

1. Final list of served cities and airports (drives the location pages).
2. Are event pages needed at launch, or after content exists?
3. Does the admin area need its own domain or only a path?
