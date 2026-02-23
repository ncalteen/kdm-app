--------------------------------------------------------------------------------
-- Wanderer Timeline Entry Table
--------------------------------------------------------------------------------
create table wanderer_timeline_entry (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Timeline Entry Data
  wanderer_id uuid not null references wanderer(id) on delete cascade,
  timeline_year int not null,
  entries varchar [] not null default '{}'
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table wanderer_timeline_entry enable row level security;
create policy "Allow authenticated read for non-custom" on wanderer_timeline_entry for
select using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and not w.custom
    )
  );
create policy "Allow all for owner/shared of custom" on wanderer_timeline_entry for all using (
  exists (
    select 1
    from wanderer w
    where w.id = wanderer_id
      and w.custom
      and (
        w.user_id = auth.uid()
        or exists (
          select 1
          from wanderer_shared_user wsu
          where wsu.wanderer_id = w.id
            and wsu.shared_user_id = auth.uid()
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
          from wanderer_shared_user wsu
          where wsu.wanderer_id = w.id
            and wsu.shared_user_id = auth.uid()
        )
      )
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_timeline_entries_wanderer on wanderer_timeline_entry (wanderer_id);