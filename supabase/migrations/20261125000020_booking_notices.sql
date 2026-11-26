-- Both sides hear about a booking and a message (docs/booking-flow-plan.md). Notices are still saved in the same
-- transaction as the change. This replaces the renter-only rule of the first notification migration.
drop trigger booking_status_events_email on booking_status_events;
drop function queue_booking_email();

-- Where a company's emails go: its own address, or that of its first person when it gave none.
create function company_email(p_operator_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    nullif(trim((select email from operators where id = p_operator_id)), ''),
    (select email from profiles where operator_id = p_operator_id and deleted_at is null
     order by created_at, id limit 1))
$$;
revoke execute on function company_email(uuid) from public, anon, authenticated;

create function queue_booking_notices() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  booking bookings := (select bookings from bookings where id = new.booking_id);
  by_renter boolean := new.actor_id is not distinct from booking.customer_id;
  is_moved boolean := new.from_status is not distinct from new.to_status;
  is_unanswered boolean := new.to_status = 'expired' and new.from_status is not distinct from 'requested';
  renter_kind text;
  company_kind text;
  details jsonb := jsonb_build_object('note', new.note);
begin
  renter_kind := case
    when is_moved then 'dates_changed'
    -- A particular car is confirmed or requested in the same step, so "we have your booking" is only for a class.
    when new.to_status = 'pending_payment'
      and not exists (select 1 from quotes where id = booking.quote_id and vehicle_id is not null)
      then 'booking_received'
    when new.to_status = 'requested' then 'booking_requested'
    when is_unanswered then 'request_expired'
    when new.to_status in ('confirmed', 'ready', 'declined', 'cancelled', 'expired')
      then 'booking_' || new.to_status
  end;
  company_kind := case
    when is_moved then 'company_dates_changed'
    when new.to_status = 'requested' then 'company_request'
    when new.to_status = 'confirmed' and by_renter then 'company_booked'
    when new.to_status = 'cancelled' and by_renter then 'company_cancelled'
    when is_unanswered then 'company_request_expired'
  end;
  if renter_kind is not null then
    perform enqueue_notification(renter_kind,
      (select email from profiles where id = booking.customer_id), booking.id, details);
  end if;
  if company_kind is not null then
    perform enqueue_notification(company_kind, company_email(booking.operator_id), booking.id, details);
  end if;
  return new;
end;
$$;
create trigger booking_status_events_notices after insert on booking_status_events
  for each row execute function queue_booking_notices();

create index notifications_recipient_idx on notifications (to_email, created_at desc);

-- The other side is emailed when a message is the first they have not seen, then at most once in fifteen minutes
-- while messages wait, and not while they have the chat open. The words stay in the app.
create function queue_message_notice() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  talk conversations := (select conversations from conversations where id = new.conversation_id);
  seen_at timestamptz := case when new.is_from_company then talk.renter_read_at else talk.company_read_at end;
  recipient text := lower(case
    when new.is_from_company then (select email from profiles where id = talk.renter_id)
    else company_email(talk.operator_id)
  end);
  is_watching boolean := coalesce(seen_at > clock_timestamp() - interval '30 seconds', false);
  was_waiting boolean := exists (
    select 1 from messages m
    where m.conversation_id = talk.id and m.id <> new.id and m.is_from_company = new.is_from_company
      and m.created_at > coalesce(seen_at, '-infinity'));
  was_told boolean := exists (
    select 1 from notifications n
    where n.to_email = recipient and n.created_at > now() - interval '15 minutes'
      and n.kind = 'message_received' and n.payload ->> 'conversation_id' = talk.id::text);
begin
  if not is_watching and not (was_waiting and was_told) then
    perform enqueue_notification('message_received', recipient, null, jsonb_build_object(
      'conversation_id', talk.id,
      'to_company', not new.is_from_company,
      'car', talk.car_name,
      'from', case when new.is_from_company then talk.company_name else talk.renter_name end));
  end if;
  -- Whoever writes has seen the chat.
  update conversations set
    last_message_at = new.created_at,
    last_message = left(new.body, 140),
    last_from_company = new.is_from_company,
    renter_read_at = case when new.is_from_company then renter_read_at else new.created_at end,
    company_read_at = case when new.is_from_company then new.created_at else company_read_at end
  where id = talk.id;
  return new;
end;
$$;
create trigger messages_notice after insert on messages for each row execute function queue_message_notice();
