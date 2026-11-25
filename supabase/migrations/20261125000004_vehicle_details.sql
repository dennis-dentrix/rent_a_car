-- What a renter wants to know about a car, what its chauffeur costs, and the public list of cars
-- (docs/operator-console.md section 10).

alter table vehicles
  add column seats smallint check (seats between 1 and 60),
  add column luggage_capacity smallint check (luggage_capacity between 0 and 100),
  add column transmission text check (transmission in ('automatic', 'manual')),
  add column fuel_type text check (fuel_type in ('petrol', 'diesel', 'hybrid', 'electric')),
  add column drive_type text check (drive_type in ('two_wheel', 'four_wheel', 'all_wheel')),
  add column engine_cc integer check (engine_cc between 50 and 10000),
  add column colour text check (char_length(colour) <= 40),
  add column description text check (char_length(description) <= 1000),
  add column features text[] not null default '{}' check (cardinality(features) <= 20),
  -- How the car is hired. The chauffeur price is per day, saved like the car's own rate until a car can be booked.
  add column chauffeur_option text check (chauffeur_option in ('self_drive', 'chauffeur', 'both')),
  add column chauffeur_daily_kes integer check (chauffeur_daily_kes > 0);

create index vehicles_status_created_idx on vehicles (status, created_at desc, id desc);

-- The cars renters may see: active cars of approved companies. Only what describes a car is here; the registration,
-- chassis number, mileage, owner, and the company's own rates are not. The view reads past Row Level Security on
-- purpose, so these columns are the whole of what a guest can learn.
create view public_vehicles as
  select v.id, v.class_id, v.make, v.model, v.year, v.seats, v.luggage_capacity, v.transmission, v.fuel_type,
    v.drive_type, v.engine_cc, v.colour, v.description, v.features, v.chauffeur_option, v.photo_paths,
    o.business_name as operator_name, v.created_at
  from vehicles v
  join operators o on o.id = v.operator_id
  where v.status = 'active' and o.status = 'approved';
grant select on public_vehicles to anon, authenticated;
