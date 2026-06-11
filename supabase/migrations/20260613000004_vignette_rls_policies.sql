--------------------------------------------------------------------------------
-- Vignette Encounter RLS Policies
-- Owner/collaborator access for active one-shot showdown instances.
--------------------------------------------------------------------------------
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
select exists (
		select 1
		from public.vignette_encounter ve
		where ve.id = target_vignette_encounter
			and ve.status = 'ACTIVE'
			and ve.user_id = (
				select auth.uid()
			)
	);
$$;

create or replace function public.can_access_active_vignette_encounter(target_vignette_encounter uuid) returns boolean language sql stable security definer
set search_path = '' as $$
select exists (
		select 1
		from public.vignette_encounter ve
		where ve.id = target_vignette_encounter
			and ve.status = 'ACTIVE'
			and (
				ve.user_id = (
					select auth.uid()
				)
				or exists (
					select 1
					from public.vignette_encounter_shared_user vesu
					where vesu.vignette_encounter_id = ve.id
						and vesu.shared_user_id = (
							select auth.uid()
						)
				)
			)
	);
$$;

create or replace function public.can_update_vignette_encounter_as_collaborator(
	target_vignette_encounter uuid,
	proposed_user_id uuid,
	proposed_definition_id uuid,
	proposed_level_id uuid,
	proposed_status text,
	proposed_ended_at timestamptz
) returns boolean language sql stable security definer
set search_path = '' as $$
select exists (
		select 1
		from public.vignette_encounter ve
		where ve.id = target_vignette_encounter
			and ve.status = 'ACTIVE'
			and ve.user_id = proposed_user_id
			and ve.vignette_encounter_definition_id = proposed_definition_id
			and ve.vignette_encounter_level_id = proposed_level_id
			and proposed_status = 'ACTIVE'
			and proposed_ended_at is null
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

revoke all on function public.can_update_vignette_encounter_as_collaborator(uuid, uuid, uuid, uuid, text, timestamptz)
from public;
revoke execute on function public.can_update_vignette_encounter_as_collaborator(uuid, uuid, uuid, uuid, text, timestamptz)
from anon;
grant execute on function public.can_update_vignette_encounter_as_collaborator(uuid, uuid, uuid, uuid, text, timestamptz) to authenticated;

create policy "Allow select for active member" on public.vignette_encounter for
select to authenticated using (public.can_access_active_vignette_encounter(id));

create policy "Allow insert for owner" on public.vignette_encounter for
insert to authenticated with check (
		user_id = (
			select auth.uid()
		)
		and status = 'ACTIVE'
		and ended_at is null
		and exists (
			select 1
			from public.vignette_encounter_level vel
				join public.vignette_encounter_definition ved on ved.id = vel.vignette_encounter_definition_id
			where vel.id = vignette_encounter_level_id
				and ved.id = vignette_encounter_definition_id
				and ved.published
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
				from public.vignette_encounter_level vel
					join public.vignette_encounter_definition ved on ved.id = vel.vignette_encounter_definition_id
				where vel.id = vignette_encounter_level_id
					and ved.id = vignette_encounter_definition_id
					and ved.published
			)
		)
		or public.can_update_vignette_encounter_as_collaborator(
			id,
			user_id,
			vignette_encounter_definition_id,
			vignette_encounter_level_id,
			status,
			ended_at
		)
	);

create policy "Allow delete for active owner" on public.vignette_encounter for delete to authenticated using (public.is_active_vignette_encounter_owner(id));

create policy "Allow select for active member" on public.vignette_encounter_monster for
select to authenticated using (public.can_access_active_vignette_encounter(vignette_encounter_id));
create policy "Allow insert for active owner" on public.vignette_encounter_monster for
insert to authenticated with check (public.is_active_vignette_encounter_owner(vignette_encounter_id));
create policy "Allow update for active member" on public.vignette_encounter_monster for
update to authenticated using (public.can_access_active_vignette_encounter(vignette_encounter_id)) with check (public.can_access_active_vignette_encounter(vignette_encounter_id));
create policy "Allow delete for active owner" on public.vignette_encounter_monster for delete to authenticated using (public.is_active_vignette_encounter_owner(vignette_encounter_id));

create policy "Allow select for active member" on public.vignette_encounter_survivor for
select to authenticated using (public.can_access_active_vignette_encounter(vignette_encounter_id));
create policy "Allow insert for active owner" on public.vignette_encounter_survivor for
insert to authenticated with check (public.is_active_vignette_encounter_owner(vignette_encounter_id));
create policy "Allow update for active member" on public.vignette_encounter_survivor for
update to authenticated using (public.can_access_active_vignette_encounter(vignette_encounter_id)) with check (public.can_access_active_vignette_encounter(vignette_encounter_id));
create policy "Allow delete for active owner" on public.vignette_encounter_survivor for delete to authenticated using (public.is_active_vignette_encounter_owner(vignette_encounter_id));

do $$
declare
	table_name text;
begin
	foreach table_name in array array[
		'vignette_encounter_survivor_fighting_art',
		'vignette_encounter_survivor_secret_fighting_art',
		'vignette_encounter_survivor_disorder',
		'vignette_encounter_survivor_ability_impairment',
		'vignette_encounter_survivor_status',
		'vignette_encounter_gear_grid'
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
