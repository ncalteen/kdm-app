--------------------------------------------------------------------------------
-- Hunt Monster Table
-- Data related to a monster during a hunt.
--------------------------------------------------------------------------------
create table hunt_monster (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  accuracy integer not null default 0,
  accuracy_tokens integer not null default 0,
  ai_deck_id uuid not null references hunt_ai_deck(id) on delete cascade,
  ai_deck_remaining integer not null default 0,
  damage integer not null default 0,
  damage_tokens integer not null default 0,
  evasion integer not null default 0,
  evasion_tokens integer not null default 0,
  hunt_id uuid not null references hunt(id) on delete cascade,
  knocked_down boolean not null default false,
  luck integer not null default 0,
  luck_tokens integer not null default 0,
  monster_name varchar,
  moods varchar [] not null default '{}',
  movement integer not null default 0,
  movement_tokens integer not null default 0,
  notes text not null default '',
  settlement_id uuid not null references settlement (id) on delete cascade,
  speed integer not null default 0,
  speed_tokens integer not null default 0,
  strength integer not null default 0,
  strength_tokens integer not null default 0,
  toughness integer not null default 0,
  traits varchar [] not null default '{}',
  wounds integer not null default 0
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table hunt_monster enable row level security;
create policy "Allow select for owner" on hunt_monster for
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
create policy "Allow insert for owner" on hunt_monster for
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
create policy "Allow update for owner" on hunt_monster for
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
create policy "Allow delete for owner" on hunt_monster for delete to authenticated using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on hunt_monster for
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
create policy "Allow all for admin" on hunt_monster for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_monster_hunt on hunt_monster(hunt_id);
create index idx_hunt_monster_settlement on hunt_monster(settlement_id);
create index idx_hunt_monster_ai_deck on hunt_monster(ai_deck_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on hunt_monster for each row execute function update_updated_at();