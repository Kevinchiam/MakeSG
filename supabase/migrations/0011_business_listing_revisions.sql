create table if not exists business_listing_revisions (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  proposed_data jsonb not null,
  proposed_services text[] not null default '{}',
  proposed_portfolio jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists business_listing_revisions_one_pending_per_business
  on business_listing_revisions (business_id)
  where status = 'pending';

alter table business_listing_revisions enable row level security;

create policy "Admins manage business listing revisions"
on business_listing_revisions for all
using (is_admin())
with check (is_admin());
