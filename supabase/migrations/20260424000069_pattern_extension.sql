--------------------------------------------------------------------------------
-- Pattern Extension
-- Adds crafting columns and junction tables to the pattern table:
--   - crafting_limit: maximum number of times this pattern may be crafted
--     (null = unlimited)
--   - endeavor_cost: endeavors required to craft this pattern
--   - crafted_gear_id: the gear unlocked by crafting this pattern
--   - pattern_gear_cost: specific gear items required to craft (with quantity)
--   - pattern_resource_cost: specific resource items required (with quantity)
--   - pattern_resource_type_cost: any resource of a given type required
--     (with quantity)
--   - pattern_innovation_requirement: innovation prerequisites required in the
--     settlement to craft
--------------------------------------------------------------------------------
-- Pattern Table
--------------------------------------------------------------------------------
ALTER TABLE pattern
ADD COLUMN crafting_limit INT CHECK (crafting_limit >= 0),
  ADD COLUMN endeavor_cost INT CHECK (endeavor_cost >= 0),
  ADD COLUMN crafted_gear_id UUID REFERENCES gear(id) ON DELETE
SET NULL;
--------------------------------------------------------------------------------
-- Crafting Cost: Gear
--------------------------------------------------------------------------------
create table pattern_gear_cost (
  pattern_id uuid not null references pattern(id) on delete cascade,
  cost_gear_id uuid not null references gear(id) on delete cascade,
  quantity int not null default 1 check (quantity >= 1),
  primary key (pattern_id, cost_gear_id)
);
--------------------------------------------------------------------------------
-- Crafting Cost: Specific Resource
--------------------------------------------------------------------------------
create table pattern_resource_cost (
  pattern_id uuid not null references pattern(id) on delete cascade,
  resource_id uuid not null references resource(id) on delete cascade,
  quantity int not null default 1 check (quantity >= 1),
  primary key (pattern_id, resource_id)
);
--------------------------------------------------------------------------------
-- Crafting Cost: Resource Type
--------------------------------------------------------------------------------
create table pattern_resource_type_cost (
  pattern_id uuid not null references pattern(id) on delete cascade,
  resource_type resource_type not null,
  quantity int not null default 1 check (quantity >= 1),
  primary key (pattern_id, resource_type)
);
--------------------------------------------------------------------------------
-- Crafting Requirement: Innovation
-- Innovation prerequisites required by the settlement to craft this pattern.
-- No quantity: presence in the settlement is sufficient.
--------------------------------------------------------------------------------
create table pattern_innovation_requirement (
  pattern_id uuid not null references pattern(id) on delete cascade,
  innovation_id uuid not null references innovation(id) on delete cascade,
  primary key (pattern_id, innovation_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
-- Each junction table's access is derived from the parent pattern row.
--------------------------------------------------------------------------------
-- pattern_gear_cost -----------------------------------------------------------
alter table pattern_gear_cost enable row level security;
create policy "Allow select for authenticated and non-custom" on pattern_gear_cost for
select to authenticated using (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and not p.custom
    )
  );
create policy "Allow select for owner and custom" on pattern_gear_cost for
select to authenticated using (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner and custom" on pattern_gear_cost for
insert to authenticated with check (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on pattern_gear_cost for
update to authenticated using (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on pattern_gear_cost for delete to authenticated using (
  exists (
    select 1
    from pattern p
    where p.id = pattern_id
      and p.custom
      and p.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on pattern_gear_cost for
select to authenticated using (
    exists (
      select 1
      from pattern_shared_user su
      where su.pattern_id = pattern_gear_cost.pattern_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on pattern_gear_cost for all using (is_admin()) with check (is_admin());
-- pattern_resource_cost -------------------------------------------------------
alter table pattern_resource_cost enable row level security;
create policy "Allow select for authenticated and non-custom" on pattern_resource_cost for
select to authenticated using (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and not p.custom
    )
  );
create policy "Allow select for owner and custom" on pattern_resource_cost for
select to authenticated using (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner and custom" on pattern_resource_cost for
insert to authenticated with check (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on pattern_resource_cost for
update to authenticated using (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on pattern_resource_cost for delete to authenticated using (
  exists (
    select 1
    from pattern p
    where p.id = pattern_id
      and p.custom
      and p.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on pattern_resource_cost for
select to authenticated using (
    exists (
      select 1
      from pattern_shared_user su
      where su.pattern_id = pattern_resource_cost.pattern_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on pattern_resource_cost for all using (is_admin()) with check (is_admin());
-- pattern_resource_type_cost --------------------------------------------------
alter table pattern_resource_type_cost enable row level security;
create policy "Allow select for authenticated and non-custom" on pattern_resource_type_cost for
select to authenticated using (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and not p.custom
    )
  );
create policy "Allow select for owner and custom" on pattern_resource_type_cost for
select to authenticated using (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner and custom" on pattern_resource_type_cost for
insert to authenticated with check (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on pattern_resource_type_cost for
update to authenticated using (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on pattern_resource_type_cost for delete to authenticated using (
  exists (
    select 1
    from pattern p
    where p.id = pattern_id
      and p.custom
      and p.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on pattern_resource_type_cost for
select to authenticated using (
    exists (
      select 1
      from pattern_shared_user su
      where su.pattern_id = pattern_resource_type_cost.pattern_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on pattern_resource_type_cost for all using (is_admin()) with check (is_admin());
-- pattern_innovation_requirement ----------------------------------------------
alter table pattern_innovation_requirement enable row level security;
create policy "Allow select for authenticated and non-custom" on pattern_innovation_requirement for
select to authenticated using (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and not p.custom
    )
  );
create policy "Allow select for owner and custom" on pattern_innovation_requirement for
select to authenticated using (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner and custom" on pattern_innovation_requirement for
insert to authenticated with check (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on pattern_innovation_requirement for
update to authenticated using (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from pattern p
      where p.id = pattern_id
        and p.custom
        and p.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on pattern_innovation_requirement for delete to authenticated using (
  exists (
    select 1
    from pattern p
    where p.id = pattern_id
      and p.custom
      and p.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on pattern_innovation_requirement for
select to authenticated using (
    exists (
      select 1
      from pattern_shared_user su
      where su.pattern_id = pattern_innovation_requirement.pattern_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on pattern_innovation_requirement for all using (is_admin()) with check (is_admin());