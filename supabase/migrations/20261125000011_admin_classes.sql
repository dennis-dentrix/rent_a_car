-- Car classes belong to the admin (docs/booking-flow-plan.md). Companies choose a class for each car and set the
-- price on the car, so they no longer add classes or price them. Classes and rates they entered before are kept as
-- history: they can read them, and an admin may move cars out of a company's class and hide it.

drop policy classes_operator_insert on vehicle_classes;
drop policy classes_operator_update on vehicle_classes;
drop policy rates_operator_insert on rates;
drop policy rates_operator_update on rates;
drop function create_operator_class(jsonb, integer, date);
drop function set_operator_class_rate(uuid, integer, date);

-- Cars that belong in a class, shown to a company while it chooses.
alter table vehicle_classes add column example_models text[] not null default '{}';

create function require_platform_class() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from vehicle_classes where id = new.class_id and operator_id is not null) then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
-- Only when a car is added or moved, so a car already in a company's class can still be edited.
create trigger vehicles_require_platform_class_insert before insert on vehicles
  for each row execute function require_platform_class();
create trigger vehicles_require_platform_class_move before update of class_id on vehicles
  for each row when (new.class_id is distinct from old.class_id) execute function require_platform_class();

-- The starting list. A class already at one of these addresses is left as it is.
insert into vehicle_classes (name, slug, seats, description, example_models, sort_order) values
  ('Compact', 'compact', 5, 'Small, economical hatchbacks.', '{Vitz,Fit,Demio}', 10),
  ('Sedan', 'sedan', 5, 'Everyday saloons.', '{Axio,Premio,Camry}', 20),
  ('SUV', 'suv', 5, 'Mid-size SUVs.', '{CX-5,Harrier,X-Trail}', 30),
  ('Large SUV', 'large-suv', 7, 'Seven seats, ready for rough roads.', '{Prado,Land Cruiser}', 40),
  ('Van', 'van', 14, 'Room for groups.', '{Noah,Hiace}', 50),
  ('Luxury', 'luxury', 5, 'Premium and performance cars.', '{G63,RS Q8,RS7}', 60)
on conflict (slug) do nothing;
