-- Quarry Timeline Data
create table quarry_timeline_data (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Timeline Data
  year_number int not null,
  title varchar not null,
  campaigns campaign_type [] not null default '{}'
);
alter table quarry_timeline_data enable row level security;
create policy "Allow read access to all users" on quarry_timeline_data for
select using (true);