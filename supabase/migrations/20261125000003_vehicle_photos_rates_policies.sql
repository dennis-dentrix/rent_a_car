-- Photos and an own daily rate for a car, and a company's rental policies (docs/operator-console.md section 8).

-- The rate is saved for later: renters book a class, so it prices nothing until they can choose a car.
alter table vehicles add column daily_rate_kes integer check (daily_rate_kes is null or daily_rate_kes > 0);

-- At most eight photos, each filed under the car's own folder in the public bucket.
create function paths_are_under(p_paths text[], p_folder text) returns boolean
language sql immutable as $$
  select coalesce(bool_and(starts_with(path, p_folder)), true) from unnest(p_paths) as path
$$;
alter table vehicles add constraint vehicles_photos_check check (
  cardinality(photo_paths) <= 8 and paths_are_under(photo_paths, 'vehicles/' || id::text || '/')
);

-- Adding and removing one photo in one statement, so two uploads at once cannot lose one. They run as the caller, so
-- Row Level Security decides whose cars may change.
create function add_vehicle_photo(p_vehicle_id uuid, p_path text) returns text[]
language plpgsql as $$
declare
  paths text[];
begin
  update vehicles set photo_paths = array_append(array_remove(photo_paths, p_path), p_path)
  where id = p_vehicle_id returning photo_paths into paths;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  return paths;
end;
$$;

create function remove_vehicle_photo(p_vehicle_id uuid, p_path text) returns text[]
language plpgsql as $$
declare
  paths text[];
begin
  update vehicles set photo_paths = array_remove(photo_paths, p_path)
  where id = p_vehicle_id and p_path = any (photo_paths) returning photo_paths into paths;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  return paths;
end;
$$;
revoke execute on function add_vehicle_photo(uuid, text), remove_vehicle_photo(uuid, text) from public, anon;
grant execute on function add_vehicle_photo(uuid, text), remove_vehicle_photo(uuid, text) to authenticated;

-- One general policy per company (no class), and at most one per class, which overrides it field by field. An empty
-- field says nothing: the general rule, if any, applies.
create table operator_policies (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references operators (id) on delete cascade,
  class_id uuid references vehicle_classes (id),
  min_hire_days smallint check (min_hire_days between 1 and 365),
  min_age smallint check (min_age between 18 and 99),
  cross_border text check (cross_border in ('not_allowed', 'with_permission', 'allowed')),
  daily_km_limit integer check (daily_km_limit > 0),
  fuel_policy text check (fuel_policy in ('same_level', 'full_to_full', 'prepaid')),
  rules text[] not null default '{}' check (cardinality(rules) <= 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index operator_policies_scope_idx on operator_policies (
  operator_id, (coalesce(class_id, '00000000-0000-0000-0000-000000000000'::uuid))
);
create index operator_policies_list_idx on operator_policies (operator_id, created_at desc, id desc);

select ensure_updated_at_triggers();
select ensure_rls_enabled();

select add_admin_policy('operator_policies');
select add_staff_read_policy('operator_policies');
create policy policies_operator_read on operator_policies for select to authenticated
  using (operates(operator_id));
create policy policies_operator_insert on operator_policies for insert to authenticated
  with check (operator_can_write(operator_id) and (class_id is null or class_usable_by(class_id, operator_id)));
create policy policies_operator_update on operator_policies for update to authenticated
  using (operator_can_write(operator_id))
  with check (operator_can_write(operator_id) and (class_id is null or class_usable_by(class_id, operator_id)));
