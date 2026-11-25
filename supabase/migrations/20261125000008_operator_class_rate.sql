-- A company changes what it charges per day for a class in one step, so a price is never left half changed
-- (docs/operator-console.md section 12). Both functions run as the caller, so Row Level Security decides who may.

-- The rate in force on the date ends the day before and the new one takes over its end date. A rate that started on
-- the date itself is corrected in place. With no rate in force, the new one runs until the next one starts.
create function set_operator_class_rate(p_class_id uuid, p_price_kes integer, p_date date) returns void
language plpgsql as $$
declare
  mine uuid := auth_operator_id();
  held rates;
  ends date;
begin
  -- Without this, a caller with no company would be writing Carvo's own rate, which renters are charged.
  if mine is null then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;
  select * into held from rates
  where operator_id = mine and class_id = p_class_id
    and daterange(effective_from, effective_to, '[]') @> p_date
  for update;
  if held.price_kes = p_price_kes then
    return;
  end if;
  if held.effective_from = p_date then
    update rates set price_kes = p_price_kes, usd_override = null where id = held.id;
    return;
  end if;
  if held.id is null then
    select min(effective_from) - 1 into ends from rates
    where operator_id = mine and class_id = p_class_id and effective_from > p_date;
  else
    ends := held.effective_to;
    update rates set effective_to = p_date - 1 where id = held.id;
  end if;
  insert into rates (class_id, operator_id, price_kes, effective_from, effective_to)
  values (p_class_id, mine, p_price_kes, p_date, ends);
end;
$$;

-- A company's new class and its first price are saved together, or not at all.
create function create_operator_class(p_class jsonb, p_price_kes integer, p_date date) returns uuid
language plpgsql as $$
declare
  made uuid;
begin
  insert into vehicle_classes (operator_id, name, slug, seats, luggage_capacity, description, best_for, is_public)
  select auth_operator_id(), name, slug, seats, luggage_capacity, description, coalesce(best_for, '{}'), false
  from jsonb_populate_record(null::vehicle_classes, p_class)
  returning id into made;
  if p_price_kes is not null then
    perform set_operator_class_rate(made, p_price_kes, p_date);
  end if;
  return made;
end;
$$;

revoke execute on function set_operator_class_rate(uuid, integer, date), create_operator_class(jsonb, integer, date)
  from public, anon;
grant execute on function set_operator_class_rate(uuid, integer, date), create_operator_class(jsonb, integer, date)
  to authenticated;
