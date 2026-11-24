-- A rental company signs itself up (product pack section 25). The person creates an ordinary account first, which the
-- sign-up trigger always makes a customer, then calls register_operator to start a company of their own. Nothing
-- is trusted from the browser: the role and the company are set here, by the database, and only for a plain
-- customer account. The company starts as `pending`: it is not shown to renters until an admin approves it
-- (review_operator), which is where the checking of its registration, KRA PIN, and insurance happens.

create function register_operator(p_business_name text, p_phone text)
returns operators
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  me profiles;
  base text;
  new_operator operators;
begin
  select * into me from profiles where id = auth.uid() and deleted_at is null;
  if not found then
    raise exception 'UNAUTHENTICATED' using errcode = 'P0001';
  end if;
  -- One company per account, and only an ordinary customer can start one: staff, admin, and corporate users cannot.
  if me.operator_id is not null then
    raise exception 'CONFLICT' using errcode = 'P0001';
  end if;
  if me.role <> 'customer' or me.company_id is not null then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;
  if length(trim(coalesce(p_business_name, ''))) not between 2 and 120 then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;

  base := trim(both '-' from regexp_replace(lower(trim(p_business_name)), '[^a-z0-9]+', '-', 'g'));
  if base = '' then base := 'operator'; end if;
  -- The address of the company's page: its name, with a short suffix when another company already has it.
  if exists (select 1 from operators where slug = base) then
    base := left(base, 90) || '-' || substr(md5(random()::text || clock_timestamp()::text), 1, 5);
  end if;

  insert into operators (business_name, slug, phone, email)
    values (trim(p_business_name), base, nullif(trim(p_phone), ''), me.email)
    returning * into new_operator;
  update profiles set role = 'operator', operator_id = new_operator.id where id = me.id;
  return new_operator;
end;
$$;
revoke execute on function register_operator(text, text) from public, anon;
grant execute on function register_operator(text, text) to authenticated;

-- The admin's review queue lists operators by status, newest first.
create index operators_status_created_idx on operators (status, created_at desc, id desc);
