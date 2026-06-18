--------------------------------------------------------------------------------
-- Active Vignette Encounter Monster State Tables
-- Tracks mutable mood, trait, and survivor-status cards attached to copied
-- monsters during a live vignette encounter.
--------------------------------------------------------------------------------
create table public.vignette_encounter_monster_mood (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_monster_id uuid not null references public.vignette_encounter_monster(id) on delete cascade,
	mood_id uuid not null references public.mood(id) on delete restrict,
	-- Constraints
	unique (vignette_encounter_monster_id, mood_id)
);

create table public.vignette_encounter_monster_trait (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_monster_id uuid not null references public.vignette_encounter_monster(id) on delete cascade,
	trait_id uuid not null references public.trait(id) on delete restrict,
	-- Constraints
	unique (vignette_encounter_monster_id, trait_id)
);

create table public.vignette_encounter_monster_survivor_status (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	vignette_encounter_monster_id uuid not null references public.vignette_encounter_monster(id) on delete cascade,
	survivor_status_id uuid not null references public.survivor_status(id) on delete restrict,
	-- Constraints
	unique (vignette_encounter_monster_id, survivor_status_id)
);

--------------------------------------------------------------------------------
-- Row Level Security
--------------------------------------------------------------------------------
alter table public.vignette_encounter_monster_mood enable row level security;
alter table public.vignette_encounter_monster_trait enable row level security;
alter table public.vignette_encounter_monster_survivor_status enable row level security;

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
			$sql$create policy "Allow select for active member" on public.%1$I for
select to authenticated using (
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
			$sql$create policy "Allow insert for active owner" on public.%1$I for
insert to authenticated with check (
	exists (
		select 1
		from public.vignette_encounter_monster vem
		where vem.id = %1$I.vignette_encounter_monster_id
			and public.is_active_vignette_encounter_owner(vem.vignette_encounter_id)
	)
)$sql$,
			table_name
		);

		execute format(
			$sql$create policy "Allow update for active member" on public.%1$I for
update to authenticated using (
	exists (
		select 1
		from public.vignette_encounter_monster vem
		where vem.id = %1$I.vignette_encounter_monster_id
			and public.can_access_active_vignette_encounter(vem.vignette_encounter_id)
	)
) with check (
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
			$sql$create policy "Allow delete for active owner" on public.%1$I for delete to authenticated using (
	exists (
		select 1
		from public.vignette_encounter_monster vem
		where vem.id = %1$I.vignette_encounter_monster_id
			and public.is_active_vignette_encounter_owner(vem.vignette_encounter_id)
	)
)$sql$,
			table_name
		);
	end loop;
end $$;

--------------------------------------------------------------------------------
-- Data API Privileges
--------------------------------------------------------------------------------
grant select, insert, update, delete on table public.vignette_encounter_monster_mood to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_monster_trait to authenticated;
grant select, insert, update, delete on table public.vignette_encounter_monster_survivor_status to authenticated;

--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_vignette_encounter_monster_mood_monster on public.vignette_encounter_monster_mood(vignette_encounter_monster_id);
create index idx_vignette_encounter_monster_mood_mood on public.vignette_encounter_monster_mood(mood_id);
create index idx_vignette_encounter_monster_trait_monster on public.vignette_encounter_monster_trait(vignette_encounter_monster_id);
create index idx_vignette_encounter_monster_trait_trait on public.vignette_encounter_monster_trait(trait_id);
create index idx_vignette_encounter_monster_survivor_status_monster on public.vignette_encounter_monster_survivor_status(vignette_encounter_monster_id);
create index idx_vignette_encounter_monster_survivor_status_status on public.vignette_encounter_monster_survivor_status(survivor_status_id);

alter table public.vignette_encounter_monster_mood replica identity full;
alter table public.vignette_encounter_monster_trait replica identity full;
alter table public.vignette_encounter_monster_survivor_status replica identity full;

--------------------------------------------------------------------------------
-- Updated At Triggers
--------------------------------------------------------------------------------
create trigger set_updated_at before
update on public.vignette_encounter_monster_mood for each row execute function public.update_updated_at();
create trigger set_updated_at before
update on public.vignette_encounter_monster_trait for each row execute function public.update_updated_at();
create trigger set_updated_at before
update on public.vignette_encounter_monster_survivor_status for each row execute function public.update_updated_at();

--------------------------------------------------------------------------------
-- Realtime Publication
--------------------------------------------------------------------------------
do $$
declare
	table_name text;
begin
	if exists (
		select 1
		from pg_publication
		where pubname = 'supabase_realtime'
	) then
		foreach table_name in array array[
			'vignette_encounter_monster_mood',
			'vignette_encounter_monster_trait',
			'vignette_encounter_monster_survivor_status'
		] loop
			if not exists (
				select 1
				from pg_publication_tables
				where pubname = 'supabase_realtime'
					and schemaname = 'public'
					and tablename = table_name
			) then
				execute format(
					'alter publication supabase_realtime add table public.%I',
					table_name
				);
			end if;
		end loop;
	end if;
end $$;
