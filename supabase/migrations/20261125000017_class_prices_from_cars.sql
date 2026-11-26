-- A car type costs what its cheapest listed car does (docs/booking-flow-plan.md): the price shown for a type is one a
-- renter can actually pay.
create view listed_class_prices as
  select class_id, min(daily_rate_kes) as price_kes from public_vehicles group by class_id;
grant select on listed_class_prices to anon, authenticated;
