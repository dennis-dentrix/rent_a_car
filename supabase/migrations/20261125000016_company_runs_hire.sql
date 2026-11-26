-- The company runs its own hires (docs/booking-flow-plan.md): it moves the booking on, checks the renter's ID and
-- licence, and records what was paid at handover. Each function first finds the booking as the caller's own.

-- Confirming and expiring are not the company's moves. The rules for each status stay in transition_booking.
create function operator_move_booking(p_booking_id uuid, p_to booking_status, p_note text) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  booking bookings := lock_run_booking(p_booking_id);
begin
  if p_to not in ('ready', 'active', 'returned', 'closed', 'cancelled') then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  if p_to = 'cancelled' and coalesce(trim(p_note), '') = '' then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  return transition_booking(booking.id, p_to, auth.uid(), p_note);
end;
$$;

-- The renter's ID and licence files that count for this booking. Only while the hire is ahead or under way: once it
-- is over the company has no further reason to see them.
create function booking_identity_documents(p_booking_id uuid) returns setof documents
language plpgsql security definer set search_path = public as $$
declare
  booking bookings := lock_run_booking(p_booking_id);
begin
  if booking.status not in ('confirmed', 'ready', 'active') then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  return query
    select * from documents d
    where d.owner_id = booking.customer_id and d.type in ('national_id', 'driving_licence')
      and d.file_confirmed_at is not null and (d.booking_id is null or d.booking_id = booking.id);
end;
$$;

create function booking_identity_document(p_booking_id uuid, p_document_id uuid) returns documents
language plpgsql security definer set search_path = public as $$
declare
  found_document documents;
begin
  select * into found_document from booking_identity_documents(p_booking_id) d where d.id = p_document_id;
  if found_document.id is null then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  return found_document;
end;
$$;
revoke execute on function booking_identity_documents(uuid), booking_identity_document(uuid, uuid)
  from public, anon, authenticated;

create function operator_documents(p_booking_id uuid)
returns table (id uuid, type document_type, status document_status, rejection_reason text)
language sql security definer set search_path = public as $$
  select d.id, d.type, d.status, d.rejection_reason
  from booking_identity_documents(p_booking_id) d order by d.created_at desc, d.id desc
$$;

-- Who opened a file, and why, is written down before the file's whereabouts are given.
create function operator_open_document(p_booking_id uuid, p_document_id uuid, p_reason text)
returns table (storage_path text, content_type text, file_etag text)
language plpgsql security definer set search_path = public as $$
declare
  wanted documents := booking_identity_document(p_booking_id, p_document_id);
begin
  if char_length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  insert into document_access_log (document_id, accessed_by, reason)
  values (wanted.id, auth.uid(), trim(p_reason));
  return query select wanted.storage_path, wanted.content_type, wanted.file_etag;
end;
$$;

create function operator_review_document(
  p_booking_id uuid,
  p_document_id uuid,
  p_status document_status,
  p_reason text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  wanted documents := booking_identity_document(p_booking_id, p_document_id);
begin
  if wanted.status <> 'uploaded' or p_status not in ('verified', 'rejected')
     or (p_status = 'rejected' and coalesce(trim(p_reason), '') = '') then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  update documents set
    status = p_status,
    rejection_reason = case when p_status = 'rejected' then trim(p_reason) end,
    reviewed_by = auth.uid(),
    reviewed_at = now()
  where id = wanted.id;
end;
$$;

create function record_handover_payment(
  p_booking_id uuid,
  p_method payment_method,
  p_amount_kes integer,
  p_reference text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  booking bookings := lock_run_booking(p_booking_id);
  paid bigint;
begin
  select coalesce(sum(amount_kes), 0) into paid from payments
  where booking_id = booking.id and status = 'succeeded';
  if booking.status in ('cancelled', 'expired') or p_method not in ('cash', 'mpesa', 'bank')
     or p_amount_kes is null or p_amount_kes not between 1 and booking.total_kes - paid then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  insert into payments (booking_id, kind, provider, provider_reference, method, amount_kes, status, paid_at)
  values (booking.id, 'balance', 'handover', nullif(trim(p_reference), ''), p_method, p_amount_kes,
    'succeeded', now());
end;
$$;

revoke execute on function operator_move_booking(uuid, booking_status, text), operator_documents(uuid),
  operator_open_document(uuid, uuid, text), operator_review_document(uuid, uuid, document_status, text),
  record_handover_payment(uuid, payment_method, integer, text)
  from public, anon;
grant execute on function operator_move_booking(uuid, booking_status, text), operator_documents(uuid),
  operator_open_document(uuid, uuid, text), operator_review_document(uuid, uuid, document_status, text),
  record_handover_payment(uuid, payment_method, integer, text)
  to authenticated;
