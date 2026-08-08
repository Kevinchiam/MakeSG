alter table business_recommendations
add column if not exists quality_rating integer check (quality_rating between 1 and 5),
add column if not exists reliability_rating integer check (reliability_rating between 1 and 5),
add column if not exists collaboration_rating integer check (collaboration_rating between 1 and 5),
add column if not exists supporting_links text[] not null default '{}';

alter table business_recommendation_media
add column if not exists caption text not null default '';

create index if not exists business_recommendations_status_created_idx
on business_recommendations (status, created_at desc);
