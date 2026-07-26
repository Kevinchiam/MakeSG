alter table creative_job_listings
  drop constraint if exists creative_job_listings_status_check;

update creative_job_listings
set status = 'taken',
  updated_at = now()
where status = 'closed';

alter table creative_job_listings
  add constraint creative_job_listings_status_check check (status in ('open', 'in_discussion', 'taken', 'archived'));
