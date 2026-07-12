create extension if not exists "uuid-ossp";

create type account_type as enum ('creative', 'provider', 'admin');
create type business_type as enum ('independent', 'studio', 'workshop', 'consultancy', 'manufacturer', 'supplier');
create type publication_status as enum ('draft', 'pending', 'published', 'rejected', 'suspended');
create type verification_status as enum ('unverified', 'claimed', 'verified');
create type project_status as enum ('draft', 'seeking_providers', 'in_progress', 'completed', 'archived');
create type enquiry_status as enum ('sent', 'viewed', 'replied', 'closed');

create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  account_type account_type not null default 'creative',
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  service_group text not null default 'General',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table materials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text not null,
  description text not null,
  website_url text,
  public_email text,
  public_phone text,
  address text,
  postal_code text,
  latitude numeric,
  longitude numeric,
  show_full_address boolean not null default false,
  minimum_budget integer not null default 0,
  typical_lead_time integer not null default 14,
  business_type business_type not null default 'studio',
  accepts_prototypes boolean not null default true,
  accepts_production boolean not null default false,
  offers_onsite_service boolean not null default false,
  offers_remote_service boolean not null default true,
  verification_status verification_status not null default 'unverified',
  publication_status publication_status not null default 'draft',
  featured boolean not null default false,
  claimed boolean not null default false,
  hero_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table business_services (
  business_id uuid not null references businesses(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  primary key (business_id, service_id)
);

create table business_materials (
  business_id uuid not null references businesses(id) on delete cascade,
  material_id uuid not null references materials(id) on delete cascade,
  primary key (business_id, material_id)
);

create table portfolio_items (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  intended_outcome text,
  project_type text not null check (project_type in ('physical', 'digital', 'both')),
  quantity text,
  dimensions text,
  budget_min integer,
  budget_max integer,
  deadline date,
  deadline_flexibility text,
  preferred_location text,
  status project_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table project_files (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null default 'project-references',
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null default now()
);

create table project_service_matches (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  score integer not null default 0,
  explanation text,
  created_at timestamptz not null default now()
);

create table enquiries (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete set null,
  business_id uuid not null references businesses(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  status enquiry_status not null default 'sent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table saved_businesses (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, business_id)
);

create table reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references auth.users(id) on delete set null,
  business_id uuid references businesses(id) on delete cascade,
  portfolio_item_id uuid references portfolio_items(id) on delete cascade,
  reason text not null,
  status text not null default 'open',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table businesses enable row level security;
alter table services enable row level security;
alter table business_services enable row level security;
alter table materials enable row level security;
alter table business_materials enable row level security;
alter table portfolio_items enable row level security;
alter table projects enable row level security;
alter table project_files enable row level security;
alter table project_service_matches enable row level security;
alter table enquiries enable row level security;
alter table saved_businesses enable row level security;
alter table reports enable row level security;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where profiles.user_id = auth.uid()
    and profiles.account_type = 'admin'
  );
$$;

create policy "Anyone can read published businesses" on businesses for select using (publication_status = 'published' or owner_id = auth.uid() or is_admin());
create policy "Providers can create businesses" on businesses for insert with check (owner_id = auth.uid());
create policy "Providers can edit owned non-publication fields" on businesses for update using (owner_id = auth.uid() or is_admin()) with check (
  is_admin() or (owner_id = auth.uid() and publication_status <> 'published')
);
create policy "Admins moderate businesses" on businesses for all using (is_admin()) with check (is_admin());

create policy "Anyone can read public services" on services for select using (true);
create policy "Admins edit services" on services for all using (is_admin()) with check (is_admin());
create policy "Anyone can read public materials" on materials for select using (true);
create policy "Admins edit materials" on materials for all using (is_admin()) with check (is_admin());

create policy "Read business joins for published businesses" on business_services for select using (true);
create policy "Owners manage business services" on business_services for all using (
  exists (select 1 from businesses b where b.id = business_id and (b.owner_id = auth.uid() or is_admin()))
) with check (
  exists (select 1 from businesses b where b.id = business_id and (b.owner_id = auth.uid() or is_admin()))
);
create policy "Read business materials for published businesses" on business_materials for select using (true);
create policy "Owners manage business materials" on business_materials for all using (
  exists (select 1 from businesses b where b.id = business_id and (b.owner_id = auth.uid() or is_admin()))
) with check (
  exists (select 1 from businesses b where b.id = business_id and (b.owner_id = auth.uid() or is_admin()))
);
create policy "Read portfolio for published businesses" on portfolio_items for select using (
  exists (select 1 from businesses b where b.id = business_id and (b.publication_status = 'published' or b.owner_id = auth.uid() or is_admin()))
);
create policy "Owners manage portfolio" on portfolio_items for all using (
  exists (select 1 from businesses b where b.id = business_id and (b.owner_id = auth.uid() or is_admin()))
) with check (
  exists (select 1 from businesses b where b.id = business_id and (b.owner_id = auth.uid() or is_admin()))
);

create policy "Users manage own profiles" on profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Admins read profiles" on profiles for select using (is_admin());
create policy "Users manage own projects" on projects for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Users manage own project files" on project_files for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Users read own project matches" on project_service_matches for select using (
  exists (select 1 from projects p where p.id = project_id and p.owner_id = auth.uid())
);
create policy "Users manage own saved businesses" on saved_businesses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Enquiry participants can read" on enquiries for select using (
  sender_id = auth.uid() or exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid()) or is_admin()
);
create policy "Users can send enquiries" on enquiries for insert with check (sender_id = auth.uid());
create policy "Participants can update enquiries" on enquiries for update using (
  sender_id = auth.uid() or exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid()) or is_admin()
);
create policy "Admins manage reports" on reports for all using (is_admin()) with check (is_admin());
create policy "Users create reports" on reports for insert with check (reporter_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('business-portfolios', 'business-portfolios', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('project-references', 'project-references', false, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;
