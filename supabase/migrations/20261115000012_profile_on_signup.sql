-- Every account gets a profile the moment it is created, whether the person signs up on the website or staff
-- create the account. The role is always customer: it is never read from the sign-up data, which the person
-- controls. Staff and admin roles are set by an admin afterwards.
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), nullif(split_part(new.email, '@', 1), ''), 'Customer'),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
