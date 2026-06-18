--------------------------------------------------------------------------------
-- Vignette Source Level Links
-- Connects each vignette level to one or more concrete quarry_level/nemesis_level
-- rows, and lets active vignette encounters track multiple copied monsters.
--------------------------------------------------------------------------------
create table vignette_encounter_level_monster (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_level_id uuid not null references vignette_encounter_level(id) on delete cascade,
	source_nemesis_level_id uuid references nemesis_level(id) on delete restrict,
	source_quarry_level_id uuid references quarry_level(id) on delete restrict,
	sort_order int not null default 0,
	-- Constraints
	constraint vignette_encounter_level_monster_source_presence check (
		(
			source_nemesis_level_id is not null
			and source_quarry_level_id is null
		)
		or (
			source_quarry_level_id is not null
			and source_nemesis_level_id is null
		)
	),
	unique (vignette_encounter_level_id, source_nemesis_level_id),
	unique (vignette_encounter_level_id, source_quarry_level_id)
);

alter table vignette_encounter_monster
drop constraint vignette_encounter_monster_vignette_encounter_id_key;

alter table vignette_encounter_monster
add column vignette_encounter_level_monster_id uuid references vignette_encounter_level_monster(id) on delete set null,
add column sort_order int not null default 0;

--------------------------------------------------------------------------------
-- Validation
--------------------------------------------------------------------------------
create or replace function public.validate_vignette_encounter_level_monster_source() returns trigger language plpgsql security invoker
set search_path = public as $$
declare
	definition_source_monster_type text;
	definition_source_nemesis_id uuid;
	definition_source_quarry_id uuid;
	vignette_level_number int;
	source_nemesis_id uuid;
	source_quarry_id uuid;
	source_level_number int;
begin
	select ved.source_monster_type,
		ved.source_nemesis_id,
		ved.source_quarry_id,
		vel.level_number
	into definition_source_monster_type,
		definition_source_nemesis_id,
		definition_source_quarry_id,
		vignette_level_number
	from vignette_encounter_level vel
		join vignette_encounter_definition ved on ved.id = vel.vignette_encounter_definition_id
	where vel.id = new.vignette_encounter_level_id;

	if not found then
		raise exception 'Invalid vignette encounter level source reference' using errcode = '23503';
	end if;

	if new.source_nemesis_level_id is not null then
		select nemesis_id,
			level_number
		into source_nemesis_id,
			source_level_number
		from nemesis_level
		where id = new.source_nemesis_level_id;

		if not found then
			raise exception 'Invalid nemesis level source reference' using errcode = '23503';
		end if;

		if definition_source_monster_type <> 'NEMESIS'
			or source_nemesis_id is distinct
			from definition_source_nemesis_id then
			raise exception 'Nemesis level source must belong to the vignette definition source nemesis' using errcode = '23514';
		end if;
	else
		select quarry_id,
			level_number
		into source_quarry_id,
			source_level_number
		from quarry_level
		where id = new.source_quarry_level_id;

		if not found then
			raise exception 'Invalid quarry level source reference' using errcode = '23503';
		end if;

		if definition_source_monster_type <> 'QUARRY'
			or source_quarry_id is distinct
			from definition_source_quarry_id then
			raise exception 'Quarry level source must belong to the vignette definition source quarry' using errcode = '23514';
		end if;
	end if;

	if source_level_number <> vignette_level_number then
		raise exception 'Vignette level number must match the source monster level number' using errcode = '23514';
	end if;

	return new;
end;
$$;

create or replace function public.validate_vignette_encounter_monster_level_source() returns trigger language plpgsql security invoker
set search_path = public as $$
declare
	encounter_level_id uuid;
	source_vignette_level_id uuid;
begin
	if new.vignette_encounter_level_monster_id is null then
		return new;
	end if;

	select vignette_encounter_level_id
	into encounter_level_id
	from vignette_encounter
	where id = new.vignette_encounter_id;

	if not found then
		raise exception 'Invalid vignette encounter monster parent reference' using errcode = '23503';
	end if;

	select vignette_encounter_level_id
	into source_vignette_level_id
	from vignette_encounter_level_monster
	where id = new.vignette_encounter_level_monster_id;

	if not found then
		raise exception 'Invalid vignette encounter level monster source reference' using errcode = '23503';
	end if;

	if source_vignette_level_id is distinct
	from encounter_level_id then
		raise exception 'Active vignette monster source must belong to the selected vignette encounter level' using errcode = '23514';
	end if;

	return new;
end;
$$;

revoke all on function public.validate_vignette_encounter_level_monster_source()
from public;
revoke execute on function public.validate_vignette_encounter_level_monster_source()
from anon,
	authenticated;

revoke all on function public.validate_vignette_encounter_monster_level_source()
from public;
revoke execute on function public.validate_vignette_encounter_monster_level_source()
from anon,
	authenticated;

create trigger validate_vignette_encounter_level_monster_source before
insert
	or
update on vignette_encounter_level_monster for each row execute function public.validate_vignette_encounter_level_monster_source();

create trigger validate_vignette_encounter_monster_level_source before
insert
	or
update on vignette_encounter_monster for each row execute function public.validate_vignette_encounter_monster_level_source();

--------------------------------------------------------------------------------
-- Row Level Security
--------------------------------------------------------------------------------
alter table vignette_encounter_level_monster enable row level security;

create policy "Allow select for authenticated and published" on vignette_encounter_level_monster for
select to authenticated using (
		exists (
			select 1
			from vignette_encounter_level vel
				join vignette_encounter_definition ved on ved.id = vel.vignette_encounter_definition_id
			where vel.id = vignette_encounter_level_id
				and ved.published
		)
	);

--------------------------------------------------------------------------------
-- Data API Privileges
--------------------------------------------------------------------------------
grant select on table vignette_encounter_level_monster to authenticated;
revoke insert, update, delete on table vignette_encounter_level_monster from authenticated;

--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_vignette_encounter_level_monster_level on vignette_encounter_level_monster(vignette_encounter_level_id);
create index idx_vignette_encounter_level_monster_nemesis_level on vignette_encounter_level_monster(source_nemesis_level_id)
where source_nemesis_level_id is not null;
create index idx_vignette_encounter_level_monster_quarry_level on vignette_encounter_level_monster(source_quarry_level_id)
where source_quarry_level_id is not null;

create unique index idx_vignette_encounter_monster_source_unique on vignette_encounter_monster(vignette_encounter_id, vignette_encounter_level_monster_id)
where vignette_encounter_level_monster_id is not null;
create index idx_vignette_encounter_monster_encounter on vignette_encounter_monster(vignette_encounter_id);
create index idx_vignette_encounter_monster_level_monster on vignette_encounter_monster(vignette_encounter_level_monster_id)
where vignette_encounter_level_monster_id is not null;

--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on vignette_encounter_level_monster for each row execute function update_updated_at();
