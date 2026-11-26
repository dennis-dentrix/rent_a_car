-- A requested booking is accepted or declined by the car's company, or expires. Only confirmed bookings block dates,
-- so the overlap rules, which do not list `requested`, are checked at the moment of accepting.

insert into booking_status_transitions (from_status, to_status) values
  ('pending_payment', 'requested'),
  ('requested', 'confirmed'),
  ('requested', 'declined'),
  ('requested', 'cancelled'),
  ('requested', 'expired');

insert into settings (key, value) values ('request_response_minutes', '120')
on conflict (key) do nothing;

create function answer_request(p_booking_id uuid, p_accept boolean, p_reason text) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  booking bookings := lock_run_booking(p_booking_id);
begin
  if booking.status <> 'requested' or booking.hold_expires_at < now() then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  if p_accept is not true and coalesce(trim(p_reason), '') = '' then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  update bookings set hold_expires_at = null where id = booking.id;
  return transition_booking(
    booking.id,
    case when p_accept then 'confirmed' else 'declined' end::booking_status,
    auth.uid(),
    coalesce(nullif(trim(p_reason), ''), 'Request accepted'));
exception when exclusion_violation then
  raise exception 'BOOKING_OVERLAP' using errcode = 'P0001';
end;
$$;
revoke execute on function answer_request(uuid, boolean, text) from public, anon;
grant execute on function answer_request(uuid, boolean, text) to authenticated;

create function expire_unanswered_requests() returns integer
language sql security definer set search_path = public as $$
  select count(transition_booking(stale.id, 'expired', null, 'The company did not answer in time'))::integer
  from (
    select id from bookings
    where status = 'requested' and hold_expires_at < now()
    for update skip locked
  ) stale
$$;
revoke execute on function expire_unanswered_requests() from public, anon, authenticated;
grant execute on function expire_unanswered_requests() to service_role;

-- A renter is shown that a booking changed without them until they open it. Kept apart from the booking, so reading
-- it is not a change to the record.
create table booking_news (
  booking_id uuid primary key references bookings (id) on delete cascade,
  customer_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index booking_news_customer_idx on booking_news (customer_id);
select ensure_rls_enabled();
create policy booking_news_own_read on booking_news for select to authenticated
  using (customer_id = (select auth.uid()));

create function flag_booking_news() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into booking_news (booking_id, customer_id)
  select id, customer_id from bookings
  where id = new.booking_id and customer_id is distinct from new.actor_id
  on conflict (booking_id) do nothing;
  return new;
end;
$$;
create trigger booking_status_events_news after insert on booking_status_events
  for each row execute function flag_booking_news();

create function mark_booking_seen(p_booking_id uuid) returns void
language sql security definer set search_path = public as $$
  delete from booking_news where booking_id = p_booking_id and customer_id = auth.uid()
$$;
revoke execute on function mark_booking_seen(uuid) from public, anon;
grant execute on function mark_booking_seen(uuid) to authenticated;

-- What is waiting for the caller: chats with something unseen, for a renter the bookings that changed, and for a
-- company the requests to answer.
create function my_alerts()
returns table (unread_messages integer, waiting_requests integer, booking_updates integer)
language sql stable security definer set search_path = public as $$
  select
    (select count(*)::integer from conversations c
     where (c.renter_id = auth.uid() and c.last_from_company
              and c.last_message_at > coalesce(c.renter_read_at, '-infinity'))
        or (c.operator_id = auth_operator_id() and not c.last_from_company
              and c.last_message_at > coalesce(c.company_read_at, '-infinity'))),
    (select count(*)::integer from bookings b
     where b.operator_id = auth_operator_id() and b.status = 'requested' and b.hold_expires_at > now()),
    (select count(*)::integer from booking_news n where n.customer_id = auth.uid())
$$;
revoke execute on function my_alerts() from public, anon;
grant execute on function my_alerts() to authenticated;

-- A chat shows the renter's latest booking of the car it is about.
create index bookings_vehicle_customer_idx on bookings (vehicle_id, customer_id, created_at desc, id desc);
