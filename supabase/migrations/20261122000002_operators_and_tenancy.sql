-- Operators and tenant isolation (product pack section 25). An operator is a rental company that lists its
-- fleet. Its users see and change only that operator's records; Carvo staff and admin keep the access they had.
--
-- Scope of this migration: identity, fleet, owners, drivers, and the read side of bookings. Rates, discounts,
-- extras, delivery zones, and locations stay platform-wide until pricing reads them per operator; letting an
-- operator write those now would let one company change every other company's prices.
--
-- vehicles.operator_id is nullable on purpose. A null operator is the platform's own legacy fleet, and the API
-- does not set the column yet. Operators cannot write a row without their own id (policies below), so the column
-- becomes NOT NULL in the migration that moves the API over.

create type operator_status as enum ('pending', 'approved', 'rejected', 'suspended');

create table operators (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  slug text not null unique,
  registration_number text,
  kra_pin text,
  address text,
  phone text,
  email text,
  status operator_status not null default 'pending',
  status_reason text,
  verified_at timestamptz,
  verified_by uuid references profiles (id),
  -- Billing comes later (section 25.4). Every operator is free while the platform launches.
  plan text not null default 'free_launch',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- An operator user belongs to exactly one operator, and nobody else belongs to one.
alter table profiles add column operator_id uuid references operators (id);
create index profiles_operator_id_idx on profiles (operator_id);
alter table profiles add constraint profiles_operator_role_check
  check ((role = 'operator') = (operator_id is not null));

alter table vehicles add column operator_id uuid references operators (id);
alter table drivers add column operator_id uuid references operators (id);
alter table vehicle_owners add column operator_id uuid references operators (id);
alter table bookings add column operator_id uuid references operators (id);
create index vehicles_operator_id_idx on vehicles (operator_id);
create index drivers_operator_id_idx on drivers (operator_id);
create index vehicle_owners_operator_id_idx on vehicle_owners (operator_id);
create index bookings_operator_status_idx on bookings (operator_id, status);

-- Who the signed-in user works for, or null.
create function auth_operator_id() returns uuid
language sql stable security definer set search_path = public as $$
  select operator_id from profiles where id = auth.uid() and deleted_at is null
$$;

-- True when the row belongs to the signed-in user's operator. A null owner never matches.
create function operates(p_operator_id uuid) returns boolean
language sql stable as $$ select coalesce(p_operator_id = auth_operator_id(), false) $$;

-- Writing is allowed while the operator is being set up or approved, and not after rejection or suspension.
create function operator_can_write(p_operator_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select operates(p_operator_id)
    -- TODO(human): decide which statuses may write. Today a pending operator can add vehicles, drivers, and owners
    -- before approval. Remove 'pending' to make an operator wait for approval before it can set up its fleet.
    and exists (select 1 from operators o where o.id = p_operator_id and o.status in ('pending', 'approved'))
$$;

-- The operator that owns a vehicle, an owner record, or a booking, read past Row Level Security.
create function vehicle_operator(p_vehicle_id uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select operator_id from vehicles where id = p_vehicle_id
$$;

create function owner_operator(p_owner_id uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select operator_id from vehicle_owners where id = p_owner_id
$$;

create function operates_booking(p_booking_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from bookings b where b.id = p_booking_id and operates(b.operator_id))
$$;

create function operates_inspection(p_record_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from handover_records h where h.id = p_record_id and operates_booking(h.booking_id))
$$;

-- A booking belongs to the operator of its vehicle. The database sets it, so no caller can claim a booking.
create function sync_booking_operator() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.operator_id := (select operator_id from vehicles where id = new.vehicle_id);
  return new;
end;
$$;
create trigger bookings_sync_operator before insert or update of vehicle_id on bookings
  for each row execute function sync_booking_operator();

-- An owner record is used only by the operator that created it: its vehicles and agreements must match.
create function check_vehicle_owner_operator() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.owner_id is not null and owner_operator(new.owner_id) is distinct from new.operator_id then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger vehicles_check_owner_operator before insert or update of owner_id, operator_id on vehicles
  for each row execute function check_vehicle_owner_operator();

create function check_agreement_operator() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if owner_operator(new.owner_id) is distinct from vehicle_operator(new.vehicle_id) then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
-- Named so it fires before ownership_agreements_sync_owner, which sets the vehicle's owner.
create trigger ownership_agreements_check_operator before insert or update on ownership_agreements
  for each row execute function check_agreement_operator();

-- Every operator change is audited, including who approved it.
create trigger operators_audit after insert or update or delete on operators
  for each row execute function write_audit();

-- The one way to approve, reject, or suspend an operator. Admin only, with a reason when the answer is not yes.
create function review_operator(p_operator_id uuid, p_to operator_status, p_reason text)
returns operators
language plpgsql security definer set search_path = public as $$
declare
  current_row operators;
begin
  if not is_admin() then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;
  if p_to = 'pending' or (p_to in ('rejected', 'suspended') and coalesce(trim(p_reason), '') = '') then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  select * into current_row from operators where id = p_operator_id for update;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  if not (
    (current_row.status = 'pending' and p_to in ('approved', 'rejected'))
    or (current_row.status = 'approved' and p_to = 'suspended')
    or (current_row.status = 'suspended' and p_to = 'approved')
  ) then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  update operators set
    status = p_to,
    status_reason = nullif(trim(p_reason), ''),
    verified_at = case when p_to = 'approved' then now() else verified_at end,
    verified_by = case when p_to = 'approved' then auth.uid() else verified_by end
  where id = p_operator_id returning * into current_row;
  return current_row;
end;
$$;
revoke execute on function review_operator(uuid, operator_status, text) from public, anon;
grant execute on function review_operator(uuid, operator_status, text) to authenticated;

select ensure_updated_at_triggers();
select ensure_rls_enabled();

-- Operators: an operator reads and edits its own contact details, never its status or plan. Staff read; admin writes.
select add_admin_policy('operators');
select add_staff_read_policy('operators');
create policy operators_own_read on operators for select to authenticated using (operates(id));
create policy operators_own_update on operators for update to authenticated
  using (operates(id)) with check (operates(id));
revoke update on operators from authenticated;
grant update (business_name, registration_number, kra_pin, address, phone, email) on operators to authenticated;

-- Renters see an approved operator's name only, through a view, so contact and tax details stay private.
create view public_operators as
  select id, business_name, slug from operators where status = 'approved';
grant select on public_operators to anon, authenticated;

-- A person cannot join an operator by editing their own profile: the operator, like the role, is fixed.
alter policy profiles_own_update on profiles
  with check (
    id = auth.uid() and role = auth_role()
    and company_id is not distinct from auth_company_id()
    and operator_id is not distinct from auth_operator_id()
  );
create policy profiles_operator_team_read on profiles for select to authenticated using (operates(operator_id));
create policy profiles_operator_renter_read on profiles for select to authenticated using (
  exists (select 1 from bookings b where b.customer_id = profiles.id and operates(b.operator_id))
);

-- Read, add, and change rows that belong to the operator. `scope` is the SQL that finds the row's operator.
-- Operators never delete: a vehicle is retired and an agreement is ended, so history stays.
create function add_operator_policies(t text, scope text) returns void
language plpgsql as $$
begin
  execute format('create policy %I on %I for select to authenticated using (operates(%s))',
    t || '_operator_read', t, scope);
  execute format('create policy %I on %I for insert to authenticated with check (operator_can_write(%s))',
    t || '_operator_insert', t, scope);
  execute format(
    'create policy %I on %I for update to authenticated using (operator_can_write(%s)) with check (operator_can_write(%s))',
    t || '_operator_update', t, scope, scope);
end;
$$;

select add_operator_policies('vehicles', 'operator_id');
select add_operator_policies('drivers', 'operator_id');
select add_operator_policies('vehicle_owners', 'operator_id');
select add_operator_policies('vehicle_owner_private', 'owner_operator(owner_id)');
select add_operator_policies('ownership_agreements', 'vehicle_operator(vehicle_id)');
select add_operator_policies('vehicle_trackers', 'vehicle_operator(vehicle_id)');

-- Bookings and what hangs off them are read-only for operators. Price, status, and dates change only through
-- functions that check the rules; those arrive with the request-and-accept flow.
create policy bookings_operator_read on bookings for select to authenticated using (operates(operator_id));
create policy events_operator_read on booking_status_events for select to authenticated
  using (operates_booking(booking_id));
create policy payments_operator_read on payments for select to authenticated using (operates_booking(booking_id));
create policy deliveries_operator_read on deliveries for select to authenticated using (operates_booking(booking_id));
create policy signatures_operator_read on agreement_signatures for select to authenticated
  using (operates_booking(booking_id));

-- Inspections are the operator's handover record: read them, and add one for its own booking.
create policy handover_operator_read on handover_records for select to authenticated
  using (operates_booking(booking_id));
create policy handover_operator_insert on handover_records for insert to authenticated
  with check (operates_booking(booking_id));
create policy inspection_files_operator_read on inspection_files for select to authenticated
  using (operates_inspection(handover_record_id));
create policy inspection_files_operator_insert on inspection_files for insert to authenticated
  with check (operates_inspection(handover_record_id));

-- Whether a vehicle may be offered to renters: its operator is approved, or it is the platform's own (null) fleet.
create function vehicle_is_listed(p_operator_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select p_operator_id is null
    or exists (select 1 from operators o where o.id = p_operator_id and o.status = 'approved')
$$;

create function vehicle_is_booked(p_vehicle_id uuid, p_start timestamptz, p_end timestamptz) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from bookings b
    where b.vehicle_id = p_vehicle_id
      and b.status in ('pending_payment', 'confirmed', 'ready', 'active')
      and tstzrange(b.start_at, b.end_at) && tstzrange(p_start, p_end)
  )
$$;

-- Only vehicles of approved operators count as available.
create or replace function available_vehicle_count(p_class_id uuid, p_start timestamptz, p_end timestamptz)
returns integer
language plpgsql stable security definer set search_path = public as $$
declare
  listed_free integer;
begin
  select count(*) into listed_free from vehicles v
  where v.class_id = p_class_id and v.status = 'active'
    and vehicle_is_listed(v.operator_id)
    and not vehicle_is_booked(v.id, p_start, p_end);
  return listed_free;
end;
$$;
