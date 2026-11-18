-- Quotes, bookings, status events, deliveries, drivers, handover. docs/database-design.md section 5.

create table quotes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles (id),
  email text,
  class_id uuid not null references vehicle_classes (id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  pickup_location_id uuid references locations (id),
  handover_type handover_type not null,
  total_kes integer not null check (total_kes >= 0),
  deposit_kes integer not null check (deposit_kes >= 0),
  security_deposit_kes integer not null default 0 check (security_deposit_kes >= 0),
  breakdown jsonb not null,
  -- Section 24.1: display currency, rate and converted amounts are fixed when the quote is created.
  display_currency char(3) not null default 'KES',
  exchange_rate_to_kes numeric(12, 6) not null default 1 check (exchange_rate_to_kes > 0),
  exchange_rate_date date,
  display_total integer,
  -- The extras chosen, so the quote can be priced again when the dates change.
  extra_ids uuid[] not null default '{}',
  -- Where and when a delivery happens, so the booking can create its delivery record.
  delivery_address text,
  delivery_zone_id uuid references delivery_zones (id),
  delivery_window_start timestamptz,
  delivery_window_end timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at),
  check (
    handover_type <> 'delivery' or (
      delivery_address is not null and delivery_zone_id is not null
      and delivery_window_start is not null and delivery_window_end > delivery_window_start
    )
  )
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_id uuid references profiles (id),
  company_id uuid references companies (id),
  quote_id uuid unique references quotes (id),
  vehicle_id uuid references vehicles (id),
  class_id uuid not null references vehicle_classes (id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status booking_status not null default 'quoted',
  handover_type handover_type not null,
  pickup_location_id uuid references locations (id),
  total_kes integer not null check (total_kes >= 0),
  deposit_kes integer not null,
  security_deposit_kes integer not null default 0 check (security_deposit_kes >= 0),
  balance_kes integer not null check (balance_kes >= 0),
  pricing_snapshot jsonb not null,
  hold_expires_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  -- What is owed back to the customer on cancellation. Recorded here until payments and refunds are built.
  refund_due_kes integer check (refund_due_kes >= 0),
  date_changes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at),
  check (deposit_kes <= total_kes),
  -- A vehicle cannot be double booked. pending_payment is included so the 30-minute hold is enforced
  -- here; the expiry job moves unpaid bookings to expired, which frees the vehicle.
  exclude using gist (
    vehicle_id with =,
    tstzrange(start_at, end_at) with &&
  ) where (status in ('pending_payment', 'confirmed', 'ready', 'active') and vehicle_id is not null)
);
create index bookings_vehicle_dates_idx on bookings (vehicle_id, start_at, end_at);
create index bookings_customer_status_idx on bookings (customer_id, status);
create index bookings_company_status_idx on bookings (company_id, status);

create table booking_status_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id),
  from_status booking_status,
  to_status booking_status not null,
  actor_id uuid references profiles (id),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index booking_status_events_booking_idx on booking_status_events (booking_id, created_at);
create trigger booking_status_events_append_only
  before update or delete on booking_status_events for each row execute function block_changes();

-- The allowed moves. domain/booking-status.js mirrors this table; a test keeps them equal.
create table booking_status_transitions (
  from_status booking_status not null,
  to_status booking_status not null,
  primary key (from_status, to_status)
);
insert into booking_status_transitions (from_status, to_status) values
  ('quoted', 'pending_payment'), ('quoted', 'expired'),
  ('pending_payment', 'confirmed'), ('pending_payment', 'cancelled'), ('pending_payment', 'expired'),
  ('confirmed', 'ready'), ('confirmed', 'cancelled'),
  ('ready', 'active'), ('ready', 'cancelled'),
  ('active', 'returned'),
  ('returned', 'closed');

-- The one way to change a booking's status. Writes the event in the same transaction and enforces the rules
-- that go with each step: verified documents before ready, an inspection before active and before returned.
create function transition_booking(p_booking_id uuid, p_to booking_status, p_actor uuid, p_note text)
returns bookings
language plpgsql security definer set search_path = public as $$
declare
  current_row bookings;
  old_status booking_status;
begin
  select * into current_row from bookings where id = p_booking_id for update;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  old_status := current_row.status;
  if not exists (
    select 1 from booking_status_transitions t where t.from_status = old_status and t.to_status = p_to
  ) then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  if p_to = 'ready' and not documents_verified(current_row.customer_id, current_row.id) then
    raise exception 'DOCUMENTS_NOT_VERIFIED' using errcode = 'P0001';
  end if;
  if (p_to = 'active' and not inspection_recorded(current_row.id, 'pickup'))
     or (p_to = 'returned' and not inspection_recorded(current_row.id, 'return')) then
    raise exception 'INSPECTION_REQUIRED' using errcode = 'P0001';
  end if;
  perform set_config('app.via_transition', 'on', true);
  update bookings set
    status = p_to,
    cancelled_at = case when p_to = 'cancelled' then now() else cancelled_at end,
    cancellation_reason = case when p_to = 'cancelled' then p_note else cancellation_reason end,
    refund_due_kes = case when p_to = 'cancelled' then cancellation_refund_kes(current_row) else refund_due_kes end
  where id = p_booking_id returning * into current_row;
  insert into booking_status_events (booking_id, from_status, to_status, actor_id, note)
  values (p_booking_id, old_status, p_to, p_actor, p_note);
  return current_row;
end;
$$;

-- Rejects any direct status change that did not come through transition_booking.
create function guard_booking_status() returns trigger
language plpgsql as $$
begin
  if new.status is distinct from old.status
     and coalesce(current_setting('app.via_transition', true), 'off') <> 'on' then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger bookings_guard_status before update on bookings for each row execute function guard_booking_status();

create table drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  licence_number text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id),
  address text not null,
  window_start timestamptz not null,
  window_end timestamptz not null,
  driver_id uuid references drivers (id),
  status delivery_status not null default 'scheduled',
  checklist jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (window_end > window_start)
);
create index deliveries_window_start_idx on deliveries (window_start);

create table handover_records (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id),
  type text not null check (type in ('pickup', 'return')),
  fuel_level text,
  mileage_km integer,
  photo_paths text[] not null default '{}',
  customer_signature_path text,
  recorded_by uuid references profiles (id),
  recorded_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger handover_records_append_only
  before update or delete on handover_records for each row execute function block_changes();

