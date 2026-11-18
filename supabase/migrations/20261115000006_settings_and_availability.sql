-- Extra settings and the availability count used by the public API.
-- VAT stays at 0 until the accountant confirms the treatment (product pack section 8).
insert into settings (key, value) values
  ('quote_expiry_minutes', '30'),
  ('vat_percent', '0')
on conflict (key) do nothing;

-- Vehicles of a class that are free for the dates. Returns a count only, so guests can call it
-- without being able to read vehicles or bookings.
create function available_vehicle_count(p_class_id uuid, p_start timestamptz, p_end timestamptz)
returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::integer
  from vehicles v
  where v.class_id = p_class_id
    and v.status = 'active'
    and not exists (
      select 1 from bookings b
      where b.vehicle_id = v.id
        and b.status in ('pending_payment', 'confirmed', 'ready', 'active')
        and tstzrange(b.start_at, b.end_at) && tstzrange(p_start, p_end)
    )
$$;

grant execute on function available_vehicle_count(uuid, timestamptz, timestamptz) to anon, authenticated;
