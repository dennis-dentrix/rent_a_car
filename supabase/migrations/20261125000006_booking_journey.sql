-- What a renter watches while they wait (docs/booking-visibility.md, phase 1). The booking status stays the rule for
-- price and availability; the steps between statuses are milestones beside it.

create table booking_milestones (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id),
  step text not null check (step in ('car_prepared', 'en_route', 'arrived')),
  actor_id uuid references profiles (id),
  created_at timestamptz not null default now(),
  unique (booking_id, step)
);
create trigger booking_milestones_append_only
  before update or delete on booking_milestones for each row execute function block_changes();

alter table bookings add column no_show_at timestamptz;

select ensure_rls_enabled();

create policy milestones_read on booking_milestones for select to authenticated using (
  (select is_staff()) or owns_booking(booking_id) or operates_booking(booking_id)
);
-- No write policy: milestones are recorded only through record_milestone, which checks the booking allows the step.

-- The booking, locked, if the caller runs it: staff, or the company whose car it is while it may write.
create function lock_run_booking(p_booking_id uuid) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  booking bookings;
begin
  select * into booking from bookings where id = p_booking_id for update;
  if booking.id is null or not (is_staff() or operator_can_write(booking.operator_id)) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  return booking;
end;
$$;
revoke execute on function lock_run_booking(uuid) from public, anon, authenticated;

-- One tap by the company. Tapping the same step again changes nothing.
create function record_milestone(p_booking_id uuid, p_step text) returns void
language plpgsql security definer set search_path = public as $$
declare
  booking bookings := lock_run_booking(p_booking_id);
  allowed boolean;
begin
  allowed := case p_step
    when 'car_prepared' then booking.status in ('confirmed', 'ready')
    when 'en_route' then booking.status = 'ready' and booking.handover_type = 'delivery'
    when 'arrived' then booking.status = 'ready'
      and exists (select 1 from booking_milestones m where m.booking_id = p_booking_id and m.step = 'en_route')
    else false
  end;
  if not allowed then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  insert into booking_milestones (booking_id, step, actor_id) values (p_booking_id, p_step, auth.uid())
  on conflict (booking_id, step) do nothing;
end;
$$;

-- The renter did not come. Recorded after the start time, once; the status is changed separately.
create function mark_no_show(p_booking_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  booking bookings := lock_run_booking(p_booking_id);
begin
  if booking.status not in ('confirmed', 'ready') or booking.start_at > now() or booking.no_show_at is not null then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  update bookings set no_show_at = now() where id = p_booking_id;
end;
$$;

-- Of the bookings confirmed in each of the last weeks (Nairobi), how many were cancelled or not turned up for.
create function booking_outcomes(p_weeks integer default 8)
returns table (week date, confirmed bigint, cancelled bigint, no_shows bigint)
language sql stable security definer set search_path = public as $$
  select date_trunc('week', e.first_confirmed at time zone 'Africa/Nairobi')::date,
    count(*),
    count(*) filter (where b.status = 'cancelled'),
    count(*) filter (where b.no_show_at is not null)
  from (
    select booking_id, min(created_at) as first_confirmed
    from booking_status_events where to_status = 'confirmed' group by booking_id
  ) e
  join bookings b on b.id = e.booking_id
  where is_staff() and e.first_confirmed >= now() - make_interval(weeks => p_weeks)
  group by 1 order by 1 desc
$$;
create index booking_status_events_confirmed_idx on booking_status_events (created_at, booking_id)
  where to_status = 'confirmed';

revoke execute on function record_milestone(uuid, text), mark_no_show(uuid), booking_outcomes(integer)
  from public, anon;
grant execute on function record_milestone(uuid, text), mark_no_show(uuid), booking_outcomes(integer)
  to authenticated;
