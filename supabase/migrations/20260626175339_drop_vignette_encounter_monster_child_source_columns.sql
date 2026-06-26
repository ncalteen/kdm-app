--------------------------------------------------------------------------------
-- Drop Vignette Encounter Monster Child Source Columns
--------------------------------------------------------------------------------

drop trigger if exists validate_vignette_encounter_monster_mood_source on public.vignette_encounter_monster_mood;
drop trigger if exists validate_vignette_encounter_monster_trait_source on public.vignette_encounter_monster_trait;
drop trigger if exists validate_vignette_encounter_monster_survivor_status_source on public.vignette_encounter_monster_survivor_status;
drop function if exists public.validate_vignette_encounter_monster_mood_source();
drop function if exists public.validate_vignette_encounter_monster_trait_source();
drop function if exists public.validate_vignette_encounter_monster_survivor_status_source();

create or replace function public.create_vignette_encounter_from_catalog(
	target_vignette_monster_id uuid,
	target_level_number int
) returns uuid language plpgsql security definer
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
			mood_id
		)
		select created_monster_id,
			vmlm.mood_id
		from public.vignette_monster_level_mood vmlm
		where vmlm.vignette_monster_level_id = monster_level.id;

		insert into public.vignette_encounter_monster_trait (
			vignette_encounter_monster_id,
			trait_id
		)
		select created_monster_id,
			vmlt.trait_id
		from public.vignette_monster_level_trait vmlt
		where vmlt.vignette_monster_level_id = monster_level.id;

		insert into public.vignette_encounter_monster_survivor_status (
			vignette_encounter_monster_id,
			survivor_status_id
		)
		select created_monster_id,
			vmlss.survivor_status_id
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
			speed,
			strength,
			survival,
			survivor_name,
			survivor_type,
			understanding,
			vignette_encounter_id,
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
			source_survivor.speed,
			source_survivor.strength,
			source_survivor.survival,
			source_survivor.survivor_name,
			source_survivor.survivor_type,
			source_survivor.understanding,
			created_encounter_id,
			source_survivor.waist_armor,
			source_survivor.weapon_proficiency,
			source_survivor.weapon_type_id
		)
		returning id into created_survivor_id;

		insert into public.vignette_encounter_survivor_ability_impairment (
			vignette_encounter_survivor_id,
			ability_impairment_id
		)
		select created_survivor_id,
			vsai.ability_impairment_id
		from public.vignette_survivor_ability_impairment vsai
		where vsai.vignette_survivor_id = source_survivor.id;

		insert into public.vignette_encounter_survivor_disorder (
			vignette_encounter_survivor_id,
			disorder_id
		)
		select created_survivor_id,
			vsd.disorder_id
		from public.vignette_survivor_disorder vsd
		where vsd.vignette_survivor_id = source_survivor.id;

		insert into public.vignette_encounter_survivor_fighting_art (
			vignette_encounter_survivor_id,
			fighting_art_id
		)
		select created_survivor_id,
			vsfa.fighting_art_id
		from public.vignette_survivor_fighting_art vsfa
		where vsfa.vignette_survivor_id = source_survivor.id;

		insert into public.vignette_encounter_survivor_secret_fighting_art (
			vignette_encounter_survivor_id,
			secret_fighting_art_id
		)
		select created_survivor_id,
			vssfa.secret_fighting_art_id
		from public.vignette_survivor_secret_fighting_art vssfa
		where vssfa.vignette_survivor_id = source_survivor.id;

		insert into public.vignette_encounter_survivor_gear_grid (
			vignette_encounter_survivor_id,
			pos_top_left,
			pos_top_center,
			pos_top_right,
			pos_mid_left,
			pos_mid_center,
			pos_mid_right,
			pos_bottom_left,
			pos_bottom_center,
			pos_bottom_right,
			selected_armor_set_id
		)
		select created_survivor_id,
			vsgg.pos_top_left,
			vsgg.pos_top_center,
			vsgg.pos_top_right,
			vsgg.pos_mid_left,
			vsgg.pos_mid_center,
			vsgg.pos_mid_right,
			vsgg.pos_bottom_left,
			vsgg.pos_bottom_center,
			vsgg.pos_bottom_right,
			vsgg.selected_armor_set_id
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

alter table public.vignette_encounter_monster_mood
	drop column if exists source_vignette_monster_level_mood_id;

alter table public.vignette_encounter_monster_trait
	drop column if exists source_vignette_monster_level_trait_id;

alter table public.vignette_encounter_monster_survivor_status
	drop column if exists source_vignette_monster_level_survivor_status_id;
