alter table businesses
add column if not exists endorsement_count integer not null default 0;

create index if not exists businesses_endorsement_count_idx
on businesses (endorsement_count desc);
