--------------------------------------------------------------------------------
-- Quarry Hunt Board Table
-- Positions 0, 6, and 12 are purposefully omitted as they are always null and
-- represent Start, Overwhelming Darkness, and Starvation respectively.
--
-- This table stores the base hunt board configuration for each quarry. When a
-- new hunt is started, the quarry's hunt board data is copied into a
-- hunt_hunt_board record, which then tracks any changes made to the board
-- during that specific hunt.
--------------------------------------------------------------------------------
create table quarry_hunt_board (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Quarry Hunt Board Data
  pos_1 hunt_event_type not null default 'BASIC',
  pos_2 hunt_event_type not null default 'BASIC',
  pos_3 hunt_event_type not null default 'BASIC',
  pos_4 hunt_event_type not null default 'BASIC',
  pos_5 hunt_event_type not null default 'BASIC',
  pos_7 hunt_event_type not null default 'BASIC',
  pos_8 hunt_event_type not null default 'BASIC',
  pos_9 hunt_event_type not null default 'BASIC',
  pos_10 hunt_event_type not null default 'BASIC',
  pos_11 hunt_event_type not null default 'BASIC',
  quarry_id uuid not null references quarry(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table quarry_hunt_board enable row level security;
create policy "Allow authenticated read for non-custom" on quarry_hunt_board for
select using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and not q.custom
    )
  );
create policy "Allow all for owner/shared of custom" on quarry_hunt_board for all using (
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
create policy "Allow admin to manage all" on quarry_hunt_board for all using (
  is_admin()
  and exists (
    select 1
    from quarry q
    where q.id = quarry_id
  )
) with check (
  is_admin()
  and exists (
    select 1
    from quarry q
    where q.id = quarry_id
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_quarry_hunt_board_quarry on quarry_hunt_board(quarry_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on quarry_hunt_board for each row execute function update_updated_at();