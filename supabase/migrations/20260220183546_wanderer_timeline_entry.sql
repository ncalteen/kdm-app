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
  year_number int not null,
  -- Constraints
  unique (wanderer_id, year_number)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table wanderer_timeline_year enable row level security;
create policy "Allow authenticated read for non-custom" on wanderer_timeline_year for
select using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and not w.custom
    )
  );
create policy "Allow all for owner/shared of custom" on wanderer_timeline_year for all using (
  exists (
    select 1
    from wanderer w
    where w.id = wanderer_id
      and w.custom
      and (
        w.user_id = auth.uid()
        or exists (
          select 1
          from wanderer_shared_user su
          where su.wanderer_id = w.id
            and su.shared_user_id = auth.uid()
        )
      )
  )
) with check (
  exists (
    select 1
    from wanderer w
    where w.id = wanderer_id
      and w.custom
      and (
        w.user_id = auth.uid()
        or exists (
          select 1
          from wanderer_shared_user su
          where su.wanderer_id = w.id
            and su.shared_user_id = auth.uid()
        )
      )
  )
);
create policy "Allow admin to manage all" on wanderer_timeline_year for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_timeline_entries_wanderer on wanderer_timeline_year(wanderer_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on wanderer_timeline_year for each row execute function update_updated_at();