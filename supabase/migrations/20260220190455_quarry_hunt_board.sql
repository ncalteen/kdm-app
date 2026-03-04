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
  -- Data
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
create policy "Allow insert for authenticated and custom" on quarry_hunt_board for
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
create policy "Allow select for authenticated and non-custom" on quarry_hunt_board for
select to authenticated using (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and not q.custom
    )
  );
create policy "Allow select for owner and custom" on quarry_hunt_board for
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
create policy "Allow update for owner and custom" on quarry_hunt_board for
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
create policy "Allow delete for owner and custom" on quarry_hunt_board for delete to authenticated using (
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
create policy "Allow select for shared and custom" on quarry_hunt_board for
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
create policy "Allow all for admin" on quarry_hunt_board for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_quarry_hunt_board_quarry on quarry_hunt_board(quarry_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on quarry_hunt_board for each row execute function update_updated_at();