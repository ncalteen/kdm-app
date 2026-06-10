--------------------------------------------------------------------------------
-- Vignette Encounter Instance Tables
-- User-owned mutable one-shot showdown state copied from published templates.
-- These rows intentionally stay separate from settlement, hunt, and showdown
-- campaign tables.
--------------------------------------------------------------------------------
create table vignette_encounter (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Owner Data
	user_id uuid not null references auth.users(id) on delete cascade,
	-- Data
	vignette_encounter_definition_id uuid not null references vignette_encounter_definition(id) on delete restrict,
	vignette_encounter_level_id uuid not null references vignette_encounter_level(id) on delete restrict,
	status text not null default 'ACTIVE' check (status in ('ACTIVE', 'ENDED')),
	round int not null default 1 check (round >= 1),
	turn showdown_turn not null default 'MONSTER',
	notes text not null default '',
	ended_at timestamptz,
	-- Constraints
	constraint vignette_encounter_lifecycle check (
		(
			status = 'ACTIVE'
			and ended_at is null
		)
		or (
			status = 'ENDED'
			and ended_at is not null
		)
	)
);
--------------------------------------------------------------------------------
-- Vignette Encounter Monster
--------------------------------------------------------------------------------
create table vignette_encounter_monster (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_id uuid not null unique references vignette_encounter(id) on delete cascade,
	current_wounds int check (
		current_wounds is null
		or current_wounds >= 0
	),
	current_ai_cards int check (
		current_ai_cards is null
		or current_ai_cards >= 0
	),
	current_hit_location_cards int check (
		current_hit_location_cards is null
		or current_hit_location_cards >= 0
	),
	knocked_down boolean not null default false,
	notes text not null default ''
);
--------------------------------------------------------------------------------
-- Vignette Encounter Survivors
--------------------------------------------------------------------------------
create table vignette_encounter_survivor (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_id uuid not null references vignette_encounter(id) on delete cascade,
	vignette_survivor_template_id uuid references vignette_survivor_template(id) on delete set null,
	survivor_name varchar not null check (char_length(survivor_name) <= 100),
	survivor_type survivor_type not null default 'CORE',
	gender gender,
	movement int not null default 5,
	accuracy int not null default 0,
	strength int not null default 0,
	evasion int not null default 0,
	luck int not null default 0,
	speed int not null default 0,
	survival int not null default 0 check (survival >= 0),
	insanity int not null default 0 check (insanity >= 0),
	courage int not null default 0 check (courage >= 0),
	understanding int not null default 0 check (understanding >= 0),
	weapon_proficiency int not null default 0 check (
		weapon_proficiency >= 0
		and weapon_proficiency <= 8
	),
	weapon_type_id uuid references weapon_type(id) on delete set null,
	arm_armor int not null default 0 check (arm_armor >= 0),
	arm_light_damage boolean not null default false,
	arm_heavy_damage boolean not null default false,
	body_armor int not null default 0 check (body_armor >= 0),
	body_light_damage boolean not null default false,
	body_heavy_damage boolean not null default false,
	brain_light_damage boolean not null default false,
	head_armor int not null default 0 check (head_armor >= 0),
	head_heavy_damage boolean not null default false,
	leg_armor int not null default 0 check (leg_armor >= 0),
	leg_light_damage boolean not null default false,
	leg_heavy_damage boolean not null default false,
	waist_armor int not null default 0 check (waist_armor >= 0),
	waist_light_damage boolean not null default false,
	waist_heavy_damage boolean not null default false,
	accuracy_tokens int not null default 0,
	activation_used boolean not null default false,
	bleeding_tokens int not null default 0 check (bleeding_tokens >= 0),
	block_tokens int not null default 0,
	deflect_tokens int not null default 0,
	evasion_tokens int not null default 0,
	insanity_tokens int not null default 0,
	knocked_down boolean not null default false,
	luck_tokens int not null default 0,
	movement_tokens int not null default 0,
	movement_used boolean not null default false,
	speed_tokens int not null default 0,
	strength_tokens int not null default 0,
	survival_tokens int not null default 0,
	dead boolean not null default false,
	retired boolean not null default false,
	notes text not null default '',
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_encounter_id, vignette_survivor_template_id)
);
--------------------------------------------------------------------------------
-- Vignette Encounter Survivor Junction Tables
--------------------------------------------------------------------------------
create table vignette_encounter_survivor_fighting_art (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_survivor_id uuid not null references vignette_encounter_survivor(id) on delete cascade,
	fighting_art_id uuid not null references fighting_art(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_encounter_survivor_id, fighting_art_id)
);

create table vignette_encounter_survivor_secret_fighting_art (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_survivor_id uuid not null references vignette_encounter_survivor(id) on delete cascade,
	secret_fighting_art_id uuid not null references secret_fighting_art(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_encounter_survivor_id, secret_fighting_art_id)
);

create table vignette_encounter_survivor_disorder (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_survivor_id uuid not null references vignette_encounter_survivor(id) on delete cascade,
	disorder_id uuid not null references disorder(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_encounter_survivor_id, disorder_id)
);

create table vignette_encounter_survivor_ability_impairment (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_survivor_id uuid not null references vignette_encounter_survivor(id) on delete cascade,
	ability_impairment_id uuid not null references ability_impairment(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_encounter_survivor_id, ability_impairment_id)
);

create table vignette_encounter_survivor_status (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_survivor_id uuid not null references vignette_encounter_survivor(id) on delete cascade,
	survivor_status_id uuid not null references survivor_status(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_encounter_survivor_id, survivor_status_id)
);
--------------------------------------------------------------------------------
-- Vignette Encounter Gear Grid
--------------------------------------------------------------------------------
create table vignette_encounter_gear_grid (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_survivor_id uuid not null references vignette_encounter_survivor(id) on delete cascade,
	gear_id uuid not null references gear(id) on delete restrict,
	row_number int not null check (row_number between 0 and 2),
	column_number int not null check (column_number between 0 and 2),
	-- Constraints
	unique (vignette_encounter_survivor_id, row_number, column_number)
);
--------------------------------------------------------------------------------
-- Row Level Security
-- Detailed owner/collaborator policies are added in VIG-01.03. Until then,
-- RLS remains enabled with no row access policies.
--------------------------------------------------------------------------------
alter table vignette_encounter enable row level security;
alter table vignette_encounter_monster enable row level security;
alter table vignette_encounter_survivor enable row level security;
alter table vignette_encounter_survivor_fighting_art enable row level security;
alter table vignette_encounter_survivor_secret_fighting_art enable row level security;
alter table vignette_encounter_survivor_disorder enable row level security;
alter table vignette_encounter_survivor_ability_impairment enable row level security;
alter table vignette_encounter_survivor_status enable row level security;
alter table vignette_encounter_gear_grid enable row level security;
--------------------------------------------------------------------------------
-- Data API Privileges
-- Table privileges are in place for PostgREST exposure; RLS policies still
-- control row access and are intentionally absent until VIG-01.03.
--------------------------------------------------------------------------------
grant select, insert, update, delete on table vignette_encounter to authenticated;
grant select, insert, update, delete on table vignette_encounter_monster to authenticated;
grant select, insert, update, delete on table vignette_encounter_survivor to authenticated;
grant select, insert, update, delete on table vignette_encounter_survivor_fighting_art to authenticated;
grant select, insert, update, delete on table vignette_encounter_survivor_secret_fighting_art to authenticated;
grant select, insert, update, delete on table vignette_encounter_survivor_disorder to authenticated;
grant select, insert, update, delete on table vignette_encounter_survivor_ability_impairment to authenticated;
grant select, insert, update, delete on table vignette_encounter_survivor_status to authenticated;
grant select, insert, update, delete on table vignette_encounter_gear_grid to authenticated;
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create unique index one_active_vignette_encounter_per_user on vignette_encounter(user_id)
where status = 'ACTIVE';
create index idx_vignette_encounter_user on vignette_encounter(user_id);
create index idx_vignette_encounter_definition on vignette_encounter(vignette_encounter_definition_id);
create index idx_vignette_encounter_level on vignette_encounter(vignette_encounter_level_id);
create index idx_vignette_encounter_status on vignette_encounter(status);
create index idx_vignette_encounter_survivor_encounter on vignette_encounter_survivor(vignette_encounter_id);
create index idx_vignette_encounter_survivor_template on vignette_encounter_survivor(vignette_survivor_template_id);
create index idx_vignette_encounter_survivor_weapon_type on vignette_encounter_survivor(weapon_type_id);
create index idx_vignette_encounter_survivor_fighting_art_survivor on vignette_encounter_survivor_fighting_art(vignette_encounter_survivor_id);
create index idx_vignette_encounter_survivor_fighting_art_art on vignette_encounter_survivor_fighting_art(fighting_art_id);
create index idx_vignette_encounter_survivor_secret_fighting_art_survivor on vignette_encounter_survivor_secret_fighting_art(vignette_encounter_survivor_id);
create index idx_vignette_encounter_survivor_secret_fighting_art_art on vignette_encounter_survivor_secret_fighting_art(secret_fighting_art_id);
create index idx_vignette_encounter_survivor_disorder_survivor on vignette_encounter_survivor_disorder(vignette_encounter_survivor_id);
create index idx_vignette_encounter_survivor_disorder_disorder on vignette_encounter_survivor_disorder(disorder_id);
create index idx_vignette_encounter_survivor_ability_impairment_survivor on vignette_encounter_survivor_ability_impairment(vignette_encounter_survivor_id);
create index idx_vignette_encounter_survivor_ability_impairment_ability on vignette_encounter_survivor_ability_impairment(ability_impairment_id);
create index idx_vignette_encounter_survivor_status_survivor on vignette_encounter_survivor_status(vignette_encounter_survivor_id);
create index idx_vignette_encounter_survivor_status_status on vignette_encounter_survivor_status(survivor_status_id);
create index idx_vignette_encounter_gear_grid_survivor on vignette_encounter_gear_grid(vignette_encounter_survivor_id);
create index idx_vignette_encounter_gear_grid_gear on vignette_encounter_gear_grid(gear_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on vignette_encounter for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_encounter_monster for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_encounter_survivor for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_encounter_survivor_fighting_art for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_encounter_survivor_secret_fighting_art for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_encounter_survivor_disorder for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_encounter_survivor_ability_impairment for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_encounter_survivor_status for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_encounter_gear_grid for each row execute function update_updated_at();
