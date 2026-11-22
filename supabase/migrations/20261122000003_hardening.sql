-- Hardening from the Supabase advisors after the first push to the hosted project.
-- Behaviour is unchanged: the same rows are visible and the same functions run.

-- 1. Evaluate auth.uid() once per query, not once per row. Wrapped in a sub-select, Postgres runs it
--    as an init plan and reuses the value.
alter policy profiles_own_read on profiles using (id = (select auth.uid()));
alter policy profiles_own_update on profiles
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid()) and role = auth_role()
    and company_id is not distinct from auth_company_id()
    and operator_id is not distinct from auth_operator_id()
  );
alter policy quotes_own on quotes using (customer_id = (select auth.uid()));
alter policy bookings_own on bookings using (customer_id = (select auth.uid()));
alter policy refunds_staff_request on refunds
  with check (is_staff() and requested_by = (select auth.uid()) and status = 'requested');
alter policy refunds_admin_update on refunds
  using (is_admin())
  with check (is_admin() and requested_by is distinct from (select auth.uid()));
alter policy documents_own_read on documents using (owner_id = (select auth.uid()));
alter policy access_log_staff_insert on document_access_log
  with check (is_staff() and accessed_by = (select auth.uid()));
alter policy agreement_signatures_own on agreement_signatures using (signer_id = (select auth.uid()));

-- 2. Index the foreign keys that queries filter or join on. Columns that only record who acted
--    (reviewed_by, approved_by and similar) are left until a query needs them.
create index quotes_customer_id_idx on quotes (customer_id);
create index documents_booking_id_idx on documents (booking_id);
create index deliveries_booking_id_idx on deliveries (booking_id);
create index handover_records_booking_id_idx on handover_records (booking_id);
create index refunds_payment_id_idx on refunds (payment_id);
create index enquiries_customer_id_idx on enquiries (customer_id);

-- 3. Fix the search path of every function in public that does not set one, so a caller cannot
--    put a schema ahead of public and swap in their own table or function. Functions that belong
--    to an extension (btree_gist) are managed by the extension and skipped.
do $$
declare
  fn regprocedure;
begin
  for fn in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and not exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%')
      and not exists (
        select 1 from pg_depend d
        where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e'
      )
  loop
    execute format('alter function %s set search_path = public, pg_temp', fn);
  end loop;
end;
$$;
