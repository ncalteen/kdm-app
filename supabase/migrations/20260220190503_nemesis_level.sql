--------------------------------------------------------------------------------
-- Nemesis Level Table
-- Each entry represents the level data for a nemesis, which will be used to
-- determine the attributes and traits of the nemesis during a showdown.
--------------------------------------------------------------------------------
create table nemesis_level (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- AI Deck Data
  ai_deck_remaining int not null default 0,
  basic_cards int not null default 0,
  advanced_cards int not null default 0,
  legendary_cards int not null default 0,
  overtone_cards int not null default 0,
  -- Nemesis Level Data
  accuracy int not null default 0,
  accuracy_tokens int not null default 0,
  damage int not null default 0,
  damage_tokens int not null default 0,
  evasion int not null default 0,
  evasion_tokens int not null default 0,
  hunt_pos int not null default 12,
  level_number int not null check (
    level_number between 1 and 4
  ),
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
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table nemesis_level enable row level security;
create policy "Allow authenticated read for non-custom" on nemesis_level for
select using (
    auth.role() = 'authenticated'
    and exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and not n.custom
    )
  );
create policy "Allow all for owner/shared of nemesis" on nemesis_level for all using (
  exists (
    select 1
    from nemesis n
    where n.id = nemesis_id
      and n.custom
      and (
        n.user_id = auth.uid()
        or exists (
          select 1
          from nemesis_shared_user su
          where su.nemesis_id = n.id
            and su.shared_user_id = auth.uid()
        )
      )
  )
) with check (
  exists (
    select 1
    from nemesis n
    where n.id = nemesis_id
      and n.custom
      and (
        n.user_id = auth.uid()
        or exists (
          select 1
          from nemesis_shared_user su
          where su.nemesis_id = n.id
            and su.shared_user_id = auth.uid()
        )
      )
  )
);
alter table nemesis_level enable row level security;
create policy "Allow all for owner of location" on nemesis_level for all using (
  auth.uid() = (
    select user_id
    from location
    where id = location_id
  )
);
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_nemesis_level_nemesis on nemesis_level(nemesis_id);