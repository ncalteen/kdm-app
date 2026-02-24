--------------------------------------------------------------------------------
-- Nemesis Timeline Year Table
-- Each entry represents a single timeline year and any events that will be
-- added to the settlement timeline when the nemesis is added.
--------------------------------------------------------------------------------
create table nemesis_timeline_year (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Nemesis Timeline Year Data
  campaigns campaign_type [] not null default '{}',
  entries varchar [] not null default '{}',
  nemesis_id uuid not null references nemesis(id) on delete cascade,
  year_number int not null
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table nemesis_timeline_year enable row level security;
create policy "Allow authenticated read for non-custom" on nemesis_timeline_year for
select using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and not n.custom
    )
  );
create policy "Allow all for owner/shared of custom" on nemesis_timeline_year for all using (
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
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_timeline_entries_nemesis on nemesis_timeline_year(nemesis_id);