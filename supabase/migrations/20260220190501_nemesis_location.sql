--------------------------------------------------------------------------------
-- Junction Table: Nemesis Location
--------------------------------------------------------------------------------
create table nemesis_location (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Nemesis Location Data
  location_id uuid not null references location(id) on delete cascade,
  nemesis_id uuid not null references nemesis(id) on delete cascade,
  -- Constraints
  unique (nemesis_id, location_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table nemesis_location enable row level security;
create policy "Allow authenticated read for non-custom" on nemesis_location for
select using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and not n.custom
    )
  );
create policy "Allow all for owner/shared of nemesis" on nemesis_location for all using (
  exists (
    select 1
    from nemesis n
    where n.id = nemesis_id
      and n.custom
      and (
        n.user_id = auth.uid()
        or exists (
          select 1
          from nemesis_shared_user su
          where su.nemesis_id = n.id
            and su.shared_user_id = auth.uid()
        )
      )
  )
) with check (
  exists (
    select 1
    from nemesis n
    where n.id = nemesis_id
      and n.custom
      and (
        n.user_id = auth.uid()
        or exists (
          select 1
          from nemesis_shared_user su
          where su.nemesis_id = n.id
            and su.shared_user_id = auth.uid()
        )
      )
  )
);
create policy "Allow admin to manage all" on nemesis_location for all using (
  is_admin()
  and exists (
    select 1
    from nemesis n
    where n.id = nemesis_id
  )
) with check (
  is_admin()
  and exists (
    select 1
    from nemesis n
    where n.id = nemesis_id
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_nemesis_location_location on nemesis_location(location_id);
create index idx_nemesis_location_nemesis on nemesis_location(nemesis_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on nemesis_location for each row execute function update_updated_at();