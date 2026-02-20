-- Aenas State
create type aenas_state as enum ('Content', 'Hungry');
-- Survivor
create table survivor (
  -- IDs
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid not null references settlement(id) on delete cascade,
  -- Base Survivor Data
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
  courage int not null default 0,
  cursed_gear varchar [] not null default '{}',
  dead boolean not null default false,
  disorders varchar [] not null default '{}',
  disposition int not null default 0,
  evasion int not null default 0,
  fighting_arts varchar [] not null default '{}',
  gender gender not null,
  has_analyze boolean not null default false,
  has_explore boolean not null default false,
  has_matchmaker boolean not null default false,
  has_prepared boolean not null default false,
  has_stalwart boolean not null default false,
  has_tinker boolean not null default false,
  hunt_xp int not null default 0,
  hunt_xp_rank_up int [] not null default '{}',
  insanity int not null default 0,
  luck int not null default 0,
  movement int not null default 0,
  next_departure varchar [] not null default '{}',
  notes text not null default '',
  once_per_lifetime varchar [] not null default '{}',
  reroll_used boolean not null default false,
  retired boolean not null default false,
  secret_fighting_arts varchar [] not null default '{}',
  skip_next_hunt boolean not null default false,
  speed int not null default 0,
  aenas_state aenas_state,
  strength int not null default 0,
  survival int not null default 0,
  survivor_name varchar,
  understanding int not null default 0,
  wanderer boolean not null default false,
  weapon_proficiency int not null default 0,
  weapon_proficiency_type varchar,
  -- Hunt/Showdown Attributes
  arm_armor int not null default 0,
  arm_light_damage boolean default false,
  arm_heavy_damage boolean default false,
  body_armor int not null default 0,
  body_light_damage boolean default false,
  body_heavy_damage boolean default false,
  brain_light_damage boolean default false,
  head_armor int not null default 0,
  head_light_damage boolean default false,
  head_heavy_damage boolean default false,
  leg_armor int not null default 0,
  leg_light_damage boolean default false,
  leg_heavy_damage boolean default false,
  waist_armor int not null default 0,
  waist_light_damage boolean default false,
  waist_heavy_damage boolean default false,
  -- Severe Injuries
  arm_boken int not null default 0,
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
  knowledge_1_observaton_conditions text,
  knowledge_1_observation_rank int,
  knowledge_1_rank_up int [],
  knowledge_1_rules text,
  knowledge_2 varchar,
  knowledge_2_observaton_conditions text,
  knowledge_2_observation_rank int,
  knowledge_2_rank_up int [],
  knowledge_2_rules text,
  lumi int,
  neurosis varchar,
  philosophy varchar,
  philosophy_rank int,
  systemic_pressure int,
  tenet_knowledge varchar,
  tenet_knowledge_observaton_conditions text,
  tenet_knowledge_observation_rank int,
  tenet_knowledge_rank_up int [],
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
  sculptor_witch boolean
);
alter table survivor enable row level security;
create policy "Allow all for owner" on survivor for all using (
  auth.uid() = (
    select user_id
    from settlement
    where id = settlement_id
  )
);
create policy "Allow all for shared users" on survivor for all using (
  exists (
    select 1
    from settlement s
    where s.id = settlement_id
      and auth.uid() = any(s.shared_user_ids)
  )
);
-- Indexes
create index idx_survivor_settlement on survivor (settlement_id);