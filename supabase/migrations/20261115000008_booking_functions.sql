-- Creating a booking from a quote, and releasing unpaid holds.
-- Business errors are raised as exceptions whose message is an API error code (docs/api-spec.md section 3).

-- A quote that can still become (or change) a booking: it exists, has not expired, and no booking has used it.
-- Locks it so two requests cannot claim the same quote. Only other functions call this.
create function claim_quote(p_quote_id uuid) returns quotes
language plpgsql security definer set search_path = public as $$
declare
  q quotes;
begin
  select * into q from quotes where id = p_quote_id for update;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  if q.expires_at < now() then
    raise exception 'QUOTE_EXPIRED' using errcode = 'P0001';
  end if;
  if exists (select 1 from bookings where quote_id = q.id) then
    raise exception 'CONFLICT' using errcode = 'P0001';
  end if;
  return q;
end;
$$;
revoke execute on function claim_quote(uuid) from public, anon, authenticated;

-- Creating a booking from a quote. Staff can pick the vehicle and skip the 30-minute hold, and the event
-- records who did it. A delivery quote creates its delivery record.
create function create_booking_from_quote(
  p_quote_id uuid,
  p_customer_id uuid,
  p_company_id uuid,
  p_actor_id uuid default null,
  p_vehicle_id uuid default null,
  p_no_expiry boolean default false
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  q quotes;
  candidate record;
  created bookings;
  hold_minutes integer;
begin
  q := claim_quote(p_quote_id);
  if p_vehicle_id is not null and not exists (
    select 1 from vehicles where id = p_vehicle_id and class_id = q.class_id and status = 'active'
  ) then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;

  select (value #>> '{}')::integer into hold_minutes from settings where key = 'hold_minutes';

  for candidate in
    select id from vehicles
    where class_id = q.class_id and status = 'active' and (p_vehicle_id is null or id = p_vehicle_id)
    order by registration
  loop
    begin
      insert into bookings (
        reference, customer_id, company_id, quote_id, vehicle_id, class_id, start_at, end_at, status,
        handover_type, pickup_location_id, total_kes, deposit_kes, security_deposit_kes, balance_kes,
        pricing_snapshot, hold_expires_at
      ) values (
        'BK-' || upper(substr(md5(random()::text || clock_timestamp()::text || q.id::text), 1, 8)),
        p_customer_id, p_company_id, q.id, candidate.id, q.class_id, q.start_at, q.end_at, 'pending_payment',
        q.handover_type, q.pickup_location_id, q.total_kes, q.deposit_kes, q.security_deposit_kes,
        q.total_kes - q.deposit_kes,
        jsonb_build_object(
          'breakdown', q.breakdown, 'service', q.service, 'display_currency', q.display_currency,
          'exchange_rate_to_kes', q.exchange_rate_to_kes, 'exchange_rate_date', q.exchange_rate_date,
          'display_total', q.display_total
        ),
        case when p_no_expiry then null else now() + make_interval(mins => coalesce(hold_minutes, 30)) end
      ) returning * into created;

      insert into booking_status_events (booking_id, from_status, to_status, actor_id, note)
      values (
        created.id, null, 'pending_payment', coalesce(p_actor_id, p_customer_id),
        case when p_actor_id is null then 'Booking created from quote' else 'Booking created by staff' end
      );
      if q.handover_type = 'delivery' then
        insert into deliveries (booking_id, address, window_start, window_end)
        values (created.id, q.delivery_address, q.delivery_window_start, q.delivery_window_end);
      end if;
      return created;
    exception when exclusion_violation then
      continue;
    end;
  end loop;

  raise exception 'BOOKING_OVERLAP' using errcode = 'P0001';
end;
$$;

revoke execute on function create_booking_from_quote(uuid, uuid, uuid, uuid, uuid, boolean) from public, anon, authenticated;
grant execute on function create_booking_from_quote(uuid, uuid, uuid, uuid, uuid, boolean) to service_role;

-- Moves bookings whose 30-minute hold has passed to expired, which frees the vehicle.
create function expire_unpaid_bookings() returns integer
language plpgsql security definer set search_path = public as $$
declare
  stale record;
  released integer := 0;
begin
  for stale in
    select id from bookings
    where status = 'pending_payment' and hold_expires_at < now()
    for update skip locked
  loop
    perform transition_booking(stale.id, 'expired', null, 'Hold expired');
    released := released + 1;
  end loop;
  return released;
end;
$$;

revoke execute on function expire_unpaid_bookings() from public, anon, authenticated;
grant execute on function expire_unpaid_bookings() to service_role;
