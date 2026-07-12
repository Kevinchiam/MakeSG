create type business_recommendation_status as enum ('pending', 'approved', 'rejected');
create type business_recommendation_relationship as enum ('client', 'collaborator', 'supplier', 'peer', 'other');

create table business_recommendations (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  recommender_id uuid references auth.users(id) on delete set null,
  recommender_name text not null,
  recommender_role text,
  recommender_email text,
  relationship business_recommendation_relationship not null default 'client',
  project_context text not null,
  recommended_for text[] not null default '{}',
  comment text not null,
  permission_to_contact boolean not null default false,
  permission_to_publish_name boolean not null default false,
  status business_recommendation_status not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table business_recommendations enable row level security;

create policy "Anyone can read approved business recommendations"
on business_recommendations for select
using (
  status = 'approved'
  or recommender_id = auth.uid()
  or exists (
    select 1 from businesses b
    where b.id = business_id and b.owner_id = auth.uid()
  )
  or is_admin()
);

create policy "Signed in users can recommend businesses"
on business_recommendations for insert
with check (recommender_id = auth.uid());

create policy "Recommenders can edit pending recommendations"
on business_recommendations for update
using (recommender_id = auth.uid() and status = 'pending')
with check (recommender_id = auth.uid() and status = 'pending');

create policy "Admins moderate business recommendations"
on business_recommendations for all
using (is_admin())
with check (is_admin());

create index business_recommendations_business_status_idx
on business_recommendations (business_id, status, created_at desc);
