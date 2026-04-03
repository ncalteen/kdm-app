--------------------------------------------------------------------------------
-- Quarry Hunt Board Position Table
-- Stores the base survivor and monster hunt board positions for each quarry
-- and level combination. This avoids ambiguity when a single hunt can include
-- multiple quarry_level rows for the same level (multi-monster encounters).
--------------------------------------------------------------------------------
create table quarry_hunt_board_position (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  level_number int not null check (
    level_number between 1 and 4
  ),
  monster_hunt_pos int not null default 12,
  survivor_hunt_pos int not null default 0,
  quarry_id uuid not null references quarry(id) on delete cascade,
  unique (quarry_id, level_number)
);
--------------------------------------------------------------------------------
-- Data Migration
-- For each (quarry_id, level_number), use the first quarry_level record by
-- created_at/id and copy hunt positions into the new table.
--------------------------------------------------------------------------------
insert into quarry_hunt_board_position (
    quarry_id,
    level_number,
    monster_hunt_pos,
    survivor_hunt_pos
  )
select ranked.quarry_id,
  ranked.level_number,
  ranked.hunt_pos,
  ranked.survivor_hunt_pos
from (
    select ql.quarry_id,
      ql.level_number,
      ql.hunt_pos,
      ql.survivor_hunt_pos,
      row_number() over (
        partition by ql.quarry_id,
        ql.level_number
        order by ql.created_at,
          ql.id
      ) as row_num
    from quarry_level ql
  ) ranked
where ranked.row_num = 1;
--------------------------------------------------------------------------------
-- Schema Migration
-- Remove legacy hunt position columns now that data is stored by quarry+level.
--------------------------------------------------------------------------------
alter table quarry_level drop column hunt_pos,
  drop column survivor_hunt_pos;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table quarry_hunt_board_position enable row level security;
create policy "Allow insert for authenticated and custom" on quarry_hunt_board_position for
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
create policy "Allow select for authenticated and non-custom" on quarry_hunt_board_position for
select to authenticated using (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and not q.custom
    )
  );
create policy "Allow select for owner and custom" on quarry_hunt_board_position for
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
create policy "Allow update for owner and custom" on quarry_hunt_board_position for
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
create policy "Allow delete for owner and custom" on quarry_hunt_board_position for delete to authenticated using (
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
create policy "Allow select for shared and custom" on quarry_hunt_board_position for
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
create policy "Allow all for admin" on quarry_hunt_board_position for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_quarry_hunt_board_position_quarry on quarry_hunt_board_position(quarry_id);
create index idx_quarry_hunt_board_position_quarry_level on quarry_hunt_board_position(quarry_id, level_number);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on quarry_hunt_board_position for each row execute function update_updated_at();