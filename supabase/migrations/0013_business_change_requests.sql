create table if not exists business_change_requests (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  requester_email text not null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table business_change_requests enable row level security;

drop policy if exists "Admins manage business change requests" on business_change_requests;
create policy "Admins manage business change requests"
on business_change_requests for all
using (is_admin())
with check (is_admin());

create index if not exists business_change_requests_status_created_idx
on business_change_requests (status, created_at desc);

create index if not exists business_change_requests_business_idx
on business_change_requests (business_id, created_at desc);
