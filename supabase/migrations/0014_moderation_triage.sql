alter table businesses
  add column if not exists moderation_decision text,
  add column if not exists moderation_risk text,
  add column if not exists moderation_reason text,
  add column if not exists moderation_signals jsonb not null default '[]'::jsonb;

alter table business_listing_revisions
  add column if not exists moderation_decision text,
  add column if not exists moderation_risk text,
  add column if not exists moderation_reason text,
  add column if not exists moderation_signals jsonb not null default '[]'::jsonb;

alter table business_recommendations
  add column if not exists moderation_decision text,
  add column if not exists moderation_risk text,
  add column if not exists moderation_reason text,
  add column if not exists moderation_signals jsonb not null default '[]'::jsonb;

alter table business_change_requests
  add column if not exists moderation_decision text,
  add column if not exists moderation_risk text,
  add column if not exists moderation_reason text,
  add column if not exists moderation_signals jsonb not null default '[]'::jsonb;

alter table creative_job_listings
  add column if not exists moderation_decision text,
  add column if not exists moderation_risk text,
  add column if not exists moderation_reason text,
  add column if not exists moderation_signals jsonb not null default '[]'::jsonb;

alter table creative_job_listings
  drop constraint if exists creative_job_listings_status_check;

alter table creative_job_listings
  add constraint creative_job_listings_status_check
  check (status in ('pending_review', 'open', 'in_discussion', 'taken', 'closed', 'archived'));

drop policy if exists "Anyone can read open creative jobs" on creative_job_listings;
create policy "Anyone can read open creative jobs" on creative_job_listings
  for select using (status in ('open', 'in_discussion'));

drop policy if exists "Anyone can read creative job references" on creative_job_reference_files;
create policy "Anyone can read creative job references" on creative_job_reference_files
  for select using (
    exists (
      select 1 from creative_job_listings job
      where job.id = job_id
      and job.status in ('open', 'in_discussion')
    )
  );

create index if not exists businesses_moderation_idx
  on businesses (moderation_risk, publication_status, created_at desc);

create index if not exists creative_job_listings_moderation_idx
  on creative_job_listings (moderation_risk, status, created_at desc);

create index if not exists business_recommendations_moderation_idx
  on business_recommendations (moderation_risk, status, created_at desc);

create index if not exists business_change_requests_moderation_idx
  on business_change_requests (moderation_risk, status, created_at desc);
