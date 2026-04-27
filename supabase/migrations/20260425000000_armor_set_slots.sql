--------------------------------------------------------------------------------
-- Armor Set Slots
--
-- Refactors `armor_set_gear` into a slot-based model so that a single armor
-- set can list multiple gear alternatives per slot. A survivor qualifies for
-- the set bonus when every required slot has at least one matching piece in
-- their gear grid (instead of needing every individual gear piece).
--
-- Old shape: armor_set ──< armor_set_gear >── gear
-- New shape: armor_set ──< armor_set_slot ──< armor_set_slot_gear >── gear
--
-- The migration creates the new tables, backfills them from the legacy
-- junction (one slot per `gear.armor_location` per set, so existing rows that
-- happen to share an armor location automatically become alternates), drops
-- the legacy junction, and exposes a `survivor_qualifies_for_armor_set`
-- helper that the application can call directly.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- Armor Set Slot Table
-- A named slot belonging to an armor set. One slot per location/role
-- (e.g. Head, Chest, Tabard). Slots are unique within a set by name.
--------------------------------------------------------------------------------
create table armor_set_slot (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Owner Data (denormalised from armor_set for RLS)
  armor_set_id uuid not null references armor_set(id) on delete cascade,
  -- Data
  slot_name varchar not null,
  slot_order integer not null default 0,
  required boolean not null default true,
  unique (armor_set_id, slot_name)
);
--------------------------------------------------------------------------------
-- Junction Table: Slot Gear (Candidates)
-- Each row is a gear piece that, if equipped, satisfies the parent slot.
--------------------------------------------------------------------------------
create table armor_set_slot_gear (
  armor_set_slot_id uuid not null references armor_set_slot(id) on delete cascade,
  gear_id uuid not null references gear(id) on delete cascade,
  primary key (armor_set_slot_id, gear_id)
);
--------------------------------------------------------------------------------
-- Backfill from legacy armor_set_gear
--------------------------------------------------------------------------------
-- 1) Create one slot per (armor_set_id, slot_name). Slot name is derived from
--    the gear's armor_location (HEAD/CHEST/ARMS/WAIST/FEET); when null, fall
--    back to the gear name so slot identity is still unique. Multiple gear
--    pieces in the same set sharing an armor_location collapse into a single
--    slot whose entries are the alternatives.
insert into armor_set_slot (armor_set_id, slot_name, slot_order)
select distinct asg.armor_set_id,
  coalesce(g.armor_location::text, g.gear_name) as slot_name,
  case
    g.armor_location::text
    when 'HEAD' then 1
    when 'CHEST' then 2
    when 'ARMS' then 3
    when 'WAIST' then 4
    when 'FEET' then 5
    else 99
  end as slot_order
from armor_set_gear asg
  join gear g on g.id = asg.gear_id on conflict do nothing;
-- 2) Link each legacy gear piece into its newly-created slot.
insert into armor_set_slot_gear (armor_set_slot_id, gear_id)
select s.id,
  asg.gear_id
from armor_set_gear asg
  join gear g on g.id = asg.gear_id
  join armor_set_slot s on s.armor_set_id = asg.armor_set_id
  and s.slot_name = coalesce(g.armor_location::text, g.gear_name) on conflict do nothing;
-- 3) Drop the legacy junction now that data is migrated.
drop table armor_set_gear;
--------------------------------------------------------------------------------
-- Row Level Security: armor_set_slot
--
-- Mirrors the policies on the legacy armor_set_gear: read open for non-custom
-- sets, write restricted to the owner of the parent set. Sharing is honored
-- through the existing `armor_set_shared_user` table.
--------------------------------------------------------------------------------
alter table armor_set_slot enable row level security;
create policy "Allow insert for owner and custom" on armor_set_slot for
insert to authenticated with check (is_armor_set_owner(armor_set_id));
create policy "Allow select for authenticated and non-custom" on armor_set_slot for
select to authenticated using (
    exists (
      select 1
      from armor_set a
      where a.id = armor_set_id
        and not a.custom
    )
  );
create policy "Allow select for owner and custom" on armor_set_slot for
select to authenticated using (is_armor_set_owner(armor_set_id));
create policy "Allow select for shared and custom" on armor_set_slot for
select to authenticated using (
    exists (
      select 1
      from armor_set_shared_user su
      where su.armor_set_id = armor_set_slot.armor_set_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on armor_set_slot for
update to authenticated using (is_armor_set_owner(armor_set_id)) with check (is_armor_set_owner(armor_set_id));
create policy "Allow delete for owner and custom" on armor_set_slot for delete to authenticated using (is_armor_set_owner(armor_set_id));
create policy "Allow all for admin" on armor_set_slot for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Row Level Security: armor_set_slot_gear
--------------------------------------------------------------------------------
alter table armor_set_slot_gear enable row level security;
create policy "Allow insert for owner and custom" on armor_set_slot_gear for
insert to authenticated with check (
    exists (
      select 1
      from armor_set_slot s
      where s.id = armor_set_slot_id
        and is_armor_set_owner(s.armor_set_id)
    )
  );
create policy "Allow select for authenticated and non-custom" on armor_set_slot_gear for
select to authenticated using (
    exists (
      select 1
      from armor_set_slot s
        join armor_set a on a.id = s.armor_set_id
      where s.id = armor_set_slot_id
        and not a.custom
    )
  );
create policy "Allow select for owner and custom" on armor_set_slot_gear for
select to authenticated using (
    exists (
      select 1
      from armor_set_slot s
      where s.id = armor_set_slot_id
        and is_armor_set_owner(s.armor_set_id)
    )
  );
create policy "Allow select for shared and custom" on armor_set_slot_gear for
select to authenticated using (
    exists (
      select 1
      from armor_set_slot s
        join armor_set_shared_user su on su.armor_set_id = s.armor_set_id
      where s.id = armor_set_slot_id
        and su.shared_user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on armor_set_slot_gear for delete to authenticated using (
  exists (
    select 1
    from armor_set_slot s
    where s.id = armor_set_slot_id
      and is_armor_set_owner(s.armor_set_id)
  )
);
create policy "Allow all for admin" on armor_set_slot_gear for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_armor_set_slot_armor_set on armor_set_slot(armor_set_id);
create index idx_armor_set_slot_gear_slot on armor_set_slot_gear(armor_set_slot_id);
create index idx_armor_set_slot_gear_gear on armor_set_slot_gear(gear_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on armor_set_slot for each row execute function update_updated_at();
--------------------------------------------------------------------------------
-- Helper: armor_set_qualifies
--
-- Returns true when, for every required slot in the given armor set, the
-- supplied gear-id array contains at least one candidate registered for that
-- slot. Optional (non-required) slots are ignored. If the set has no slots,
-- the call trivially returns true.
--
-- Callers pass the set of currently-equipped gear ids for whichever survivor
-- they're checking (typically the nine `gear_grid.pos_*` cells). Keeping the
-- helper decoupled from the survivor↔gear linkage means it works regardless
-- of how the application chooses to represent loadouts in the future.
--
-- Example:
--   select armor_set_qualifies(
--     '<armor_set_id>',
--     array[gg.pos_top_left, gg.pos_top_center, ...]::uuid[]
--   )
--   from gear_grid gg where gg.id = '<grid_id>';
--------------------------------------------------------------------------------
create or replace function armor_set_qualifies(
    p_armor_set_id uuid,
    p_equipped_gear_ids uuid []
  ) returns boolean language sql stable security definer
set search_path = '' as $$
select not exists (
    select 1
    from public.armor_set_slot s
    where s.armor_set_id = p_armor_set_id
      and s.required
      and not exists (
        select 1
        from public.armor_set_slot_gear sg
        where sg.armor_set_slot_id = s.id
          and sg.gear_id = any(p_equipped_gear_ids)
      )
  );
$$;
grant execute on function armor_set_qualifies(uuid, uuid []) to authenticated;