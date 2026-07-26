alter table creative_job_listings
  add column if not exists manage_token text;

alter table creative_job_listings
  drop constraint if exists creative_job_listings_status_check;

alter table creative_job_listings
  add constraint creative_job_listings_status_check check (status in ('open', 'in_discussion', 'taken', 'closed', 'archived'));

create unique index if not exists creative_job_listings_manage_token_key
  on creative_job_listings (manage_token)
  where manage_token is not null;

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
