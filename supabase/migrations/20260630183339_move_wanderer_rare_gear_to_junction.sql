--------------------------------------------------------------------------------
-- Wanderer Rare Gear Junction
--
-- Moves legacy `wanderer.rare_gear_ids` array data into a proper junction
-- table. This mirrors the current `wanderer_ability_impairment` access model:
-- non-custom wanderers are globally readable, and custom wanderer owners may
-- read and mutate their rows.
--------------------------------------------------------------------------------

create table public.wanderer_rare_gear (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	wanderer_id uuid not null references public.wanderer(id) on delete cascade,
	rare_gear_id uuid not null references public.gear(id) on delete cascade,
	-- Constraints
	unique (wanderer_id, rare_gear_id)
);

--------------------------------------------------------------------------------
-- Migrate Legacy Wanderer Rare Gear
--------------------------------------------------------------------------------

insert into public.wanderer_rare_gear (wanderer_id, rare_gear_id)
select distinct w.id,
	rare_gear_id
from public.wanderer w
	cross join lateral unnest(w.rare_gear_ids) as rare_gear_id
where w.rare_gear_ids is not null
	and array_length(w.rare_gear_ids, 1) > 0
	and rare_gear_id is not null on conflict (wanderer_id, rare_gear_id) do nothing;

--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------

alter table public.wanderer_rare_gear enable row level security;

create policy "Allow insert for authenticated and custom" on public.wanderer_rare_gear for
insert to authenticated with check (
	exists (
		select 1
		from public.wanderer w
		where w.id = wanderer_id
			and w.custom
			and w.user_id = (
				select auth.uid()
			)
	)
);

create policy "Allow select for authenticated and non-custom" on public.wanderer_rare_gear for
select to authenticated using (
	exists (
		select 1
		from public.wanderer w
		where w.id = wanderer_id
			and not w.custom
	)
);

create policy "Allow select for owner and custom" on public.wanderer_rare_gear for
select to authenticated using (
	exists (
		select 1
		from public.wanderer w
		where w.id = wanderer_id
			and w.custom
			and w.user_id = (
				select auth.uid()
			)
	)
);

create policy "Allow update for owner and custom" on public.wanderer_rare_gear for
update to authenticated using (
	exists (
		select 1
		from public.wanderer w
		where w.id = wanderer_id
			and w.custom
			and w.user_id = (
				select auth.uid()
			)
	)
) with check (
	exists (
		select 1
		from public.wanderer w
		where w.id = wanderer_id
			and w.custom
			and w.user_id = (
				select auth.uid()
			)
	)
);

create policy "Allow delete for owner and custom" on public.wanderer_rare_gear for delete to authenticated using (
	exists (
		select 1
		from public.wanderer w
		where w.id = wanderer_id
			and w.custom
			and w.user_id = (
				select auth.uid()
			)
	)
);

--------------------------------------------------------------------------------
-- Grants
--------------------------------------------------------------------------------

grant select, insert, update, delete on table public.wanderer_rare_gear to authenticated;
grant all privileges on table public.wanderer_rare_gear to service_role;

--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------

create index idx_wanderer_rare_gear_wanderer on public.wanderer_rare_gear(wanderer_id);
create index idx_wanderer_rare_gear_gear on public.wanderer_rare_gear(rare_gear_id);

--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------

create trigger set_updated_at before
update on public.wanderer_rare_gear for each row execute function public.update_updated_at();

--------------------------------------------------------------------------------
-- Drop Legacy Column
--------------------------------------------------------------------------------

alter table public.wanderer drop column rare_gear_ids;
