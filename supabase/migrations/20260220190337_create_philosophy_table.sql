-- Philosophy
create table philosophy (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  philosophy_name varchar not null
);
alter table philosophy enable row level security;
create policy "Allow authenticated read" on philosophy for
select using (auth.role () = 'authenticated');