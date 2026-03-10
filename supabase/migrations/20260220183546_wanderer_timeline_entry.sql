--------------------------------------------------------------------------------
-- Wanderer Timeline Year Table
-- Each entry represents a single timeline year and any events that will be
-- added to the settlement timeline when the wanderer is added.
--------------------------------------------------------------------------------
create table wanderer_timeline_year (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  wanderer_id uuid not null references wanderer(id) on delete cascade,
  entries varchar [] not null default '{}',
  year_number int not null check (
    year_number >= 0
    and year_number <= 50
  ),
  -- Constraints
  unique (wanderer_id, year_number)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table wanderer_timeline_year enable row level security;
create policy "Allow insert for authenticated and custom" on wanderer_timeline_year for
insert to authenticated with check (
    exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and w.custom
        and w.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for authenticated and non-custom" on wanderer_timeline_year for
select to authenticated using (
    exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and not w.custom
    )
  );
create policy "Allow select for owner and custom" on wanderer_timeline_year for
select to authenticated using (
    exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and w.custom
        and w.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on wanderer_timeline_year for
update to authenticated using (
    exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and w.custom
        and w.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and w.custom
        and w.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on wanderer_timeline_year for delete to authenticated using (
  exists (
    select 1
    from wanderer w
    where w.id = wanderer_id
      and w.custom
      and w.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on wanderer_timeline_year for
select to authenticated using (
    exists (
      select 1
      from wanderer_shared_user su
      where wanderer_id = su.wanderer_id
        and shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on wanderer_timeline_year for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_timeline_entries_wanderer on wanderer_timeline_year(wanderer_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on wanderer_timeline_year for each row execute function update_updated_at();