--------------------------------------------------------------------------------
-- Nemesis Level Table
-- Each entry represents the level data for a nemesis, which will be used to
-- determine the attributes and traits of the nemesis during a showdown. A
-- single nemesis can have multiple level data entries for the same level,
-- indicating a multi-monster showdown.
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
  -- Base Data
  accuracy int not null default 0,
  accuracy_tokens int not null default 0,
  damage int not null default 0,
  damage_tokens int not null default 0,
  evasion int not null default 0,
  evasion_tokens int not null default 0,
  level_number int not null check (
    level_number between 1 and 4
  ),
  life int,
  luck int not null default 0,
  luck_tokens int not null default 0,
  moods varchar [] not null default '{}',
  movement int not null default 1,
  movement_tokens int not null default 0,
  nemesis_id uuid not null references nemesis(id) on delete cascade,
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
create policy "Allow insert for authenticated and custom" on nemesis_level for
insert to authenticated with check (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for authenticated and non-custom" on nemesis_level for
select to authenticated using (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and not n.custom
    )
  );
create policy "Allow select for owner and custom" on nemesis_level for
select to authenticated using (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on nemesis_level for
update to authenticated using (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from nemesis n
      where n.id = nemesis_id
        and n.custom
        and n.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on nemesis_level for delete to authenticated using (
  exists (
    select 1
    from nemesis n
    where n.id = nemesis_id
      and n.custom
      and n.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on nemesis_level for
select to authenticated using (
    exists (
      select 1
      from nemesis_shared_user su
      where nemesis_id = su.nemesis_id
        and shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on nemesis_level for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_nemesis_level_nemesis on nemesis_level(nemesis_id);
create index idx_nemesis_level_nemesis_level on nemesis_level(nemesis_id, level_number);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on nemesis_level for each row execute function update_updated_at();