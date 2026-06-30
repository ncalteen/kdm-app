--------------------------------------------------------------------------------
-- Rename Encounter Survivor Table
--
-- Aligns active encounter survivor state with the existing active encounter
-- monster naming (`encounter_active_monster`). PostgreSQL keeps RLS policies,
-- grants, triggers, and publication membership attached to the relation across
-- the table rename; this migration also renames table-specific constraints and
-- indexes so schema metadata follows the new table name.
--------------------------------------------------------------------------------

do $$
begin
	if to_regclass('public.encounter_active_survivor') is null
		and to_regclass('public.encounter_survivor') is not null then
		alter table public.encounter_survivor rename to encounter_active_survivor;
	end if;
end $$;

do $$
begin
	if to_regclass('public.encounter_active_survivor') is null then
		raise exception 'public.encounter_active_survivor was not found after rename';
	end if;

	if exists (
		select 1
		from pg_constraint
		where conrelid = 'public.encounter_active_survivor'::regclass
			and conname = 'encounter_survivor_pkey'
	) then
		alter table public.encounter_active_survivor
			rename constraint encounter_survivor_pkey to encounter_active_survivor_pkey;
	end if;

	if exists (
		select 1
		from pg_constraint
		where conrelid = 'public.encounter_active_survivor'::regclass
			and conname = 'encounter_survivor_encounter_id_survivor_id_key'
	) then
		alter table public.encounter_active_survivor
			rename constraint encounter_survivor_encounter_id_survivor_id_key to encounter_active_survivor_encounter_id_survivor_id_key;
	end if;

	if exists (
		select 1
		from pg_constraint
		where conrelid = 'public.encounter_active_survivor'::regclass
			and conname = 'encounter_survivor_encounter_id_settlement_id_fkey'
	) then
		alter table public.encounter_active_survivor
			rename constraint encounter_survivor_encounter_id_settlement_id_fkey to encounter_active_survivor_encounter_id_settlement_id_fkey;
	end if;

	if exists (
		select 1
		from pg_constraint
		where conrelid = 'public.encounter_active_survivor'::regclass
			and conname = 'encounter_survivor_settlement_id_fkey'
	) then
		alter table public.encounter_active_survivor
			rename constraint encounter_survivor_settlement_id_fkey to encounter_active_survivor_settlement_id_fkey;
	end if;

	if exists (
		select 1
		from pg_constraint
		where conrelid = 'public.encounter_active_survivor'::regclass
			and conname = 'encounter_survivor_survivor_id_fkey'
	) then
		alter table public.encounter_active_survivor
			rename constraint encounter_survivor_survivor_id_fkey to encounter_active_survivor_survivor_id_fkey;
	end if;
end $$;

alter index if exists public.idx_encounter_survivor_encounter
	rename to idx_encounter_active_survivor_encounter;
alter index if exists public.idx_encounter_survivor_settlement
	rename to idx_encounter_active_survivor_settlement;
alter index if exists public.idx_encounter_survivor_survivor
	rename to idx_encounter_active_survivor_survivor;
