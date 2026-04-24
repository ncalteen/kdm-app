--------------------------------------------------------------------------------
-- Junction Table: Wanderer Ability/Impairment
-- Represents the many-to-many relationship between wanderers and
-- abilities/impairments.
--------------------------------------------------------------------------------
create table wanderer_ability_impairment (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Data
  wanderer_id uuid not null references wanderer(id) on delete cascade,
  ability_impairment_id uuid not null references ability_impairment(id) on delete cascade,
  -- Constraints
  unique (wanderer_id, ability_impairment_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--
-- Modeled on `wanderer_timeline_year`: non-custom wanderers are globally
-- readable, owners of custom wanderers have full access, and shared users
-- can read junction rows for wanderers shared with them.
--------------------------------------------------------------------------------
alter table wanderer_ability_impairment enable row level security;
create policy "Allow insert for authenticated and custom" on wanderer_ability_impairment for
insert to authenticated with check (
    exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and w.custom
        and w.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for authenticated and non-custom" on wanderer_ability_impairment for
select to authenticated using (
    exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and not w.custom
    )
  );
create policy "Allow select for owner and custom" on wanderer_ability_impairment for
select to authenticated using (
    exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and w.custom
        and w.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on wanderer_ability_impairment for
update to authenticated using (
    exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and w.custom
        and w.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from wanderer w
      where w.id = wanderer_id
        and w.custom
        and w.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on wanderer_ability_impairment for delete to authenticated using (
  exists (
    select 1
    from wanderer w
    where w.id = wanderer_id
      and w.custom
      and w.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on wanderer_ability_impairment for
select to authenticated using (
    exists (
      select 1
      from wanderer_shared_user su
      where su.wanderer_id = wanderer_ability_impairment.wanderer_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on wanderer_ability_impairment for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_wanderer_ability_impairment_wanderer on wanderer_ability_impairment(wanderer_id);
create index idx_wanderer_ability_impairment_ability_impairment on wanderer_ability_impairment(ability_impairment_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on wanderer_ability_impairment for each row execute function update_updated_at();