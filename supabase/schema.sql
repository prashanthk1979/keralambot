-- KeralamBot.com foundational schema
-- Paste into Supabase SQL editor (run in a new project).
-- Uses UUID primary keys and server-side timestamps.

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type public.user_role as enum ('CUSTOMER','VENDOR','EMPLOYEE','ADMIN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum ('PENDING','ACCEPTED','CANCELLED','COMPLETED');
exception when duplicate_object then null; end $$;

-- Profiles (one row per user/vendor/employee/admin)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique, -- optional linkage to auth.users.id
  role public.user_role not null,

  full_name text,
  email text,
  phone_e164 text, -- +91...
  alt_phones_e164 text[],

  -- vendor-specific onboarding
  vendor_status text not null default 'PENDING', -- PENDING/APPROVED/REJECTED
  vendor_aadhaar text,
  vendor_pan text,
  vendor_shop_municipal_license_id text,
  vendor_address text,
  shop_lat double precision,
  shop_lng double precision,
  service_radius_km integer,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_phone_idx on public.profiles(phone_e164);
create index if not exists profiles_email_idx on public.profiles(email);

-- Service categories and optional subcategories
create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  approx_price_rupees integer, -- admin-editable "shown price"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(category_id, name)
);

-- Vendor services offered (many-to-many)
create table if not exists public.vendor_services (
  vendor_profile_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.service_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (vendor_profile_id, category_id)
);

-- Bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),

  customer_profile_id uuid not null references public.profiles(id) on delete restrict,
  vendor_profile_id uuid references public.profiles(id) on delete set null,
  created_by_employee_profile_id uuid references public.profiles(id) on delete set null,

  service_category_id uuid not null references public.service_categories(id) on delete restrict,
  service_subcategory_text text,

  customer_name text,
  customer_phone_e164 text,
  customer_email text,
  customer_address text,
  customer_notes text,

  location_lat double precision,
  location_lng double precision,

  scheduled_for timestamptz not null,
  status public.booking_status not null default 'PENDING',

  vendor_cancel_reason text,
  accepted_at timestamptz,
  completed_at timestamptz,

  -- closure fields
  warranty_notes text,
  accessories_notes text,
  platform_commission_rupees integer not null default 25,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_scheduled_for_idx on public.bookings(scheduled_for);
create index if not exists bookings_vendor_idx on public.bookings(vendor_profile_id);
create index if not exists bookings_customer_idx on public.bookings(customer_profile_id);
create index if not exists bookings_service_idx on public.bookings(service_category_id);

-- Messages (chat) - enforce "ACCEPTED-only" in server or RLS later
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_booking_idx on public.messages(booking_id, created_at);

-- Complaints/helpline notes (limits enforced server-side/RLS)
create table if not exists public.complaint_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);
create index if not exists complaint_notes_booking_idx on public.complaint_notes(booking_id, created_at);

-- Audit logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_table text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs(created_at desc);

-- Seed categories (idempotent)
insert into public.service_categories(name, approx_price_rupees)
values
  ('Refrigerator Repair', null),
  ('Washing Machine Repair', null),
  ('AC Repair & Installation', null),
  ('Water Purifier Sales & Service', null),
  ('TV Repair & Installation', null),
  ('Microwave Repair', null),
  ('Chimney Repair & Installation', null),
  ('Pest Control', null),
  ('Laptop/Desktop Sales, Service & Repairs', null),
  ('Plumber (Pipes & Toiletries)', null),
  ('Plumber (WM/Dishwasher & Pipe Solutions)', null),
  ('Electrician', null),
  ('House Painting & Waterproofing', null),
  ('Cooking Range Repair', null),
  ('Solar Water Heater Repair', null),
  ('Gas Stove/Hob Repair & Installation', null),
  ('CCTV Installation & Repairs', null),
  ('Inverter/UPS Sales & Repair', null),
  ('Water Level Controller', null),
  ('Carpenter & Mosquito Mesh', null),
  ('Modular Kitchen', null),
  ('Geyser', null),
  ('Dishwasher', null),
  ('Civil Work / PoP / Welding / Fabrication / Core Cutting', null),
  ('Gas Geyser', null),
  ('Bike Repair', null),
  ('Shingari Melam', null),
  ('Coconut Tree Climbers', null)
on conflict (name) do nothing;

