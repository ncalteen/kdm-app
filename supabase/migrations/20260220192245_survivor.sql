--------------------------------------------------------------------------------
-- Survivor Table
-- Represents a survivor associated with a settlement.
--------------------------------------------------------------------------------
create table survivor (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Base Data
  abilities_impairments varchar [] not null default '{}',
  accuracy int not null default 0,
  arc boolean not null default false,
  can_dash boolean not null default false,
  can_dodge boolean not null default false,
  can_fist_pump boolean not null default false,
  can_encourage boolean not null default false,
  can_spend_survival boolean not null default true,
  can_surge boolean not null default false,
  can_use_fighting_arts_knowledges boolean not null default true,
  color color_choice not null default 'slate',
  courage int not null default 0 check (courage >= 0),
  cursed_gear varchar [] not null default '{}',
  dead boolean not null default false,
  disorders varchar [] not null default '{}',
  disposition int,
  evasion int not null default 0,
  fighting_arts varchar [] not null default '{}',
  gender gender not null,
  has_analyze boolean not null default false,
  has_explore boolean not null default false,
  has_matchmaker boolean not null default false,
  has_prepared boolean not null default false,
  has_stalwart boolean not null default false,
  has_tinker boolean not null default false,
  hunt_xp int not null default 0 check (hunt_xp >= 0),
  hunt_xp_rank_up int [] not null default '{}',
  insanity int not null default 0 check (insanity >= 0),
  luck int not null default 0,
  movement int not null default 0,
  next_departure varchar [] not null default '{}',
  notes text not null default '',
  once_per_lifetime varchar [] not null default '{}',
  reroll_used boolean not null default false,
  retired boolean not null default false,
  secret_fighting_arts varchar [] not null default '{}',
  settlement_id uuid not null references settlement(id) on delete cascade,
  skip_next_hunt boolean not null default false,
  speed int not null default 0,
  aenas_state aenas_state,
  strength int not null default 0,
  survival int not null default 0,
  survivor_name varchar,
  understanding int not null default 0,
  wanderer boolean not null default false,
  weapon_proficiency int not null default 0 check (weapon_proficiency >= 0),
  weapon_proficiency_type varchar,
  -- Hunt/Showdown Attributes
  arm_armor int not null default 0 check (arm_armor >= 0),
  arm_light_damage boolean default false,
  arm_heavy_damage boolean default false,
  body_armor int not null default 0 check (body_armor >= 0),
  body_light_damage boolean default false,
  body_heavy_damage boolean default false,
  brain_light_damage boolean default false,
  head_armor int not null default 0 check (head_armor >= 0),
  head_heavy_damage boolean default false,
  leg_armor int not null default 0 check (leg_armor >= 0),
  leg_light_damage boolean default false,
  leg_heavy_damage boolean default false,
  waist_armor int not null default 0 check (waist_armor >= 0),
  waist_light_damage boolean default false,
  waist_heavy_damage boolean default false,
  -- Severe Injuries
  arm_broken int not null default 0,
  arm_contracture int not null default 0,
  arm_dismembered int not null default 0,
  arm_ruptured_muscle boolean not null default false,
  body_broken_rib int not null default 0,
  body_destroyed_back boolean not null default false,
  body_gaping_chest_wound int not null default 0,
  head_blind int not null default 0,
  head_deaf boolean not null default false,
  head_intracranial_hemorrhage boolean not null default false,
  head_shattered_jaw boolean not null default false,
  leg_broken int not null default 0,
  leg_dismembered int not null default 0,
  leg_hamstrung boolean not null default false,
  waist_broken_hip boolean not null default false,
  waist_destroyed_genitals boolean not null default false,
  waist_intestinal_prolapse boolean not null default false,
  waist_warped_pelvis int not null default 0,
  -- Arc Survivors
  can_endure boolean,
  knowledge_1 varchar,
  knowledge_1_observation_conditions text,
  knowledge_1_observation_rank int,
  knowledge_1_rank_up int,
  knowledge_1_rules text,
  knowledge_2 varchar,
  knowledge_2_observation_conditions text,
  knowledge_2_observation_rank int,
  knowledge_2_rank_up int,
  knowledge_2_rules text,
  lumi int,
  neurosis varchar,
  philosophy varchar,
  philosophy_rank int,
  systemic_pressure int,
  tenet_knowledge varchar,
  tenet_knowledge_observation_conditions text,
  tenet_knowledge_observation_rank int,
  tenet_knowledge_rank_up int,
  tenet_knowledge_rules text,
  torment int,
  -- People of the Stars Survivors
  absolute_reaper boolean,
  absolute_rust boolean,
  absolute_storm boolean,
  absolute_witch boolean,
  gambler_reaper boolean,
  gambler_rust boolean,
  gambler_storm boolean,
  gambler_witch boolean,
  goblin_reaper boolean,
  goblin_rust boolean,
  goblin_storm boolean,
  goblin_witch boolean,
  sculptor_reaper boolean,
  sculptor_rust boolean,
  sculptor_storm boolean,
  sculptor_witch boolean,
  -- Squires of the Citadel Survivors
  squire_suspicion_level_1 boolean not null default false,
  squire_suspicion_level_2 boolean not null default false,
  squire_suspicion_level_3 boolean not null default false,
  squire_suspicion_level_4 boolean not null default false
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table survivor enable row level security;
create policy "Allow select for owner" on survivor for
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
create policy "Allow insert for owner" on survivor for
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
create policy "Allow update for owner" on survivor for
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
create policy "Allow delete for owner" on survivor for delete to authenticated using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and s.user_id = (
        select auth.uid()
      )
  )
);
create policy "Allow select for shared" on survivor for
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
create policy "Allow all for admin" on survivor for all using (is_admin()) with check (is_admin());
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_survivor_settlement on survivor(settlement_id);
create index idx_survivor_dead on survivor(dead);
create index idx_survivor_retired on survivor(retired);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on survivor for each row execute function update_updated_at();