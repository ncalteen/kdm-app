--------------------------------------------------------------------------------
-- Fix: Shared User RLS Infinite Recursion
--
-- All *_shared_user tables have INSERT policies that subquery their parent
-- table. The parent tables have shared SELECT policies that subquery back to
-- the *_shared_user table. Combined with FOR ALL admin policies on both,
-- PostgreSQL detects infinite recursion during RLS evaluation.
--
-- Fix: Create SECURITY DEFINER helper functions for each parent table's
-- ownership check and use them in the *_shared_user INSERT policies. These
-- functions bypass RLS, breaking the circular dependency.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- Helper Functions (SECURITY DEFINER — bypass RLS)
--------------------------------------------------------------------------------
create or replace function is_character_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.character
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_collective_cognition_reward_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.collective_cognition_reward
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_disorder_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.disorder
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_fighting_art_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.fighting_art
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_gear_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.gear
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_innovation_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.innovation
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_knowledge_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.knowledge
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_location_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.location
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_milestone_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.milestone
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_nemesis_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.nemesis
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_neurosis_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.neurosis
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_pattern_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.pattern
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_philosophy_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.philosophy
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_principle_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.principle
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_quarry_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.quarry
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_resource_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.resource
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_secret_fighting_art_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.secret_fighting_art
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_seed_pattern_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.seed_pattern
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_settlement_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.settlement
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_strain_milestone_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.strain_milestone
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_wanderer_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.wanderer
    where id = record_id
      and user_id = auth.uid()
  );
$$;
create or replace function is_weapon_type_owner(record_id uuid) returns boolean language sql
set search_path = '' stable security definer as $$
select exists (
    select 1
    from public.weapon_type
    where id = record_id
      and user_id = auth.uid()
  );
$$;
--------------------------------------------------------------------------------
-- Drop and Recreate INSERT Policies on *_shared_user Tables
--
-- Each INSERT policy previously did:
--   exists (select 1 from <parent> where id = <fk> and user_id = auth.uid())
-- Now uses the SECURITY DEFINER function instead.
--------------------------------------------------------------------------------
-- character_shared_user
drop policy if exists "Allow insert for authenticated" on character_shared_user;
create policy "Allow insert for authenticated" on character_shared_user for
insert to authenticated with check (
    is_character_owner(character_id)
    and user_id = (
      select auth.uid()
    )
  );
-- collective_cognition_reward_shared_user
drop policy if exists "Allow insert for authenticated" on collective_cognition_reward_shared_user;
create policy "Allow insert for authenticated" on collective_cognition_reward_shared_user for
insert to authenticated with check (
    is_collective_cognition_reward_owner(collective_cognition_reward_id)
    and user_id = (
      select auth.uid()
    )
  );
-- disorder_shared_user
drop policy if exists "Allow insert for authenticated" on disorder_shared_user;
create policy "Allow insert for authenticated" on disorder_shared_user for
insert to authenticated with check (
    is_disorder_owner(disorder_id)
    and user_id = (
      select auth.uid()
    )
  );
-- fighting_art_shared_user
drop policy if exists "Allow insert for authenticated" on fighting_art_shared_user;
create policy "Allow insert for authenticated" on fighting_art_shared_user for
insert to authenticated with check (
    is_fighting_art_owner(fighting_art_id)
    and user_id = (
      select auth.uid()
    )
  );
-- gear_shared_user
drop policy if exists "Allow insert for authenticated" on gear_shared_user;
create policy "Allow insert for authenticated" on gear_shared_user for
insert to authenticated with check (
    is_gear_owner(gear_id)
    and user_id = (
      select auth.uid()
    )
  );
-- innovation_shared_user
drop policy if exists "Allow insert for authenticated" on innovation_shared_user;
create policy "Allow insert for authenticated" on innovation_shared_user for
insert to authenticated with check (
    is_innovation_owner(innovation_id)
    and user_id = (
      select auth.uid()
    )
  );
-- knowledge_shared_user
drop policy if exists "Allow insert for authenticated" on knowledge_shared_user;
create policy "Allow insert for authenticated" on knowledge_shared_user for
insert to authenticated with check (
    is_knowledge_owner(knowledge_id)
    and user_id = (
      select auth.uid()
    )
  );
-- location_shared_user
drop policy if exists "Allow insert for authenticated" on location_shared_user;
create policy "Allow insert for authenticated" on location_shared_user for
insert to authenticated with check (
    is_location_owner(location_id)
    and user_id = (
      select auth.uid()
    )
  );
-- milestone_shared_user
drop policy if exists "Allow insert for authenticated" on milestone_shared_user;
create policy "Allow insert for authenticated" on milestone_shared_user for
insert to authenticated with check (
    is_milestone_owner(milestone_id)
    and user_id = (
      select auth.uid()
    )
  );
-- nemesis_shared_user
drop policy if exists "Allow insert for authenticated" on nemesis_shared_user;
create policy "Allow insert for authenticated" on nemesis_shared_user for
insert to authenticated with check (
    is_nemesis_owner(nemesis_id)
    and user_id = (
      select auth.uid()
    )
  );
-- neurosis_shared_user
drop policy if exists "Allow insert for authenticated" on neurosis_shared_user;
create policy "Allow insert for authenticated" on neurosis_shared_user for
insert to authenticated with check (
    is_neurosis_owner(neurosis_id)
    and user_id = (
      select auth.uid()
    )
  );
-- pattern_shared_user
drop policy if exists "Allow insert for authenticated" on pattern_shared_user;
create policy "Allow insert for authenticated" on pattern_shared_user for
insert to authenticated with check (
    is_pattern_owner(pattern_id)
    and user_id = (
      select auth.uid()
    )
  );
-- philosophy_shared_user
drop policy if exists "Allow insert for authenticated" on philosophy_shared_user;
create policy "Allow insert for authenticated" on philosophy_shared_user for
insert to authenticated with check (
    is_philosophy_owner(philosophy_id)
    and user_id = (
      select auth.uid()
    )
  );
-- principle_shared_user
drop policy if exists "Allow insert for authenticated" on principle_shared_user;
create policy "Allow insert for authenticated" on principle_shared_user for
insert to authenticated with check (
    is_principle_owner(principle_id)
    and user_id = (
      select auth.uid()
    )
  );
-- quarry_shared_user
drop policy if exists "Allow insert for authenticated" on quarry_shared_user;
create policy "Allow insert for authenticated" on quarry_shared_user for
insert to authenticated with check (
    is_quarry_owner(quarry_id)
    and user_id = (
      select auth.uid()
    )
  );
-- resource_shared_user
drop policy if exists "Allow insert for authenticated" on resource_shared_user;
create policy "Allow insert for authenticated" on resource_shared_user for
insert to authenticated with check (
    is_resource_owner(resource_id)
    and user_id = (
      select auth.uid()
    )
  );
-- secret_fighting_art_shared_user
drop policy if exists "Allow insert for authenticated" on secret_fighting_art_shared_user;
create policy "Allow insert for authenticated" on secret_fighting_art_shared_user for
insert to authenticated with check (
    is_secret_fighting_art_owner(secret_fighting_art_id)
    and user_id = (
      select auth.uid()
    )
  );
-- seed_pattern_shared_user
drop policy if exists "Allow insert for authenticated" on seed_pattern_shared_user;
create policy "Allow insert for authenticated" on seed_pattern_shared_user for
insert to authenticated with check (
    is_seed_pattern_owner(seed_pattern_id)
    and user_id = (
      select auth.uid()
    )
  );
-- settlement_shared_user
drop policy if exists "Allow insert for authenticated" on settlement_shared_user;
create policy "Allow insert for authenticated" on settlement_shared_user for
insert to authenticated with check (
    is_settlement_owner(settlement_id)
    and user_id = (
      select auth.uid()
    )
  );
-- strain_milestone_shared_user
drop policy if exists "Allow insert for authenticated" on strain_milestone_shared_user;
create policy "Allow insert for authenticated" on strain_milestone_shared_user for
insert to authenticated with check (
    is_strain_milestone_owner(strain_milestone_id)
    and user_id = (
      select auth.uid()
    )
  );
-- wanderer_shared_user
drop policy if exists "Allow insert for authenticated" on wanderer_shared_user;
create policy "Allow insert for authenticated" on wanderer_shared_user for
insert to authenticated with check (
    is_wanderer_owner(wanderer_id)
    and user_id = (
      select auth.uid()
    )
  );
-- weapon_type_shared_user
drop policy if exists "Allow insert for authenticated" on weapon_type_shared_user;
create policy "Allow insert for authenticated" on weapon_type_shared_user for
insert to authenticated with check (
    is_weapon_type_owner(weapon_type_id)
    and user_id = (
      select auth.uid()
    )
  );