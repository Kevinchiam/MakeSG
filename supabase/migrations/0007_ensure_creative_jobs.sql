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
  other_service text,
  budget_min integer,
  budget_max integer,
  deadline date,
  reference_links text,
  notes text,
  status text not null default 'open' check (status in ('open', 'in_discussion', 'taken', 'archived')),
  manage_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table creative_job_listings
  add column if not exists other_service text;

alter table creative_job_listings
  add column if not exists manage_token text;

alter table creative_job_listings
  drop constraint if exists creative_job_listings_status_check;

alter table creative_job_listings
  add constraint creative_job_listings_status_check check (status in ('open', 'in_discussion', 'taken', 'archived'));

create unique index if not exists creative_job_listings_manage_token_key
  on creative_job_listings (manage_token)
  where manage_token is not null;

alter table creative_job_listings enable row level security;

drop policy if exists "Anyone can read open creative jobs" on creative_job_listings;
create policy "Anyone can read open creative jobs" on creative_job_listings
  for select using (status in ('open', 'in_discussion'));

drop policy if exists "Admins manage creative jobs" on creative_job_listings;
create policy "Admins manage creative jobs" on creative_job_listings
  for all using (is_admin()) with check (is_admin());

create table if not exists creative_job_reference_files (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references creative_job_listings(id) on delete cascade,
  bucket text not null default 'creative-job-references',
  storage_path text not null,
  file_name text not null,
  caption text,
  file_url text not null,
  mime_type text not null,
  size_bytes integer not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table creative_job_reference_files
  add column if not exists caption text;

alter table creative_job_reference_files enable row level security;

drop policy if exists "Anyone can read creative job references" on creative_job_reference_files;
create policy "Anyone can read creative job references" on creative_job_reference_files
  for select using (
    exists (
      select 1 from creative_job_listings job
      where job.id = job_id
      and job.status in ('open', 'in_discussion')
    )
  );

drop policy if exists "Admins manage creative job references" on creative_job_reference_files;
create policy "Admins manage creative job references" on creative_job_reference_files
  for all using (is_admin()) with check (is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'creative-job-references',
  'creative-job-references',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
