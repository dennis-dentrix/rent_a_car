-- Confirming an upload. Document rows are created by the API (customers cannot insert them), the file goes
-- straight to storage, and this marks it as arrived. It runs as the function owner so the document's columns
-- stay locked for everyone else, and it checks the caller is the owner or staff.
create function confirm_document(p_document_id uuid) returns documents
language plpgsql security definer set search_path = public as $$
declare
  d documents;
begin
  select * into d from documents where id = p_document_id for update;
  if not found or not (d.owner_id = auth.uid() or is_staff()) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  update documents set file_confirmed_at = coalesce(file_confirmed_at, now()) where id = d.id returning * into d;
  -- A newer copy replaces an earlier one that was never accepted. Files are never deleted.
  update documents set status = 'replaced'
  where id <> d.id and owner_id = d.owner_id and type = d.type
    and booking_id is not distinct from d.booking_id
    and status in ('uploaded', 'rejected') and file_confirmed_at is not null;
  return d;
end;
$$;

revoke execute on function confirm_document(uuid) from public, anon;
grant execute on function confirm_document(uuid) to authenticated;
