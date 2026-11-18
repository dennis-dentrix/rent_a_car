-- Cancelling a booking and changing its dates, as the customer. Both are database functions so the checks and the
-- change happen together. They run as the owner of the function, so each one checks who is calling.

-- A booking the caller owns and may still change (pending payment, confirmed, or ready), locked for the change.
-- Only other functions call this.
create function lock_changeable_booking(p_booking_id uuid) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  b bookings;
begin
  select * into b from bookings where id = p_booking_id for update;
  if not found or b.customer_id is distinct from auth.uid() then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  if b.status not in ('pending_payment', 'confirmed', 'ready') then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  return b;
end;
$$;
revoke execute on function lock_changeable_booking(uuid) from public, anon, authenticated;

-- What cancelling would mean for this booking right now. Used to show the refund before the customer confirms.
create function cancellation_preview(p_booking_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  b bookings;
  window_hours integer;
begin
  select * into b from bookings where id = p_booking_id;
  if not found or not (b.customer_id = auth.uid() or is_staff()) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  select (value #>> '{}')::integer into window_hours from settings where key = 'cancellation_window_hours';
  return jsonb_build_object(
    'booking_id', b.id,
    'status', b.status,
    'can_cancel', b.status in ('pending_payment', 'confirmed', 'ready'),
    'policy_window', cancellation_policy(b),
    'refund_kes', cancellation_refund_kes(b),
    'full_refund_until', b.start_at - make_interval(hours => window_hours)
  );
end;
$$;

-- Cancel as the customer. Inside the no-refund window the customer must have acknowledged it.
create function cancel_booking(p_booking_id uuid, p_reason text, p_acknowledged boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  b bookings;
  policy text;
begin
  b := lock_changeable_booking(p_booking_id);
  policy := cancellation_policy(b);
  if policy = 'no_refund' and not coalesce(p_acknowledged, false) then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  b := transition_booking(
    p_booking_id, 'cancelled', auth.uid(), coalesce(nullif(trim(p_reason), ''), 'Cancelled by the customer')
  );
  return jsonb_build_object('status', b.status, 'refund_kes', b.refund_due_kes, 'policy_window', policy);
end;
$$;

-- Move a booking to the dates of a new quote, which the API priced from the rate table. Allowed a limited number
-- of times and not close to pickup. The same vehicle is kept when it is free, otherwise another of the class.
create function change_booking_dates(p_booking_id uuid, p_quote_id uuid) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  b bookings;
  q quotes;
  cutoff_hours integer;
  max_changes integer;
  candidate record;
  changed boolean := false;
begin
  b := lock_changeable_booking(p_booking_id);
  select (value #>> '{}')::integer into cutoff_hours from settings where key = 'date_change_cutoff_hours';
  select (value #>> '{}')::integer into max_changes from settings where key = 'max_date_changes';
  if b.start_at - now() < make_interval(hours => cutoff_hours) or b.date_changes >= max_changes then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;

  q := claim_quote(p_quote_id);
  if q.class_id <> b.class_id then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;

  for candidate in
    select id from vehicles where class_id = b.class_id and status = 'active'
    order by (id = b.vehicle_id) desc, registration
  loop
    begin
      update bookings set
        start_at = q.start_at, end_at = q.end_at, vehicle_id = candidate.id, quote_id = q.id,
        total_kes = q.total_kes,
        -- A deposit already received stays as it was; it can never be more than the new total.
        deposit_kes = case when b.status = 'pending_payment' then q.deposit_kes else least(b.deposit_kes, q.total_kes) end,
        pricing_snapshot = jsonb_build_object(
          'breakdown', q.breakdown, 'service', q.service, 'display_currency', q.display_currency,
          'exchange_rate_to_kes', q.exchange_rate_to_kes, 'exchange_rate_date', q.exchange_rate_date,
          'display_total', q.display_total, 'previous_quote_id', b.quote_id
        ),
        date_changes = b.date_changes + 1
      where id = b.id returning * into b;
      changed := true;
      exit;
    exception when exclusion_violation then
      continue;
    end;
  end loop;
  if not changed then
    raise exception 'BOOKING_OVERLAP' using errcode = 'P0001';
  end if;

  update bookings set balance_kes = total_kes - deposit_kes where id = b.id returning * into b;
  -- A delivery moves with the new start date.
  update deliveries set
    window_start = q.delivery_window_start, window_end = q.delivery_window_end
  where booking_id = b.id and q.delivery_window_start is not null;
  insert into booking_status_events (booking_id, from_status, to_status, actor_id, note)
  values (b.id, b.status, b.status, auth.uid(), 'Dates changed by the customer');
  return b;
end;
$$;

revoke execute on function cancellation_preview(uuid) from public, anon;
revoke execute on function cancel_booking(uuid, text, boolean) from public, anon;
revoke execute on function change_booking_dates(uuid, uuid) from public, anon;
grant execute on function cancellation_preview(uuid) to authenticated;
grant execute on function cancel_booking(uuid, text, boolean) to authenticated;
grant execute on function change_booking_dates(uuid, uuid) to authenticated;
