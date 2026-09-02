-- ============================================================
-- PACKAGE DESTINATIONS TABLE (admin-managed options for package builder)
-- ============================================================
create table package_destinations (
  id uuid primary key default gen_random_uuid(),
  category text not null,        -- group header (e.g. "Bangladesh", "Asia", "Europe")
  name text not null,            -- display name (e.g. "Thailand", "Bangladesh (Customized)")
  value text not null unique,    -- slug for combobox selection (e.g. "thailand", "bangladesh-customized")
  sort_order int not null default 0,  -- ordering within category
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Index for fetching active destinations sorted by category and order
create index idx_package_destinations_active on package_destinations (category, sort_order) where is_active = true;

-- RLS: only admins can modify, everyone can read active ones
alter table package_destinations enable row level security;

create policy "Anyone can view active package destinations"
  on package_destinations for select
  using (is_active = true);

create policy "Admins can view all package destinations"
  on package_destinations for select
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Admins can manage package destinations"
  on package_destinations for all
  using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Seed with current hardcoded destinations
insert into package_destinations (category, name, value, sort_order) values
  ('Bangladesh', 'Bangladesh (Customized)', 'bangladesh-customized', 0),
  ('Bangladesh', 'Dhaka Division', 'dhaka-division', 1),
  ('Bangladesh', 'Chattogram Division', 'chattogram-division', 2),
  ('Bangladesh', 'Sylhet Division', 'sylhet-division', 3),
  ('Bangladesh', 'Rajshahi Division', 'rajshahi-division', 4),
  ('Bangladesh', 'Khulna Division', 'khulna-division', 5),
  ('Bangladesh', 'Barishal Division', 'barishal-division', 6),
  ('Bangladesh', 'Rangpur Division', 'rangpur-division', 7),
  ('Bangladesh', 'Mymensingh Division', 'mymensingh-division', 8),
  ('Asia', 'Thailand', 'thailand', 0),
  ('Asia', 'Malaysia', 'malaysia', 1),
  ('Asia', 'Indonesia', 'indonesia', 2),
  ('Asia', 'United Arab Emirates', 'united-arab-emirates', 3),
  ('Asia', 'Maldives', 'maldives', 4),
  ('Asia', 'Nepal', 'nepal', 5),
  ('Asia', 'Japan', 'japan', 6),
  ('Asia / Europe', 'Turkey', 'turkey', 0),
  ('Europe', 'Switzerland', 'switzerland', 0),
  ('Europe', 'France', 'france', 1);
