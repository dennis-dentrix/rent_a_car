-- A renter books a particular car in one step (docs/booking-flow-plan.md): the age rule, the booking, the trip
-- details, and the confirmation (or the request to the company) happen together or not at all.

alter table profiles add column date_of_birth date check (date_of_birth > '1900-01-01');
alter table bookings
  add column destination text check (char_length(destination) <= 200),
  add column pickup_place text check (char_length(pickup_place) <= 200),
  add column wants_dropoff boolean not null default false,
  add column wants_pickup boolean not null default false;
-- Drop-off: the company brings the car to the renter. Pick-up: the company collects it when the hire ends.
alter table operators
  add column offers_dropoff boolean not null default false,
  add column offers_pickup boolean not null default false;
grant update (offers_dropoff, offers_pickup) on operators to authenticated;
alter table quotes add column with_chauffeur boolean not null default false;
-- Whether a booking of the car is confirmed at once, or waits for the company to accept it.
alter table vehicles add column booking_mode text not null default 'instant'
  check (booking_mode in ('instant', 'request'));

-- A car's chauffeur price is part of what a renter pays, so it is listed with the daily price.
create or replace view public_vehicles as
  select shown.*, car.daily_rate_kes, car.chauffeur_daily_kes, car.booking_mode,
    company.offers_dropoff, company.offers_pickup
  from active_company_cars shown
  join vehicles car on car.id = shown.id
  join operators company on company.id = car.operator_id
  where car.daily_rate_kes is not null;

-- The platform's minimum, or the company's higher one: its rule for the car's class where it has one, otherwise its
-- general rule.
create function minimum_age_for(p_vehicle_id uuid) returns integer
language sql stable security definer set search_path = public as $$
  select greatest(
    (select (value #>> '{}')::integer from settings where key = 'minimum_age'),
    (select p.min_age from vehicles car
       join operator_policies p on p.operator_id = car.operator_id
         and (p.class_id = car.class_id or p.class_id is null)
     where car.id = p_vehicle_id and p.min_age is not null
     order by p.class_id nulls last limit 1)
  )
$$;
revoke execute on function minimum_age_for(uuid) from public, anon, authenticated;

create function book_car(
  p_quote_id uuid,
  p_customer_id uuid,
  p_date_of_birth date,
  p_destination text,
  p_pickup_place text,
  p_wants_dropoff boolean default false,
  p_wants_pickup boolean default false
) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  q quotes := (select quotes from quotes where id = p_quote_id);
  car public_vehicles := (select public_vehicles from public_vehicles where id = q.vehicle_id);
  made bookings;
begin
  if car.id is null then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  if p_date_of_birth is null or coalesce(trim(p_destination), '') = ''
     or coalesce(trim(p_pickup_place), '') = ''
     or (p_wants_dropoff and not car.offers_dropoff) or (p_wants_pickup and not car.offers_pickup) then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  -- The age on the day the hire starts, in Nairobi.
  if date_part('year', age((q.start_at at time zone 'Africa/Nairobi')::date, p_date_of_birth))
     < minimum_age_for(q.vehicle_id) then
    raise exception 'UNDER_MINIMUM_AGE' using errcode = 'P0001';
  end if;
  update profiles set date_of_birth = p_date_of_birth where id = p_customer_id;
  made := create_booking_from_quote(p_quote_id, p_customer_id, null, null, null, true);
  update bookings set destination = trim(p_destination), pickup_place = trim(p_pickup_place),
    wants_dropoff = coalesce(p_wants_dropoff, false), wants_pickup = coalesce(p_wants_pickup, false)
  where id = made.id;
  if car.booking_mode = 'request' then
    -- The company has this long to answer, and never beyond the start of the hire. A request holds no dates.
    update bookings set hold_expires_at = least(
      now() + make_interval(mins => coalesce(
        (select (value #>> '{}')::integer from settings where key = 'request_response_minutes'), 120)),
      made.start_at)
    where id = made.id;
    return transition_booking(made.id, 'requested', p_customer_id, 'Booking requested');
  end if;
  return transition_booking(made.id, 'confirmed', p_customer_id, 'Booked instantly');
end;
$$;
revoke execute on function book_car(uuid, uuid, date, text, text, boolean, boolean)
  from public, anon, authenticated;
grant execute on function book_car(uuid, uuid, date, text, text, boolean, boolean) to service_role;
