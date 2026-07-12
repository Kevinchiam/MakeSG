update storage.buckets
set
  file_size_limit = 41943040,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
where id in ('business-portfolios', 'project-references');

create table business_recommendation_media (
  id uuid primary key default uuid_generate_v4(),
  recommendation_id uuid not null references business_recommendations(id) on delete cascade,
  bucket text not null default 'business-portfolios',
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes integer not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table business_recommendation_media enable row level security;

create policy "Read media for approved recommendations"
on business_recommendation_media for select
using (
  exists (
    select 1 from business_recommendations br
    where br.id = recommendation_id
    and (
      br.status = 'approved'
      or br.recommender_id = auth.uid()
      or is_admin()
      or exists (
        select 1 from businesses b
        where b.id = br.business_id and b.owner_id = auth.uid()
      )
    )
  )
);

create policy "Recommenders manage pending recommendation media"
on business_recommendation_media for all
using (
  exists (
    select 1 from business_recommendations br
    where br.id = recommendation_id
    and br.recommender_id = auth.uid()
    and br.status = 'pending'
  )
)
with check (
  exists (
    select 1 from business_recommendations br
    where br.id = recommendation_id
    and br.recommender_id = auth.uid()
    and br.status = 'pending'
  )
);

create policy "Admins manage recommendation media"
on business_recommendation_media for all
using (is_admin())
with check (is_admin());
