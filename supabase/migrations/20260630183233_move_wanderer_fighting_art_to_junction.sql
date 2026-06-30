--------------------------------------------------------------------------------
-- Wanderer Fighting Art Junction
--
-- Moves legacy `wanderer.fighting_art_ids` array data into a proper junction
-- table. This mirrors the current `wanderer_ability_impairment` access model:
-- non-custom wanderers are globally readable, and custom wanderer owners may
-- read and mutate their rows.
--------------------------------------------------------------------------------

create table public.wanderer_fighting_art (
	-- Metadata
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	-- Data
	wanderer_id uuid not null references public.wanderer(id) on delete cascade,
	fighting_art_id uuid not null references public.fighting_art(id) on delete cascade,
	-- Constraints
	unique (wanderer_id, fighting_art_id)
);

--------------------------------------------------------------------------------
-- Migrate Legacy Wanderer Fighting Arts
--------------------------------------------------------------------------------

insert into public.wanderer_fighting_art (wanderer_id, fighting_art_id)
select distinct w.id,
	fighting_art_id
from public.wanderer w
	cross join lateral unnest(w.fighting_art_ids) as fighting_art_id
where w.fighting_art_ids is not null
	and array_length(w.fighting_art_ids, 1) > 0
	and fighting_art_id is not null on conflict (wanderer_id, fighting_art_id) do nothing;

--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------

alter table public.wanderer_fighting_art enable row level security;

create policy "Allow insert for authenticated and custom" on public.wanderer_fighting_art for
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

create policy "Allow select for authenticated and non-custom" on public.wanderer_fighting_art for
select to authenticated using (
	exists (
		select 1
		from public.wanderer w
		where w.id = wanderer_id
			and not w.custom
	)
);

create policy "Allow select for owner and custom" on public.wanderer_fighting_art for
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

create policy "Allow update for owner and custom" on public.wanderer_fighting_art for
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

create policy "Allow delete for owner and custom" on public.wanderer_fighting_art for delete to authenticated using (
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

grant select, insert, update, delete on table public.wanderer_fighting_art to authenticated;
grant all privileges on table public.wanderer_fighting_art to service_role;

--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------

create index idx_wanderer_fighting_art_wanderer on public.wanderer_fighting_art(wanderer_id);
create index idx_wanderer_fighting_art_fighting_art on public.wanderer_fighting_art(fighting_art_id);

--------------------------------------------------------------------------------
-- Triggers
--------------------------------------------------------------------------------

create trigger set_updated_at before
update on public.wanderer_fighting_art for each row execute function public.update_updated_at();

--------------------------------------------------------------------------------
-- Drop Legacy Column
--------------------------------------------------------------------------------

alter table public.wanderer drop column fighting_art_ids;
