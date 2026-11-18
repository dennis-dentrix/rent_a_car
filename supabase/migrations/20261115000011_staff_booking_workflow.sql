-- Staff booking workflow: status changes made by staff as themselves, and vehicle and driver assignment.
-- The rules each status step needs (documents before ready, an inspection before active and returned) are in
-- transition_booking, and creating a booking for a walk-in is in create_booking_from_quote.

-- Staff and admin change a booking's status as themselves. A note is required where the reason matters:
-- confirming by hand (deposit received outside the system), cancelling, and expiring.
create function staff_transition_booking(p_booking_id uuid, p_to booking_status, p_note text)
returns bookings
language plpgsql security definer set search_path = public as $$
begin
  if not is_staff() then
    raise exception 'FORBIDDEN' using errcode = 'P0001';
  end if;
  if p_to in ('confirmed', 'cancelled', 'expired') and coalesce(trim(p_note), '') = '' then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  return transition_booking(p_booking_id, p_to, auth.uid(), p_note);
end;
$$;

revoke execute on function staff_transition_booking(uuid, booking_status, text) from public, anon;
grant execute on function staff_transition_booking(uuid, booking_status, text) to authenticated;

-- Move a booking to another vehicle of the same class, and for a delivery set the driver. Runs as the caller,
-- so only staff can; the overlap rule in the database is the final check.
create function assign_booking(p_booking_id uuid, p_vehicle_id uuid, p_driver_id uuid default null)
returns bookings
language plpgsql as $$
declare
  target bookings;
  chosen vehicles;
begin
  select * into target from bookings where id = p_booking_id for update;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  if target.status not in ('pending_payment', 'confirmed', 'ready') then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;
  select * into chosen from vehicles where id = p_vehicle_id;
  if not found or chosen.status <> 'active' or chosen.class_id <> target.class_id
     or (target.handover_type = 'delivery' and p_driver_id is null)
     or (target.handover_type = 'office' and p_driver_id is not null) then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  begin
    update bookings set vehicle_id = p_vehicle_id where id = p_booking_id returning * into target;
  exception when exclusion_violation then
    raise exception 'BOOKING_OVERLAP' using errcode = 'P0001';
  end;
  if p_driver_id is not null then
    update deliveries set driver_id = p_driver_id where booking_id = p_booking_id;
  end if;
  return target;
end;
$$;

revoke execute on function assign_booking(uuid, uuid, uuid) from public, anon;
grant execute on function assign_booking(uuid, uuid, uuid) to authenticated;

-- Changes to a booking, including who made them, are kept in the audit log.
create trigger bookings_audit after update on bookings for each row execute function write_audit();
