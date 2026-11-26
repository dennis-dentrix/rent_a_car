-- A quote may be for one car, priced from that car's own daily rate (docs/booking-flow-plan.md). A quote with no car
-- is still priced from its class.

alter table quotes add column vehicle_id uuid references vehicles (id);
create index quotes_vehicle_id_idx on quotes (vehicle_id) where vehicle_id is not null;

-- The price of a car quote holds for that car only. Checked here so that every way of creating or changing a booking
-- obeys it. A booking offered another car gets the overlap error, so the functions that try each car of a class pass
-- over it and settle on the quoted one, or report that it is taken. A booking of a car cannot be repriced for a
-- different car, or for a class.
create function keep_quoted_car() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  priced_car uuid := (select vehicle_id from quotes where id = new.quote_id);
  booked_car uuid;
begin
  if tg_op = 'UPDATE' then
    booked_car := (select vehicle_id from quotes where id = old.quote_id);
    if booked_car is not null and priced_car is distinct from booked_car then
      raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
    end if;
  end if;
  if priced_car is not null and new.vehicle_id is distinct from priced_car then
    raise exception 'BOOKING_OVERLAP' using errcode = 'exclusion_violation';
  end if;
  return new;
end;
$$;
create trigger bookings_keep_quoted_car before insert or update of vehicle_id, quote_id on bookings
  for each row execute function keep_quoted_car();
