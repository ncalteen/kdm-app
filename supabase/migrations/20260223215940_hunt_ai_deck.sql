--------------------------------------------------------------------------------
-- Hunt AI Deck Table
-- This table stores the AI deck composition for each hunt, allowing for user
-- adjustment without affecting base monster data.
--------------------------------------------------------------------------------
create table hunt_ai_deck (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  basic_cards int not null default 0 check (basic_cards >= 0),
  advanced_cards int not null default 0 check (advanced_cards >= 0),
  legendary_cards int not null default 0 check (legendary_cards >= 0),
  overtone_cards int not null default 0 check (overtone_cards >= 0),
  hunt_id uuid not null references hunt(id) on delete cascade,
  settlement_id uuid not null references settlement(id) on delete cascade
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table hunt_ai_deck enable row level security;
create policy "Allow select for owner" on hunt_ai_deck for
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
create policy "Allow insert for owner" on hunt_ai_deck for
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
create policy "Allow update for owner" on hunt_ai_deck for
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
create policy "Allow delete for owner" on hunt_ai_deck for delete to authenticated using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on hunt_ai_deck for
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
create policy "Allow all for admin" on hunt_ai_deck for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_ai_deck_hunt on hunt_ai_deck(hunt_id);
create index idx_hunt_ai_deck_settlement on hunt_ai_deck(settlement_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on hunt_ai_deck for each row execute function update_updated_at();