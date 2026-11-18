-- Email notifications. Something happening (a booking confirmed, a document rejected) saves a row here in the
-- same transaction as the change, so a notification is never lost and never sent for a change that rolled back.
-- The API sends the rows later (a scheduled job) and records the result, so a mail outage delays emails, it
-- does not fail bookings.
create table notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  to_email text not null,
  booking_id uuid references bookings (id),
  payload jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
  attempts integer not null default 0,
  last_error text,
  send_after timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notifications_queue_idx on notifications (status, send_after);
create index notifications_booking_idx on notifications (booking_id);

select ensure_updated_at_triggers();
select ensure_rls_enabled();
select add_staff_read_policy('notifications');

-- Save a notification. Only the functions below call this.
create function enqueue_notification(p_kind text, p_email text, p_booking_id uuid, p_payload jsonb default '{}')
returns void
language sql security definer set search_path = public as $$
  insert into notifications (kind, to_email, booking_id, payload)
  select p_kind, lower(trim(p_email)), p_booking_id, p_payload where coalesce(trim(p_email), '') <> ''
$$;
revoke execute on function enqueue_notification(text, text, uuid, jsonb) from public, anon, authenticated;

-- A booking changed: tell the customer. Date changes are the events whose status did not change.
create function queue_booking_email() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  kind text;
  customer_email text;
begin
  kind := case
    when new.from_status is null and new.to_status = 'pending_payment' then 'booking_received'
    when new.from_status = new.to_status then 'dates_changed'
    when new.to_status = 'confirmed' then 'booking_confirmed'
    when new.to_status = 'ready' then 'booking_ready'
    when new.to_status = 'cancelled' then 'booking_cancelled'
    when new.to_status = 'expired' then 'booking_expired'
  end;
  if kind is null then
    return new;
  end if;
  select p.email into customer_email
  from bookings b join profiles p on p.id = b.customer_id where b.id = new.booking_id;
  perform enqueue_notification(kind, customer_email, new.booking_id, jsonb_build_object('note', new.note));
  return new;
end;
$$;
create trigger booking_status_events_email after insert on booking_status_events
  for each row execute function queue_booking_email();

-- A document was rejected: tell the customer why, so they can upload it again.
create function queue_document_email() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  owner_email text;
begin
  select email into owner_email from profiles where id = new.owner_id;
  perform enqueue_notification(
    'document_rejected', owner_email, new.booking_id,
    jsonb_build_object('document_type', new.type, 'reason', new.rejection_reason)
  );
  return new;
end;
$$;
create trigger documents_rejected_email after update of status on documents
  for each row when (new.status = 'rejected' and old.status is distinct from 'rejected')
  execute function queue_document_email();

-- A guest sent an enquiry: thank them, and alert the team address when one is set.
create function queue_enquiry_email() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  alert_email text;
  details jsonb := jsonb_build_object('name', new.name, 'phone', new.phone, 'email', new.email, 'message', new.message,
    'start_at', new.start_at, 'end_at', new.end_at);
begin
  perform enqueue_notification('enquiry_received', new.email, null, details);
  select value #>> '{}' into alert_email from settings where key = 'staff_alert_email';
  perform enqueue_notification('enquiry_alert', alert_email, null, details);
  return new;
end;
$$;
create trigger enquiries_email after insert on enquiries for each row execute function queue_enquiry_email();

-- The sender takes a batch to work on. Rows left "sending" by a crashed run are taken again after ten minutes.
create function claim_notifications(p_limit integer) returns setof notifications
language sql security definer set search_path = public as $$
  update notifications n set status = 'sending', claimed_at = now(), attempts = n.attempts + 1
  where n.id in (
    select id from notifications
    where (status = 'pending' and send_after <= now())
       or (status = 'sending' and claimed_at < now() - interval '10 minutes')
    order by created_at
    limit p_limit
    for update skip locked
  )
  returning n.*
$$;

-- Record what happened. A failure is tried again at p_retry_at, or given up on when p_retry_at is null.
create function finish_notification(p_id uuid, p_sent boolean, p_error text, p_retry_at timestamptz)
returns void
language sql security definer set search_path = public as $$
  update notifications set
    status = case when p_sent then 'sent' when p_retry_at is null then 'failed' else 'pending' end,
    sent_at = case when p_sent then now() end,
    last_error = p_error,
    send_after = coalesce(p_retry_at, send_after)
  where id = p_id
$$;

revoke execute on function claim_notifications(integer) from public, anon, authenticated;
revoke execute on function finish_notification(uuid, boolean, text, timestamptz) from public, anon, authenticated;
grant execute on function claim_notifications(integer) to service_role;
grant execute on function finish_notification(uuid, boolean, text, timestamptz) to service_role;
