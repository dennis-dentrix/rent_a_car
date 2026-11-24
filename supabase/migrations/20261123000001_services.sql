-- Services: what a rental company can offer (car hire, transfers, events), and a way for a renter to filter by
-- them. A service is reference data with a stable id used in addresses and the API; an operator chooses which
-- ones it offers. The ids and groups are kept in packages/shared/src/services.js, and a unit test fails if the
-- two lists differ.

create table services (
  id text primary key check (id ~ '^[a-z][a-z_]*$'),
  service_group text not null check (service_group in ('car_hire', 'transfers', 'events')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into services (id, service_group, sort_order) values
  ('self_drive', 'car_hire', 10),
  ('chauffeur_driven', 'car_hire', 20),
  ('airport_transfer', 'transfers', 30),
  ('corporate_transfer', 'transfers', 40),
  ('wedding_car', 'events', 50),
  ('video_shoot', 'events', 60),
  ('convoy', 'events', 70),
  ('corporate_transport', 'events', 80);

create table operator_services (
  operator_id uuid not null references operators (id) on delete cascade,
  service_id text not null references services (id),
  created_at timestamptz not null default now(),
  primary key (operator_id, service_id)
);
-- The renter-side filter looks up by service, so the reverse of the primary key needs its own index.
create index operator_services_service_idx on operator_services (service_id, operator_id);

select ensure_updated_at_triggers();
select ensure_rls_enabled();

-- The list of services is public reference data; only admin changes it.
create policy services_read on services for select to anon, authenticated using (true);
select add_admin_policy('services');

-- What an operator offers is its own to read and change. Staff read it; admin manages it. Renters never read
-- this table: they filter through classes_offering_service below.
select add_admin_policy('operator_services');
select add_staff_read_policy('operator_services');
create policy operator_services_own_read on operator_services for select to authenticated
  using (operates(operator_id));
create policy operator_services_own_insert on operator_services for insert to authenticated
  with check (operator_can_write(operator_id));
create policy operator_services_own_delete on operator_services for delete to authenticated
  using (operator_can_write(operator_id));

-- Replace the set of services an operator offers, in one step: admin for any operator, an operator for its own.
-- Returns the new set. An unknown or retired service fails the whole call.
create function set_operator_services(p_operator_id uuid, p_services text[])
returns setof text
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not ((select is_admin()) or operator_can_write(p_operator_id)) then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from unnest(p_services) as wanted(id)
    where not exists (select 1 from services s where s.id = wanted.id and s.is_active)
  ) then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  delete from operator_services where operator_id = p_operator_id and service_id <> all (p_services);
  insert into operator_services (operator_id, service_id)
    select p_operator_id, wanted.id from unnest(p_services) as wanted(id)
    on conflict do nothing;
  return query select service_id from operator_services where operator_id = p_operator_id order by service_id;
end;
$$;
revoke execute on function set_operator_services(uuid, text[]) from public, anon;
grant execute on function set_operator_services(uuid, text[]) to authenticated;

-- The classes that have at least one listed, active vehicle whose operator offers the service. The platform's own
-- fleet (no operator) offers every service until it is assigned to one. One query for any number of classes.
create function classes_offering_service(p_service text)
returns table (class_id uuid)
language sql stable security definer set search_path = public, pg_temp as $$
  select distinct v.class_id
  from vehicles v
  where v.status = 'active'
    and vehicle_is_listed(v.operator_id)
    and (
      v.operator_id is null
      or exists (
        select 1 from operator_services os
        where os.operator_id = v.operator_id and os.service_id = p_service
      )
    )
$$;
grant execute on function classes_offering_service(text) to anon, authenticated;
