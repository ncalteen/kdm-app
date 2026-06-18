--------------------------------------------------------------------------------
-- Vignette Active Play State
-- Adds live survivor state, source-aware copied rows, member CRUD for active
-- gameplay children, and a transactional catalog-copy RPC.
--------------------------------------------------------------------------------

--------------------------------------------------------------------------------
-- Source Links And Live Survivor State
--------------------------------------------------------------------------------
alter table public.vignette_encounter_monster
	add column source_vignette_monster_level_id uuid references public.vignette_monster_level(id) on delete set null;

alter table public.vignette_encounter_monster_mood
	add column source_vignette_monster_level_mood_id uuid references public.vignette_monster_level_mood(id) on delete set null;

alter table public.vignette_encounter_monster_trait
	add column source_vignette_monster_level_trait_id uuid references public.vignette_monster_level_trait(id) on delete set null;

alter table public.vignette_encounter_monster_survivor_status
	add column source_vignette_monster_level_survivor_status_id uuid references public.vignette_monster_level_survivor_status(id) on delete set null;

alter table public.vignette_encounter_survivor
	add column source_vignette_survivor_id uuid references public.vignette_survivor(id) on delete set null,
	add column arm_light_damage boolean not null default false,
	add column arm_heavy_damage boolean not null default false,
	add column body_light_damage boolean not null default false,
	add column body_heavy_damage boolean not null default false,
	add column brain_light_damage boolean not null default false,
	add column head_heavy_damage boolean not null default false,
	add column leg_light_damage boolean not null default false,
	add column leg_heavy_damage boolean not null default false,
	add column waist_light_damage boolean not null default false,
	add column waist_heavy_damage boolean not null default false,
	add column accuracy_tokens int not null default 0,
	add column activation_used boolean not null default false,
	add column bleeding_tokens int not null default 0 check (bleeding_tokens >= 0),
	add column block_tokens int not null default 0,
	add column deflect_tokens int not null default 0,
	add column evasion_tokens int not null default 0,
	add column insanity_tokens int not null default 0,
	add column knocked_down boolean not null default false,
	add column luck_tokens int not null default 0,
	add column movement_tokens int not null default 0,
	add column movement_used boolean not null default false,
	add column priority_target boolean not null default false,
	add column scout boolean not null default false,
	add column speed_tokens int not null default 0,
	add column strength_tokens int not null default 0,
	add column survival_tokens int not null default 0,
	add column dead boolean not null default false,
	add column retired boolean not null default false;

alter table public.vignette_encounter_survivor_ability_impairment
	add column source_vignette_survivor_ability_impairment_id uuid references public.vignette_survivor_ability_impairment(id) on delete set null;

alter table public.vignette_encounter_survivor_disorder
	add column source_vignette_survivor_disorder_id uuid references public.vignette_survivor_disorder(id) on delete set null;

alter table public.vignette_encounter_survivor_fighting_art
	add column source_vignette_survivor_fighting_art_id uuid references public.vignette_survivor_fighting_art(id) on delete set null;

alter table public.vignette_encounter_survivor_secret_fighting_art
	add column source_vignette_survivor_secret_fighting_art_id uuid references public.vignette_survivor_secret_fighting_art(id) on delete set null;

alter table public.vignette_encounter_survivor_gear_grid
	add column source_vignette_survivor_gear_grid_id uuid references public.vignette_survivor_gear_grid(id) on delete set null;

create unique index idx_vignette_encounter_monster_source_unique on public.vignette_encounter_monster(vignette_encounter_id, source_vignette_monster_level_id)
where source_vignette_monster_level_id is not null;
create index idx_vignette_encounter_monster_source_level on public.vignette_encounter_monster(source_vignette_monster_level_id)
where source_vignette_monster_level_id is not null;

create unique index idx_vignette_encounter_monster_mood_source_unique on public.vignette_encounter_monster_mood(vignette_encounter_monster_id, source_vignette_monster_level_mood_id)
where source_vignette_monster_level_mood_id is not null;
create index idx_vignette_encounter_monster_mood_source on public.vignette_encounter_monster_mood(source_vignette_monster_level_mood_id)
where source_vignette_monster_level_mood_id is not null;

create unique index idx_vignette_encounter_monster_trait_source_unique on public.vignette_encounter_monster_trait(vignette_encounter_monster_id, source_vignette_monster_level_trait_id)
where source_vignette_monster_level_trait_id is not null;
create index idx_vignette_encounter_monster_trait_source on public.vignette_encounter_monster_trait(source_vignette_monster_level_trait_id)
where source_vignette_monster_level_trait_id is not null;

create unique index idx_vignette_encounter_monster_survivor_status_source_unique on public.vignette_encounter_monster_survivor_status(vignette_encounter_monster_id, source_vignette_monster_level_survivor_status_id)
where source_vignette_monster_level_survivor_status_id is not null;
create index idx_vignette_encounter_monster_survivor_status_source on public.vignette_encounter_monster_survivor_status(source_vignette_monster_level_survivor_status_id)
where source_vignette_monster_level_survivor_status_id is not null;

create unique index idx_vignette_encounter_survivor_source_unique on public.vignette_encounter_survivor(vignette_encounter_id, source_vignette_survivor_id)
where source_vignette_survivor_id is not null;
create index idx_vignette_encounter_survivor_source on public.vignette_encounter_survivor(source_vignette_survivor_id)
where source_vignette_survivor_id is not null;

create unique index idx_vignette_encounter_survivor_ability_source_unique on public.vignette_encounter_survivor_ability_impairment(vignette_encounter_survivor_id, source_vignette_survivor_ability_impairment_id)
where source_vignette_survivor_ability_impairment_id is not null;
create index idx_vignette_encounter_survivor_ability_source on public.vignette_encounter_survivor_ability_impairment(source_vignette_survivor_ability_impairment_id)
where source_vignette_survivor_ability_impairment_id is not null;

create unique index idx_vignette_encounter_survivor_disorder_source_unique on public.vignette_encounter_survivor_disorder(vignette_encounter_survivor_id, source_vignette_survivor_disorder_id)
where source_vignette_survivor_disorder_id is not null;
create index idx_vignette_encounter_survivor_disorder_source on public.vignette_encounter_survivor_disorder(source_vignette_survivor_disorder_id)
where source_vignette_survivor_disorder_id is not null;

create unique index idx_vignette_encounter_survivor_fighting_art_source_unique on public.vignette_encounter_survivor_fighting_art(vignette_encounter_survivor_id, source_vignette_survivor_fighting_art_id)
where source_vignette_survivor_fighting_art_id is not null;
create index idx_vignette_encounter_survivor_fighting_art_source on public.vignette_encounter_survivor_fighting_art(source_vignette_survivor_fighting_art_id)
where source_vignette_survivor_fighting_art_id is not null;

create unique index idx_vignette_encounter_survivor_secret_fighting_art_source_unique on public.vignette_encounter_survivor_secret_fighting_art(vignette_encounter_survivor_id, source_vignette_survivor_secret_fighting_art_id)
where source_vignette_survivor_secret_fighting_art_id is not null;
create index idx_vignette_encounter_survivor_secret_fighting_art_source on public.vignette_encounter_survivor_secret_fighting_art(source_vignette_survivor_secret_fighting_art_id)
where source_vignette_survivor_secret_fighting_art_id is not null;

create unique index idx_vignette_encounter_survivor_gear_grid_source_unique on public.vignette_encounter_survivor_gear_grid(vignette_encounter_survivor_id, source_vignette_survivor_gear_grid_id)
where source_vignette_survivor_gear_grid_id is not null;
create index idx_vignette_encounter_survivor_gear_grid_source on public.vignette_encounter_survivor_gear_grid(source_vignette_survivor_gear_grid_id)
where source_vignette_survivor_gear_grid_id is not null;

--------------------------------------------------------------------------------
-- Source Validation
--------------------------------------------------------------------------------
create or replace function public.validate_vignette_encounter_monster_source() returns trigger language plpgsql security invoker
set search_path = public as $$
begin
	if new.source_vignette_monster_level_id is null then
		return new;
	end if;

	if not exists (
		select 1
		from public.vignette_encounter ve
			join public.vignette_monster_level vml on vml.id = new.source_vignette_monster_level_id
		where ve.id = new.vignette_encounter_id
			and vml.vignette_monster_id = ve.vignette_monster_id
			and vml.level_number = ve.level_number
	) then
		raise exception 'Active vignette monster source must belong to the selected vignette monster level' using errcode = '23514';
	end if;

	return new;
end;
$$;

create or replace function public.validate_vignette_encounter_monster_mood_source() returns trigger language plpgsql security invoker
set search_path = public as $$
declare
	active_source_level_id uuid;
begin
	select vem.source_vignette_monster_level_id
	into active_source_level_id
	from public.vignette_encounter_monster vem
	where vem.id = new.vignette_encounter_monster_id;

	if not found then
		raise exception 'Active vignette monster state must reference an existing active monster' using errcode = '23503';
	end if;

	if new.source_vignette_monster_level_mood_id is not null
		and (
			active_source_level_id is null
			or not exists (
				select 1
				from public.vignette_monster_level_mood vmlm
				where vmlm.id = new.source_vignette_monster_level_mood_id
					and vmlm.vignette_monster_level_id = active_source_level_id
					and vmlm.mood_id = new.mood_id
			)
		) then
		raise exception 'Active vignette monster mood source must belong to the active monster source level' using errcode = '23514';
	end if;

	return new;
end;
$$;

create or replace function public.validate_vignette_encounter_monster_trait_source() returns trigger language plpgsql security invoker
set search_path = public as $$
declare
	active_source_level_id uuid;
begin
	select vem.source_vignette_monster_level_id
	into active_source_level_id
	from public.vignette_encounter_monster vem
	where vem.id = new.vignette_encounter_monster_id;

	if not found then
		raise exception 'Active vignette monster state must reference an existing active monster' using errcode = '23503';
	end if;

	if new.source_vignette_monster_level_trait_id is not null
		and (
			active_source_level_id is null
			or not exists (
				select 1
				from public.vignette_monster_level_trait vmlt
				where vmlt.id = new.source_vignette_monster_level_trait_id
					and vmlt.vignette_monster_level_id = active_source_level_id
					and vmlt.trait_id = new.trait_id
			)
		) then
		raise exception 'Active vignette monster trait source must belong to the active monster source level' using errcode = '23514';
	end if;

	return new;
end;
$$;

create or replace function public.validate_vignette_encounter_monster_survivor_status_source() returns trigger language plpgsql security invoker
set search_path = public as $$
declare
	active_source_level_id uuid;
begin
	select vem.source_vignette_monster_level_id
	into active_source_level_id
	from public.vignette_encounter_monster vem
	where vem.id = new.vignette_encounter_monster_id;

	if not found then
		raise exception 'Active vignette monster state must reference an existing active monster' using errcode = '23503';
	end if;

	if new.source_vignette_monster_level_survivor_status_id is not null
		and (
			active_source_level_id is null
			or not exists (
				select 1
				from public.vignette_monster_level_survivor_status vmlss
				where vmlss.id = new.source_vignette_monster_level_survivor_status_id
					and vmlss.vignette_monster_level_id = active_source_level_id
					and vmlss.survivor_status_id = new.survivor_status_id
			)
		) then
		raise exception 'Active vignette monster survivor status source must belong to the active monster source level' using errcode = '23514';
	end if;

	return new;
end;
$$;

create or replace function public.validate_vignette_encounter_survivor_source() returns trigger language plpgsql security invoker
set search_path = public as $$
begin
	if new.source_vignette_survivor_id is null then
		return new;
	end if;

	if not exists (
		select 1
		from public.vignette_survivor vs
		where vs.id = new.source_vignette_survivor_id
			and vs.vignette_monster_id = new.vignette_monster_id
	) then
		raise exception 'Active vignette survivor source must belong to the selected vignette monster' using errcode = '23514';
	end if;

	return new;
end;
$$;

create or replace function public.validate_vignette_encounter_survivor_ability_source() returns trigger language plpgsql security invoker
set search_path = public as $$
declare
	active_source_survivor_id uuid;
begin
	select ves.source_vignette_survivor_id
	into active_source_survivor_id
	from public.vignette_encounter_survivor ves
	where ves.id = new.vignette_encounter_survivor_id;

	if not found then
		raise exception 'Active vignette survivor child row must reference an existing active survivor' using errcode = '23503';
	end if;

	if new.source_vignette_survivor_ability_impairment_id is not null
		and (
			active_source_survivor_id is null
			or not exists (
				select 1
				from public.vignette_survivor_ability_impairment vsai
				where vsai.id = new.source_vignette_survivor_ability_impairment_id
					and vsai.vignette_survivor_id = active_source_survivor_id
					and vsai.ability_impairment_id = new.ability_impairment_id
			)
		) then
		raise exception 'Active vignette survivor ability impairment source must belong to the active survivor source' using errcode = '23514';
	end if;

	return new;
end;
$$;

create or replace function public.validate_vignette_encounter_survivor_disorder_source() returns trigger language plpgsql security invoker
set search_path = public as $$
declare
	active_source_survivor_id uuid;
begin
	select ves.source_vignette_survivor_id
	into active_source_survivor_id
	from public.vignette_encounter_survivor ves
	where ves.id = new.vignette_encounter_survivor_id;

	if not found then
		raise exception 'Active vignette survivor child row must reference an existing active survivor' using errcode = '23503';
	end if;

	if new.source_vignette_survivor_disorder_id is not null
		and (
			active_source_survivor_id is null
			or not exists (
				select 1
				from public.vignette_survivor_disorder vsd
				where vsd.id = new.source_vignette_survivor_disorder_id
					and vsd.vignette_survivor_id = active_source_survivor_id
					and vsd.disorder_id = new.disorder_id
			)
		) then
		raise exception 'Active vignette survivor disorder source must belong to the active survivor source' using errcode = '23514';
	end if;

	return new;
end;
$$;

create or replace function public.validate_vignette_encounter_survivor_fighting_art_source() returns trigger language plpgsql security invoker
set search_path = public as $$
declare
	active_source_survivor_id uuid;
begin
	select ves.source_vignette_survivor_id
	into active_source_survivor_id
	from public.vignette_encounter_survivor ves
	where ves.id = new.vignette_encounter_survivor_id;

	if not found then
		raise exception 'Active vignette survivor child row must reference an existing active survivor' using errcode = '23503';
	end if;

	if new.source_vignette_survivor_fighting_art_id is not null
		and (
			active_source_survivor_id is null
			or not exists (
				select 1
				from public.vignette_survivor_fighting_art vsfa
				where vsfa.id = new.source_vignette_survivor_fighting_art_id
					and vsfa.vignette_survivor_id = active_source_survivor_id
					and vsfa.fighting_art_id = new.fighting_art_id
			)
		) then
		raise exception 'Active vignette survivor fighting art source must belong to the active survivor source' using errcode = '23514';
	end if;

	return new;
end;
$$;

create or replace function public.validate_vignette_encounter_survivor_secret_fighting_art_source() returns trigger language plpgsql security invoker
set search_path = public as $$
declare
	active_source_survivor_id uuid;
begin
	select ves.source_vignette_survivor_id
	into active_source_survivor_id
	from public.vignette_encounter_survivor ves
	where ves.id = new.vignette_encounter_survivor_id;

	if not found then
		raise exception 'Active vignette survivor child row must reference an existing active survivor' using errcode = '23503';
	end if;

	if new.source_vignette_survivor_secret_fighting_art_id is not null
		and (
			active_source_survivor_id is null
			or not exists (
				select 1
				from public.vignette_survivor_secret_fighting_art vssfa
				where vssfa.id = new.source_vignette_survivor_secret_fighting_art_id
					and vssfa.vignette_survivor_id = active_source_survivor_id
					and vssfa.secret_fighting_art_id = new.secret_fighting_art_id
			)
		) then
		raise exception 'Active vignette survivor secret fighting art source must belong to the active survivor source' using errcode = '23514';
	end if;

	return new;
end;
$$;

create or replace function public.validate_vignette_encounter_survivor_gear_grid_source() returns trigger language plpgsql security invoker
set search_path = public as $$
declare
	active_source_survivor_id uuid;
begin
	select ves.source_vignette_survivor_id
	into active_source_survivor_id
	from public.vignette_encounter_survivor ves
	where ves.id = new.vignette_encounter_survivor_id;

	if not found then
		raise exception 'Active vignette survivor child row must reference an existing active survivor' using errcode = '23503';
	end if;

	if new.source_vignette_survivor_gear_grid_id is not null
		and (
			active_source_survivor_id is null
			or not exists (
				select 1
				from public.vignette_survivor_gear_grid vsgg
				where vsgg.id = new.source_vignette_survivor_gear_grid_id
					and vsgg.vignette_survivor_id = active_source_survivor_id
					and vsgg.gear_id = new.gear_id
			)
		) then
		raise exception 'Active vignette survivor gear source must belong to the active survivor source' using errcode = '23514';
	end if;

	return new;
end;
$$;

revoke all on function public.validate_vignette_encounter_monster_source()
from public;
revoke execute on function public.validate_vignette_encounter_monster_source()
from anon,
	authenticated;

revoke all on function public.validate_vignette_encounter_monster_mood_source()
from public;
revoke execute on function public.validate_vignette_encounter_monster_mood_source()
from anon,
	authenticated;

revoke all on function public.validate_vignette_encounter_monster_trait_source()
from public;
revoke execute on function public.validate_vignette_encounter_monster_trait_source()
from anon,
	authenticated;

revoke all on function public.validate_vignette_encounter_monster_survivor_status_source()
from public;
revoke execute on function public.validate_vignette_encounter_monster_survivor_status_source()
from anon,
	authenticated;

revoke all on function public.validate_vignette_encounter_survivor_source()
from public;
revoke execute on function public.validate_vignette_encounter_survivor_source()
from anon,
	authenticated;

revoke all on function public.validate_vignette_encounter_survivor_ability_source()
from public;
revoke execute on function public.validate_vignette_encounter_survivor_ability_source()
from anon,
	authenticated;

revoke all on function public.validate_vignette_encounter_survivor_disorder_source()
from public;
revoke execute on function public.validate_vignette_encounter_survivor_disorder_source()
from anon,
	authenticated;

revoke all on function public.validate_vignette_encounter_survivor_fighting_art_source()
from public;
revoke execute on function public.validate_vignette_encounter_survivor_fighting_art_source()
from anon,
	authenticated;

revoke all on function public.validate_vignette_encounter_survivor_secret_fighting_art_source()
from public;
revoke execute on function public.validate_vignette_encounter_survivor_secret_fighting_art_source()
from anon,
	authenticated;

revoke all on function public.validate_vignette_encounter_survivor_gear_grid_source()
from public;
revoke execute on function public.validate_vignette_encounter_survivor_gear_grid_source()
from anon,
	authenticated;

create trigger validate_vignette_encounter_monster_source before
insert
	or
update on public.vignette_encounter_monster for each row execute function public.validate_vignette_encounter_monster_source();

create trigger validate_vignette_encounter_monster_mood_source before
insert
	or
update on public.vignette_encounter_monster_mood for each row execute function public.validate_vignette_encounter_monster_mood_source();

create trigger validate_vignette_encounter_monster_trait_source before
insert
	or
update on public.vignette_encounter_monster_trait for each row execute function public.validate_vignette_encounter_monster_trait_source();

create trigger validate_vignette_encounter_monster_survivor_status_source before
insert
	or
update on public.vignette_encounter_monster_survivor_status for each row execute function public.validate_vignette_encounter_monster_survivor_status_source();

create trigger validate_vignette_encounter_survivor_source before
insert
	or
update on public.vignette_encounter_survivor for each row execute function public.validate_vignette_encounter_survivor_source();

create trigger validate_vignette_encounter_survivor_ability_source before
insert
	or
update on public.vignette_encounter_survivor_ability_impairment for each row execute function public.validate_vignette_encounter_survivor_ability_source();

create trigger validate_vignette_encounter_survivor_disorder_source before
insert
	or
update on public.vignette_encounter_survivor_disorder for each row execute function public.validate_vignette_encounter_survivor_disorder_source();

create trigger validate_vignette_encounter_survivor_fighting_art_source before
insert
	or
update on public.vignette_encounter_survivor_fighting_art for each row execute function public.validate_vignette_encounter_survivor_fighting_art_source();

create trigger validate_vignette_encounter_survivor_secret_fighting_art_source before
insert
	or
update on public.vignette_encounter_survivor_secret_fighting_art for each row execute function public.validate_vignette_encounter_survivor_secret_fighting_art_source();

create trigger validate_vignette_encounter_survivor_gear_grid_source before
insert
	or
update on public.vignette_encounter_survivor_gear_grid for each row execute function public.validate_vignette_encounter_survivor_gear_grid_source();

--------------------------------------------------------------------------------
-- Active Gameplay RLS
--------------------------------------------------------------------------------
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
			'drop policy if exists "Allow insert for active owner" on public.%I',
			table_name
		);
		execute format(
			'drop policy if exists "Allow delete for active owner" on public.%I',
			table_name
		);
		execute format(
			'drop policy if exists "Allow insert for active member" on public.%I',
			table_name
		);
		execute format(
			'drop policy if exists "Allow delete for active member" on public.%I',
			table_name
		);

		execute format(
			'create policy "Allow insert for active member" on public.%1$I for insert to authenticated with check (public.can_access_active_vignette_encounter(vignette_encounter_id))',
			table_name
		);
		execute format(
			'create policy "Allow delete for active member" on public.%1$I for delete to authenticated using (public.can_access_active_vignette_encounter(vignette_encounter_id))',
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
			'drop policy if exists "Allow insert for active owner" on public.%I',
			table_name
		);
		execute format(
			'drop policy if exists "Allow delete for active owner" on public.%I',
			table_name
		);
		execute format(
			'drop policy if exists "Allow insert for active member" on public.%I',
			table_name
		);
		execute format(
			'drop policy if exists "Allow delete for active member" on public.%I',
			table_name
		);

		execute format(
			$sql$create policy "Allow insert for active member" on public.%1$I for
insert to authenticated with check (
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
			$sql$create policy "Allow delete for active member" on public.%1$I for delete to authenticated using (
	exists (
		select 1
		from public.vignette_encounter_survivor ves
		where ves.id = %1$I.vignette_encounter_survivor_id
			and public.can_access_active_vignette_encounter(ves.vignette_encounter_id)
	)
)$sql$,
			table_name
		);
	end loop;
end $$;

do $$
declare
	table_name text;
begin
	foreach table_name in array array[
		'vignette_encounter_monster_mood',
		'vignette_encounter_monster_trait',
		'vignette_encounter_monster_survivor_status'
	] loop
		execute format(
			'drop policy if exists "Allow insert for active owner" on public.%I',
			table_name
		);
		execute format(
			'drop policy if exists "Allow delete for active owner" on public.%I',
			table_name
		);
		execute format(
			'drop policy if exists "Allow insert for active member" on public.%I',
			table_name
		);
		execute format(
			'drop policy if exists "Allow delete for active member" on public.%I',
			table_name
		);

		execute format(
			$sql$create policy "Allow insert for active member" on public.%1$I for
insert to authenticated with check (
	exists (
		select 1
		from public.vignette_encounter_monster vem
		where vem.id = %1$I.vignette_encounter_monster_id
			and public.can_access_active_vignette_encounter(vem.vignette_encounter_id)
	)
)$sql$,
			table_name
		);
		execute format(
			$sql$create policy "Allow delete for active member" on public.%1$I for delete to authenticated using (
	exists (
		select 1
		from public.vignette_encounter_monster vem
		where vem.id = %1$I.vignette_encounter_monster_id
			and public.can_access_active_vignette_encounter(vem.vignette_encounter_id)
	)
)$sql$,
			table_name
		);
	end loop;
end $$;

--------------------------------------------------------------------------------
-- Data API Privileges
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
		'vignette_encounter_monster_mood',
		'vignette_encounter_monster_trait',
		'vignette_encounter_monster_survivor_status',
		'vignette_encounter_survivor',
		'vignette_encounter_survivor_ability_impairment',
		'vignette_encounter_survivor_disorder',
		'vignette_encounter_survivor_fighting_art',
		'vignette_encounter_survivor_secret_fighting_art',
		'vignette_encounter_survivor_gear_grid',
		'vignette_encounter_shared_user'
	] loop
		execute format('revoke all privileges on table public.%I from anon', table_name);
		execute format('revoke all privileges on table public.%I from authenticated', table_name);
	end loop;
end $$;

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

grant select, insert, update, delete on table public.vignette_encounter to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_ai_deck to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_monster to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_monster_mood to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_monster_trait to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_monster_survivor_status to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_survivor to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_survivor_ability_impairment to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_survivor_disorder to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_survivor_fighting_art to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_survivor_secret_fighting_art to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_survivor_gear_grid to authenticated;
grant select, insert, delete on table public.vignette_encounter_shared_user to authenticated;

--------------------------------------------------------------------------------
-- Realtime Delete Payloads
--------------------------------------------------------------------------------
do $$
declare
	table_name text;
begin
	foreach table_name in array array[
		'vignette_encounter',
		'vignette_encounter_ai_deck',
		'vignette_encounter_monster',
		'vignette_encounter_monster_mood',
		'vignette_encounter_monster_trait',
		'vignette_encounter_monster_survivor_status',
		'vignette_encounter_survivor',
		'vignette_encounter_survivor_ability_impairment',
		'vignette_encounter_survivor_disorder',
		'vignette_encounter_survivor_fighting_art',
		'vignette_encounter_survivor_secret_fighting_art',
		'vignette_encounter_survivor_gear_grid',
		'vignette_encounter_shared_user'
	] loop
		execute format('alter table public.%I replica identity full', table_name);
	end loop;
end $$;

--------------------------------------------------------------------------------
-- Catalog Copy RPC
--------------------------------------------------------------------------------
create or replace function public.create_vignette_encounter_from_catalog(
	target_vignette_monster_id uuid,
	target_level_number int
) returns uuid language plpgsql security invoker
set search_path = public as $$
declare
	current_user_id uuid := auth.uid();
	created_encounter_id uuid;
	created_ai_deck_id uuid;
	created_monster_id uuid;
	created_survivor_id uuid;
	monster_level record;
	source_survivor record;
begin
	if current_user_id is null then
		raise exception 'Authenticated user is required to create a vignette encounter' using errcode = '42501';
	end if;

	if not exists (
		select 1
		from public.vignette_monster_level vml
		where vml.vignette_monster_id = target_vignette_monster_id
			and vml.level_number = target_level_number
	) then
		raise exception 'Vignette monster level does not exist' using errcode = '23514';
	end if;

	insert into public.vignette_encounter (
		user_id,
		vignette_monster_id,
		level_number
	)
	values (
		current_user_id,
		target_vignette_monster_id,
		target_level_number
	)
	returning id into created_encounter_id;

	for monster_level in
		select vml.*,
			vm.monster_name as catalog_monster_name
		from public.vignette_monster_level vml
			join public.vignette_monster vm on vm.id = vml.vignette_monster_id
		where vml.vignette_monster_id = target_vignette_monster_id
			and vml.level_number = target_level_number
		order by vml.sub_monster_name nulls first,
			vml.id
	loop
		insert into public.vignette_encounter_ai_deck (
			advanced_cards,
			basic_cards,
			legendary_cards,
			overtone_cards,
			vignette_encounter_id
		)
		values (
			monster_level.advanced_cards,
			monster_level.basic_cards,
			monster_level.legendary_cards,
			monster_level.overtone_cards,
			created_encounter_id
		)
		returning id into created_ai_deck_id;

		insert into public.vignette_encounter_monster (
			accuracy,
			accuracy_tokens,
			ai_deck_id,
			ai_deck_remaining,
			damage,
			damage_tokens,
			evasion,
			evasion_tokens,
			luck,
			luck_tokens,
			monster_name,
			movement,
			movement_tokens,
			source_vignette_monster_level_id,
			speed,
			speed_tokens,
			strength,
			strength_tokens,
			toughness,
			toughness_tokens,
			vignette_encounter_id
		)
		values (
			monster_level.accuracy,
			monster_level.accuracy_tokens,
			created_ai_deck_id,
			monster_level.ai_deck_remaining,
			monster_level.damage,
			monster_level.damage_tokens,
			monster_level.evasion,
			monster_level.evasion_tokens,
			monster_level.luck,
			monster_level.luck_tokens,
			coalesce(monster_level.sub_monster_name, monster_level.catalog_monster_name),
			monster_level.movement,
			monster_level.movement_tokens,
			monster_level.id,
			monster_level.speed,
			monster_level.speed_tokens,
			monster_level.strength,
			monster_level.strength_tokens,
			monster_level.toughness,
			monster_level.toughness_tokens,
			created_encounter_id
		)
		returning id into created_monster_id;

		insert into public.vignette_encounter_monster_mood (
			vignette_encounter_monster_id,
			mood_id,
			source_vignette_monster_level_mood_id
		)
		select created_monster_id,
			vmlm.mood_id,
			vmlm.id
		from public.vignette_monster_level_mood vmlm
		where vmlm.vignette_monster_level_id = monster_level.id;

		insert into public.vignette_encounter_monster_trait (
			vignette_encounter_monster_id,
			trait_id,
			source_vignette_monster_level_trait_id
		)
		select created_monster_id,
			vmlt.trait_id,
			vmlt.id
		from public.vignette_monster_level_trait vmlt
		where vmlt.vignette_monster_level_id = monster_level.id;

		insert into public.vignette_encounter_monster_survivor_status (
			vignette_encounter_monster_id,
			survivor_status_id,
			source_vignette_monster_level_survivor_status_id
		)
		select created_monster_id,
			vmlss.survivor_status_id,
			vmlss.id
		from public.vignette_monster_level_survivor_status vmlss
		where vmlss.vignette_monster_level_id = monster_level.id;
	end loop;

	for source_survivor in
		select *
		from public.vignette_survivor vs
		where vs.vignette_monster_id = target_vignette_monster_id
		order by vs.survivor_name,
			vs.id
	loop
		insert into public.vignette_encounter_survivor (
			accuracy,
			arm_armor,
			body_armor,
			courage,
			evasion,
			gender,
			head_armor,
			insanity,
			leg_armor,
			luck,
			movement,
			notes,
			source_vignette_survivor_id,
			speed,
			strength,
			survival,
			survivor_name,
			survivor_type,
			understanding,
			vignette_encounter_id,
			vignette_monster_id,
			waist_armor,
			weapon_proficiency,
			weapon_type_id
		)
		values (
			source_survivor.accuracy,
			source_survivor.arm_armor,
			source_survivor.body_armor,
			source_survivor.courage,
			source_survivor.evasion,
			source_survivor.gender,
			source_survivor.head_armor,
			source_survivor.insanity,
			source_survivor.leg_armor,
			source_survivor.luck,
			source_survivor.movement,
			source_survivor.notes,
			source_survivor.id,
			source_survivor.speed,
			source_survivor.strength,
			source_survivor.survival,
			source_survivor.survivor_name,
			source_survivor.survivor_type,
			source_survivor.understanding,
			created_encounter_id,
			target_vignette_monster_id,
			source_survivor.waist_armor,
			source_survivor.weapon_proficiency,
			source_survivor.weapon_type_id
		)
		returning id into created_survivor_id;

		insert into public.vignette_encounter_survivor_ability_impairment (
			vignette_encounter_survivor_id,
			ability_impairment_id,
			source_vignette_survivor_ability_impairment_id
		)
		select created_survivor_id,
			vsai.ability_impairment_id,
			vsai.id
		from public.vignette_survivor_ability_impairment vsai
		where vsai.vignette_survivor_id = source_survivor.id;

		insert into public.vignette_encounter_survivor_disorder (
			vignette_encounter_survivor_id,
			disorder_id,
			source_vignette_survivor_disorder_id
		)
		select created_survivor_id,
			vsd.disorder_id,
			vsd.id
		from public.vignette_survivor_disorder vsd
		where vsd.vignette_survivor_id = source_survivor.id;

		insert into public.vignette_encounter_survivor_fighting_art (
			vignette_encounter_survivor_id,
			fighting_art_id,
			source_vignette_survivor_fighting_art_id
		)
		select created_survivor_id,
			vsfa.fighting_art_id,
			vsfa.id
		from public.vignette_survivor_fighting_art vsfa
		where vsfa.vignette_survivor_id = source_survivor.id;

		insert into public.vignette_encounter_survivor_secret_fighting_art (
			vignette_encounter_survivor_id,
			secret_fighting_art_id,
			source_vignette_survivor_secret_fighting_art_id
		)
		select created_survivor_id,
			vssfa.secret_fighting_art_id,
			vssfa.id
		from public.vignette_survivor_secret_fighting_art vssfa
		where vssfa.vignette_survivor_id = source_survivor.id;

		insert into public.vignette_encounter_survivor_gear_grid (
			vignette_encounter_survivor_id,
			gear_id,
			row_number,
			column_number,
			source_vignette_survivor_gear_grid_id
		)
		select created_survivor_id,
			vsgg.gear_id,
			vsgg.row_number,
			vsgg.column_number,
			vsgg.id
		from public.vignette_survivor_gear_grid vsgg
		where vsgg.vignette_survivor_id = source_survivor.id;
	end loop;

	return created_encounter_id;
end;
$$;

revoke all on function public.create_vignette_encounter_from_catalog(uuid, int)
from public;
revoke execute on function public.create_vignette_encounter_from_catalog(uuid, int)
from anon;
grant execute on function public.create_vignette_encounter_from_catalog(uuid, int) to authenticated;
