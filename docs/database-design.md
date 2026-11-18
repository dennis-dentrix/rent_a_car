# Database Design Document

**Purpose:** Defines every table, column, type, constraint, index, and policy. Database: Supabase Postgres. Conventions: snake\_case names; `id uuid primary key default gen_random_uuid()`; `created_at` and `updated_at` as `timestamptz` in UTC on every table; money as `integer` in KES; RLS enabled on every table.

## 1. Enumerated types

| Type                 | Values                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `user_role`          | customer, corporate\_approver, staff, admin                                              |
| `booking_status`     | quoted, pending\_payment, confirmed, ready, active, returned, closed, cancelled, expired |
| `handover_type`      | office, delivery                                                                         |
| `vehicle_status`     | active, maintenance, retired                                                             |
| `payment_method`     | mpesa, card, bank                                                                        |
| `payment_status`     | pending, succeeded, failed, cancelled                                                    |
| `refund_status`      | requested, approved, rejected, paid                                                      |
| `document_type`      | national\_id, driving\_licence, agreement, receipt                                       |
| `document_status`    | uploaded, verified, rejected, replaced                                                   |
| `delivery_status`    | scheduled, out\_for\_delivery, completed, failed                                         |
| `tax_receipt_status` | none, pending, submitted, failed                                                         |
| `enquiry_source`     | whatsapp, phone, form                                                                    |

## 2. Identity and companies

**profiles**: `id uuid` (equals `auth.users.id`), `full_name text not null`, `phone text unique`, `email text`, `role user_role not null default 'customer'`, `company_id uuid references companies(id)`, `marketing_opt_in boolean not null default false`, `deleted_at timestamptz`. Index on `company_id`.

**companies**: `name text not null`, `kra_pin text`, `billing_email text`, `credit_terms_days integer default 0`, `approval_limit_kes integer`. Check: `credit_terms_days >= 0`.

## 3. Fleet and pricing

**vehicle\_classes**: `name text not null unique`, `seats smallint not null`, `description text`, `best_for text[]`, `is_public boolean default true`, `sort_order integer`.

**vehicles**: `registration text not null unique`, `make text`, `model text`, `year smallint`, `class_id uuid not null references vehicle_classes(id)`, `status vehicle_status not null default 'active'`, `mileage_km integer`, `home_location_id uuid references locations(id)`. Index on `class_id`.

**rates**: `class_id uuid not null references vehicle_classes(id)`, `duration_type text not null check (duration_type in ('day','week'))`, `price_kes integer not null check (price_kes > 0)`, `effective_from date not null`, `effective_to date`. Exclusion constraint: no overlapping date ranges for the same class and duration type.

**extras**: `name text not null`, `price_kes integer not null check (price_kes >= 0)`, `pricing_type text not null check (pricing_type in ('per_day','per_booking'))`, `is_active boolean default true`.

**settings**: `key text primary key`, `value jsonb not null`, `updated_by uuid`, `updated_at`. Holds deposit percent, grace period, delivery zone fees, `etims_enabled`, `currency_selector_enabled`, and similar values. Read through one service function; cached per request.

**exchange\_rates**: `currency char(3) primary key`, `rate_to_kes numeric(12,6) not null check (rate_to_kes > 0)`, `rate_date date not null`. Display only.

## 4. Locations and delivery

**locations**: `name text not null`, `type text not null check (type in ('office','airport','custom'))`, `address text not null`, `latitude numeric(9,6)`, `longitude numeric(9,6)`, `entrance_note text`, `is_served boolean not null default true`, `slug text unique not null`. Pages exist only where `is_served` is true.

**delivery\_zones**: `name text not null`, `fee_kes integer not null check (fee_kes >= 0)`, `polygon` optional, `is_active boolean default true`.

## 5. Customers, quotes, and bookings

**quotes**: `customer_id uuid references profiles(id)`, `email text`, `class_id uuid not null references vehicle_classes(id)`, `start_at timestamptz not null`, `end_at timestamptz not null`, `pickup_location_id uuid references locations(id)`, `handover_type handover_type not null`, `total_kes integer not null`, `deposit_kes integer not null`, `breakdown jsonb not null`, `expires_at timestamptz not null`. Check: `end_at > start_at`.

**bookings**: `reference text unique not null`, `customer_id uuid references profiles(id)`, `company_id uuid references companies(id)`, `quote_id uuid unique references quotes(id)`, `vehicle_id uuid references vehicles(id)`, `class_id uuid not null references vehicle_classes(id)`, `start_at timestamptz not null`, `end_at timestamptz not null`, `status booking_status not null default 'quoted'`, `handover_type handover_type not null`, `pickup_location_id uuid references locations(id)`, `total_kes integer not null`, `deposit_kes integer not null`, `balance_kes integer not null`, `pricing_snapshot jsonb not null`, `cancelled_at timestamptz`, `cancellation_reason text`.

Overlap rule: exclusion constraint on `vehicle_id` with `tstzrange(start_at, end_at)` for bookings whose status is in (confirmed, ready, active).

Check: `end_at > start_at`; `total_kes >= 0`; `deposit_kes <= total_kes`.

**booking\_status\_events**: `booking_id uuid not null references bookings(id)`, `from_status booking_status`, `to_status booking_status not null`, `actor_id uuid references profiles(id)`, `note text`. Append-only: updates and deletes are blocked by trigger.

**deliveries**: `booking_id uuid not null references bookings(id)`, `address text not null`, `window_start timestamptz not null`, `window_end timestamptz not null`, `driver_id uuid references drivers(id)`, `status delivery_status not null default 'scheduled'`, `checklist jsonb`. Check: `window_end > window_start`.

**drivers**: `name text not null`, `phone text not null`, `licence_number text`, `is_active boolean default true`.

**handover\_records**: `booking_id uuid not null references bookings(id)`, `type text not null check (type in ('pickup','return'))`, `fuel_level text`, `mileage_km integer`, `photo_paths text[]`, `customer_signature_path text`, `recorded_by uuid references profiles(id)`, `recorded_at timestamptz not null`. Append-only.

## 6. Payments and refunds

**payments**: `booking_id uuid not null references bookings(id)`, `provider text not null default 'tingg'`, `provider_reference text unique`, `method payment_method not null`, `amount_kes integer not null check (amount_kes > 0)`, `status payment_status not null`, `paid_at timestamptz`, `tax_receipt_status tax_receipt_status not null default 'none'`.

**payment\_events**: `provider_event_id text primary key` (idempotency key), `provider text not null`, `payload jsonb not null`, `received_at timestamptz not null default now()`, `processed_at timestamptz`.

**refunds**: `payment_id uuid not null references payments(id)`, `amount_kes integer not null check (amount_kes > 0)`, `reason text not null`, `status refund_status not null default 'requested'`, `requested_by uuid references profiles(id)`, `approved_by uuid references profiles(id)`, `check (approved_by is null or approved_by <> requested_by)`.

## 7. Documents

**documents**: `owner_id uuid not null references profiles(id)`, `booking_id uuid references bookings(id)`, `type document_type not null`, `storage_path text not null unique`, `status document_status not null default 'uploaded'`, `reviewed_by uuid references profiles(id)`, `reviewed_at timestamptz`, `rejection_reason text`, `replaces_id uuid references documents(id)`. Files are never deleted; replaced rows keep their history.

**document\_access\_log**: `document_id uuid not null references documents(id)`, `accessed_by uuid not null references profiles(id)`, `reason text not null`, `accessed_at timestamptz not null default now()`. Append-only.

## 8. Enquiries, invoices, and tax

**enquiries**: `source enquiry_source not null`, `name text`, `phone text`, `message text`, `converted_booking_id uuid references bookings(id)`, `handled_by uuid references profiles(id)`.

**invoices**: `company_id uuid not null references companies(id)`, `period_start date not null`, `period_end date not null`, `total_kes integer not null`, `status text not null check (status in ('draft','issued','paid','overdue'))`, `etims_reference text`, `etims_submitted_at timestamptz`, `customer_pin text`.

**etims\_submissions** (empty at launch): `payment_id uuid references payments(id)`, `invoice_id uuid references invoices(id)`, `request_json jsonb`, `response_json jsonb`, `status text not null`, `attempts integer not null default 0`, `last_error text`.

## 9. Audit

**audit\_log**: `actor_id uuid references profiles(id)`, `action text not null`, `table_name text not null`, `row_id uuid`, `old_values jsonb`, `new_values jsonb`, `created_at timestamptz not null default now()`. Written by triggers on `rates`, `profiles`, `settings`, `vehicles`, `refunds`.

## 10. Indexes

- `bookings (vehicle_id, start_at, end_at)` for availability.
- `bookings (customer_id, status)` and `bookings (company_id, status)`.
- `booking_status_events (booking_id, created_at)`.
- `payments (booking_id)`; `payments (provider_reference)` unique.
- `documents (owner_id)`; `documents (status)` for the review queue.
- `deliveries (window_start)` for the daily list.

## 11. Storage buckets

| Bucket              | Public | Contents                                                            |
| ------------------- | ------ | ------------------------------------------------------------------- |
| `vehicle-photos`    | Yes    | Vehicle images, resized on upload                                   |
| `documents-private` | No     | IDs, licences, agreements, receipts, handover photos and signatures |

## 12. Rules enforced in the database

- Overlapping bookings rejected by exclusion constraint.
- Booking status changes only through the transition function, which writes `booking_status_events` in the same transaction.
- `payment_events` primary key prevents double processing of a webhook.
- Row Level Security on every table, from the access control matrix in section 13 of the pack.
- Soft delete on `profiles` only; other rows are kept for legal and audit reasons.

## 13. Migration and seed rules

- Every schema change is a numbered SQL migration in `supabase/migrations`.
- Seed data contains no real personal information.
- Production data is never copied to development.

## 14. Open questions

1. Retention period for identity and rental records (lawyer to confirm).
2. Whether `delivery_zones.polygon` is needed at launch or a fee list is enough.

## Additions: owners, chassis, trackers, inspections (15 November 2026)

See product pack section 24.10. Migrations 9 and 10.

- **vehicle\_owners**: `owner_type` (individual, company), `full_name`, `phone`, `email`, `kra_pin`, `status`, `notes`. Admin writes; staff read.
- **vehicle\_owner\_private**: `owner_id` (primary key), `national_id_number`, `payout_method` (mpesa, bank), `payout_account`, `payout_account_name`. Admin only.
- **vehicles**: new `chassis_number text not null` (at least 5 characters, unique ignoring case and spaces) and `owner_id` (null for the company's own vehicles).
- **ownership\_agreements**: `owner_id`, `vehicle_id`, `commission_percent` (0 to 100), `starts_on`, `ends_on`, `agreement_storage_path`, `notes`. A vehicle cannot have overlapping agreements. The first agreement sets the vehicle's owner; an agreement for a different owner is a conflict.
- **vehicle\_trackers**: `vehicle_id`, `provider`, `model`, `device_id` (unique), `sim_number`, `installed_on`, `removed_on`, `status` (active, inactive, faulty, removed), `subscription_expires_on`, `notes`. At most one active tracker per vehicle.
- **handover\_records** (the inspection report): `photo_paths` is removed. New `vehicle_id` (must be the booking's vehicle), `condition_notes`, `damage_noted`, `checklist`. Still append-only.
- **inspection\_files**: `handover_record_id`, `kind` (photo, document), `label`, `caption`, `storage_path` (private R2 key), `content_type`, `size_bytes` (1 byte to 10 MB). Append-only. Customers read the files of their own rentals; staff read and add.
- **Functions:** `create_inspection(...)` saves a report and its files in one transaction. `ensure_updated_at_triggers()`, `ensure_rls_enabled()`, and the `add_*_policy` helpers keep table set-up in one place.
