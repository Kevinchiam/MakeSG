create table if not exists creative_job_listings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text not null,
  intended_outcome text,
  contact_name text not null,
  contact_email text not null,
  company_name text,
  project_type text not null check (project_type in ('physical', 'digital', 'both')),
  services text[] not null default '{}',
  service_slugs text[] not null default '{}',
  budget_min integer,
  budget_max integer,
  deadline date,
  preferred_location text,
  reference_links text,
  notes text,
  status text not null default 'open' check (status in ('open', 'closed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table creative_job_listings enable row level security;

drop policy if exists "Anyone can read open creative jobs" on creative_job_listings;
create policy "Anyone can read open creative jobs" on creative_job_listings
  for select using (status = 'open');

drop policy if exists "Admins manage creative jobs" on creative_job_listings;
create policy "Admins manage creative jobs" on creative_job_listings
  for all using (is_admin()) with check (is_admin());
