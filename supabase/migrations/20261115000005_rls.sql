-- Row Level Security from the access control matrix (product pack section 13). Any cell not granted is denied.
-- Writes that touch money or status go through the server with the service role, which bypasses RLS.

create function auth_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid() and deleted_at is null
$$;

create function auth_company_id() returns uuid
language sql stable security definer set search_path = public as $$
  select company_id from profiles where id = auth.uid() and deleted_at is null
$$;

create function is_staff() returns boolean
language sql stable as $$ select coalesce(auth_role() in ('staff', 'admin'), false) $$;

create function is_admin() returns boolean
language sql stable as $$ select coalesce(auth_role() = 'admin', false) $$;

create function is_approver() returns boolean
language sql stable as $$ select coalesce(auth_role() = 'corporate_approver', false) $$;

-- Rows that hang off a booking follow the booking's owner or company.
create function owns_booking(p_booking_id uuid) returns boolean
language sql stable as $$
  select exists (select 1 from bookings b where b.id = p_booking_id and b.customer_id = auth.uid())
$$;

create function company_has_booking(p_booking_id uuid) returns boolean
language sql stable as $$
  select is_approver() and exists (
    select 1 from bookings b where b.id = p_booking_id and b.company_id = auth_company_id()
  )
$$;

revoke execute on function transition_booking(uuid, booking_status, uuid, text) from public, anon, authenticated;
grant execute on function transition_booking(uuid, booking_status, uuid, text) to service_role;

-- RLS on every table. A table with no policy is reachable by the service role only.
-- Later migrations call ensure_rls_enabled() again after they create tables.
create function ensure_rls_enabled() returns void
language plpgsql as $$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table %I enable row level security', t);
  end loop;
end;
$$;

-- Policy helpers, so each table's access is one call instead of a copied statement.
create function add_admin_policy(t text) returns void
language plpgsql as $$
begin
  execute format(
    'create policy %I on %I for all to authenticated using (is_admin()) with check (is_admin())',
    t || '_admin', t
  );
end;
$$;

create function add_staff_policy(t text) returns void
language plpgsql as $$
begin
  execute format(
    'create policy %I on %I for all to authenticated using (is_staff()) with check (is_staff())',
    t || '_staff', t
  );
end;
$$;

create function add_staff_read_policy(t text) returns void
language plpgsql as $$
begin
  execute format('create policy %I on %I for select to authenticated using (is_staff())', t || '_staff_read', t);
end;
$$;

select ensure_rls_enabled();

-- Admin writes these tables. Staff, which includes admin, write the second group.
select add_admin_policy(t) from unnest(array[
  'vehicle_classes', 'rates', 'discounts', 'extras', 'locations', 'delivery_zones',
  'exchange_rates', 'vehicles', 'settings', 'drivers', 'profiles', 'invoices'
]) as t;
select add_staff_policy(t) from unnest(array['bookings', 'payments', 'deliveries', 'enquiries', 'companies']) as t;

-- Public reference data: guests read.
create policy classes_read on vehicle_classes for select to anon, authenticated using (is_public or is_staff());
create policy rates_read on rates for select to anon, authenticated using (true);
create policy discounts_read on discounts for select to anon, authenticated using (is_active or is_staff());
create policy extras_read on extras for select to anon, authenticated using (is_active or is_staff());
create policy locations_read on locations for select to anon, authenticated using (is_served or is_staff());
create policy zones_read on delivery_zones for select to anon, authenticated using (is_active or is_staff());
create policy fx_read on exchange_rates for select to anon, authenticated using (true);

-- Internal reference data: staff read.
select add_staff_read_policy(t) from unnest(array['vehicles', 'settings', 'drivers']) as t;

-- Profiles: own row (role cannot change), approver reads company staff, staff read.
create policy profiles_own_read on profiles for select to authenticated using (id = auth.uid());
create policy profiles_own_update on profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = auth_role() and company_id is not distinct from auth_company_id());
create policy profiles_company_read on profiles for select to authenticated
  using (is_approver() and company_id = auth_company_id());
create policy profiles_staff_read on profiles for select to authenticated using (is_staff());

create policy companies_own_read on companies for select to authenticated using (id = auth_company_id());

-- Quotes: own, or company (approver), staff and admin read.
create policy quotes_own on quotes for select to authenticated using (customer_id = auth.uid());
create policy quotes_company on quotes for select to authenticated
  using (is_approver() and customer_id in (select id from profiles where company_id = auth_company_id()));
create policy quotes_staff on quotes for select to authenticated using (is_staff());

-- Bookings: customers and approvers read; staff write (status only through transition_booking).
create policy bookings_own on bookings for select to authenticated using (customer_id = auth.uid());
create policy bookings_company on bookings for select to authenticated
  using (is_approver() and company_id = auth_company_id());

create policy events_own on booking_status_events for select to authenticated using (owns_booking(booking_id));
create policy events_company on booking_status_events for select to authenticated using (company_has_booking(booking_id));
create policy events_staff_read on booking_status_events for select to authenticated using (is_staff());
create policy events_staff_insert on booking_status_events for insert to authenticated with check (is_staff());

create policy payments_own on payments for select to authenticated using (owns_booking(booking_id));
create policy payments_company on payments for select to authenticated using (company_has_booking(booking_id));

-- Refunds: staff request, admin approve. Staff cannot update, so they cannot approve their own.
create policy refunds_own on refunds for select to authenticated
  using (exists (select 1 from payments p where p.id = payment_id and owns_booking(p.booking_id)));
create policy refunds_staff_read on refunds for select to authenticated using (is_staff());
create policy refunds_staff_request on refunds for insert to authenticated
  with check (is_staff() and requested_by = auth.uid() and status = 'requested');
create policy refunds_admin_update on refunds for update to authenticated
  using (is_admin()) with check (is_admin() and requested_by is distinct from auth.uid());

-- Deliveries and handover.
create policy deliveries_own on deliveries for select to authenticated using (owns_booking(booking_id));
create policy deliveries_company on deliveries for select to authenticated using (company_has_booking(booking_id));
create policy handover_own on handover_records for select to authenticated using (owns_booking(booking_id));
create policy handover_staff_read on handover_records for select to authenticated using (is_staff());
create policy handover_staff_insert on handover_records for insert to authenticated with check (is_staff());

-- Documents: owners read; the API creates rows after checking the upload (customers cannot insert, or they could
-- point a row at someone else's file); approvers read company metadata; staff review (status fields only).
create policy documents_own_read on documents for select to authenticated using (owner_id = auth.uid());
create policy documents_company on documents for select to authenticated using (company_has_booking(booking_id));
create policy documents_staff_read on documents for select to authenticated using (is_staff());
create policy documents_staff_review on documents for update to authenticated
  using (is_staff()) with check (is_staff());
revoke update on documents from authenticated;
grant update (status, reviewed_by, reviewed_at, rejection_reason) on documents to authenticated;

create policy access_log_admin on document_access_log for select to authenticated using (is_admin());
create policy access_log_staff_insert on document_access_log for insert to authenticated
  with check (is_staff() and accessed_by = auth.uid());
create policy invoices_company on invoices for select to authenticated
  using (is_approver() and company_id = auth_company_id());
create policy invoices_staff on invoices for select to authenticated using (is_staff());
create policy audit_admin on audit_log for select to authenticated using (is_admin());
-- payment_events, etims_submissions and booking_status_transitions have no policies: service role only.
