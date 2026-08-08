alter table businesses
  add column if not exists manage_token text;

create unique index if not exists businesses_manage_token_key
  on businesses (manage_token)
  where manage_token is not null;

alter table portfolio_items
  add column if not exists file_name text,
  add column if not exists storage_path text,
  add column if not exists mime_type text,
  add column if not exists size_bytes integer;
