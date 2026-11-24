-- The operator console (docs/operator-console.md). An operator picks its classes, sets its daily rates, and chooses
-- the airports and airstrips it serves. Carvo's own rows keep a null operator; an operator's rows carry its id, so
-- nothing an operator adds is shown to renters until an admin makes it so.

alter table vehicle_classes add column operator_id uuid references operators (id);
alter table rates add column operator_id uuid references operators (id);
alter table locations add column operator_id uuid references operators (id);
create index vehicle_classes_operator_idx on vehicle_classes (operator_id) where operator_id is not null;
create index rates_operator_class_idx on rates (operator_id, class_id) where operator_id is not null;
create index locations_operator_idx on locations (operator_id) where operator_id is not null;

-- Two operators may price one class on the same dates; one owner may not price it twice for one day. A null owner
-- (Carvo's own rate) is treated as one owner of its own.
alter table rates drop constraint rates_class_id_duration_type_daterange_excl;
alter table rates add constraint rates_owner_class_period_excl exclude using gist (
  (coalesce(operator_id, '00000000-0000-0000-0000-000000000000'::uuid)) with =,
  class_id with =,
  duration_type with =,
  daterange(effective_from, coalesce(effective_to, 'infinity'::date), '[]') with &&
);

-- A class is usable by an operator when it is Carvo's, or its own.
create function class_usable_by(p_class_id uuid, p_operator_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from vehicle_classes c
    where c.id = p_class_id and (c.operator_id is null or c.operator_id = p_operator_id)
  )
$$;

-- Every airport and airstrip is served by default. An operator switches one off here.
create table operator_excluded_locations (
  operator_id uuid not null references operators (id) on delete cascade,
  location_id uuid not null references locations (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (operator_id, location_id)
);
create index operator_excluded_locations_location_idx on operator_excluded_locations (location_id, operator_id);

select ensure_rls_enabled();

select add_admin_policy('operator_excluded_locations');
select add_staff_read_policy('operator_excluded_locations');
create policy excluded_locations_own_read on operator_excluded_locations for select to authenticated
  using (operates(operator_id));
create policy excluded_locations_own_insert on operator_excluded_locations for insert to authenticated
  with check (operator_can_write(operator_id));
create policy excluded_locations_own_delete on operator_excluded_locations for delete to authenticated
  using (operator_can_write(operator_id));

-- Classes: an operator reads its own beside Carvo's public ones, adds its own, and changes them. It cannot make one
-- public; an admin does that.
create policy classes_operator_read on vehicle_classes for select to authenticated using (operates(operator_id));
create policy classes_operator_insert on vehicle_classes for insert to authenticated
  with check (operator_can_write(operator_id) and not is_public);
create policy classes_operator_update on vehicle_classes for update to authenticated
  using (operator_can_write(operator_id))
  with check (operator_can_write(operator_id) and not is_public);

-- Rates: an operator prices a class that is Carvo's or its own.
create policy rates_operator_insert on rates for insert to authenticated
  with check (operator_can_write(operator_id) and class_usable_by(class_id, operator_id));
create policy rates_operator_update on rates for update to authenticated
  using (operator_can_write(operator_id))
  with check (operator_can_write(operator_id) and class_usable_by(class_id, operator_id));

-- Places: an operator's own pick-up places are never offered to renters (is_served stays false) and are only
-- airports, airstrips, or custom places.
create policy locations_operator_read on locations for select to authenticated using (operates(operator_id));
create policy locations_operator_insert on locations for insert to authenticated
  with check (operator_can_write(operator_id) and not is_served and type in ('airport', 'airstrip', 'custom'));
create policy locations_operator_update on locations for update to authenticated
  using (operator_can_write(operator_id))
  with check (operator_can_write(operator_id) and not is_served and type in ('airport', 'airstrip', 'custom'));

-- The public aerodromes of the Kenya Airports Authority (kaa.go.ke/airports, read 24 November 2026): four
-- international, four domestic, and 13 airstrips. Those already in the list are left as they are.
insert into locations (name, type, address, slug) values
  ('Wajir Airport', 'airport', 'Wajir', 'wajir-airport'),
  ('Lokichogio Airport', 'airport', 'Turkana County', 'lokichogio-airport'),
  ('Isiolo Airport', 'airport', 'Isiolo', 'isiolo-airport'),
  ('Eldoret (Boma) Airstrip', 'airstrip', 'Eldoret', 'eldoret-boma-airstrip'),
  ('Garissa Airstrip', 'airstrip', 'Garissa', 'garissa-airstrip'),
  ('Kabunde Airstrip', 'airstrip', 'Homa Bay', 'kabunde-airstrip'),
  ('Kakamega Airstrip', 'airstrip', 'Kakamega', 'kakamega-airstrip'),
  ('Kitale Airstrip', 'airstrip', 'Kitale', 'kitale-airstrip'),
  ('Lodwar Airstrip', 'airstrip', 'Lodwar', 'lodwar-airstrip'),
  ('Migori Airstrip', 'airstrip', 'Migori', 'migori-airstrip'),
  ('Nyaribo Airstrip', 'airstrip', 'Nyeri', 'nyaribo-airstrip'),
  ('Suneka Airstrip', 'airstrip', 'Kisii', 'suneka-airstrip')
on conflict (slug) do nothing;
