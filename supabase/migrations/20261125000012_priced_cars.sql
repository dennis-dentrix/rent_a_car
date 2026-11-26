-- Renters see and book a car at its own daily price, so only a priced car is listed (docs/booking-flow-plan.md).

-- The existing view keeps the choice of safe columns under a new name, no longer read by renters directly.
alter view public_vehicles rename to active_company_cars;
revoke select on active_company_cars from anon, authenticated;

create view public_vehicles as
  select shown.*, car.daily_rate_kes
  from active_company_cars shown
  join vehicles car on car.id = shown.id
  where car.daily_rate_kes is not null;
grant select on public_vehicles to anon, authenticated;

-- The listed cars that are neither booked nor blocked for the dates. Returned as rows of the view, so the API can
-- order and page them like any list. Replaces the list of ids.
drop function free_vehicle_ids(timestamptz, timestamptz);
create function free_cars(p_start timestamptz, p_end timestamptz) returns setof public_vehicles
language sql stable security definer set search_path = public as $$
  select * from public_vehicles listed where not vehicle_is_booked(listed.id, p_start, p_end)
$$;
grant execute on function free_cars(timestamptz, timestamptz) to anon, authenticated;
