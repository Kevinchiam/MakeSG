do $$
begin
  create type business_submission_source as enum ('community', 'owner', 'admin');
exception
  when duplicate_object then null;
end $$;

alter table businesses
  add column if not exists submission_source business_submission_source not null default 'community';

update businesses
set submission_source = 'community'
where submission_source is null;

create table if not exists business_claim_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  requester_name text not null,
  requester_role text,
  requester_email text not null,
  requester_phone text,
  proof_url text,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_claim_requests_status_created_idx
  on business_claim_requests(status, created_at desc);

create index if not exists business_claim_requests_business_idx
  on business_claim_requests(business_id);

alter table business_claim_requests enable row level security;

drop policy if exists "Anyone can submit business claim requests" on business_claim_requests;
create policy "Anyone can submit business claim requests"
  on business_claim_requests
  for insert
  with check (true);

drop policy if exists "Admins manage business claim requests" on business_claim_requests;
create policy "Admins manage business claim requests"
  on business_claim_requests
  for all
  using (is_admin())
  with check (is_admin());
