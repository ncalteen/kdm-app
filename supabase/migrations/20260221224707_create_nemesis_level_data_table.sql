-- Nemesis Level Data
create table nemesis_level_data (
  id uuid primary key default gen_random_uuid(),
  accuracy int not null default 0,
  accuracy_tokens int not null default 0,
  ai_deck uuid not null references ai_deck_data(id) on delete
  set null,
    ai_deck_remaining int not null default 0,
    damage int not null default 0,
    damage_tokens int not null default 0,
    evasion int not null default 0,
    evasion_tokens int not null default 0,
    hunt_pos int not null default 12,
    life int not null default 0,
    luck int not null default 0,
    luck_tokens int not null default 0,
    moods varchar [] not null default '{}',
    movement int not null default 1,
    movement_tokens int not null default 0,
    sub_monster_name varchar,
    speed int not null default 0,
    speed_tokens int not null default 0,
    strength int not null default 0,
    strength_tokens int not null default 0,
    survivor_statuses varchar [] not null default '{}',
    toughness int not null default 0,
    toughness_tokens int not null default 0,
    traits varchar [] not null default '{}'
);
alter table nemesis_level_data enable row level security;
create policy "Allow read access to all users" on nemesis_level_data for
select using (true);