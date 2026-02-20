-- Hunt Board
-- Positions 0, 6, and 12 are purposefully omitted as they are always null and
-- represent Start, Overwhelming Darkness, and Starvation respectively.
create table quarry_hunt_board (
  id uuid primary key default gen_random_uuid(),
  pos_1 hunt_event_type not null default 'BASIC',
  pos_2 hunt_event_type not null default 'BASIC',
  pos_3 hunt_event_type not null default 'BASIC',
  pos_4 hunt_event_type not null default 'BASIC',
  pos_5 hunt_event_type not null default 'BASIC',
  pos_7 hunt_event_type not null default 'BASIC',
  pos_8 hunt_event_type not null default 'BASIC',
  pos_9 hunt_event_type not null default 'BASIC',
  pos_10 hunt_event_type not null default 'BASIC',
  pos_11 hunt_event_type not null default 'BASIC'
);
alter table quarry_hunt_board enable row level security;
create policy "Allow read access to all users" on quarry_hunt_board for
select using (true);