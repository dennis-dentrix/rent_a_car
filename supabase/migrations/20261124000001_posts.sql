-- Blog and guides (docs/content-management.md). A post is structured text: sections, questions, and related
-- links as JSON, so the page can build its contents list and its FAQ markup. Images are records here and files in
-- the public bucket. The readiness rules (keyword in the title, minimum length) live in packages/shared and are
-- checked by the API when a post is published; the database keeps only what must never be false.

create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 100),
  keyword text not null default '' check (length(keyword) <= 100),
  title text not null check (length(title) between 1 and 200),
  description text not null default '' check (length(description) <= 300),
  intro text not null default '' check (length(intro) <= 2000),
  sections jsonb not null default '[]' check (jsonb_typeof(sections) = 'array'),
  faq jsonb not null default '[]' check (jsonb_typeof(faq) = 'array'),
  related jsonb not null default '[]' check (jsonb_typeof(related) = 'array'),
  cover_image_id uuid,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or published_at is not null)
);

create table post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  storage_path text not null unique,
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer not null check (size_bytes > 0),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  alt_text text not null check (length(trim(alt_text)) between 1 and 300),
  caption text check (length(caption) <= 300),
  created_at timestamptz not null default now()
);

-- A cover must be one of the post's own images; if that image is removed the post simply has no cover.
alter table posts add constraint posts_cover_image_fk
  foreign key (cover_image_id) references post_images (id) on delete set null;

-- The public list, and the admin list (every list is newest first with the id as the tiebreak).
create index posts_published_idx on posts (status, published_at desc, id desc);
create index posts_created_idx on posts (created_at desc, id desc);
create index post_images_post_idx on post_images (post_id, created_at desc, id desc);
create index posts_cover_image_idx on posts (cover_image_id);

-- A post gets its publication date the first time it is published and keeps it. Its address is indexed by
-- search engines by then, so the slug cannot change afterwards.
create function posts_publish_rules() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  if tg_op = 'UPDATE' and old.published_at is not null and new.slug <> old.slug then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger posts_publish_rules before insert or update on posts
  for each row execute function posts_publish_rules();

-- A cover and the images in a post's sections must belong to that post. The cover is checked here; the sections
-- are JSON, so the API checks those against the post's images when it saves.
create function posts_cover_belongs() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  if new.cover_image_id is not null and not exists (
    select 1 from post_images where id = new.cover_image_id and post_id = new.id
  ) then
    raise exception 'VALIDATION_FAILED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger posts_cover_belongs before update of cover_image_id on posts
  for each row execute function posts_cover_belongs();

select ensure_updated_at_triggers();
select ensure_rls_enabled();

create trigger posts_audit after insert or update or delete on posts
  for each row execute function write_audit();

-- Anyone reads what is published; admin reads and writes everything.
select add_admin_policy('posts');
create policy posts_read_published on posts for select to anon, authenticated
  using (status = 'published');

select add_admin_policy('post_images');
create policy post_images_read_published on post_images for select to anon, authenticated
  using (exists (select 1 from posts p where p.id = post_id and p.status = 'published'));
