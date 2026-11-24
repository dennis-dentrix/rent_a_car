-- A person's picture. The file lives in the public media bucket under avatars/{their id}/, named with a random id, so
-- the address is not guessable and a replaced picture gets a new address. The column may only name a file in the
-- person's own folder: someone who edits their own profile directly still cannot point it at another person's file.
alter table profiles add column avatar_path text
  check (avatar_path is null or avatar_path like 'avatars/' || id::text || '/%');
