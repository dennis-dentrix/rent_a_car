-- Payments, refunds, documents, enquiries, invoices, eTIMS room, audit.
-- docs/database-design.md sections 6 to 9, plus product pack sections 23 and 24.

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id),
  kind payment_kind not null,
  provider text not null default 'tingg',
  provider_reference text unique,
  method payment_method not null,
  amount_kes integer not null check (amount_kes > 0),
  status payment_status not null,
  paid_at timestamptz,
  tax_receipt_status tax_receipt_status not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_booking_idx on payments (booking_id);

-- Primary key on the provider event id makes a repeated webhook a no-op.
create table payment_events (
  provider_event_id text primary key,
  provider text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments (id),
  amount_kes integer not null check (amount_kes > 0),
  reason text not null,
  status refund_status not null default 'requested',
  requested_by uuid references profiles (id),
  approved_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (approved_by is null or approved_by <> requested_by)
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles (id),
  booking_id uuid references bookings (id),
  type document_type not null,
  -- Object key in the private Cloudflare R2 bucket.
  storage_path text not null unique,
  content_type text not null,
  size_bytes integer not null check (size_bytes between 1 and 10485760),
  -- Set once the file is in storage. A document whose file never arrived cannot be reviewed.
  file_confirmed_at timestamptz,
  uploaded_by uuid references profiles (id),
  status document_status not null default 'uploaded',
  reviewed_by uuid references profiles (id),
  reviewed_at timestamptz,
  rejection_reason text,
  replaces_id uuid references documents (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index documents_owner_idx on documents (owner_id);
create index documents_status_idx on documents (status);

create table document_access_log (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents (id),
  accessed_by uuid not null references profiles (id),
  reason text not null,
  accessed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger document_access_log_append_only
  before update or delete on document_access_log for each row execute function block_changes();

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  source enquiry_source not null,
  name text,
  phone text,
  email text,
  message text,
  class_id uuid references vehicle_classes (id),
  vehicle_id uuid references vehicles (id),
  start_at timestamptz,
  end_at timestamptz,
  customer_id uuid references profiles (id),
  converted_booking_id uuid references bookings (id),
  handled_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id),
  period_start date not null,
  period_end date not null,
  total_kes integer not null,
  status text not null check (status in ('draft', 'issued', 'paid', 'overdue')),
  etims_reference text,
  etims_submitted_at timestamptz,
  customer_pin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table etims_submissions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references payments (id),
  invoice_id uuid references invoices (id),
  request_json jsonb,
  response_json jsonb,
  status text not null,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles (id),
  action text not null,
  table_name text not null,
  row_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);
create trigger audit_log_append_only
  before update or delete on audit_log for each row execute function block_changes();

create function write_audit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into audit_log (actor_id, action, table_name, row_id, old_values, new_values)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    coalesce((to_jsonb(new) ->> 'id')::uuid, (to_jsonb(old) ->> 'id')::uuid),
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

create trigger rates_audit after insert or update or delete on rates for each row execute function write_audit();
create trigger profiles_audit after update or delete on profiles for each row execute function write_audit();
create trigger vehicles_audit after insert or update or delete on vehicles for each row execute function write_audit();
create trigger refunds_audit after insert or update or delete on refunds for each row execute function write_audit();
create trigger discounts_audit after insert or update or delete on discounts for each row execute function write_audit();
create trigger vehicle_classes_audit after update on vehicle_classes for each row execute function write_audit();


-- Attach the updated_at trigger to every table that has the column and does not have it yet.
-- Later migrations call this again after they create tables.
create function ensure_updated_at_triggers() returns void
language plpgsql as $$
declare
  t text;
begin
  for t in
    select c.table_name from information_schema.columns c
    where c.table_schema = 'public' and c.column_name = 'updated_at'
      and not exists (
        select 1 from pg_trigger g where g.tgname = c.table_name || '_updated' and not g.tgisinternal
      )
  loop
    execute format(
      'create trigger %I before update on %I for each row execute function set_updated_at()',
      t || '_updated', t
    );
  end loop;
end;
$$;

select ensure_updated_at_triggers();

-- A customer's documents are verified when their ID and driving licence are verified, and the agreement for
-- this booking is verified (signed online, or the signed copy checked at the office).
create function documents_verified(p_customer_id uuid, p_booking_id uuid) returns boolean
language sql stable as $$
  select
    (
      select count(distinct d.type) from documents d
      where d.owner_id = p_customer_id and d.status = 'verified'
        and d.type in ('national_id', 'driving_licence') and d.file_confirmed_at is not null
        and (d.booking_id is null or d.booking_id = p_booking_id)
    ) = 2
    and exists (
      select 1 from documents d
      where d.booking_id = p_booking_id and d.type = 'agreement' and d.status = 'verified'
        and d.file_confirmed_at is not null
    )
$$;

create function inspection_recorded(p_booking_id uuid, p_type text) returns boolean
language sql stable as $$
  select exists (select 1 from handover_records h where h.booking_id = p_booking_id and h.type = p_type)
$$;

-- Cancellation policy (owner decision, pack section 23.1): more than the window before pickup the deposit is
-- refunded in full; inside it, nothing. A booking whose deposit was never received has nothing to refund.
create function cancellation_policy(b bookings) returns text
language sql stable security definer set search_path = public as $$
  select case
    when b.status not in ('confirmed', 'ready') then 'nothing_paid'
    when b.start_at - now() > make_interval(
      hours => (select (value #>> '{}')::integer from settings where key = 'cancellation_window_hours')
    ) then 'full_refund'
    else 'no_refund'
  end
$$;

create function cancellation_refund_kes(b bookings) returns integer
language sql stable as $$
  select case when cancellation_policy(b) = 'full_refund' then b.deposit_kes else 0 end
$$;
