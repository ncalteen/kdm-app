--------------------------------------------------------------------------------
-- Encounter Active Monster Survivor Status
--------------------------------------------------------------------------------

create table public.encounter_active_monster_survivor_status (
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	encounter_active_monster_id uuid not null references public.encounter_active_monster(id) on delete cascade,
	settlement_id uuid not null default '00000000-0000-0000-0000-000000000000'::uuid references public.settlement(id) on delete cascade,
	survivor_status_id uuid not null references public.survivor_status(id) on delete cascade,
	unique (encounter_active_monster_id, survivor_status_id)
);

alter table public.encounter_active_monster_survivor_status enable row level security;

create policy "Allow select for member" on public.encounter_active_monster_survivor_status for
select to authenticated using (
	is_settlement_owner(settlement_id)
	or is_settlement_collaborator(settlement_id)
);

create policy "Allow insert for member" on public.encounter_active_monster_survivor_status for
insert to authenticated with check (
	is_settlement_owner(settlement_id)
	or is_settlement_collaborator(settlement_id)
);

create policy "Allow update for member" on public.encounter_active_monster_survivor_status for
update to authenticated using (
	is_settlement_owner(settlement_id)
	or is_settlement_collaborator(settlement_id)
) with check (
	is_settlement_owner(settlement_id)
	or is_settlement_collaborator(settlement_id)
);

create policy "Allow delete for member" on public.encounter_active_monster_survivor_status for delete to authenticated using (
	is_settlement_owner(settlement_id)
	or is_settlement_collaborator(settlement_id)
);

create policy "Allow select via active encounter" on public.survivor_status for
select to authenticated using (
	custom
	and exists (
		select 1
		from public.encounter_active_monster_survivor_status eamss
			join public.encounter_active_monster eam on eam.id = eamss.encounter_active_monster_id
		where eamss.survivor_status_id = survivor_status.id
			and (
				is_settlement_owner(eam.settlement_id)
				or is_settlement_collaborator(eam.settlement_id)
			)
			and is_settlement_member(eam.settlement_id, survivor_status.user_id)
	)
);

create or replace function public.propagate_encounter_active_monster_child_settlement_id() returns trigger language plpgsql security definer
set search_path = '' as $$ begin
update public.encounter_active_monster_trait
set settlement_id = new.settlement_id
where encounter_active_monster_id = new.id;
update public.encounter_active_monster_mood
set settlement_id = new.settlement_id
where encounter_active_monster_id = new.id;
update public.encounter_active_monster_survivor_status
set settlement_id = new.settlement_id
where encounter_active_monster_id = new.id;
return new;
end;
$$;

revoke all on function public.propagate_encounter_active_monster_child_settlement_id()
from public;

create trigger set_settlement_id before
insert
	or
update of encounter_active_monster_id,
	settlement_id on public.encounter_active_monster_survivor_status for each row execute function public.set_encounter_active_monster_child_settlement_id();

create index idx_encounter_active_monster_survivor_status_monster on public.encounter_active_monster_survivor_status(encounter_active_monster_id);
create index idx_encounter_active_monster_survivor_status_settlement on public.encounter_active_monster_survivor_status(settlement_id);
create index idx_encounter_active_monster_survivor_status_status on public.encounter_active_monster_survivor_status(survivor_status_id);

create trigger set_updated_at before
update on public.encounter_active_monster_survivor_status for each row execute function update_updated_at();

alter table public.encounter_active_monster_survivor_status replica identity full;

do $$
begin
	if exists (
		select 1
		from pg_publication
		where pubname = 'supabase_realtime'
	)
	and not exists (
		select 1
		from pg_publication_tables
		where pubname = 'supabase_realtime'
			and schemaname = 'public'
			and tablename = 'encounter_active_monster_survivor_status'
	) then
		alter publication supabase_realtime add table public.encounter_active_monster_survivor_status;
	end if;
end $$;
