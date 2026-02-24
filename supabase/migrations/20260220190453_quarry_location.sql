--------------------------------------------------------------------------------
-- Junction Table: Quarry Location
--------------------------------------------------------------------------------
create table quarry_location (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Quarry Location Data
  location_id uuid not null references location(id) on delete cascade,
  quarry_id uuid not null references quarry(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table quarry_location enable row level security;
create policy "Allow authenticated read for non-custom" on quarry_location for
select using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and not q.custom
    )
  );
create policy "Allow all for owner/shared of quarry" on quarry_location for all using (
  exists (
    select 1
    from quarry q
    where q.id = quarry_id
      and q.custom
      and (
        q.user_id = auth.uid()
        or exists (
          select 1
          from quarry_shared_user su
          where su.quarry_id = q.id
            and su.shared_user_id = auth.uid()
        )
      )
  )
) with check (
  exists (
    select 1
    from quarry q
    where q.id = quarry_id
      and q.custom
      and (
        q.user_id = auth.uid()
        or exists (
          select 1
          from quarry_shared_user su
          where su.quarry_id = q.id
            and su.shared_user_id = auth.uid()
        )
      )
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_quarry_location_location on quarry_location(location_id);
create index idx_quarry_location_quarry on quarry_location(quarry_id);