--------------------------------------------------------------------------------
-- Quarry Timeline Year Table
-- Each entry represents a single timeline year and any events that will be
-- added to the settlement timeline when the quarry is added.
--------------------------------------------------------------------------------
create table quarry_timeline_year (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  campaigns campaign_type [] not null default '{}',
  quarry_id uuid not null references quarry(id) on delete cascade,
  entries varchar [] not null default '{}',
  year_number int not null,
  -- Constraints
  unique (quarry_id, year_number)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table quarry_timeline_year enable row level security;
create policy "Allow authenticated read for non-custom" on quarry_timeline_year for
select using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and not q.custom
    )
  );
create policy "Allow all for owner/shared of custom" on quarry_timeline_year for all using (
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
create policy "Allow admin to manage all" on quarry_timeline_year for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_timeline_entries_quarry on quarry_timeline_year(quarry_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on quarry_timeline_year for each row execute function update_updated_at();