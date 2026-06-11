--------------------------------------------------------------------------------
-- VIG-01.05: Add vignette encounter tables to `supabase_realtime`.
--
-- Vignette encounter instances are independent from settlement gameplay, so
-- their mutable showdown state and sharing rows need their own publication
-- membership before owner/collaborator clients can receive live changes.
--
-- The RLS policies from `20260613000004_vignette_rls_policies.sql` still gate
-- delivery. Adding a table here only makes eligible INSERT / UPDATE / DELETE
-- events available to Supabase Realtime; it does not widen row visibility.
--
-- `vignette_encounter_shared_user` is included so later user-level listeners can
-- observe invite and revoke events for the Vignette Encounters surface.
--
-- One guarded loop mirrors the catalog realtime migrations and keeps replays or
-- partial local applications from failing if a table was already added.
--
-- Citations:
--   GitHub issue #334 ([VIG-01.05])
--   docs/vignette-encounters-implementation-plan.md Realtime section
--   supabase/migrations/20260519000000_catalog_realtime_publication.sql
--   supabase/migrations/20260613000002_vignette_instance_tables.sql
--   supabase/migrations/20260613000003_vignette_sharing_entitlement.sql
--   supabase/migrations/20260613000004_vignette_rls_policies.sql
--------------------------------------------------------------------------------
do $$
declare
	vignette_table_name text;
	vignette_realtime_tables text [] := array [
		'vignette_encounter',
		'vignette_encounter_monster',
		'vignette_encounter_survivor',
		'vignette_encounter_survivor_fighting_art',
		'vignette_encounter_survivor_secret_fighting_art',
		'vignette_encounter_survivor_disorder',
		'vignette_encounter_survivor_ability_impairment',
		'vignette_encounter_survivor_status',
		'vignette_encounter_gear_grid',
		'vignette_encounter_shared_user'
	];
begin
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
end $$;
