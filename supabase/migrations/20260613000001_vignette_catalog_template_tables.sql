--------------------------------------------------------------------------------
-- Vignette Encounter Catalog Tables
-- App-authored one-shot showdown definitions and level setup. These rows are
-- intentionally independent from campaign hunt/showdown/settlement state.
--------------------------------------------------------------------------------
create table vignette_encounter_definition (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	name text not null,
	slug text not null unique,
	description text,
	source_monster_type text not null check (source_monster_type in ('NEMESIS', 'QUARRY')),
	source_nemesis_id uuid references nemesis(id) on delete restrict,
	source_quarry_id uuid references quarry(id) on delete restrict,
	sort_order int not null default 0,
	published boolean not null default false,
	-- Constraints
	constraint vignette_encounter_definition_source_presence check (
		(
			source_monster_type = 'NEMESIS'
			and source_nemesis_id is not null
			and source_quarry_id is null
		)
		or (
			source_monster_type = 'QUARRY'
			and source_quarry_id is not null
			and source_nemesis_id is null
		)
	)
);
--------------------------------------------------------------------------------
-- Vignette Encounter Level
-- Encounter-specific monster level data. This does not mutate or depend on
-- normal quarry_level or nemesis_level rows.
--------------------------------------------------------------------------------
create table vignette_encounter_level (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_definition_id uuid not null references vignette_encounter_definition(id) on delete cascade,
	level_number int not null check (level_number between 1 and 4),
	movement int not null default 0,
	speed int not null default 0,
	accuracy int not null default 0,
	evasion int not null default 0,
	damage int not null default 0,
	toughness int not null default 0,
	wounds int check (
		wounds is null
		or wounds >= 0
	),
	ai_deck_size int check (
		ai_deck_size is null
		or ai_deck_size >= 0
	),
	hit_location_deck_size int check (
		hit_location_deck_size is null
		or hit_location_deck_size >= 0
	),
	basic_action text,
	special_rules text,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_encounter_definition_id, level_number)
);
--------------------------------------------------------------------------------
-- Level Junction Tables
--------------------------------------------------------------------------------
create table vignette_encounter_level_mood (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_level_id uuid not null references vignette_encounter_level(id) on delete cascade,
	mood_id uuid not null references mood(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_encounter_level_id, mood_id)
);

create table vignette_encounter_level_trait (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_level_id uuid not null references vignette_encounter_level(id) on delete cascade,
	trait_id uuid not null references trait(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_encounter_level_id, trait_id)
);

create table vignette_encounter_level_survivor_status (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_level_id uuid not null references vignette_encounter_level(id) on delete cascade,
	survivor_status_id uuid not null references survivor_status(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_encounter_level_id, survivor_status_id)
);
--------------------------------------------------------------------------------
-- Vignette Survivor Templates
--------------------------------------------------------------------------------
create table vignette_survivor_template (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_definition_id uuid not null references vignette_encounter_definition(id) on delete cascade,
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
	body_armor int not null default 0 check (body_armor >= 0),
	head_armor int not null default 0 check (head_armor >= 0),
	leg_armor int not null default 0 check (leg_armor >= 0),
	waist_armor int not null default 0 check (waist_armor >= 0),
	notes text not null default '',
	sort_order int not null default 0
);
--------------------------------------------------------------------------------
-- Vignette Survivor Template Junction Tables
--------------------------------------------------------------------------------
create table vignette_survivor_template_fighting_art (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_survivor_template_id uuid not null references vignette_survivor_template(id) on delete cascade,
	fighting_art_id uuid not null references fighting_art(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_survivor_template_id, fighting_art_id)
);

create table vignette_survivor_template_secret_fighting_art (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_survivor_template_id uuid not null references vignette_survivor_template(id) on delete cascade,
	secret_fighting_art_id uuid not null references secret_fighting_art(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_survivor_template_id, secret_fighting_art_id)
);

create table vignette_survivor_template_disorder (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_survivor_template_id uuid not null references vignette_survivor_template(id) on delete cascade,
	disorder_id uuid not null references disorder(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_survivor_template_id, disorder_id)
);

create table vignette_survivor_template_ability_impairment (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_survivor_template_id uuid not null references vignette_survivor_template(id) on delete cascade,
	ability_impairment_id uuid not null references ability_impairment(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_survivor_template_id, ability_impairment_id)
);

create table vignette_survivor_template_survivor_status (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_survivor_template_id uuid not null references vignette_survivor_template(id) on delete cascade,
	survivor_status_id uuid not null references survivor_status(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	unique (vignette_survivor_template_id, survivor_status_id)
);
--------------------------------------------------------------------------------
-- Vignette Survivor Template Gear Grid
--------------------------------------------------------------------------------
create table vignette_survivor_template_gear_grid (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_survivor_template_id uuid not null references vignette_survivor_template(id) on delete cascade,
	gear_id uuid not null references gear(id) on delete restrict,
	row_number int not null check (row_number between 0 and 2),
	column_number int not null check (column_number between 0 and 2),
	-- Constraints
	unique (vignette_survivor_template_id, row_number, column_number)
);
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table vignette_encounter_definition enable row level security;
alter table vignette_encounter_level enable row level security;
alter table vignette_encounter_level_mood enable row level security;
alter table vignette_encounter_level_trait enable row level security;
alter table vignette_encounter_level_survivor_status enable row level security;
alter table vignette_survivor_template enable row level security;
alter table vignette_survivor_template_fighting_art enable row level security;
alter table vignette_survivor_template_secret_fighting_art enable row level security;
alter table vignette_survivor_template_disorder enable row level security;
alter table vignette_survivor_template_ability_impairment enable row level security;
alter table vignette_survivor_template_survivor_status enable row level security;
alter table vignette_survivor_template_gear_grid enable row level security;

create policy "Allow select for authenticated and published" on vignette_encounter_definition for
select to authenticated using (published);

create policy "Allow select for authenticated and published" on vignette_encounter_level for
select to authenticated using (
		exists (
			select 1
			from vignette_encounter_definition ved
			where ved.id = vignette_encounter_definition_id
				and ved.published
		)
	);

create policy "Allow select for authenticated and published" on vignette_encounter_level_mood for
select to authenticated using (
		exists (
			select 1
			from vignette_encounter_level vel
				join vignette_encounter_definition ved on ved.id = vel.vignette_encounter_definition_id
			where vel.id = vignette_encounter_level_id
				and ved.published
		)
	);

create policy "Allow select for authenticated and published" on vignette_encounter_level_trait for
select to authenticated using (
		exists (
			select 1
			from vignette_encounter_level vel
				join vignette_encounter_definition ved on ved.id = vel.vignette_encounter_definition_id
			where vel.id = vignette_encounter_level_id
				and ved.published
		)
	);

create policy "Allow select for authenticated and published" on vignette_encounter_level_survivor_status for
select to authenticated using (
		exists (
			select 1
			from vignette_encounter_level vel
				join vignette_encounter_definition ved on ved.id = vel.vignette_encounter_definition_id
			where vel.id = vignette_encounter_level_id
				and ved.published
		)
	);

create policy "Allow select for authenticated and published" on vignette_survivor_template for
select to authenticated using (
		exists (
			select 1
			from vignette_encounter_definition ved
			where ved.id = vignette_encounter_definition_id
				and ved.published
		)
	);

create policy "Allow select for authenticated and published" on vignette_survivor_template_fighting_art for
select to authenticated using (
		exists (
			select 1
			from vignette_survivor_template vst
				join vignette_encounter_definition ved on ved.id = vst.vignette_encounter_definition_id
			where vst.id = vignette_survivor_template_id
				and ved.published
		)
	);

create policy "Allow select for authenticated and published" on vignette_survivor_template_secret_fighting_art for
select to authenticated using (
		exists (
			select 1
			from vignette_survivor_template vst
				join vignette_encounter_definition ved on ved.id = vst.vignette_encounter_definition_id
			where vst.id = vignette_survivor_template_id
				and ved.published
		)
	);

create policy "Allow select for authenticated and published" on vignette_survivor_template_disorder for
select to authenticated using (
		exists (
			select 1
			from vignette_survivor_template vst
				join vignette_encounter_definition ved on ved.id = vst.vignette_encounter_definition_id
			where vst.id = vignette_survivor_template_id
				and ved.published
		)
	);

create policy "Allow select for authenticated and published" on vignette_survivor_template_ability_impairment for
select to authenticated using (
		exists (
			select 1
			from vignette_survivor_template vst
				join vignette_encounter_definition ved on ved.id = vst.vignette_encounter_definition_id
			where vst.id = vignette_survivor_template_id
				and ved.published
		)
	);

create policy "Allow select for authenticated and published" on vignette_survivor_template_survivor_status for
select to authenticated using (
		exists (
			select 1
			from vignette_survivor_template vst
				join vignette_encounter_definition ved on ved.id = vst.vignette_encounter_definition_id
			where vst.id = vignette_survivor_template_id
				and ved.published
		)
	);

create policy "Allow select for authenticated and published" on vignette_survivor_template_gear_grid for
select to authenticated using (
		exists (
			select 1
			from vignette_survivor_template vst
				join vignette_encounter_definition ved on ved.id = vst.vignette_encounter_definition_id
			where vst.id = vignette_survivor_template_id
				and ved.published
		)
	);
--------------------------------------------------------------------------------
-- Data API Privileges
--------------------------------------------------------------------------------
grant select on table vignette_encounter_definition to authenticated;
grant select on table vignette_encounter_level to authenticated;
grant select on table vignette_encounter_level_mood to authenticated;
grant select on table vignette_encounter_level_trait to authenticated;
grant select on table vignette_encounter_level_survivor_status to authenticated;
grant select on table vignette_survivor_template to authenticated;
grant select on table vignette_survivor_template_fighting_art to authenticated;
grant select on table vignette_survivor_template_secret_fighting_art to authenticated;
grant select on table vignette_survivor_template_disorder to authenticated;
grant select on table vignette_survivor_template_ability_impairment to authenticated;
grant select on table vignette_survivor_template_survivor_status to authenticated;
grant select on table vignette_survivor_template_gear_grid to authenticated;

revoke insert, update, delete on table vignette_encounter_definition from authenticated;
revoke insert, update, delete on table vignette_encounter_level from authenticated;
revoke insert, update, delete on table vignette_encounter_level_mood from authenticated;
revoke insert, update, delete on table vignette_encounter_level_trait from authenticated;
revoke insert, update, delete on table vignette_encounter_level_survivor_status from authenticated;
revoke insert, update, delete on table vignette_survivor_template from authenticated;
revoke insert, update, delete on table vignette_survivor_template_fighting_art from authenticated;
revoke insert, update, delete on table vignette_survivor_template_secret_fighting_art from authenticated;
revoke insert, update, delete on table vignette_survivor_template_disorder from authenticated;
revoke insert, update, delete on table vignette_survivor_template_ability_impairment from authenticated;
revoke insert, update, delete on table vignette_survivor_template_survivor_status from authenticated;
revoke insert, update, delete on table vignette_survivor_template_gear_grid from authenticated;
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_vignette_encounter_definition_published_sort on vignette_encounter_definition(published, sort_order);
create index idx_vignette_encounter_definition_source_nemesis on vignette_encounter_definition(source_nemesis_id);
create index idx_vignette_encounter_definition_source_quarry on vignette_encounter_definition(source_quarry_id);
create index idx_vignette_encounter_level_definition on vignette_encounter_level(vignette_encounter_definition_id);
create index idx_vignette_encounter_level_mood_level on vignette_encounter_level_mood(vignette_encounter_level_id);
create index idx_vignette_encounter_level_mood_mood on vignette_encounter_level_mood(mood_id);
create index idx_vignette_encounter_level_trait_level on vignette_encounter_level_trait(vignette_encounter_level_id);
create index idx_vignette_encounter_level_trait_trait on vignette_encounter_level_trait(trait_id);
create index idx_vignette_encounter_level_survivor_status_level on vignette_encounter_level_survivor_status(vignette_encounter_level_id);
create index idx_vignette_encounter_level_survivor_status_status on vignette_encounter_level_survivor_status(survivor_status_id);
create index idx_vignette_survivor_template_definition on vignette_survivor_template(vignette_encounter_definition_id);
create index idx_vignette_survivor_template_weapon_type on vignette_survivor_template(weapon_type_id);
create index idx_vignette_survivor_template_fighting_art_template on vignette_survivor_template_fighting_art(vignette_survivor_template_id);
create index idx_vignette_survivor_template_fighting_art_art on vignette_survivor_template_fighting_art(fighting_art_id);
create index idx_vignette_survivor_template_secret_fighting_art_template on vignette_survivor_template_secret_fighting_art(vignette_survivor_template_id);
create index idx_vignette_survivor_template_secret_fighting_art_art on vignette_survivor_template_secret_fighting_art(secret_fighting_art_id);
create index idx_vignette_survivor_template_disorder_template on vignette_survivor_template_disorder(vignette_survivor_template_id);
create index idx_vignette_survivor_template_disorder_disorder on vignette_survivor_template_disorder(disorder_id);
create index idx_vignette_survivor_template_ability_impairment_template on vignette_survivor_template_ability_impairment(vignette_survivor_template_id);
create index idx_vignette_survivor_template_ability_impairment_ability on vignette_survivor_template_ability_impairment(ability_impairment_id);
create index idx_vignette_survivor_template_survivor_status_template on vignette_survivor_template_survivor_status(vignette_survivor_template_id);
create index idx_vignette_survivor_template_survivor_status_status on vignette_survivor_template_survivor_status(survivor_status_id);
create index idx_vignette_survivor_template_gear_grid_template on vignette_survivor_template_gear_grid(vignette_survivor_template_id);
create index idx_vignette_survivor_template_gear_grid_gear on vignette_survivor_template_gear_grid(gear_id);
--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on vignette_encounter_definition for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_encounter_level for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_encounter_level_mood for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_encounter_level_trait for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_encounter_level_survivor_status for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_survivor_template for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_survivor_template_fighting_art for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_survivor_template_secret_fighting_art for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_survivor_template_disorder for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_survivor_template_ability_impairment for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_survivor_template_survivor_status for each row execute function update_updated_at();
create trigger set_updated_at before
update on vignette_survivor_template_gear_grid for each row execute function update_updated_at();
