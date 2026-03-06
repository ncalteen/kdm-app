--------------------------------------------------------------------------------
-- Showdown Survivor Table
-- Data related to a survivor during a showdown.
--------------------------------------------------------------------------------
create table showdown_survivor (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  activation_used boolean not null default false,
  accuracy_tokens integer not null default 0,
  bleeding_tokens integer not null default 0,
  block_tokens integer not null default 0,
  deflect_tokens integer not null default 0,
  evasion_tokens integer not null default 0,
  insanity_tokens integer not null default 0,
  knocked_down boolean not null default false,
  luck_tokens integer not null default 0,
  movement_tokens integer not null default 0,
  movement_used boolean not null default false,
  notes text not null default '',
  priority_target boolean not null default false,
  scout boolean not null default false,
  settlement_id uuid not null references settlement(id) on delete cascade,
  showdown_id uuid not null references showdown(id) on delete cascade,
  speed_tokens integer not null default 0,
  strength_tokens integer not null default 0,
  survival_tokens integer not null default 0,
  survivor_id uuid not null references survivor(id) on delete cascade,
  -- Constraints
  unique (showdown_id, survivor_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table showdown_survivor enable row level security;
create policy "Allow select for owner" on showdown_survivor for
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
create policy "Allow insert for owner" on showdown_survivor for
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
create policy "Allow update for owner" on showdown_survivor for
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
create policy "Allow delete for owner" on showdown_survivor for delete to authenticated using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on showdown_survivor for
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
create policy "Allow all for admin" on showdown_survivor for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_showdown_survivor_settlement on showdown_survivor(settlement_id);
create index idx_showdown_survivor_showdown on showdown_survivor(showdown_id);
create index idx_showdown_survivor_survivor on showdown_survivor(survivor_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on showdown_survivor for each row execute function update_updated_at();