--------------------------------------------------------------------------------
-- Quarry Level Table
-- Each entry represents the level data for a quarry, which will be used to
-- determine the attributes and traits of the quarry during a hunt. A single
-- quarry can have multiple level data entries for the same level, indicating a
-- multi-monster hunt/showdown.
--------------------------------------------------------------------------------
create table quarry_level (
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
  hunt_pos int not null default 12,
  level_number int not null check (
    level_number between 1 and 4
  ),
  luck int not null default 0,
  luck_tokens int not null default 0,
  moods varchar [] not null default '{}',
  movement int not null default 1,
  movement_tokens int not null default 0,
  quarry_id uuid not null references quarry(id) on delete cascade,
  sub_monster_name varchar,
  speed int not null default 0,
  speed_tokens int not null default 0,
  strength int not null default 0,
  strength_tokens int not null default 0,
  survivor_hunt_pos int not null default 0,
  survivor_statuses varchar [] not null default '{}',
  toughness int not null default 0,
  toughness_tokens int not null default 0,
  traits varchar [] not null default '{}'
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table quarry_level enable row level security;
create policy "Allow insert for authenticated and custom" on quarry_level for
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
create policy "Allow select for authenticated and non-custom" on quarry_level for
select to authenticated using (
    exists (
      select 1
      from quarry q
      where q.id = quarry_id
        and not q.custom
    )
  );
create policy "Allow select for owner and custom" on quarry_level for
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
create policy "Allow update for owner and custom" on quarry_level for
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
create policy "Allow delete for owner and custom" on quarry_level for delete to authenticated using (
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
create policy "Allow select for shared and custom" on quarry_level for
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
create policy "Allow all for admin" on quarry_level for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_quarry_level_quarry on quarry_level(quarry_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on quarry_level for each row execute function update_updated_at();