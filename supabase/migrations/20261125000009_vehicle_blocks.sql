-- Renters book a particular car (docs/booking-flow-plan.md). A listed car is free unless a booking or its company's
-- block covers the dates: a block is a hire made outside the platform, a service day, or any day the car is not
-- offered. The database keeps a block and a holding booking of one car from ever overlapping.

create table vehicle_blocks (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  note text check (char_length(note) <= 200),
  created_by uuid default auth.uid() references profiles (id),
  created_at timestamptz not null default now(),
  check (end_at > start_at),
  -- Also the index that finds a car's blocks for given dates.
  exclude using gist (vehicle_id with =, tstzrange(start_at, end_at) with &&)
);
create index vehicle_blocks_vehicle_created_idx on vehicle_blocks (vehicle_id, created_at desc, id desc);

-- The existing check looked at bookings only. It keeps that job under a clearer name.
alter function vehicle_is_booked(uuid, timestamptz, timestamptz) rename to vehicle_has_booking;

create function vehicle_has_block(p_vehicle_id uuid, p_start timestamptz, p_end timestamptz) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from vehicle_blocks k
    where k.vehicle_id = p_vehicle_id and tstzrange(k.start_at, k.end_at) && tstzrange(p_start, p_end)
  )
$$;
revoke execute on function vehicle_has_booking(uuid, timestamptz, timestamptz),
  vehicle_has_block(uuid, timestamptz, timestamptz) from public, anon, authenticated;

-- Taken by every availability count, so a blocked car is no longer counted.
create function vehicle_is_booked(p_vehicle_id uuid, p_start timestamptz, p_end timestamptz) returns boolean
language sql stable security definer set search_path = public as $$
  select vehicle_has_booking(p_vehicle_id, p_start, p_end) or vehicle_has_block(p_vehicle_id, p_start, p_end)
$$;

-- A booking and a block are rows of two tables, so no one constraint covers both. Each side first locks the car's
-- row, which makes two requests for one car take turns, then looks for the other kind. The error is an exclusion
-- violation like the booking overlap rule's, so callers that try another car, or report the overlap, still do.
create function refuse_booking_over_block() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status not in ('pending_payment', 'confirmed', 'ready', 'active') or new.vehicle_id is null then
    return new;
  end if;
  perform 1 from vehicles where id = new.vehicle_id for no key update;
  if vehicle_has_block(new.vehicle_id, new.start_at, new.end_at) then
    raise exception 'BOOKING_OVERLAP' using errcode = 'exclusion_violation';
  end if;
  return new;
end;
$$;
create trigger bookings_refuse_block before insert or update of vehicle_id, start_at, end_at, status on bookings
  for each row execute function refuse_booking_over_block();

create function refuse_block_over_booking() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform 1 from vehicles where id = new.vehicle_id for no key update;
  if vehicle_has_booking(new.vehicle_id, new.start_at, new.end_at) then
    raise exception 'BOOKING_OVERLAP' using errcode = 'exclusion_violation';
  end if;
  return new;
end;
$$;
create trigger vehicle_blocks_refuse_booking before insert or update on vehicle_blocks
  for each row execute function refuse_block_over_booking();

create trigger vehicle_blocks_audit after insert or update or delete on vehicle_blocks
  for each row execute function write_audit();

select ensure_rls_enabled();

-- A company manages the blocks of its own cars. Unlike other records a block may be deleted: it frees the car, and
-- the audit log keeps what was there.
select add_admin_policy('vehicle_blocks');
select add_staff_read_policy('vehicle_blocks');
select add_operator_policies('vehicle_blocks', 'vehicle_operator(vehicle_id)');
create policy vehicle_blocks_operator_delete on vehicle_blocks for delete to authenticated
  using (operator_can_write(vehicle_operator(vehicle_id)));

-- The cars a renter may book for these dates: listed, priced, and neither booked nor blocked. One call for all cars.
create function free_vehicle_ids(p_start timestamptz, p_end timestamptz)
returns table (vehicle_id uuid)
language sql stable security definer set search_path = public as $$
  select listed.id from public_vehicles listed
  join vehicles car on car.id = listed.id
  where car.daily_rate_kes is not null and not vehicle_is_booked(listed.id, p_start, p_end)
$$;
grant execute on function free_vehicle_ids(timestamptz, timestamptz) to anon, authenticated;
