create index if not exists businesses_rejected_updated_idx
on businesses (publication_status, updated_at)
where publication_status = 'rejected';

create index if not exists business_listing_revisions_rejected_updated_idx
on business_listing_revisions (status, updated_at)
where status = 'rejected';

create index if not exists business_recommendations_rejected_updated_idx
on business_recommendations (status, updated_at)
where status = 'rejected';

create index if not exists creative_job_listings_archived_updated_idx
on creative_job_listings (status, updated_at)
where status = 'archived';

create index if not exists business_change_requests_dismissed_updated_idx
on business_change_requests (status, updated_at)
where status = 'dismissed';
