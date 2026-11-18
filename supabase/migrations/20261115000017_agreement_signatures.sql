-- Signing the rental agreement online. A signature is the evidence that a customer accepted the terms for one
-- booking: who, when, from where, the exact terms and booking details they were shown (a snapshot and its hash),
-- and the signed PDF, which is stored as the booking's agreement document. A signature is never edited; it can only
-- be voided when the booking's dates change, because the terms no longer match what was signed.
create table agreement_signatures (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id),
  signer_id uuid not null references profiles (id),
  document_id uuid not null references documents (id),
  signed_name text not null,
  terms_version text not null,
  terms_sha256 text not null,
  snapshot jsonb not null,
  has_drawn_signature boolean not null default false,
  ip_address text,
  user_agent text,
  signed_at timestamptz not null default now(),
  voided_at timestamptz,
  void_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- One valid signature per booking.
create unique index agreement_signatures_one_valid on agreement_signatures (booking_id) where voided_at is null;

create trigger agreement_signatures_no_delete
  before delete on agreement_signatures for each row execute function block_changes();
create trigger agreement_signatures_audit after insert or update on agreement_signatures
  for each row execute function write_audit();

-- The only change allowed after signing is voiding.
create function guard_agreement_signature() returns trigger
language plpgsql as $$
begin
  if (to_jsonb(new) - 'voided_at' - 'void_reason' - 'updated_at')
     is distinct from (to_jsonb(old) - 'voided_at' - 'void_reason' - 'updated_at') then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger agreement_signatures_guard before update on agreement_signatures
  for each row execute function guard_agreement_signature();

select ensure_updated_at_triggers();
select ensure_rls_enabled();
select add_staff_read_policy('agreement_signatures');
create policy agreement_signatures_own on agreement_signatures for select to authenticated
  using (signer_id = auth.uid());

-- Save a signature and the signed PDF's document row together. The API builds and stores the PDF, then calls this
-- with the service role on behalf of the signed-in customer, so a customer cannot call it directly with a file path
-- of their choosing. It checks the booking again. The signed document counts as a verified agreement, which is one of
-- the things a booking needs before it can become ready.
create function sign_agreement(
  p_booking_id uuid, p_customer_id uuid, p_document_id uuid, p_storage_path text, p_size_bytes integer,
  p_signed_name text, p_signed_at timestamptz, p_terms_version text, p_terms_sha256 text, p_snapshot jsonb,
  p_has_drawn boolean, p_ip text, p_user_agent text
) returns agreement_signatures
language plpgsql security definer set search_path = public as $$
declare
  b bookings;
  signature agreement_signatures;
  customer_email text;
begin
  select * into b from bookings where id = p_booking_id for update;
  if not found or b.customer_id is distinct from p_customer_id then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  if b.status <> 'confirmed' then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  if exists (select 1 from agreement_signatures where booking_id = b.id and voided_at is null) then
    raise exception 'CONFLICT' using errcode = 'P0001';
  end if;

  insert into documents (
    id, owner_id, booking_id, type, storage_path, content_type, size_bytes, file_confirmed_at, status,
    uploaded_by, reviewed_at
  ) values (
    p_document_id, b.customer_id, b.id, 'agreement', p_storage_path, 'application/pdf', p_size_bytes, now(),
    'verified', p_customer_id, now()
  );
  insert into agreement_signatures (
    booking_id, signer_id, document_id, signed_name, signed_at, terms_version, terms_sha256, snapshot,
    has_drawn_signature, ip_address, user_agent
  ) values (
    b.id, p_customer_id, p_document_id, p_signed_name, p_signed_at, p_terms_version, p_terms_sha256, p_snapshot,
    p_has_drawn, p_ip, p_user_agent
  ) returning * into signature;

  select email into customer_email from profiles where id = b.customer_id;
  perform enqueue_notification('agreement_signed', customer_email, b.id);
  return signature;
end;
$$;
revoke execute on function sign_agreement(
  uuid, uuid, uuid, text, integer, text, timestamptz, text, text, jsonb, boolean, text, text
) from public, anon, authenticated;
grant execute on function sign_agreement(
  uuid, uuid, uuid, text, integer, text, timestamptz, text, text, jsonb, boolean, text, text
) to service_role;

-- Changing a booking's dates voids its signature, and the signed PDF is replaced, so the customer signs again for
-- the new dates. Once a booking is ready its agreement can no longer be voided, so the dates cannot change then.
create function void_agreement_on_date_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.start_at = old.start_at and new.end_at = old.end_at then
    return new;
  end if;
  if old.status = 'ready' and exists (
    select 1 from agreement_signatures where booking_id = old.id and voided_at is null
  ) then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  with voided as (
    update agreement_signatures set voided_at = now(), void_reason = 'The booking dates changed'
    where booking_id = old.id and voided_at is null returning document_id
  )
  update documents set status = 'replaced' where id in (select document_id from voided);
  return new;
end;
$$;
create trigger bookings_void_agreement before update of start_at, end_at on bookings
  for each row execute function void_agreement_on_date_change();
