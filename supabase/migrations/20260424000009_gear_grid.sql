--------------------------------------------------------------------------------
-- Gear Grid Table
-- A 3x3 grid of gear items. Each column (pos_X_Y) holds a nullable reference
-- to a gear item. Coordinates range from (0, 0) at the top-left to (2, 2) at
-- the bottom-right.
--------------------------------------------------------------------------------
create table gear_grid (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  -- Grid Positions
  pos_top_left uuid references gear(id) on delete
  set null,
    pos_top_center uuid references gear(id) on delete
  set null,
    pos_top_right uuid references gear(id) on delete
  set null,
    pos_mid_left uuid references gear(id) on delete
  set null,
    pos_mid_center uuid references gear(id) on delete
  set null,
    pos_mid_right uuid references gear(id) on delete
  set null,
    pos_bottom_left uuid references gear(id) on delete
  set null,
    pos_bottom_center uuid references gear(id) on delete
  set null,
    pos_bottom_right uuid references gear(id) on delete
  set null
);
--------------------------------------------------------------------------------
-- Junction Table: Shared Users
--------------------------------------------------------------------------------
create table gear_grid_shared_user (
  gear_grid_id uuid not null references gear_grid(id) on delete cascade,
  shared_user_id uuid not null references auth.users(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (gear_grid_id, shared_user_id, user_id)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
create or replace function is_gear_grid_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.gear_grid
    where id = record_id
      and user_id = auth.uid()
  );
$$;
-- gear_grid -------------------------------------------------------------------
alter table gear_grid enable row level security;
create policy "Allow insert for authenticated and custom" on gear_grid for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on gear_grid for
select to authenticated using (not custom);
create policy "Allow select for owner and custom" on gear_grid for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on gear_grid for
update to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  ) with check (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner and custom" on gear_grid for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared and custom" on gear_grid for
select to authenticated using (
    custom
    and exists (
      select 1
      from gear_grid_shared_user su
      where su.gear_grid_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for shared and custom" on gear_grid for
update to authenticated using (
    custom
    and exists (
      select 1
      from gear_grid_shared_user su
      where su.gear_grid_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  ) with check (
    custom
    and exists (
      select 1
      from gear_grid_shared_user su
      where su.gear_grid_id = id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow all for admin" on gear_grid for all using (is_admin()) with check (is_admin());
-- gear_grid_shared_user -------------------------------------------------------
alter table gear_grid_shared_user enable row level security;
create policy "Allow insert for authenticated" on gear_grid_shared_user for
insert to authenticated with check (
    is_gear_grid_owner(gear_grid_id)
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow select for owner" on gear_grid_shared_user for
select to authenticated using (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner" on gear_grid_shared_user for
update to authenticated using (
    user_id = (
      select auth.uid()
    )
  ) with check (
    user_id = (
      select auth.uid()
    )
  );
create policy "Allow delete for owner" on gear_grid_shared_user for delete to authenticated using (
  user_id = (
    select auth.uid()
  )
);
create policy "Allow select for shared" on gear_grid_shared_user for
select to authenticated using (
    shared_user_id = (
      select auth.uid()
    )
  );
create policy "Allow all for admin" on gear_grid_shared_user for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_gear_grid_custom_user on gear_grid(custom, user_id);
create index idx_gear_grid_shared_user_gear_grid on gear_grid_shared_user(gear_grid_id);
create index idx_gear_grid_shared_user_user on gear_grid_shared_user(shared_user_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on gear_grid for each row execute function update_updated_at();
--------------------------------------------------------------------------------
-- Trigger: Validate gear belongs to the survivor's settlement storage
--------------------------------------------------------------------------------
create or replace function validate_gear_grid_positions() returns trigger language plpgsql
set search_path = '' security definer as $$
declare v_settlement_id uuid;
v_gear_id uuid;
v_positions uuid [];
v_available integer;
v_equipped integer;
begin
select settlement_id into v_settlement_id
from public.survivor
where id = new.survivor_id;
v_positions := array [
    new.pos_top_left,
    new.pos_top_center,
    new.pos_top_right,
    new.pos_mid_left,
    new.pos_mid_center,
    new.pos_mid_right,
    new.pos_bottom_left,
    new.pos_bottom_center,
    new.pos_bottom_right
  ];
foreach v_gear_id in array v_positions loop if v_gear_id is not null then -- Check the gear exists in settlement storage and get quantity
select sg.quantity into v_available
from public.settlement_gear sg
where sg.settlement_id = v_settlement_id
  and sg.gear_id = v_gear_id;
if v_available is null then raise exception 'Gear % Not in Settlement % Storage',
v_gear_id,
v_settlement_id;
end if;
-- Count how many times this gear is equipped across ALL survivors in the
-- settlement (excluding the current survivor's grid being inserted/updated)
select count(*) into v_equipped
from (
    select unnest(
        array [
          gg.pos_top_left, gg.pos_top_center, gg.pos_top_right,
          gg.pos_mid_left, gg.pos_mid_center, gg.pos_mid_right,
          gg.pos_bottom_left, gg.pos_bottom_center, gg.pos_bottom_right
        ]
      ) as equipped_gear_id
    from public.gear_grid gg
      join public.survivor s on s.id = gg.survivor_id
    where s.settlement_id = v_settlement_id
      and gg.survivor_id != new.survivor_id
  ) as other_equipped
where other_equipped.equipped_gear_id = v_gear_id;
-- Add how many times this gear appears in the NEW row being saved
v_equipped := v_equipped + (
  select count(*)
  from unnest(v_positions) as p
  where p = v_gear_id
);
if v_equipped > v_available then raise exception 'Gear % Exceeds Available Quantity (% Available, % Needed)',
v_gear_id,
v_available,
v_equipped;
end if;
end if;
end loop;
return new;
end;
$$;
create trigger validate_gear_grid_positions before
insert
  or
update on gear_grid for each row execute function validate_gear_grid_positions();