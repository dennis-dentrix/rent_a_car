-- Signing a handover inspection, and the sealed report both sides keep (docs/operator-console.md section 9).
-- A signature and a sealed report are written only by the API's service role, after it has checked who is signing, and
-- can never be changed or removed.

create table inspection_signatures (
  id uuid primary key default gen_random_uuid(),
  handover_record_id uuid not null references handover_records (id),
  party text not null check (party in ('operator', 'renter')),
  signer_id uuid not null references profiles (id),
  signed_name text not null,
  -- on_device: on the company's screen (a renter also gives the code sent to their email); account: signed in.
  method text not null check (method in ('on_device', 'account')),
  signature_path text,
  -- The fingerprint of the report as it was shown to this signer.
  report_sha256 text not null,
  ip_address text,
  user_agent text,
  signed_at timestamptz not null default now(),
  unique (handover_record_id, party)
);
create trigger inspection_signatures_append_only
  before update or delete on inspection_signatures for each row execute function block_changes();

create table inspection_reports (
  handover_record_id uuid primary key references handover_records (id),
  storage_path text not null unique,
  size_bytes integer not null check (size_bytes > 0),
  -- The fingerprint of the stored PDF: anyone holding a copy can check it is the one that was sealed.
  pdf_sha256 text not null unique,
  report_sha256 text not null,
  sealed_at timestamptz not null default now()
);
create trigger inspection_reports_append_only
  before update or delete on inspection_reports for each row execute function block_changes();

-- The code emailed to a renter who signs on the company's screen. Only its hash is kept.
create table inspection_codes (
  handover_record_id uuid primary key references handover_records (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts smallint not null default 0,
  created_at timestamptz not null default now()
);

create index handover_records_list_idx on handover_records (created_at desc, id desc);

select ensure_rls_enabled();

create policy inspection_signatures_read on inspection_signatures for select to authenticated using (
  (select is_staff()) or owns_inspection(handover_record_id) or operates_inspection(handover_record_id)
);
create policy inspection_reports_read on inspection_reports for select to authenticated using (
  (select is_staff()) or owns_inspection(handover_record_id) or operates_inspection(handover_record_id)
);
-- inspection_codes has no policy: nobody but the service role reads or writes it.
