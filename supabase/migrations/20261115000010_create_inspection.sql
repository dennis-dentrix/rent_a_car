-- Saves an inspection report and its files in one transaction. Inspection records are append-only, so a
-- half-saved report could never be corrected; this makes it all or nothing.
-- Runs as the caller (not security definer), so Row Level Security still limits it to staff.
create function create_inspection(
  p_booking_id uuid,
  p_type text,
  p_fuel_level text,
  p_mileage_km integer,
  p_condition_notes text,
  p_damage_noted boolean,
  p_checklist jsonb,
  p_signature_path text,
  p_files jsonb
) returns uuid
language plpgsql as $$
declare
  booked_vehicle uuid;
  report_id uuid;
begin
  select vehicle_id into booked_vehicle from bookings where id = p_booking_id;
  if booked_vehicle is null then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;

  insert into handover_records (
    booking_id, type, vehicle_id, fuel_level, mileage_km, condition_notes, damage_noted,
    checklist, customer_signature_path, recorded_by, recorded_at
  ) values (
    p_booking_id, p_type, booked_vehicle, p_fuel_level, p_mileage_km, p_condition_notes,
    coalesce(p_damage_noted, false), p_checklist, p_signature_path, auth.uid(), now()
  ) returning id into report_id;

  insert into inspection_files (handover_record_id, kind, label, caption, storage_path, content_type, size_bytes)
  select report_id, f.kind, f.label, f.caption, f.storage_path, f.content_type, f.size_bytes
  from jsonb_to_recordset(coalesce(p_files, '[]'::jsonb))
    as f(kind text, label text, caption text, storage_path text, content_type text, size_bytes integer);

  return report_id;
end;
$$;

revoke execute on function create_inspection(uuid, text, text, integer, text, boolean, jsonb, text, jsonb) from public, anon;
grant execute on function create_inspection(uuid, text, text, integer, text, boolean, jsonb, text, jsonb) to authenticated;
