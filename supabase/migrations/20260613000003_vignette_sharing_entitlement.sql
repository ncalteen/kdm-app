--------------------------------------------------------------------------------
-- Vignette Encounter Sharing And Entitlement
-- Active instance collaboration for Lantern Hoard owners. This intentionally
-- mirrors settlement sharing while keeping vignette membership independent
-- from settlement membership.
--------------------------------------------------------------------------------
create table vignette_encounter_shared_user (
	-- Metadata
	created_at timestamptz not null default now(),
	-- Data
	vignette_encounter_id uuid not null references vignette_encounter(id) on delete cascade,
	shared_user_id uuid not null references auth.users(id) on delete cascade,
	created_by uuid not null references auth.users(id) on delete cascade,
	-- Constraints
	primary key (vignette_encounter_id, shared_user_id),
	constraint vignette_encounter_shared_user_no_self_share check (shared_user_id <> created_by),
	constraint fk_vignette_encounter_shared_user_settings foreign key (shared_user_id) references user_settings(user_id) on delete cascade
);
--------------------------------------------------------------------------------
-- Helper: is_vignette_encounter_owner(uuid)
--
-- SECURITY DEFINER predicate for sharing-table RLS. The parent
-- `vignette_encounter` table has its detailed owner/collaborator policies added
-- in VIG-01.04, so this helper avoids re-entering parent-table RLS while still
-- tying share management to the owning user.
--------------------------------------------------------------------------------
create or replace function is_vignette_encounter_owner(target_vignette_encounter uuid) returns boolean language sql stable security definer
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
--------------------------------------------------------------------------------
-- Helper: can_share_vignette_encounters(uuid)
--
-- Returns true only when the provided user is the caller and has an active or
-- trialing Lantern Hoard subscription. This is stricter than `user_can_share()`
-- so future settlement-sharing tiers can evolve without widening vignette
-- sharing access by accident.
--------------------------------------------------------------------------------
create or replace function can_share_vignette_encounters(target_user_id uuid) returns boolean language sql stable security definer
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
--------------------------------------------------------------------------------
-- Privilege Lockdown
--------------------------------------------------------------------------------
revoke all on function public.is_vignette_encounter_owner(uuid)
from public;
revoke execute on function public.is_vignette_encounter_owner(uuid)
from anon;
grant execute on function public.is_vignette_encounter_owner(uuid) to authenticated;

revoke all on function public.can_share_vignette_encounters(uuid)
from public;
revoke execute on function public.can_share_vignette_encounters(uuid)
from anon;
grant execute on function public.can_share_vignette_encounters(uuid) to authenticated;
--------------------------------------------------------------------------------
-- Row Level Security Policies
--------------------------------------------------------------------------------
alter table vignette_encounter_shared_user enable row level security;

create policy "Allow insert for entitled owner" on vignette_encounter_shared_user for
insert to authenticated with check (
		is_vignette_encounter_owner(vignette_encounter_id)
		and created_by = (
			select auth.uid()
		)
		and can_share_vignette_encounters(
			(
				select auth.uid()
			)
		)
	);

create policy "Allow select for owner" on vignette_encounter_shared_user for
select to authenticated using (is_vignette_encounter_owner(vignette_encounter_id));

create policy "Allow select for shared" on vignette_encounter_shared_user for
select to authenticated using (
		shared_user_id = (
			select auth.uid()
		)
	);

create policy "Allow delete for owner" on vignette_encounter_shared_user for delete to authenticated using (is_vignette_encounter_owner(vignette_encounter_id));
--------------------------------------------------------------------------------
-- Data API Privileges
--------------------------------------------------------------------------------
grant select, insert, delete on table vignette_encounter_shared_user to authenticated;
revoke update on table vignette_encounter_shared_user from authenticated;
--------------------------------------------------------------------------------
-- Indexes
--------------------------------------------------------------------------------
create index idx_vignette_encounter_shared_user_vignette_encounter on vignette_encounter_shared_user(vignette_encounter_id);
create index idx_vignette_encounter_shared_user_shared_user on vignette_encounter_shared_user(shared_user_id);
create index idx_vignette_encounter_shared_user_created_by on vignette_encounter_shared_user(created_by);
