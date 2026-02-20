-- Hunt Event Type
create type hunt_event_type as enum ('ARC', 'BASIC', 'MONSTER', 'SCOUT');
-- Hunt Board
create table quarry_hunt_board (
  id uuid primary key default gen_random_uuid (),
  -- Start
  pos_0 null,
  pos_1 hunt_event_type not null default 'BASIC',
  pos_2 hunt_event_type not null default 'BASIC',
  pos_3 hunt_event_type not null default 'BASIC',
  pos_4 hunt_event_type not null default 'BASIC',
  pos_5 hunt_event_type not null default 'BASIC',
  -- Overwhelming Darkness
  pos_6 null,
  pos_7 hunt_event_type not null default 'BASIC',
  pos_8 hunt_event_type not null default 'BASIC',
  pos_9 hunt_event_type not null default 'BASIC',
  pos_10 hunt_event_type not null default 'BASIC',
  pos_11 hunt_event_type not null default 'BASIC',
  -- Starvation (End)
  pos_12 null
);
alter table quarry_hunt_board enable row level security;
create policy "Allow read access to all users" on quarry_hunt_board for
select using (true);