-- A renter may ask the company about a car before deciding (docs/booking-flow-plan.md). One conversation for each
-- renter and car, seen only by that renter and that company. Names are copied onto the conversation, because neither
-- side may read the other's records.

create table conversations (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles (id) on delete cascade,
  renter_id uuid not null references profiles (id) on delete cascade,
  operator_id uuid not null references operators (id) on delete cascade,
  car_name text not null,
  company_name text not null,
  renter_name text not null,
  start_at timestamptz,
  end_at timestamptz,
  awaiting_company boolean not null default true,
  -- What each side has seen, and the latest message, kept here so a list needs no second query.
  renter_read_at timestamptz,
  company_read_at timestamptz,
  last_message_at timestamptz,
  last_message text,
  last_from_company boolean,
  created_at timestamptz not null default now(),
  unique (vehicle_id, renter_id)
);
create index conversations_renter_idx on conversations (renter_id, created_at desc, id desc);
create index conversations_operator_idx on conversations (operator_id, created_at desc, id desc);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender_id uuid not null references profiles (id),
  is_from_company boolean not null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default clock_timestamp()
);
create index messages_conversation_idx on messages (conversation_id, created_at desc, id desc);

select ensure_rls_enabled();

-- Both sides read; nobody writes the tables directly. The two functions below are the only way in.
create policy conversations_party_read on conversations for select to authenticated
  using (renter_id = (select auth.uid()) or operates(operator_id));
create policy messages_party_read on messages for select to authenticated
  using (exists (select 1 from conversations c where c.id = conversation_id));

-- Phone numbers (nine digits or more) and email addresses, which stay private until a booking is agreed.
create function hide_contacts(p_text text) returns text
language sql immutable as $$
  select regexp_replace(
    regexp_replace(p_text, '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}', '[hidden until booked]', 'g'),
    '\+?[0-9]([ ().-]*[0-9]){8,}', '[hidden until booked]', 'g')
$$;

create function send_message(p_conversation_id uuid, p_body text) returns void
language plpgsql security definer set search_path = public as $$
declare
  talk conversations := (select conversations from conversations where id = p_conversation_id);
  is_company boolean := operator_can_write(talk.operator_id);
  said text := trim(coalesce(p_body, ''));
begin
  if not (is_company or coalesce(talk.renter_id = auth.uid(), false)) then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  if char_length(said) not between 1 and 1000 then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from bookings b
    where b.customer_id = talk.renter_id and b.operator_id = talk.operator_id
      and b.status in ('confirmed', 'ready', 'active', 'returned', 'closed')
  ) then
    said := hide_contacts(said);
  end if;
  insert into messages (conversation_id, sender_id, is_from_company, body)
  values (talk.id, auth.uid(), is_company, said);
  update conversations set awaiting_company = not is_company where id = talk.id;
end;
$$;

-- A renter's first word about a car, or the next one if they have asked about it before. The dates they were looking
-- at head the conversation.
create function start_conversation(p_vehicle_id uuid, p_start timestamptz, p_end timestamptz, p_body text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  started uuid;
begin
  insert into conversations
    (vehicle_id, renter_id, operator_id, car_name, company_name, renter_name, start_at, end_at)
  select car.id, me.id, car.operator_id, concat_ws(' ', car.make, car.model, car.year), shown.operator_name,
    me.full_name, p_start, p_end
  from public_vehicles shown
  join vehicles car on car.id = shown.id
  join profiles me on me.id = auth.uid() and me.deleted_at is null
  where shown.id = p_vehicle_id and car.operator_id is distinct from me.operator_id
  on conflict (vehicle_id, renter_id) do update
    set start_at = coalesce(excluded.start_at, conversations.start_at),
        end_at = coalesce(excluded.end_at, conversations.end_at)
  returning id into started;
  if started is null then
    raise exception 'NOT_FOUND' using errcode = 'P0001';
  end if;
  perform send_message(started, p_body);
  return started;
end;
$$;
revoke execute on function send_message(uuid, text), start_conversation(uuid, timestamptz, timestamptz, text)
  from public, anon;
grant execute on function send_message(uuid, text), start_conversation(uuid, timestamptz, timestamptz, text)
  to authenticated;

-- The caller has the chat open. Nobody else's mark can be moved.
create function mark_conversation_read(p_conversation_id uuid) returns void
language sql security definer set search_path = public as $$
  update conversations set
    renter_read_at = case when renter_id = auth.uid() then clock_timestamp() else renter_read_at end,
    company_read_at = case when operates(operator_id) then clock_timestamp() else company_read_at end
  where id = p_conversation_id and (renter_id = auth.uid() or operates(operator_id))
$$;
revoke execute on function mark_conversation_read(uuid) from public, anon;
grant execute on function mark_conversation_read(uuid) to authenticated;
