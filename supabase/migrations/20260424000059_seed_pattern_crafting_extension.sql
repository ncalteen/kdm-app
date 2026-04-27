--------------------------------------------------------------------------------
-- Seed Pattern Crafting Extension
-- Adds junction tables describing what is required to craft a seed pattern:
--   - seed_pattern_gear_cost: specific gear items required (with quantity)
--   - seed_pattern_resource_cost: specific resource items required (with quantity)
--   - seed_pattern_resource_type_cost: any resource of a given type required
--     (with quantity)
--   - seed_pattern_innovation_requirement: innovations that must be present in
--     the settlement in order to craft
--------------------------------------------------------------------------------
-- Crafting Cost: Gear
--------------------------------------------------------------------------------
create table seed_pattern_gear_cost (
  seed_pattern_id uuid not null references seed_pattern(id) on delete cascade,
  cost_gear_id uuid not null references gear(id) on delete cascade,
  quantity int not null default 1 check (quantity >= 1),
  primary key (seed_pattern_id, cost_gear_id)
);
--------------------------------------------------------------------------------
-- Crafting Cost: Specific Resource
--------------------------------------------------------------------------------
create table seed_pattern_resource_cost (
  seed_pattern_id uuid not null references seed_pattern(id) on delete cascade,
  resource_id uuid not null references resource(id) on delete cascade,
  quantity int not null default 1 check (quantity >= 1),
  primary key (seed_pattern_id, resource_id)
);
--------------------------------------------------------------------------------
-- Crafting Cost: Resource Type
--------------------------------------------------------------------------------
create table seed_pattern_resource_type_cost (
  seed_pattern_id uuid not null references seed_pattern(id) on delete cascade,
  resource_type resource_type not null,
  quantity int not null default 1 check (quantity >= 1),
  primary key (seed_pattern_id, resource_type)
);
--------------------------------------------------------------------------------
-- Crafting Requirement: Innovation
-- Innovation prerequisites required by the settlement to craft this seed
-- pattern. No quantity: presence in the settlement is sufficient.
--------------------------------------------------------------------------------
create table seed_pattern_innovation_requirement (
  seed_pattern_id uuid not null references seed_pattern(id) on delete cascade,
  innovation_id uuid not null references innovation(id) on delete cascade,
  primary key (seed_pattern_id, innovation_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
-- Each junction table's access is derived from the parent seed_pattern row.
--------------------------------------------------------------------------------
-- seed_pattern_gear_cost ------------------------------------------------------
alter table seed_pattern_gear_cost enable row level security;
create policy "Allow select for authenticated and non-custom" on seed_pattern_gear_cost for
select to authenticated using (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and not sp.custom
    )
  );
create policy "Allow select for owner and custom" on seed_pattern_gear_cost for
select to authenticated using (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner and custom" on seed_pattern_gear_cost for
insert to authenticated with check (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on seed_pattern_gear_cost for
update to authenticated using (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on seed_pattern_gear_cost for delete to authenticated using (
  exists (
    select 1
    from seed_pattern sp
    where sp.id = seed_pattern_id
      and sp.custom
      and sp.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on seed_pattern_gear_cost for
select to authenticated using (
    exists (
      select 1
      from seed_pattern_shared_user su
      where su.seed_pattern_id = seed_pattern_gear_cost.seed_pattern_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on seed_pattern_gear_cost for all using (is_admin()) with check (is_admin());
-- seed_pattern_resource_cost --------------------------------------------------
alter table seed_pattern_resource_cost enable row level security;
create policy "Allow select for authenticated and non-custom" on seed_pattern_resource_cost for
select to authenticated using (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and not sp.custom
    )
  );
create policy "Allow select for owner and custom" on seed_pattern_resource_cost for
select to authenticated using (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner and custom" on seed_pattern_resource_cost for
insert to authenticated with check (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on seed_pattern_resource_cost for
update to authenticated using (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on seed_pattern_resource_cost for delete to authenticated using (
  exists (
    select 1
    from seed_pattern sp
    where sp.id = seed_pattern_id
      and sp.custom
      and sp.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on seed_pattern_resource_cost for
select to authenticated using (
    exists (
      select 1
      from seed_pattern_shared_user su
      where su.seed_pattern_id = seed_pattern_resource_cost.seed_pattern_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on seed_pattern_resource_cost for all using (is_admin()) with check (is_admin());
-- seed_pattern_resource_type_cost ---------------------------------------------
alter table seed_pattern_resource_type_cost enable row level security;
create policy "Allow select for authenticated and non-custom" on seed_pattern_resource_type_cost for
select to authenticated using (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and not sp.custom
    )
  );
create policy "Allow select for owner and custom" on seed_pattern_resource_type_cost for
select to authenticated using (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner and custom" on seed_pattern_resource_type_cost for
insert to authenticated with check (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on seed_pattern_resource_type_cost for
update to authenticated using (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on seed_pattern_resource_type_cost for delete to authenticated using (
  exists (
    select 1
    from seed_pattern sp
    where sp.id = seed_pattern_id
      and sp.custom
      and sp.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on seed_pattern_resource_type_cost for
select to authenticated using (
    exists (
      select 1
      from seed_pattern_shared_user su
      where su.seed_pattern_id = seed_pattern_resource_type_cost.seed_pattern_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on seed_pattern_resource_type_cost for all using (is_admin()) with check (is_admin());
-- seed_pattern_innovation_requirement -----------------------------------------
alter table seed_pattern_innovation_requirement enable row level security;
create policy "Allow select for authenticated and non-custom" on seed_pattern_innovation_requirement for
select to authenticated using (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and not sp.custom
    )
  );
create policy "Allow select for owner and custom" on seed_pattern_innovation_requirement for
select to authenticated using (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow insert for owner and custom" on seed_pattern_innovation_requirement for
insert to authenticated with check (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on seed_pattern_innovation_requirement for
update to authenticated using (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from seed_pattern sp
      where sp.id = seed_pattern_id
        and sp.custom
        and sp.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on seed_pattern_innovation_requirement for delete to authenticated using (
  exists (
    select 1
    from seed_pattern sp
    where sp.id = seed_pattern_id
      and sp.custom
      and sp.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared and custom" on seed_pattern_innovation_requirement for
select to authenticated using (
    exists (
      select 1
      from seed_pattern_shared_user su
      where su.seed_pattern_id = seed_pattern_innovation_requirement.seed_pattern_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on seed_pattern_innovation_requirement for all using (is_admin()) with check (is_admin());