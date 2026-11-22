-- A policy that calls is_staff(), is_admin(), is_approver(), auth_role(), auth_company_id() or auth_operator_id()
-- runs it once per row, and each of those looks up the signed-in user's profile. Written as (select is_staff()),
-- the database runs it once per query (an init plan) and reuses the answer. The rows seen and the rules are
-- unchanged: only how often the profile is read.
--
-- Helpers that take a column (owns_booking(booking_id), operates(operator_id)) need the row, so they stay as they are.

-- Rewrite every existing policy. Calls already inside a (select ...) are left alone, so this is safe to run again.
do $$
declare
  p record;
  pattern constant text := '(?<!SELECT )\m(?:public\.)?(is_staff|is_admin|is_approver|auth_role|auth_company_id|auth_operator_id)\(\)';
  hoisted constant text := '(select \1())';
  new_using text;
  new_check text;
  left_over integer;
begin
  for p in select schemaname, tablename, policyname, qual, with_check from pg_policies where schemaname = 'public'
  loop
    new_using := regexp_replace(p.qual, pattern, hoisted, 'g');
    new_check := regexp_replace(p.with_check, pattern, hoisted, 'g');
    if new_using is distinct from p.qual or new_check is distinct from p.with_check then
      execute format('alter policy %I on %I.%I %s %s',
        p.policyname, p.schemaname, p.tablename,
        case when new_using is not null then 'using (' || new_using || ')' else '' end,
        case when new_check is not null then 'with check (' || new_check || ')' else '' end);
    end if;
  end loop;

  -- Fail the migration, rather than quietly do less, if the pattern missed a policy.
  select count(*) into left_over from pg_policies
  where schemaname = 'public' and coalesce(qual, '') || ' ' || coalesce(with_check, '') ~ pattern;
  if left_over > 0 then
    raise exception '% policies still call a helper once per row', left_over;
  end if;
end;
$$;

-- The helpers that write policies, so a policy added later is written the same way.
create or replace function add_admin_policy(t text) returns void
language plpgsql set search_path = public, pg_temp as $$
begin
  execute format(
    'create policy %I on %I for all to authenticated using ((select is_admin())) with check ((select is_admin()))',
    t || '_admin', t
  );
end;
$$;

create or replace function add_staff_policy(t text) returns void
language plpgsql set search_path = public, pg_temp as $$
begin
  execute format(
    'create policy %I on %I for all to authenticated using ((select is_staff())) with check ((select is_staff()))',
    t || '_staff', t
  );
end;
$$;

create or replace function add_staff_read_policy(t text) returns void
language plpgsql set search_path = public, pg_temp as $$
begin
  execute format('create policy %I on %I for select to authenticated using ((select is_staff()))', t || '_staff_read', t);
end;
$$;
