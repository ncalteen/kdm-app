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
  campaign_types campaign_type [] not null default '{}',
  quarry_id uuid not null references quarry(id) on delete cascade,
  entries varchar [] not null default '{}',
  year_number int not null check (
    year_number >= 0
    and year_number <= 50
  ),
  -- Constraints
  unique (quarry_id, year_number)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table quarry_timeline_year enable row level security;
create policy "Allow insert for authenticated and custom" on quarry_timeline_year for
insert to authenticated with check (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and q.custom
        and q.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for authenticated and non-custom" on quarry_timeline_year for
select to authenticated using (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and not q.custom
    )
  );
create policy "Allow select for owner and custom" on quarry_timeline_year for
select to authenticated using (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and q.custom
        and q.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on quarry_timeline_year for
update to authenticated using (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and q.custom
        and q.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and q.custom
        and q.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on quarry_timeline_year for delete to authenticated using (
  exists (
    select 1
    from quarry q
    where q.id = quarry_id
      and q.custom
      and q.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on quarry_timeline_year for
select to authenticated using (
    exists (
      select 1
      from quarry_shared_user su
      where quarry_id = su.quarry_id
        and shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on quarry_timeline_year for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_timeline_entries_quarry on quarry_timeline_year(quarry_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on quarry_timeline_year for each row execute function update_updated_at();