alter table creative_job_listings
  add column if not exists other_service text;

create table if not exists creative_job_reference_files (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references creative_job_listings(id) on delete cascade,
  bucket text not null default 'creative-job-references',
  storage_path text not null,
  file_name text not null,
  file_url text not null,
  mime_type text not null,
  size_bytes integer not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table creative_job_reference_files enable row level security;

drop policy if exists "Anyone can read creative job references" on creative_job_reference_files;
create policy "Anyone can read creative job references" on creative_job_reference_files
  for select using (
    exists (
      select 1 from creative_job_listings job
      where job.id = job_id
      and job.status = 'open'
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
