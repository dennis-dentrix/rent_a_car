-- Indexes for the way the API lists, filters, and looks things up, and one function that answers
-- availability for every public class in a single call (so the class list needs no query per class).

-- Every list is newest first with a keyset cursor: order by created_at desc, id desc. The staff inbox adds
-- an optional status or start date.
create index bookings_created_idx on bookings (created_at desc, id desc);
create index bookings_status_created_idx on bookings (status, created_at desc, id desc);
create index bookings_start_at_idx on bookings (start_at);

-- The enquiry list is open, converted, or all. Open is the one staff work from, so it gets its own small index.
create index enquiries_created_idx on enquiries (created_at desc, id desc);
create index enquiries_open_idx on enquiries (created_at desc, id desc) where converted_booking_id is null;

-- The document review queue is by status, newest first. This index also serves a status-only filter, so the
-- old status index is dropped.
create index documents_status_created_idx on documents (status, created_at desc, id desc);
drop index documents_status_idx;

-- Finding an account by email: sign-up of a walk-in customer, and inviting staff.
create index profiles_email_idx on profiles (email);

-- Free vehicles for the dates, for every public class at once. It calls the single-class function, so the rule
-- for "free" lives in one place; the loop runs inside the database, in one round trip.
create function available_vehicle_counts(p_start timestamptz, p_end timestamptz)
returns table (class_id uuid, available_count integer)
language sql stable security definer set search_path = public, pg_temp as $$
  select c.id, available_vehicle_count(c.id, p_start, p_end)
  from vehicle_classes c
  where c.is_public
$$;

grant execute on function available_vehicle_counts(timestamptz, timestamptz) to anon, authenticated;
