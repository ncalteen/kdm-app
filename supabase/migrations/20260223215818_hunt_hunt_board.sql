--------------------------------------------------------------------------------
-- Hunt Board Table
-- Positions 0, 6, and 12 are purposefully omitted as they are always null and
-- represent Start, Overwhelming Darkness, and Starvation respectively.
--
-- This table tracks the hunt board state for a specific active hunt. Its initial
-- values are copied from the quarry's base hunt board configuration
-- (quarry_hunt_board) when a new hunt is started. Changes made during the hunt
-- are recorded here without affecting the quarry's base data.
--------------------------------------------------------------------------------
create table hunt_hunt_board (
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
  hunt_id uuid not null references hunt(id) on delete cascade,
  settlement_id uuid references settlement(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table hunt_hunt_board enable row level security;
create policy "Allow select for owner" on hunt_hunt_board for
select to authenticated using (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner" on hunt_hunt_board for
insert to authenticated with check (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner" on hunt_hunt_board for
update to authenticated using (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from settlement s
      where s.id = settlement_id
        and s.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner" on hunt_hunt_board for delete to authenticated using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on hunt_hunt_board for
select to authenticated using (
    exists (
      select 1
      from settlement_shared_user su
      where settlement_id = su.settlement_id
        and shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on hunt_hunt_board for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_hunt_board_hunt_id on hunt_hunt_board(hunt_id);
create index idx_hunt_hunt_board_settlement_id on hunt_hunt_board(settlement_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on hunt_hunt_board for each row execute function update_updated_at();