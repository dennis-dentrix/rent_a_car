-- Identity, companies, fleet, pricing, locations. docs/database-design.md sections 2 to 4, plus
-- product pack section 24 (discounts, security deposit, USD override).

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kra_pin text,
  billing_email text,
  credit_terms_days integer not null default 0 check (credit_terms_days >= 0),
  approval_limit_kes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text unique,
  email text,
  role user_role not null default 'customer',
  company_id uuid references companies (id),
  marketing_opt_in boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_company_id_idx on profiles (company_id);

create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('office', 'airport', 'city', 'custom')),
  address text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  entrance_note text,
  is_served boolean not null default true,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee_kes integer not null check (fee_kes >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table vehicle_classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  seats smallint not null,
  luggage_capacity smallint,
  description text,
  best_for text[] not null default '{}',
  photo_paths text[] not null default '{}',
  is_public boolean not null default true,
  sort_order integer,
  -- Security deposit (section 24.4). Null enabled means "follow the system setting".
  security_deposit_enabled boolean,
  security_deposit_kes integer check (security_deposit_kes is null or security_deposit_kes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table vehicles (
  id uuid primary key default gen_random_uuid(),
  registration text not null unique,
  make text,
  model text,
  year smallint,
  class_id uuid not null references vehicle_classes (id),
  status vehicle_status not null default 'active',
  mileage_km integer,
  home_location_id uuid references locations (id),
  photo_paths text[] not null default '{}',
  -- A vehicle-level setting overrides the class and system settings.
  security_deposit_enabled boolean,
  security_deposit_kes integer check (security_deposit_kes is null or security_deposit_kes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index vehicles_class_id_idx on vehicles (class_id);

-- Daily rate only. Weekly and longer hire are discount rules (section 24.5).
create table rates (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references vehicle_classes (id),
  duration_type text not null default 'day' check (duration_type = 'day'),
  price_kes integer not null check (price_kes > 0),
  usd_override integer check (usd_override is null or usd_override > 0),
  effective_from date not null,
  effective_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  exclude using gist (
    class_id with =,
    duration_type with =,
    daterange(effective_from, coalesce(effective_to, 'infinity'::date), '[]') with &&
  )
);

create table discounts (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references vehicle_classes (id),
  label text not null,
  min_days integer not null check (min_days > 0),
  kind text not null check (kind in ('percent', 'fixed')),
  value integer not null check (value > 0),
  effective_from date not null,
  effective_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind <> 'percent' or value <= 100)
);

create table extras (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_kes integer not null check (price_kes >= 0),
  pricing_type text not null check (pricing_type in ('per_day', 'per_booking')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table exchange_rates (
  currency char(3) primary key,
  rate_to_kes numeric(12, 6) not null check (rate_to_kes > 0),
  rate_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


insert into settings (key, value) values
  ('deposit_percent', '30'),
  ('late_return_grace_minutes', '60'),
  ('hold_minutes', '30'),
  ('cancellation_window_hours', '24'),
  ('minimum_age', '21'),
  ('security_deposit_enabled', 'false'),
  ('review_threshold', '5'),
  ('currency_selector_enabled', 'true'),
  ('etims_enabled', 'false'),
  ('date_change_cutoff_hours', '24'),
  ('max_date_changes', '1');
