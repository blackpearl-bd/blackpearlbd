-- BlackPearl Travel Agency - Initial Database Schema
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text not null,
  phone text,
  address text,
  avatar_url text,
  pearls int not null default 0,
  status text not null default 'new',
  role text not null default 'user',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. DESTINATIONS TABLE (for cascading form)
-- ============================================================
create table destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references destinations(id),
  type text not null,
  metadata jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- 3. TOUR DEALS TABLE
-- ============================================================
create table tour_deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  short_description text,
  destination text not null,
  price decimal(10,2) not null,
  original_price decimal(10,2),
  duration_days int not null,
  max_travelers int,
  image_url text,
  gallery jsonb default '[]',
  inclusions jsonb default '[]',
  exclusions jsonb default '[]',
  itinerary jsonb default '[]',
  is_active boolean default true,
  is_featured boolean default false,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 4. CUSTOM PACKAGES TABLE
-- ============================================================
create table custom_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text,
  destination_id uuid references destinations(id),
  budget decimal(10,2),
  travel_date date,
  num_travelers int default 1,
  accommodation_type text,
  transport_type text,
  activities jsonb default '[]',
  special_requests text,
  estimated_price decimal(10,2),
  status text not null default 'pending',
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 5. BOOKINGS TABLE (Unified)
-- ============================================================
create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  booking_type text not null,
  deal_id uuid references tour_deals(id),
  custom_package_id uuid references custom_packages(id),
  status text not null default 'pending',
  total_amount decimal(10,2) not null,
  traveler_details jsonb default '{}',
  invoice_number text unique,
  invoice_url text,
  payment_status text default 'pending',
  booked_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint booking_target_check check (
    (booking_type = 'deal' and deal_id is not null and custom_package_id is null) or
    (booking_type = 'custom' and custom_package_id is not null and deal_id is null)
  )
);

-- ============================================================
-- 6. SAVED DEALS TABLE (Bookmarks)
-- ============================================================
create table saved_deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  deal_id uuid references tour_deals(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, deal_id)
);

-- ============================================================
-- 7. PEARLS HISTORY TABLE
-- ============================================================
create table pearls_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  amount int not null,
  reason text not null,
  booking_id uuid references bookings(id),
  created_at timestamptz default now()
);

-- ============================================================
-- 8. PEARLS & STATUS TRIGGER
-- ============================================================
create or replace function award_pearls_on_approval()
returns trigger as $$
declare
  new_status text;
begin
  if NEW.status = 'approved' and OLD.status != 'approved' then
    insert into pearls_history (user_id, amount, reason, booking_id)
    values (NEW.user_id, 10, 'Booking approved', NEW.id);

    update profiles
    set pearls = pearls + 10
    where id = NEW.user_id;

    -- Update status tier
    select case
      when pearls >= 200 then 'diamond'
      when pearls >= 100 then 'gold'
      when pearls >= 50 then 'platinum'
      when pearls >= 10 then 'bronze'
      else 'new'
    end into new_status
    from profiles where id = NEW.user_id;

    update profiles set status = new_status where id = NEW.user_id;
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger on_booking_approved
  after update on bookings
  for each row execute procedure award_pearls_on_approval();

-- ============================================================
-- 9. ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Profiles
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Tour Deals
alter table tour_deals enable row level security;

create policy "Tour deals are viewable by everyone"
  on tour_deals for select
  using (is_active = true);

create policy "Admins can manage tour deals"
  on tour_deals for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Custom Packages
alter table custom_packages enable row level security;

create policy "Users can manage own custom packages"
  on custom_packages for all
  using (auth.uid() = user_id);

create policy "Admins can view all custom packages"
  on custom_packages for select
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Bookings
alter table bookings enable row level security;

create policy "Users can view own bookings"
  on bookings for select
  using (auth.uid() = user_id);

create policy "Admins can manage all bookings"
  on bookings for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Saved Deals
alter table saved_deals enable row level security;

create policy "Users can manage own saved deals"
  on saved_deals for all
  using (auth.uid() = user_id);

-- Pearls History
alter table pearls_history enable row level security;

create policy "Users can view own pearls history"
  on pearls_history for select
  using (auth.uid() = user_id);

-- ============================================================
-- 10. SEED DATA (sample destinations)
-- ============================================================
insert into destinations (id, name, type, parent_id) values
  ('a0000000-0000-0000-0000-000000000001', 'India', 'country', null),
  ('a0000000-0000-0000-0000-000000000002', 'Nepal', 'country', null),
  ('a0000000-0000-0000-0000-000000000003', 'Thailand', 'country', null),
  ('a0000000-0000-0000-0000-000000000004', 'Bali', 'country', null);

insert into destinations (id, name, type, parent_id) values
  ('b0000000-0000-0000-0000-000000000001', 'Goa', 'city', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000002', 'Kerala', 'city', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'Ladakh', 'city', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', 'Kathmandu', 'city', 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000005', 'Bangkok', 'city', 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000006', 'Phuket', 'city', 'a0000000-0000-0000-0000-000000000003');

insert into destinations (id, name, type, parent_id) values
  ('c0000000-0000-0000-0000-000000000001', 'Beach Activities', 'activity', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'Nightlife', 'activity', 'b0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000003', 'Backwaters Cruise', 'activity', 'b0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000004', 'Ayurvedic Spa', 'activity', 'b0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000005', 'Motorbike Tour', 'activity', 'b0000000-0000-0000-0000-000000000003'),
  ('c0000000-0000-0000-0000-000000000006', 'Temple Tours', 'activity', 'b0000000-0000-0000-0000-000000000004'),
  ('c0000000-0000-0000-0000-000000000007', 'Street Food Tour', 'activity', 'b0000000-0000-0000-0000-000000000005'),
  ('c0000000-0000-0000-0000-000000000008', 'Island Hopping', 'activity', 'b0000000-0000-0000-0000-000000000006');
