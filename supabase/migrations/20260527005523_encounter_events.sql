--------------------------------------------------------------------------------
-- Encounter Event Schema
--
-- Encounter monsters are catalog monsters distinct from quarries and nemeses.
-- During a hunt, an active encounter can be created for the settlement and
-- linked back to the paused hunt. Survivor armor and damage boxes remain on
-- `survivor`; phase-specific tokens and bleeding are copied between
-- hunt_survivor, encounter_survivor, and showdown_survivor.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- Hunt Survivor Bleeding Tokens
--------------------------------------------------------------------------------
alter table public.hunt_survivor
add column if not exists bleeding_tokens integer not null default 0;
--------------------------------------------------------------------------------
-- Encounter Monster Catalog
--------------------------------------------------------------------------------
create table public.encounter_monster (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  custom boolean not null default false,
  user_id uuid references auth.users(id) on delete cascade,
  monster_name varchar not null,
  basic_action text not null default '',
  instinct text not null default ''
);
create table public.encounter_monster_level (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  encounter_monster_id uuid not null references public.encounter_monster(id) on delete cascade,
  level_number int not null check (level_number > 0),
  life int not null default 0 check (life >= 0),
  movement int not null default 1 check (movement >= 0),
  toughness int not null default 0 check (toughness >= 0),
  speed int not null default 0,
  damage int not null default 0,
  accuracy int not null default 0,
  evasion int not null default 0,
  luck int not null default 0,
  sub_monster_name varchar
);
create table public.encounter_monster_level_trait (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  encounter_monster_level_id uuid not null references public.encounter_monster_level(id) on delete cascade,
  trait_id uuid not null references public.trait(id) on delete cascade,
  unique (encounter_monster_level_id, trait_id)
);
create table public.encounter_monster_level_mood (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  encounter_monster_level_id uuid not null references public.encounter_monster_level(id) on delete cascade,
  mood_id uuid not null references public.mood(id) on delete cascade,
  unique (encounter_monster_level_id, mood_id)
);
--------------------------------------------------------------------------------
-- Active Encounter Tables
--------------------------------------------------------------------------------
alter table public.hunt
add constraint hunt_id_settlement_id_unique unique (id, settlement_id);
create table public.encounter (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  hunt_id uuid not null unique,
  monster_level int not null check (monster_level > 0),
  settlement_id uuid not null unique references public.settlement(id) on delete cascade,
  turn showdown_turn not null default 'MONSTER',
  unique (id, settlement_id),
  foreign key (hunt_id, settlement_id) references public.hunt(id, settlement_id) on delete cascade
);
create table public.encounter_active_monster (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accuracy int not null default 0,
  accuracy_tokens int not null default 0,
  damage int not null default 0,
  damage_tokens int not null default 0,
  encounter_id uuid not null,
  encounter_monster_id uuid references public.encounter_monster(id) on delete
  set null,
    encounter_monster_level_id uuid references public.encounter_monster_level(id) on delete
  set null,
    evasion int not null default 0,
    evasion_tokens int not null default 0,
    knocked_down boolean not null default false,
    life int not null default 0 check (life >= 0),
    luck int not null default 0,
    luck_tokens int not null default 0,
    monster_name varchar not null,
    movement int not null default 1,
    movement_tokens int not null default 0,
    notes text not null default '',
    settlement_id uuid not null references public.settlement(id) on delete cascade,
    speed int not null default 0,
    speed_tokens int not null default 0,
    toughness int not null default 0,
    unique (encounter_id, monster_name),
    foreign key (encounter_id, settlement_id) references public.encounter(id, settlement_id) on delete cascade
);
create table public.encounter_active_monster_trait (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  encounter_active_monster_id uuid not null references public.encounter_active_monster(id) on delete cascade,
  settlement_id uuid not null default '00000000-0000-0000-0000-000000000000'::uuid references public.settlement(id) on delete cascade,
  trait_id uuid not null references public.trait(id) on delete cascade,
  unique (encounter_active_monster_id, trait_id)
);
create table public.encounter_active_monster_mood (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  encounter_active_monster_id uuid not null references public.encounter_active_monster(id) on delete cascade,
  settlement_id uuid not null default '00000000-0000-0000-0000-000000000000'::uuid references public.settlement(id) on delete cascade,
  mood_id uuid not null references public.mood(id) on delete cascade,
  unique (encounter_active_monster_id, mood_id)
);
create table public.encounter_survivor (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accuracy_tokens integer not null default 0,
  activation_used boolean not null default false,
  bleeding_tokens integer not null default 0,
  block_tokens integer not null default 0,
  deflect_tokens integer not null default 0,
  encounter_id uuid not null,
  evasion_tokens integer not null default 0,
  insanity_tokens integer not null default 0,
  knocked_down boolean not null default false,
  luck_tokens integer not null default 0,
  movement_tokens integer not null default 0,
  movement_used boolean not null default false,
  notes text not null default '',
  scout boolean not null default false,
  settlement_id uuid not null references public.settlement(id) on delete cascade,
  speed_tokens integer not null default 0,
  strength_tokens integer not null default 0,
  survival_tokens integer not null default 0,
  survivor_id uuid not null references public.survivor(id) on delete cascade,
  unique (encounter_id, survivor_id),
  foreign key (encounter_id, settlement_id) references public.encounter(id, settlement_id) on delete cascade
);
--------------------------------------------------------------------------------
-- Grants
--------------------------------------------------------------------------------
grant select,
  insert,
  update,
  delete on table public.encounter_monster,
  public.encounter_monster_level,
  public.encounter_monster_level_trait,
  public.encounter_monster_level_mood,
  public.encounter,
  public.encounter_active_monster,
  public.encounter_active_monster_trait,
  public.encounter_active_monster_mood,
  public.encounter_survivor to authenticated;
grant select,
  insert,
  update,
  delete on table public.encounter_monster,
  public.encounter_monster_level,
  public.encounter_monster_level_trait,
  public.encounter_monster_level_mood,
  public.encounter,
  public.encounter_active_monster,
  public.encounter_active_monster_trait,
  public.encounter_active_monster_mood,
  public.encounter_survivor to service_role;
--------------------------------------------------------------------------------
-- Row Level Security: Catalog
--------------------------------------------------------------------------------
alter table public.encounter_monster enable row level security;
alter table public.encounter_monster_level enable row level security;
alter table public.encounter_monster_level_trait enable row level security;
alter table public.encounter_monster_level_mood enable row level security;
create policy "Allow insert for authenticated and custom" on public.encounter_monster for
insert to authenticated with check (
    user_id = (
      select auth.uid()
    )
    and custom
  );
create policy "Allow select for authenticated and non-custom" on public.encounter_monster for
select to authenticated using (
    not custom
    and archived_at is null
  );
create policy "Allow select for owner and custom" on public.encounter_monster for
select to authenticated using (
    custom
    and user_id = (
      select auth.uid()
    )
  );
create policy "Allow update for owner and custom" on public.encounter_monster for
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
create policy "Allow delete for owner and custom" on public.encounter_monster for delete to authenticated using (
  custom
  and user_id = (
    select auth.uid()
  )
);
create policy "Allow select via active encounter" on public.encounter_monster for
select to authenticated using (
    custom
    and exists (
      select 1
      from public.encounter_active_monster eam
      where eam.encounter_monster_id = encounter_monster.id
        and (
          is_settlement_owner(eam.settlement_id)
          or is_settlement_collaborator(eam.settlement_id)
        )
    )
  );
create policy "Allow insert for owner and custom" on public.encounter_monster_level for
insert to authenticated with check (
    exists (
      select 1
      from public.encounter_monster em
      where em.id = encounter_monster_id
        and em.custom
        and em.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow select for authenticated and non-custom" on public.encounter_monster_level for
select to authenticated using (
    exists (
      select 1
      from public.encounter_monster em
      where em.id = encounter_monster_id
        and not em.custom
        and em.archived_at is null
    )
  );
create policy "Allow select for owner and custom" on public.encounter_monster_level for
select to authenticated using (
    exists (
      select 1
      from public.encounter_monster em
      where em.id = encounter_monster_id
        and em.custom
        and em.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow update for owner and custom" on public.encounter_monster_level for
update to authenticated using (
    exists (
      select 1
      from public.encounter_monster em
      where em.id = encounter_monster_id
        and em.custom
        and em.user_id = (
          select auth.uid()
        )
    )
  ) with check (
    exists (
      select 1
      from public.encounter_monster em
      where em.id = encounter_monster_id
        and em.custom
        and em.user_id = (
          select auth.uid()
        )
    )
  );
create policy "Allow delete for owner and custom" on public.encounter_monster_level for delete to authenticated using (
  exists (
    select 1
    from public.encounter_monster em
    where em.id = encounter_monster_id
      and em.custom
      and em.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select via active encounter" on public.encounter_monster_level for
select to authenticated using (
    exists (
      select 1
      from public.encounter_active_monster eam
      where eam.encounter_monster_level_id = encounter_monster_level.id
        and (
          is_settlement_owner(eam.settlement_id)
          or is_settlement_collaborator(eam.settlement_id)
        )
    )
  );
--------------------------------------------------------------------------------
-- Row Level Security: Encounter Trait/Mood Transitive SELECT
--------------------------------------------------------------------------------
create policy "Allow select via active encounter" on public.trait for
select to authenticated using (
    custom
    and exists (
      select 1
      from public.encounter_active_monster_trait eamt
        join public.encounter_active_monster eam on eam.id = eamt.encounter_active_monster_id
      where eamt.trait_id = trait.id
        and (
          is_settlement_owner(eam.settlement_id)
          or is_settlement_collaborator(eam.settlement_id)
        )
    )
  );
create policy "Allow select via active encounter" on public.mood for
select to authenticated using (
    custom
    and exists (
      select 1
      from public.encounter_active_monster_mood eamm
        join public.encounter_active_monster eam on eam.id = eamm.encounter_active_monster_id
      where eamm.mood_id = mood.id
        and (
          is_settlement_owner(eam.settlement_id)
          or is_settlement_collaborator(eam.settlement_id)
        )
    )
  );
--------------------------------------------------------------------------------
-- Row Level Security: Encounter Level Junctions
--------------------------------------------------------------------------------
do $$
declare spec record;
begin for spec in
select *
from (
    values ('encounter_monster_level_trait', 'trait_id'),
      ('encounter_monster_level_mood', 'mood_id')
  ) as t (child_table, catalog_column) loop execute format(
    $sql$create policy "Allow insert for owner and custom" on public.%1$I for
    insert to authenticated with check (
        exists (
          select 1
          from public.encounter_monster_level eml
            join public.encounter_monster em on em.id = eml.encounter_monster_id
          where eml.id = encounter_monster_level_id
            and em.custom
            and em.user_id = (
              select auth.uid()
            )
        )
      ) $sql$,
      spec.child_table
  );
execute format(
  $sql$create policy "Allow select for authenticated and non-custom" on public.%1$I for
  select to authenticated using (
      exists (
        select 1
        from public.encounter_monster_level eml
          join public.encounter_monster em on em.id = eml.encounter_monster_id
        where eml.id = encounter_monster_level_id
          and not em.custom
          and em.archived_at is null
      )
    ) $sql$,
    spec.child_table
);
execute format(
  $sql$create policy "Allow select for owner and custom" on public.%1$I for
  select to authenticated using (
      exists (
        select 1
        from public.encounter_monster_level eml
          join public.encounter_monster em on em.id = eml.encounter_monster_id
        where eml.id = encounter_monster_level_id
          and em.custom
          and em.user_id = (
            select auth.uid()
          )
      )
    ) $sql$,
    spec.child_table
);
execute format(
  $sql$create policy "Allow select via active encounter" on public.%1$I for
  select to authenticated using (
      exists (
        select 1
        from public.encounter_active_monster eam
        where eam.encounter_monster_level_id = %1$I.encounter_monster_level_id
          and (
            is_settlement_owner(eam.settlement_id)
            or is_settlement_collaborator(eam.settlement_id)
          )
      )
    ) $sql$,
    spec.child_table
);
execute format(
  $sql$create policy "Allow update for owner and custom" on public.%1$I for
  update to authenticated using (
      exists (
        select 1
        from public.encounter_monster_level eml
          join public.encounter_monster em on em.id = eml.encounter_monster_id
        where eml.id = encounter_monster_level_id
          and em.custom
          and em.user_id = (
            select auth.uid()
          )
      )
    ) with check (
      exists (
        select 1
        from public.encounter_monster_level eml
          join public.encounter_monster em on em.id = eml.encounter_monster_id
        where eml.id = encounter_monster_level_id
          and em.custom
          and em.user_id = (
            select auth.uid()
          )
      )
    ) $sql$,
    spec.child_table
);
execute format(
  $sql$create policy "Allow delete for owner and custom" on public.%1$I for delete to authenticated using (
    exists (
      select 1
      from public.encounter_monster_level eml
        join public.encounter_monster em on em.id = eml.encounter_monster_id
      where eml.id = encounter_monster_level_id
        and em.custom
        and em.user_id = (
          select auth.uid()
        )
    )
  ) $sql$,
  spec.child_table
);
end loop;
end $$;
--------------------------------------------------------------------------------
-- Row Level Security: Active Encounter Tables
--------------------------------------------------------------------------------
alter table public.encounter enable row level security;
alter table public.encounter_active_monster enable row level security;
alter table public.encounter_active_monster_trait enable row level security;
alter table public.encounter_active_monster_mood enable row level security;
alter table public.encounter_survivor enable row level security;
do $$
declare t text;
begin foreach t in array array [
	'encounter',
	'encounter_active_monster',
	'encounter_active_monster_trait',
	'encounter_active_monster_mood',
	'encounter_survivor'
] loop execute format(
  $sql$create policy "Allow select for member" on public.%1$I for
  select to authenticated using (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) $sql$,
    t
);
execute format(
  $sql$create policy "Allow insert for member" on public.%1$I for
  insert to authenticated with check (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) $sql$,
    t
);
execute format(
  $sql$create policy "Allow update for member" on public.%1$I for
  update to authenticated using (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) with check (
      is_settlement_owner(settlement_id)
      or is_settlement_collaborator(settlement_id)
    ) $sql$,
    t
);
execute format(
  $sql$create policy "Allow delete for member" on public.%1$I for delete to authenticated using (
    is_settlement_owner(settlement_id)
    or is_settlement_collaborator(settlement_id)
  ) $sql$,
  t
);
end loop;
end $$;
--------------------------------------------------------------------------------
-- Denormalized Active Encounter Junction Settlement Scope
--------------------------------------------------------------------------------
create or replace function public.set_encounter_active_monster_child_settlement_id() returns trigger language plpgsql security definer
set search_path = '' as $$
declare parent_settlement_id uuid;
begin
select eam.settlement_id into parent_settlement_id
from public.encounter_active_monster eam
where eam.id = new.encounter_active_monster_id
  and (
    auth.role() = 'service_role'
    or auth.role() is null
    or public.is_settlement_owner(eam.settlement_id)
    or public.is_settlement_collaborator(eam.settlement_id)
  );
if parent_settlement_id is null then raise exception 'Invalid parent reference' using errcode = '23503';
end if;
new.settlement_id := parent_settlement_id;
return new;
end;
$$;
create or replace function public.propagate_encounter_active_monster_child_settlement_id() returns trigger language plpgsql security definer
set search_path = '' as $$ begin
update public.encounter_active_monster_trait
set settlement_id = new.settlement_id
where encounter_active_monster_id = new.id;
update public.encounter_active_monster_mood
set settlement_id = new.settlement_id
where encounter_active_monster_id = new.id;
return new;
end;
$$;
revoke all on function public.set_encounter_active_monster_child_settlement_id()
from public;
revoke all on function public.propagate_encounter_active_monster_child_settlement_id()
from public;
create trigger set_settlement_id before
insert
  or
update of encounter_active_monster_id,
  settlement_id on public.encounter_active_monster_trait for each row execute function public.set_encounter_active_monster_child_settlement_id();
create trigger set_settlement_id before
insert
  or
update of encounter_active_monster_id,
  settlement_id on public.encounter_active_monster_mood for each row execute function public.set_encounter_active_monster_child_settlement_id();
create trigger propagate_child_settlement_id
after
update of settlement_id on public.encounter_active_monster for each row
  when (
    old.settlement_id is distinct
    from new.settlement_id
  ) execute function public.propagate_encounter_active_monster_child_settlement_id();
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_hunt_survivor_bleeding_tokens on public.hunt_survivor(bleeding_tokens);
create index idx_encounter_monster_user on public.encounter_monster(user_id);
create index idx_encounter_monster_archived on public.encounter_monster(archived_at);
create index idx_encounter_monster_level_monster on public.encounter_monster_level(encounter_monster_id);
create index idx_encounter_monster_level_level on public.encounter_monster_level(encounter_monster_id, level_number);
create index idx_encounter_monster_level_trait_level on public.encounter_monster_level_trait(encounter_monster_level_id);
create index idx_encounter_monster_level_trait_trait on public.encounter_monster_level_trait(trait_id);
create index idx_encounter_monster_level_mood_level on public.encounter_monster_level_mood(encounter_monster_level_id);
create index idx_encounter_monster_level_mood_mood on public.encounter_monster_level_mood(mood_id);
create index idx_encounter_hunt on public.encounter(hunt_id);
create index idx_encounter_settlement on public.encounter(settlement_id);
create index idx_encounter_active_monster_encounter on public.encounter_active_monster(encounter_id);
create index idx_encounter_active_monster_settlement on public.encounter_active_monster(settlement_id);
create index idx_encounter_active_monster_catalog on public.encounter_active_monster(encounter_monster_id);
create index idx_encounter_active_monster_level on public.encounter_active_monster(encounter_monster_level_id);
create index idx_encounter_active_monster_trait_monster on public.encounter_active_monster_trait(encounter_active_monster_id);
create index idx_encounter_active_monster_trait_settlement on public.encounter_active_monster_trait(settlement_id);
create index idx_encounter_active_monster_trait_trait on public.encounter_active_monster_trait(trait_id);
create index idx_encounter_active_monster_mood_monster on public.encounter_active_monster_mood(encounter_active_monster_id);
create index idx_encounter_active_monster_mood_settlement on public.encounter_active_monster_mood(settlement_id);
create index idx_encounter_active_monster_mood_mood on public.encounter_active_monster_mood(mood_id);
create index idx_encounter_survivor_encounter on public.encounter_survivor(encounter_id);
create index idx_encounter_survivor_settlement on public.encounter_survivor(settlement_id);
create index idx_encounter_survivor_survivor on public.encounter_survivor(survivor_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on public.encounter_monster for each row execute function update_updated_at();
create trigger set_updated_at before
update on public.encounter_monster_level for each row execute function update_updated_at();
create trigger set_updated_at before
update on public.encounter_monster_level_trait for each row execute function update_updated_at();
create trigger set_updated_at before
update on public.encounter_monster_level_mood for each row execute function update_updated_at();
create trigger set_updated_at before
update on public.encounter for each row execute function update_updated_at();
create trigger set_updated_at before
update on public.encounter_active_monster for each row execute function update_updated_at();
create trigger set_updated_at before
update on public.encounter_active_monster_trait for each row execute function update_updated_at();
create trigger set_updated_at before
update on public.encounter_active_monster_mood for each row execute function update_updated_at();
create trigger set_updated_at before
update on public.encounter_survivor for each row execute function update_updated_at();
--------------------------------------------------------------------------------
-- Realtime Publication
--------------------------------------------------------------------------------
alter table public.encounter replica identity full;
alter table public.encounter_active_monster replica identity full;
alter table public.encounter_active_monster_trait replica identity full;
alter table public.encounter_active_monster_mood replica identity full;
alter table public.encounter_survivor replica identity full;
do $$
declare t text;
encounter_realtime_tables text [] := array [
	'encounter_monster',
	'encounter_monster_level',
	'encounter_monster_level_trait',
	'encounter_monster_level_mood',
	'encounter',
	'encounter_active_monster',
	'encounter_active_monster_trait',
	'encounter_active_monster_mood',
	'encounter_survivor'
];
begin foreach t in array encounter_realtime_tables loop if not exists (
  select 1
  from pg_publication_tables
  where pubname = 'supabase_realtime'
    and schemaname = 'public'
    and tablename = t
) then execute format(
  'alter publication supabase_realtime add table public.%I',
  t
);
end if;
end loop;
end $$;