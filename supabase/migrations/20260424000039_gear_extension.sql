--------------------------------------------------------------------------------
-- Gear Table
-- Adds columns for gear attributes:
--  - accessory: gear is an accessory
--  - accuracy: weapon accuracy
--  - affinity_top: top affinity color (if any)
--  - affinity_left: left affinity color (if any)
--  - affinity_right: right affinity color (if any)
--  - affinity_bottom: bottom affinity color (if any)
--  - affinity_bonus: affinity bonus
--  - affinity_bonus_requirements: JSONB array of affinity requirements
--                                 [
--                                   {
--                                     affinity: "BLUE" | "GREEN" | "RED",
--                                     puzzle: true | false
--                                   }
--                                 ]
--  - armor_points: armor points provided by the gear
--  - armor_location: location of the armor on the body
--  - keywords: array of gear keywords
--  - rules: special rules for the gear
--  - speed: weapon speed
--  - strength: weapon strength
--  - weapon_type_id: weapon type reference
--------------------------------------------------------------------------------
ALTER TABLE gear
ADD COLUMN accessory BOOLEAN,
  ADD COLUMN accuracy INTEGER,
  ADD COLUMN affinity_top affinity,
  ADD COLUMN affinity_left affinity,
  ADD COLUMN affinity_right affinity,
  ADD COLUMN affinity_bottom affinity,
  ADD COLUMN affinity_bonus TEXT,
  ADD COLUMN affinity_bonus_requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN armor_points INTEGER,
  ADD COLUMN armor_location armor_location,
  ADD COLUMN keywords gear_keyword [],
  ADD COLUMN rules TEXT,
  ADD COLUMN speed INTEGER,
  ADD COLUMN strength INTEGER,
  ADD COLUMN weapon_type_id uuid references weapon_type(id) on delete
set null,
  -- Ensure the affinity bonus requirements are valid
ADD CONSTRAINT gear_affinity_bonus_requirements_valid CHECK (
    jsonb_typeof(affinity_bonus_requirements) = 'array'
    AND NOT jsonb_path_exists(
      affinity_bonus_requirements,
      '$[*] ? (
        @.type() != "object" ||
        @.affinity.type() != "string" ||
        (
          @.affinity != "BLUE" &&
          @.affinity != "GREEN" &&
          @.affinity != "RED"
        ) ||
        @.puzzle.type() != "boolean"
      )'
    )
  );
--------------------------------------------------------------------------------
-- Crafting Cost: Gear
-- Specific gear items required to craft this gear.
--------------------------------------------------------------------------------
create table gear_gear_cost (
  gear_id uuid not null references gear(id) on delete cascade,
  cost_gear_id uuid not null references gear(id) on delete cascade,
  quantity int not null default 1 check (quantity >= 1),
  primary key (gear_id, cost_gear_id)
);
--------------------------------------------------------------------------------
-- Crafting Cost: Specific Resource
-- Specific resource items required to craft this gear.
--------------------------------------------------------------------------------
create table gear_resource_cost (
  gear_id uuid not null references gear(id) on delete cascade,
  resource_id uuid not null references resource(id) on delete cascade,
  quantity int not null default 1 check (quantity >= 1),
  primary key (gear_id, resource_id)
);
--------------------------------------------------------------------------------
-- Crafting Cost: Resource Type
-- Any resource of a given type required to craft this gear.
--------------------------------------------------------------------------------
create table gear_resource_type_cost (
  gear_id uuid not null references gear(id) on delete cascade,
  resource_type resource_type not null,
  quantity int not null default 1 check (quantity >= 1),
  primary key (gear_id, resource_type)
);
--------------------------------------------------------------------------------
-- Crafting Cost: Other
-- Arbitrary crafting costs not tracked in other tables.
--------------------------------------------------------------------------------
create table gear_other_cost (
  id uuid primary key default gen_random_uuid(),
  gear_id uuid not null references gear(id) on delete cascade,
  cost_name varchar not null,
  quantity int not null default 1 check (quantity >= 1)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
-- gear_gear_cost --------------------------------------------------------------
alter table gear_gear_cost enable row level security;
create policy "Allow select for authenticated and non-custom" on gear_gear_cost for
select to authenticated using (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and not g.custom
    )
  );
create policy "Allow select for owner and custom" on gear_gear_cost for
select to authenticated using (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner and custom" on gear_gear_cost for
insert to authenticated with check (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on gear_gear_cost for
update to authenticated using (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on gear_gear_cost for delete to authenticated using (
  exists (
    select 1
    from gear g
    where g.id = gear_id
      and g.custom
      and g.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on gear_gear_cost for
select to authenticated using (
    exists (
      select 1
      from gear_shared_user su
      where su.gear_id = gear_gear_cost.gear_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on gear_gear_cost for all using (is_admin()) with check (is_admin());
-- gear_resource_cost ----------------------------------------------------------
alter table gear_resource_cost enable row level security;
create policy "Allow select for authenticated and non-custom" on gear_resource_cost for
select to authenticated using (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and not g.custom
    )
  );
create policy "Allow select for owner and custom" on gear_resource_cost for
select to authenticated using (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner and custom" on gear_resource_cost for
insert to authenticated with check (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on gear_resource_cost for
update to authenticated using (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on gear_resource_cost for delete to authenticated using (
  exists (
    select 1
    from gear g
    where g.id = gear_id
      and g.custom
      and g.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on gear_resource_cost for
select to authenticated using (
    exists (
      select 1
      from gear_shared_user su
      where su.gear_id = gear_resource_cost.gear_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on gear_resource_cost for all using (is_admin()) with check (is_admin());
-- gear_resource_type_cost -----------------------------------------------------
alter table gear_resource_type_cost enable row level security;
create policy "Allow select for authenticated and non-custom" on gear_resource_type_cost for
select to authenticated using (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and not g.custom
    )
  );
create policy "Allow select for owner and custom" on gear_resource_type_cost for
select to authenticated using (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner and custom" on gear_resource_type_cost for
insert to authenticated with check (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on gear_resource_type_cost for
update to authenticated using (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on gear_resource_type_cost for delete to authenticated using (
  exists (
    select 1
    from gear g
    where g.id = gear_id
      and g.custom
      and g.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on gear_resource_type_cost for
select to authenticated using (
    exists (
      select 1
      from gear_shared_user su
      where su.gear_id = gear_resource_type_cost.gear_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on gear_resource_type_cost for all using (is_admin()) with check (is_admin());
-- gear_other_cost -------------------------------------------------------------
alter table gear_other_cost enable row level security;
create policy "Allow select for authenticated and non-custom" on gear_other_cost for
select to authenticated using (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and not g.custom
    )
  );
create policy "Allow select for owner and custom" on gear_other_cost for
select to authenticated using (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner and custom" on gear_other_cost for
insert to authenticated with check (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on gear_other_cost for
update to authenticated using (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from gear g
      where g.id = gear_id
        and g.custom
        and g.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on gear_other_cost for delete to authenticated using (
  exists (
    select 1
    from gear g
    where g.id = gear_id
      and g.custom
      and g.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on gear_other_cost for
select to authenticated using (
    exists (
      select 1
      from gear_shared_user su
      where su.gear_id = gear_other_cost.gear_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on gear_other_cost for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_gear_gear_cost_cost_gear on gear_gear_cost(cost_gear_id);
create index idx_gear_resource_cost_resource on gear_resource_cost(resource_id);
create index idx_gear_other_cost_gear on gear_other_cost(gear_id);