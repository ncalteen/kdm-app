--------------------------------------------------------------------------------
-- Reshape Vignette Encounter Tables
-- Vignette tables are empty in current environments, so this migration drops
-- the provisional VIG-01 tables and recreates the final catalog and active
-- encounter schema directly.
--------------------------------------------------------------------------------

do $$
declare
	vignette_table_name text;
	vignette_realtime_tables text [] := array [
		'vignette_encounter',
		'vignette_encounter_ai_deck',
		'vignette_encounter_monster',
		'vignette_encounter_survivor',
		'vignette_encounter_survivor_fighting_art',
		'vignette_encounter_survivor_secret_fighting_art',
		'vignette_encounter_survivor_disorder',
		'vignette_encounter_survivor_ability_impairment',
		'vignette_encounter_survivor_status',
		'vignette_encounter_gear_grid',
		'vignette_encounter_survivor_gear_grid',
		'vignette_encounter_shared_user'
	];
begin
	if exists (
		select 1
		from pg_publication
		where pubname = 'supabase_realtime'
	) then
		foreach vignette_table_name in array vignette_realtime_tables loop
			if exists (
				select 1
				from pg_publication_tables
				where pubname = 'supabase_realtime'
					and schemaname = 'public'
					and tablename = vignette_table_name
			) then
				execute format(
					'alter publication supabase_realtime drop table public.%I',
					vignette_table_name
				);
			end if;
		end loop;
	end if;
end $$;

drop function if exists public.can_update_vignette_encounter_as_collaborator(uuid, uuid, uuid, uuid, text, timestamptz) cascade;
drop function if exists public.can_update_vignette_encounter_as_collaborator(uuid, uuid, uuid, int) cascade;
drop function if exists public.can_access_active_vignette_encounter(uuid) cascade;
drop function if exists public.is_active_vignette_encounter_owner(uuid) cascade;
drop function if exists public.is_vignette_encounter_collaborator(uuid) cascade;
drop function if exists public.is_vignette_encounter_owner(uuid) cascade;
drop function if exists public.can_share_vignette_encounters(uuid) cascade;
drop function if exists public.validate_vignette_encounter_level_monster_source() cascade;
drop function if exists public.validate_vignette_encounter_monster_level_source() cascade;
drop function if exists public.validate_vignette_encounter_level() cascade;
drop function if exists public.validate_vignette_encounter_monster_ai_deck() cascade;
drop function if exists public.validate_vignette_encounter_survivor_monster() cascade;

drop table if exists
	public.vignette_encounter_shared_user,
	public.vignette_encounter_survivor_gear_grid,
	public.vignette_encounter_gear_grid,
	public.vignette_encounter_survivor_status,
	public.vignette_encounter_survivor_ability_impairment,
	public.vignette_encounter_survivor_disorder,
	public.vignette_encounter_survivor_secret_fighting_art,
	public.vignette_encounter_survivor_fighting_art,
	public.vignette_encounter_survivor,
	public.vignette_encounter_monster,
	public.vignette_encounter_ai_deck,
	public.vignette_encounter,
	public.vignette_survivor_gear_grid,
	public.vignette_survivor_template_gear_grid,
	public.vignette_survivor_ability_impairment,
	public.vignette_survivor_template_ability_impairment,
	public.vignette_survivor_disorder,
	public.vignette_survivor_template_disorder,
	public.vignette_survivor_secret_fighting_art,
	public.vignette_survivor_template_secret_fighting_art,
	public.vignette_survivor_fighting_art,
	public.vignette_survivor_template_fighting_art,
	public.vignette_survivor_template_survivor_status,
	public.vignette_survivor,
	public.vignette_survivor_template,
	public.vignette_monster_level_survivor_status,
	public.vignette_encounter_level_survivor_status,
	public.vignette_monster_level_trait,
	public.vignette_encounter_level_trait,
	public.vignette_monster_level_mood,
	public.vignette_encounter_level_mood,
	public.vignette_encounter_level_monster,
	public.vignette_monster_level,
	public.vignette_encounter_level,
	public.vignette_monster,
	public.vignette_encounter_definition cascade;

--------------------------------------------------------------------------------
-- Vignette Monster Catalog
--------------------------------------------------------------------------------
create table public.vignette_monster (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	monster_name varchar not null,
	multi_monster boolean not null default false,
	source_monster_type text not null check (source_monster_type in ('NEMESIS', 'QUARRY')),
	source_nemesis_id uuid references public.nemesis(id) on delete restrict,
	source_quarry_id uuid references public.quarry(id) on delete restrict,
	-- Constraints
	constraint vignette_monster_source_presence check (
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
-- Vignette Monster Level Catalog
--------------------------------------------------------------------------------
create table public.vignette_monster_level (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- AI Deck Data
	ai_deck_remaining int not null default 0 check (ai_deck_remaining >= 0),
	basic_cards int not null default 0 check (basic_cards >= 0),
	advanced_cards int not null default 0 check (advanced_cards >= 0),
	legendary_cards int not null default 0 check (legendary_cards >= 0),
	overtone_cards int not null default 0 check (overtone_cards >= 0),
	-- Base Data
	accuracy int not null default 0,
	accuracy_tokens int not null default 0,
	damage int not null default 0,
	damage_tokens int not null default 0,
	evasion int not null default 0,
	evasion_tokens int not null default 0,
	level_number int not null check (level_number between 1 and 4),
	life int check (
		life is null
		or life >= 0
	),
	luck int not null default 0,
	luck_tokens int not null default 0,
	movement int not null default 1,
	movement_tokens int not null default 0,
	sub_monster_name varchar,
	speed int not null default 0,
	speed_tokens int not null default 0,
	strength int not null default 0,
	strength_tokens int not null default 0,
	toughness int not null default 0,
	toughness_tokens int not null default 0,
	vignette_monster_id uuid not null references public.vignette_monster(id) on delete cascade
);

create table public.vignette_monster_level_mood (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	mood_id uuid not null references public.mood(id) on delete restrict,
	vignette_monster_level_id uuid not null references public.vignette_monster_level(id) on delete cascade,
	-- Constraints
	unique (vignette_monster_level_id, mood_id)
);

create table public.vignette_monster_level_trait (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	trait_id uuid not null references public.trait(id) on delete restrict,
	vignette_monster_level_id uuid not null references public.vignette_monster_level(id) on delete cascade,
	-- Constraints
	unique (vignette_monster_level_id, trait_id)
);

create table public.vignette_monster_level_survivor_status (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	survivor_status_id uuid not null references public.survivor_status(id) on delete restrict,
	vignette_monster_level_id uuid not null references public.vignette_monster_level(id) on delete cascade,
	-- Constraints
	unique (vignette_monster_level_id, survivor_status_id)
);

--------------------------------------------------------------------------------
-- Vignette Survivor Catalog
--------------------------------------------------------------------------------
create table public.vignette_survivor (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_monster_id uuid not null references public.vignette_monster(id) on delete cascade,
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
	weapon_type_id uuid references public.weapon_type(id) on delete set null,
	arm_armor int not null default 0 check (arm_armor >= 0),
	body_armor int not null default 0 check (body_armor >= 0),
	head_armor int not null default 0 check (head_armor >= 0),
	leg_armor int not null default 0 check (leg_armor >= 0),
	waist_armor int not null default 0 check (waist_armor >= 0),
	notes text not null default ''
);

create table public.vignette_survivor_ability_impairment (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_survivor_id uuid not null references public.vignette_survivor(id) on delete cascade,
	ability_impairment_id uuid not null references public.ability_impairment(id) on delete restrict,
	-- Constraints
	unique (vignette_survivor_id, ability_impairment_id)
);

create table public.vignette_survivor_disorder (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_survivor_id uuid not null references public.vignette_survivor(id) on delete cascade,
	disorder_id uuid not null references public.disorder(id) on delete restrict,
	-- Constraints
	unique (vignette_survivor_id, disorder_id)
);

create table public.vignette_survivor_fighting_art (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_survivor_id uuid not null references public.vignette_survivor(id) on delete cascade,
	fighting_art_id uuid not null references public.fighting_art(id) on delete restrict,
	-- Constraints
	unique (vignette_survivor_id, fighting_art_id)
);

create table public.vignette_survivor_secret_fighting_art (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	secret_fighting_art_id uuid not null references public.secret_fighting_art(id) on delete restrict,
	vignette_survivor_id uuid not null references public.vignette_survivor(id) on delete cascade,
	-- Constraints
	unique (vignette_survivor_id, secret_fighting_art_id)
);

create table public.vignette_survivor_gear_grid (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_survivor_id uuid not null references public.vignette_survivor(id) on delete cascade,
	gear_id uuid not null references public.gear(id) on delete restrict,
	row_number int not null check (row_number between 0 and 2),
	column_number int not null check (column_number between 0 and 2),
	-- Constraints
	unique (vignette_survivor_id, row_number, column_number)
);

--------------------------------------------------------------------------------
-- Active Vignette Encounter Tables
--------------------------------------------------------------------------------
create table public.vignette_encounter (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Owner Data
	user_id uuid not null references auth.users(id) on delete cascade,
	-- Data
	vignette_monster_id uuid not null references public.vignette_monster(id) on delete restrict,
	level_number int not null check (level_number between 1 and 4),
	turn showdown_turn not null default 'MONSTER',
	notes text not null default ''
);

create table public.vignette_encounter_ai_deck (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	basic_cards int not null default 0 check (basic_cards >= 0),
	advanced_cards int not null default 0 check (advanced_cards >= 0),
	legendary_cards int not null default 0 check (legendary_cards >= 0),
	overtone_cards int not null default 0 check (overtone_cards >= 0),
	vignette_encounter_id uuid not null references public.vignette_encounter(id) on delete cascade
);

create table public.vignette_encounter_monster (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	accuracy int not null default 0,
	accuracy_tokens int not null default 0,
	ai_card_drawn boolean not null default false,
	ai_deck_id uuid not null references public.vignette_encounter_ai_deck(id) on delete cascade,
	ai_deck_remaining int not null default 0 check (ai_deck_remaining >= 0),
	damage int not null default 0,
	damage_tokens int not null default 0,
	evasion int not null default 0,
	evasion_tokens int not null default 0,
	knocked_down boolean not null default false,
	luck int not null default 0,
	luck_tokens int not null default 0,
	monster_name varchar,
	movement int not null default 1,
	movement_tokens int not null default 0,
	notes text not null default '',
	speed int not null default 0,
	speed_tokens int not null default 0,
	strength int not null default 0,
	strength_tokens int not null default 0,
	toughness int not null default 0,
	toughness_tokens int not null default 0,
	vignette_encounter_id uuid not null references public.vignette_encounter(id) on delete cascade,
	wounds int not null default 0 check (wounds >= 0),
	-- Constraints
	unique (ai_deck_id)
);

create table public.vignette_encounter_survivor (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_monster_id uuid not null references public.vignette_monster(id) on delete restrict,
	vignette_encounter_id uuid not null references public.vignette_encounter(id) on delete cascade,
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
	weapon_type_id uuid references public.weapon_type(id) on delete set null,
	arm_armor int not null default 0 check (arm_armor >= 0),
	body_armor int not null default 0 check (body_armor >= 0),
	head_armor int not null default 0 check (head_armor >= 0),
	leg_armor int not null default 0 check (leg_armor >= 0),
	waist_armor int not null default 0 check (waist_armor >= 0),
	notes text not null default ''
);

create table public.vignette_encounter_survivor_ability_impairment (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_survivor_id uuid not null references public.vignette_encounter_survivor(id) on delete cascade,
	ability_impairment_id uuid not null references public.ability_impairment(id) on delete restrict,
	-- Constraints
	unique (vignette_encounter_survivor_id, ability_impairment_id)
);

create table public.vignette_encounter_survivor_disorder (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_survivor_id uuid not null references public.vignette_encounter_survivor(id) on delete cascade,
	disorder_id uuid not null references public.disorder(id) on delete restrict,
	-- Constraints
	unique (vignette_encounter_survivor_id, disorder_id)
);

create table public.vignette_encounter_survivor_fighting_art (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_survivor_id uuid not null references public.vignette_encounter_survivor(id) on delete cascade,
	fighting_art_id uuid not null references public.fighting_art(id) on delete restrict,
	-- Constraints
	unique (vignette_encounter_survivor_id, fighting_art_id)
);

create table public.vignette_encounter_survivor_secret_fighting_art (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_survivor_id uuid not null references public.vignette_encounter_survivor(id) on delete cascade,
	secret_fighting_art_id uuid not null references public.secret_fighting_art(id) on delete restrict,
	-- Constraints
	unique (vignette_encounter_survivor_id, secret_fighting_art_id)
);

create table public.vignette_encounter_survivor_gear_grid (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_survivor_id uuid not null references public.vignette_encounter_survivor(id) on delete cascade,
	gear_id uuid not null references public.gear(id) on delete restrict,
	row_number int not null check (row_number between 0 and 2),
	column_number int not null check (column_number between 0 and 2),
	-- Constraints
	unique (vignette_encounter_survivor_id, row_number, column_number)
);

create table public.vignette_encounter_shared_user (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_id uuid not null references public.vignette_encounter(id) on delete cascade,
	shared_user_id uuid not null references auth.users(id) on delete cascade,
	-- Constraints
	unique (vignette_encounter_id, shared_user_id),
	constraint fk_vignette_encounter_shared_user_settings foreign key (shared_user_id) references public.user_settings(user_id) on delete cascade
);

--------------------------------------------------------------------------------
-- Validation Helpers
--------------------------------------------------------------------------------
create or replace function public.validate_vignette_encounter_level() returns trigger language plpgsql security invoker
set search_path = public as $$
begin
	if not exists (
		select 1
		from vignette_monster_level vml
		where vml.vignette_monster_id = new.vignette_monster_id
			and vml.level_number = new.level_number
	) then
		raise exception 'Vignette encounter level must belong to the selected vignette monster' using errcode = '23514';
	end if;

	return new;
end;
$$;

create or replace function public.validate_vignette_encounter_monster_ai_deck() returns trigger language plpgsql security invoker
set search_path = public as $$
begin
	if not exists (
		select 1
		from vignette_encounter_ai_deck vead
		where vead.id = new.ai_deck_id
			and vead.vignette_encounter_id = new.vignette_encounter_id
	) then
		raise exception 'Vignette encounter monster AI deck must belong to the same encounter' using errcode = '23514';
	end if;

	return new;
end;
$$;

create or replace function public.validate_vignette_encounter_survivor_monster() returns trigger language plpgsql security invoker
set search_path = public as $$
begin
	if not exists (
		select 1
		from vignette_encounter ve
		where ve.id = new.vignette_encounter_id
			and ve.vignette_monster_id = new.vignette_monster_id
	) then
		raise exception 'Vignette encounter survivor must belong to the selected vignette monster' using errcode = '23514';
	end if;

	return new;
end;
$$;

revoke all on function public.validate_vignette_encounter_level()
from public;
revoke execute on function public.validate_vignette_encounter_level()
from anon,
	authenticated;

revoke all on function public.validate_vignette_encounter_monster_ai_deck()
from public;
revoke execute on function public.validate_vignette_encounter_monster_ai_deck()
from anon,
	authenticated;

revoke all on function public.validate_vignette_encounter_survivor_monster()
from public;
revoke execute on function public.validate_vignette_encounter_survivor_monster()
from anon,
	authenticated;

create trigger validate_vignette_encounter_level before
insert
	or
update on public.vignette_encounter for each row execute function public.validate_vignette_encounter_level();

create trigger validate_vignette_encounter_monster_ai_deck before
insert
	or
update on public.vignette_encounter_monster for each row execute function public.validate_vignette_encounter_monster_ai_deck();

create trigger validate_vignette_encounter_survivor_monster before
insert
	or
update on public.vignette_encounter_survivor for each row execute function public.validate_vignette_encounter_survivor_monster();

--------------------------------------------------------------------------------
-- Sharing And Access Helpers
--------------------------------------------------------------------------------
create or replace function public.is_vignette_encounter_owner(target_vignette_encounter uuid) returns boolean language sql stable security definer
set search_path = '' as $$
select exists (
		select 1
		from public.vignette_encounter ve
		where ve.id = target_vignette_encounter
			and ve.user_id = (
				select auth.uid()
			)
	);
$$;

create or replace function public.is_vignette_encounter_collaborator(target_vignette_encounter uuid) returns boolean language sql stable security definer
set search_path = '' as $$
select exists (
		select 1
		from public.vignette_encounter_shared_user vesu
		where vesu.vignette_encounter_id = target_vignette_encounter
			and vesu.shared_user_id = (
				select auth.uid()
			)
	);
$$;

create or replace function public.is_active_vignette_encounter_owner(target_vignette_encounter uuid) returns boolean language sql stable security definer
set search_path = '' as $$
select public.is_vignette_encounter_owner(target_vignette_encounter);
$$;

create or replace function public.can_access_active_vignette_encounter(target_vignette_encounter uuid) returns boolean language sql stable security definer
set search_path = '' as $$
select public.is_vignette_encounter_owner(target_vignette_encounter)
	or public.is_vignette_encounter_collaborator(target_vignette_encounter);
$$;

create or replace function public.can_update_vignette_encounter_as_collaborator(
	target_vignette_encounter uuid,
	proposed_user_id uuid,
	proposed_vignette_monster_id uuid,
	proposed_level_number int
) returns boolean language sql stable security definer
set search_path = '' as $$
select exists (
		select 1
		from public.vignette_encounter ve
		where ve.id = target_vignette_encounter
			and ve.user_id = proposed_user_id
			and ve.vignette_monster_id = proposed_vignette_monster_id
			and ve.level_number = proposed_level_number
			and exists (
				select 1
				from public.vignette_encounter_shared_user vesu
				where vesu.vignette_encounter_id = ve.id
					and vesu.shared_user_id = (
						select auth.uid()
					)
			)
	);
$$;

create or replace function public.can_share_vignette_encounters(target_user_id uuid) returns boolean language sql stable security definer
set search_path = '' as $$
select coalesce(
		(
			select us.plan_id = 'lantern_hoard'
			from public.user_subscription us
			where us.user_id = target_user_id
				and target_user_id = (
					select auth.uid()
				)
				and us.status in ('active', 'trialing')
		),
		false
	);
$$;

revoke all on function public.is_vignette_encounter_owner(uuid)
from public;
revoke execute on function public.is_vignette_encounter_owner(uuid)
from anon;
grant execute on function public.is_vignette_encounter_owner(uuid) to authenticated;

revoke all on function public.is_vignette_encounter_collaborator(uuid)
from public;
revoke execute on function public.is_vignette_encounter_collaborator(uuid)
from anon;
grant execute on function public.is_vignette_encounter_collaborator(uuid) to authenticated;

revoke all on function public.is_active_vignette_encounter_owner(uuid)
from public;
revoke execute on function public.is_active_vignette_encounter_owner(uuid)
from anon;
grant execute on function public.is_active_vignette_encounter_owner(uuid) to authenticated;

revoke all on function public.can_access_active_vignette_encounter(uuid)
from public;
revoke execute on function public.can_access_active_vignette_encounter(uuid)
from anon;
grant execute on function public.can_access_active_vignette_encounter(uuid) to authenticated;

revoke all on function public.can_update_vignette_encounter_as_collaborator(uuid, uuid, uuid, int)
from public;
revoke execute on function public.can_update_vignette_encounter_as_collaborator(uuid, uuid, uuid, int)
from anon;
grant execute on function public.can_update_vignette_encounter_as_collaborator(uuid, uuid, uuid, int) to authenticated;

revoke all on function public.can_share_vignette_encounters(uuid)
from public;
revoke execute on function public.can_share_vignette_encounters(uuid)
from anon;
grant execute on function public.can_share_vignette_encounters(uuid) to authenticated;

--------------------------------------------------------------------------------
-- Row Level Security
--------------------------------------------------------------------------------
alter table public.vignette_monster enable row level security;
alter table public.vignette_monster_level enable row level security;
alter table public.vignette_monster_level_mood enable row level security;
alter table public.vignette_monster_level_trait enable row level security;
alter table public.vignette_monster_level_survivor_status enable row level security;
alter table public.vignette_survivor enable row level security;
alter table public.vignette_survivor_ability_impairment enable row level security;
alter table public.vignette_survivor_disorder enable row level security;
alter table public.vignette_survivor_fighting_art enable row level security;
alter table public.vignette_survivor_secret_fighting_art enable row level security;
alter table public.vignette_survivor_gear_grid enable row level security;
alter table public.vignette_encounter enable row level security;
alter table public.vignette_encounter_ai_deck enable row level security;
alter table public.vignette_encounter_monster enable row level security;
alter table public.vignette_encounter_survivor enable row level security;
alter table public.vignette_encounter_survivor_ability_impairment enable row level security;
alter table public.vignette_encounter_survivor_disorder enable row level security;
alter table public.vignette_encounter_survivor_fighting_art enable row level security;
alter table public.vignette_encounter_survivor_secret_fighting_art enable row level security;
alter table public.vignette_encounter_survivor_gear_grid enable row level security;
alter table public.vignette_encounter_shared_user enable row level security;

do $$
declare
	table_name text;
begin
	foreach table_name in array array[
		'vignette_monster',
		'vignette_monster_level',
		'vignette_monster_level_mood',
		'vignette_monster_level_trait',
		'vignette_monster_level_survivor_status',
		'vignette_survivor',
		'vignette_survivor_ability_impairment',
		'vignette_survivor_disorder',
		'vignette_survivor_fighting_art',
		'vignette_survivor_secret_fighting_art',
		'vignette_survivor_gear_grid'
	] loop
		execute format(
			'create policy "Allow select for authenticated" on public.%I for select to authenticated using (true)',
			table_name
		);
	end loop;
end $$;

create policy "Allow select for active member" on public.vignette_encounter for
select to authenticated using (public.can_access_active_vignette_encounter(id));

create policy "Allow insert for owner" on public.vignette_encounter for
insert to authenticated with check (
		user_id = (
			select auth.uid()
		)
		and exists (
			select 1
			from public.vignette_monster_level vml
			where vml.vignette_monster_id = vignette_encounter.vignette_monster_id
				and vml.level_number = vignette_encounter.level_number
		)
	);

create policy "Allow update for active member" on public.vignette_encounter for
update to authenticated using (public.can_access_active_vignette_encounter(id)) with check (
		(
			user_id = (
				select auth.uid()
			)
			and exists (
				select 1
				from public.vignette_monster_level vml
				where vml.vignette_monster_id = vignette_encounter.vignette_monster_id
					and vml.level_number = vignette_encounter.level_number
			)
		)
		or public.can_update_vignette_encounter_as_collaborator(
			id,
			user_id,
			vignette_monster_id,
			level_number
		)
	);

create policy "Allow delete for active owner" on public.vignette_encounter for delete to authenticated using (public.is_active_vignette_encounter_owner(id));

do $$
declare
	table_name text;
begin
	foreach table_name in array array[
		'vignette_encounter_ai_deck',
		'vignette_encounter_monster',
		'vignette_encounter_survivor'
	] loop
		execute format(
			'create policy "Allow select for active member" on public.%1$I for select to authenticated using (public.can_access_active_vignette_encounter(vignette_encounter_id))',
			table_name
		);

		execute format(
			'create policy "Allow insert for active owner" on public.%1$I for insert to authenticated with check (public.is_active_vignette_encounter_owner(vignette_encounter_id))',
			table_name
		);

		execute format(
			'create policy "Allow update for active member" on public.%1$I for update to authenticated using (public.can_access_active_vignette_encounter(vignette_encounter_id)) with check (public.can_access_active_vignette_encounter(vignette_encounter_id))',
			table_name
		);

		execute format(
			'create policy "Allow delete for active owner" on public.%1$I for delete to authenticated using (public.is_active_vignette_encounter_owner(vignette_encounter_id))',
			table_name
		);
	end loop;
end $$;

do $$
declare
	table_name text;
begin
	foreach table_name in array array[
		'vignette_encounter_survivor_ability_impairment',
		'vignette_encounter_survivor_disorder',
		'vignette_encounter_survivor_fighting_art',
		'vignette_encounter_survivor_secret_fighting_art',
		'vignette_encounter_survivor_gear_grid'
	] loop
		execute format(
			$sql$create policy "Allow select for active member" on public.%1$I for
select to authenticated using (
	exists (
		select 1
		from public.vignette_encounter_survivor ves
		where ves.id = %1$I.vignette_encounter_survivor_id
			and public.can_access_active_vignette_encounter(ves.vignette_encounter_id)
	)
)$sql$,
			table_name
		);

		execute format(
			$sql$create policy "Allow insert for active owner" on public.%1$I for
insert to authenticated with check (
	exists (
		select 1
		from public.vignette_encounter_survivor ves
		where ves.id = %1$I.vignette_encounter_survivor_id
			and public.is_active_vignette_encounter_owner(ves.vignette_encounter_id)
	)
)$sql$,
			table_name
		);

		execute format(
			$sql$create policy "Allow update for active member" on public.%1$I for
update to authenticated using (
	exists (
		select 1
		from public.vignette_encounter_survivor ves
		where ves.id = %1$I.vignette_encounter_survivor_id
			and public.can_access_active_vignette_encounter(ves.vignette_encounter_id)
	)
) with check (
	exists (
		select 1
		from public.vignette_encounter_survivor ves
		where ves.id = %1$I.vignette_encounter_survivor_id
			and public.can_access_active_vignette_encounter(ves.vignette_encounter_id)
	)
)$sql$,
			table_name
		);

		execute format(
			$sql$create policy "Allow delete for active owner" on public.%1$I for delete to authenticated using (
	exists (
		select 1
		from public.vignette_encounter_survivor ves
		where ves.id = %1$I.vignette_encounter_survivor_id
			and public.is_active_vignette_encounter_owner(ves.vignette_encounter_id)
	)
)$sql$,
			table_name
		);
	end loop;
end $$;

create policy "Allow insert for entitled owner" on public.vignette_encounter_shared_user for
insert to authenticated with check (
		public.is_vignette_encounter_owner(vignette_encounter_id)
		and shared_user_id <> (
			select auth.uid()
		)
		and public.can_share_vignette_encounters(
			(
				select auth.uid()
			)
		)
	);

create policy "Allow select for owner" on public.vignette_encounter_shared_user for
select to authenticated using (public.is_vignette_encounter_owner(vignette_encounter_id));

create policy "Allow select for shared" on public.vignette_encounter_shared_user for
select to authenticated using (
		shared_user_id = (
			select auth.uid()
		)
	);

create policy "Allow delete for owner" on public.vignette_encounter_shared_user for delete to authenticated using (public.is_vignette_encounter_owner(vignette_encounter_id));

--------------------------------------------------------------------------------
-- Data API Privileges
--------------------------------------------------------------------------------
grant select on table public.vignette_monster to authenticated;
grant select on table public.vignette_monster_level to authenticated;
grant select on table public.vignette_monster_level_mood to authenticated;
grant select on table public.vignette_monster_level_trait to authenticated;
grant select on table public.vignette_monster_level_survivor_status to authenticated;
grant select on table public.vignette_survivor to authenticated;
grant select on table public.vignette_survivor_ability_impairment to authenticated;
grant select on table public.vignette_survivor_disorder to authenticated;
grant select on table public.vignette_survivor_fighting_art to authenticated;
grant select on table public.vignette_survivor_secret_fighting_art to authenticated;
grant select on table public.vignette_survivor_gear_grid to authenticated;

revoke insert, update, delete on table public.vignette_monster from authenticated;
revoke insert, update, delete on table public.vignette_monster_level from authenticated;
revoke insert, update, delete on table public.vignette_monster_level_mood from authenticated;
revoke insert, update, delete on table public.vignette_monster_level_trait from authenticated;
revoke insert, update, delete on table public.vignette_monster_level_survivor_status from authenticated;
revoke insert, update, delete on table public.vignette_survivor from authenticated;
revoke insert, update, delete on table public.vignette_survivor_ability_impairment from authenticated;
revoke insert, update, delete on table public.vignette_survivor_disorder from authenticated;
revoke insert, update, delete on table public.vignette_survivor_fighting_art from authenticated;
revoke insert, update, delete on table public.vignette_survivor_secret_fighting_art from authenticated;
revoke insert, update, delete on table public.vignette_survivor_gear_grid from authenticated;

grant select, insert, update, delete on table public.vignette_encounter to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_ai_deck to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_monster to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_survivor to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_survivor_ability_impairment to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_survivor_disorder to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_survivor_fighting_art to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_survivor_secret_fighting_art to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_survivor_gear_grid to authenticated;
grant select, insert, delete on table public.vignette_encounter_shared_user to authenticated;
revoke update on table public.vignette_encounter_shared_user from authenticated;

--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_vignette_monster_source_nemesis on public.vignette_monster(source_nemesis_id)
where source_nemesis_id is not null;
create index idx_vignette_monster_source_quarry on public.vignette_monster(source_quarry_id)
where source_quarry_id is not null;
create index idx_vignette_monster_monster_name on public.vignette_monster(monster_name);

create index idx_vignette_monster_level_monster on public.vignette_monster_level(vignette_monster_id);
create index idx_vignette_monster_level_number on public.vignette_monster_level(level_number);

create index idx_vignette_monster_level_mood_level on public.vignette_monster_level_mood(vignette_monster_level_id);
create index idx_vignette_monster_level_mood_mood on public.vignette_monster_level_mood(mood_id);
create index idx_vignette_monster_level_trait_level on public.vignette_monster_level_trait(vignette_monster_level_id);
create index idx_vignette_monster_level_trait_trait on public.vignette_monster_level_trait(trait_id);
create index idx_vignette_monster_level_survivor_status_level on public.vignette_monster_level_survivor_status(vignette_monster_level_id);
create index idx_vignette_monster_level_survivor_status_status on public.vignette_monster_level_survivor_status(survivor_status_id);

create index idx_vignette_survivor_monster on public.vignette_survivor(vignette_monster_id);
create index idx_vignette_survivor_weapon_type on public.vignette_survivor(weapon_type_id);
create index idx_vignette_survivor_ability_impairment_survivor on public.vignette_survivor_ability_impairment(vignette_survivor_id);
create index idx_vignette_survivor_ability_impairment_ability on public.vignette_survivor_ability_impairment(ability_impairment_id);
create index idx_vignette_survivor_disorder_survivor on public.vignette_survivor_disorder(vignette_survivor_id);
create index idx_vignette_survivor_disorder_disorder on public.vignette_survivor_disorder(disorder_id);
create index idx_vignette_survivor_fighting_art_survivor on public.vignette_survivor_fighting_art(vignette_survivor_id);
create index idx_vignette_survivor_fighting_art_art on public.vignette_survivor_fighting_art(fighting_art_id);
create index idx_vignette_survivor_secret_fighting_art_survivor on public.vignette_survivor_secret_fighting_art(vignette_survivor_id);
create index idx_vignette_survivor_secret_fighting_art_art on public.vignette_survivor_secret_fighting_art(secret_fighting_art_id);
create index idx_vignette_survivor_gear_grid_survivor on public.vignette_survivor_gear_grid(vignette_survivor_id);
create index idx_vignette_survivor_gear_grid_gear on public.vignette_survivor_gear_grid(gear_id);

create unique index one_active_vignette_encounter_per_user on public.vignette_encounter(user_id);
create index idx_vignette_encounter_user on public.vignette_encounter(user_id);
create index idx_vignette_encounter_monster_template on public.vignette_encounter(vignette_monster_id);
create index idx_vignette_encounter_level_number on public.vignette_encounter(level_number);

create index idx_vignette_encounter_ai_deck_encounter on public.vignette_encounter_ai_deck(vignette_encounter_id);
create index idx_vignette_encounter_monster_encounter on public.vignette_encounter_monster(vignette_encounter_id);
create index idx_vignette_encounter_monster_ai_deck on public.vignette_encounter_monster(ai_deck_id);

create index idx_vignette_encounter_survivor_monster on public.vignette_encounter_survivor(vignette_monster_id);
create index idx_vignette_encounter_survivor_encounter on public.vignette_encounter_survivor(vignette_encounter_id);
create index idx_vignette_encounter_survivor_weapon_type on public.vignette_encounter_survivor(weapon_type_id);
create index idx_vignette_encounter_survivor_ability_impairment_survivor on public.vignette_encounter_survivor_ability_impairment(vignette_encounter_survivor_id);
create index idx_vignette_encounter_survivor_ability_impairment_ability on public.vignette_encounter_survivor_ability_impairment(ability_impairment_id);
create index idx_vignette_encounter_survivor_disorder_survivor on public.vignette_encounter_survivor_disorder(vignette_encounter_survivor_id);
create index idx_vignette_encounter_survivor_disorder_disorder on public.vignette_encounter_survivor_disorder(disorder_id);
create index idx_vignette_encounter_survivor_fighting_art_survivor on public.vignette_encounter_survivor_fighting_art(vignette_encounter_survivor_id);
create index idx_vignette_encounter_survivor_fighting_art_art on public.vignette_encounter_survivor_fighting_art(fighting_art_id);
create index idx_vignette_encounter_survivor_secret_fighting_art_survivor on public.vignette_encounter_survivor_secret_fighting_art(vignette_encounter_survivor_id);
create index idx_vignette_encounter_survivor_secret_fighting_art_art on public.vignette_encounter_survivor_secret_fighting_art(secret_fighting_art_id);
create index idx_vignette_encounter_survivor_gear_grid_survivor on public.vignette_encounter_survivor_gear_grid(vignette_encounter_survivor_id);
create index idx_vignette_encounter_survivor_gear_grid_gear on public.vignette_encounter_survivor_gear_grid(gear_id);

create index idx_vignette_encounter_shared_user_vignette_encounter on public.vignette_encounter_shared_user(vignette_encounter_id);
create index idx_vignette_encounter_shared_user_shared_user on public.vignette_encounter_shared_user(shared_user_id);

--------------------------------------------------------------------------------
-- Updated At Triggers
--------------------------------------------------------------------------------
do $$
declare
	table_name text;
begin
	foreach table_name in array array[
		'vignette_monster',
		'vignette_monster_level',
		'vignette_monster_level_mood',
		'vignette_monster_level_trait',
		'vignette_monster_level_survivor_status',
		'vignette_survivor',
		'vignette_survivor_ability_impairment',
		'vignette_survivor_disorder',
		'vignette_survivor_fighting_art',
		'vignette_survivor_secret_fighting_art',
		'vignette_survivor_gear_grid',
		'vignette_encounter',
		'vignette_encounter_ai_deck',
		'vignette_encounter_monster',
		'vignette_encounter_survivor',
		'vignette_encounter_survivor_ability_impairment',
		'vignette_encounter_survivor_disorder',
		'vignette_encounter_survivor_fighting_art',
		'vignette_encounter_survivor_secret_fighting_art',
		'vignette_encounter_survivor_gear_grid',
		'vignette_encounter_shared_user'
	] loop
		execute format(
			'create trigger set_updated_at before update on public.%I for each row execute function public.update_updated_at()',
			table_name
		);
	end loop;
end $$;

--------------------------------------------------------------------------------
-- Realtime Publication
--------------------------------------------------------------------------------
do $$
declare
	vignette_table_name text;
	vignette_realtime_tables text [] := array [
		'vignette_encounter',
		'vignette_encounter_ai_deck',
		'vignette_encounter_monster',
		'vignette_encounter_survivor',
		'vignette_encounter_survivor_ability_impairment',
		'vignette_encounter_survivor_disorder',
		'vignette_encounter_survivor_fighting_art',
		'vignette_encounter_survivor_secret_fighting_art',
		'vignette_encounter_survivor_gear_grid',
		'vignette_encounter_shared_user'
	];
begin
	if exists (
		select 1
		from pg_publication
		where pubname = 'supabase_realtime'
	) then
		foreach vignette_table_name in array vignette_realtime_tables loop
			if not exists (
				select 1
				from pg_publication_tables
				where pubname = 'supabase_realtime'
					and schemaname = 'public'
					and tablename = vignette_table_name
			) then
				execute format(
					'alter publication supabase_realtime add table public.%I',
					vignette_table_name
				);
			end if;
		end loop;
	end if;
end $$;