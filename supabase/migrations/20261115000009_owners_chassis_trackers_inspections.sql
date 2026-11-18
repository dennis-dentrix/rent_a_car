-- Private vehicle owners, chassis numbers, trackers, and inspection reports with files.
-- Owner request, 15 November 2026. Tables are empty on a fresh database, so NOT NULL columns can be added.

-- Private owners the company rents cars out for. Payouts and escrow stay later work.
create table vehicle_owners (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null default 'individual' check (owner_type in ('individual', 'company')),
  full_name text not null,
  phone text not null,
  email text,
  kra_pin text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sensitive owner details, readable by admin only.
create table vehicle_owner_private (
  owner_id uuid primary key references vehicle_owners (id) on delete cascade,
  national_id_number text,
  payout_method text check (payout_method in ('mpesa', 'bank')),
  payout_account text,
  payout_account_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table vehicles
  add column chassis_number text not null check (length(trim(chassis_number)) >= 5),
  add column owner_id uuid references vehicle_owners (id);
create unique index vehicles_chassis_number_key on vehicles (upper(trim(chassis_number)));
create index vehicles_owner_id_idx on vehicles (owner_id);

-- The terms under which an owner's vehicle is rented out. Stored only; nothing is calculated from it yet.
create table ownership_agreements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references vehicle_owners (id),
  vehicle_id uuid not null references vehicles (id),
  commission_percent numeric(5, 2) not null check (commission_percent between 0 and 100),
  starts_on date not null,
  ends_on date,
  agreement_storage_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or ends_on >= starts_on),
  exclude using gist (
    vehicle_id with =,
    daterange(starts_on, coalesce(ends_on, 'infinity'::date), '[]') with &&
  )
);

-- A vehicle has one current owner. The first agreement sets it; an agreement for a different owner conflicts.
create function sync_vehicle_owner() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  current_owner uuid;
begin
  select owner_id into current_owner from vehicles where id = new.vehicle_id for update;
  if current_owner is null then
    update vehicles set owner_id = new.owner_id where id = new.vehicle_id;
  elsif current_owner <> new.owner_id then
    raise exception 'CONFLICT' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger ownership_agreements_sync_owner before insert on ownership_agreements
  for each row execute function sync_vehicle_owner();

-- Trackers fitted to vehicles. Provider login details are never stored here.
create table vehicle_trackers (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles (id),
  provider text not null,
  model text,
  device_id text not null unique,
  sim_number text,
  installed_on date,
  removed_on date,
  status text not null default 'active' check (status in ('active', 'inactive', 'faulty', 'removed')),
  subscription_expires_on date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vehicle_trackers_vehicle_idx on vehicle_trackers (vehicle_id);
create unique index one_active_tracker_per_vehicle on vehicle_trackers (vehicle_id) where status = 'active';

-- Inspection reports are the handover records: one at pickup, one at return. Photos and documents move to
-- their own table so each file has a type, a label, and a size.
alter table handover_records
  drop column photo_paths,
  add column vehicle_id uuid not null references vehicles (id),
  add column condition_notes text,
  add column damage_noted boolean not null default false,
  add column checklist jsonb;

-- The vehicle inspected must be the vehicle on the booking.
create function check_inspection_vehicle() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select vehicle_id from bookings where id = new.booking_id) is distinct from new.vehicle_id then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger handover_records_check_vehicle before insert on handover_records
  for each row execute function check_inspection_vehicle();

create table inspection_files (
  id uuid primary key default gen_random_uuid(),
  handover_record_id uuid not null references handover_records (id),
  kind text not null check (kind in ('photo', 'document')),
  label text,
  caption text,
  -- Object key in the private Cloudflare R2 bucket.
  storage_path text not null unique,
  content_type text not null,
  size_bytes integer not null check (size_bytes between 1 and 10485760),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inspection_files_record_idx on inspection_files (handover_record_id);
create trigger inspection_files_append_only
  before update or delete on inspection_files for each row execute function block_changes();

-- Audit, updated_at, and RLS for the new tables.
create trigger vehicle_owners_audit after insert or update or delete on vehicle_owners
  for each row execute function write_audit();
create trigger vehicle_owner_private_audit after insert or update or delete on vehicle_owner_private
  for each row execute function write_audit();
create trigger ownership_agreements_audit after insert or update or delete on ownership_agreements
  for each row execute function write_audit();
create trigger vehicle_trackers_audit after insert or update or delete on vehicle_trackers
  for each row execute function write_audit();

select ensure_updated_at_triggers();
select ensure_rls_enabled();

-- Admin writes owners, agreements, and trackers; staff read them. Private owner details are admin only.
select add_admin_policy(t) from unnest(array[
  'vehicle_owners', 'vehicle_owner_private', 'ownership_agreements', 'vehicle_trackers'
]) as t;
select add_staff_read_policy(t) from unnest(array[
  'vehicle_owners', 'ownership_agreements', 'vehicle_trackers'
]) as t;

-- Inspection files follow their inspection: customers see their own rental's, staff add and read.
create function owns_inspection(p_record_id uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from handover_records h where h.id = p_record_id and owns_booking(h.booking_id)
  )
$$;
create policy inspection_files_own on inspection_files for select to authenticated
  using (owns_inspection(handover_record_id));
create policy inspection_files_staff_read on inspection_files for select to authenticated using (is_staff());
create policy inspection_files_staff_insert on inspection_files for insert to authenticated with check (is_staff());
