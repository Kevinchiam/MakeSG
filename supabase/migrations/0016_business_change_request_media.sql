create table if not exists business_change_request_media (
  id uuid primary key default uuid_generate_v4(),
  change_request_id uuid not null references business_change_requests(id) on delete cascade,
  bucket text not null default 'business-portfolios',
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table business_change_request_media enable row level security;

drop policy if exists "Admins manage business change request media" on business_change_request_media;
create policy "Admins manage business change request media"
on business_change_request_media for all
using (is_admin())
with check (is_admin());

create index if not exists business_change_request_media_request_idx
on business_change_request_media (change_request_id, sort_order);
