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
  -- Data
  campaigns campaign_type [] not null default '{}',
  entries varchar [] not null default '{}',
  nemesis_id uuid not null references nemesis(id) on delete cascade,
  year_number int not null,
  -- Constraints
  unique (nemesis_id, year_number)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table nemesis_timeline_year enable row level security;
create policy "Allow insert for authenticated and custom" on nemesis_timeline_year for
insert to authenticated with check (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for authenticated and non-custom" on nemesis_timeline_year for
select to authenticated using (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and not n.custom
    )
  );
create policy "Allow select for owner and custom" on nemesis_timeline_year for
select to authenticated using (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on nemesis_timeline_year for
update to authenticated using (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on nemesis_timeline_year for delete to authenticated using (
  exists (
    select 1
    from nemesis n
    where n.id = nemesis_id
      and n.custom
      and n.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on nemesis_timeline_year for
select to authenticated using (
    exists (
      select 1
      from nemesis_shared_user su
      where nemesis_id = su.nemesis_id
        and shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on nemesis_timeline_year for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_nemesis_timeline_year_nemesis on nemesis_timeline_year(nemesis_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on nemesis_timeline_year for each row execute function update_updated_at();