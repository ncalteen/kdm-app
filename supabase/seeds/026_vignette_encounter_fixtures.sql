--------------------------------------------------------------------------------
-- Vignette Encounter Fixture Data
-- Clearly marked fixture-only one-shots for integration and UI development.
--------------------------------------------------------------------------------
do $$
declare
	white_lion_id uuid;
	red_witches_id uuid;
	feeding_time_id uuid;
	frantic_spinning_id uuid;
	necrotoxins_id uuid;
	aleatoric_melody_id uuid;
	cunning_id uuid;
	merciless_id uuid;
	boiling_blood_id uuid;
	discouraging_presence_id uuid;
	red_initiate_id uuid;
	witching_cloak_id uuid;
	battle_tempo_id uuid;
	bloody_hands_id uuid;
	dreaded_decade_id uuid;
	polarized_aura_id uuid;
	somatic_static_id uuid;
	sword_id uuid;
	dagger_id uuid;
	lantern_id uuid;
	shield_id uuid;
	spear_id uuid;
	founding_stone_id uuid;
	cloth_id uuid;
	bone_dagger_id uuid;
	skull_helm_id uuid;
	rawhide_headband_id uuid;
	white_lion_gauntlet_id uuid;
	king_spear_id uuid;
	lantern_sword_id uuid;
	gorment_mask_id uuid;
	leader_id uuid;
	mighty_strike_id uuid;
	strategist_id uuid;
	acrobatics_id uuid;
	tough_id uuid;
	red_fist_id uuid;
	kings_step_id uuid;
	synchronized_strike_id uuid;
	fear_of_the_dark_id uuid;
	cowardice_id uuid;
	brain_smog_id uuid;
	veteran_id uuid;
	servant_of_fate_id uuid;
	revenant_id uuid;
begin
	select id into strict white_lion_id
	from quarry
	where monster_name = 'White Lion'
		and not custom;

	select id into strict red_witches_id
	from nemesis
	where monster_name = 'Red Witches'
		and not custom
		and multi_monster;

	select id into strict feeding_time_id from mood where mood_name = 'Feeding Time' and not custom;
	select id into strict frantic_spinning_id from mood where mood_name = 'Frantic Spinning' and not custom;
	select id into strict necrotoxins_id from mood where mood_name = 'Necrotoxins' and not custom;
	select id into strict aleatoric_melody_id from mood where mood_name = 'Aleatoric Melody' and not custom;

	select id into strict cunning_id from trait where trait_name = 'Cunning' and not custom;
	select id into strict merciless_id from trait where trait_name = 'Merciless' and not custom;
	select id into strict boiling_blood_id from trait where trait_name = 'Boiling Blood' and not custom;
	select id into strict discouraging_presence_id from trait where trait_name = 'Discouraging Presence' and not custom;
	select id into strict red_initiate_id from trait where trait_name = 'Red Initiate' and not custom;
	select id into strict witching_cloak_id from trait where trait_name = 'Witching Cloak' and not custom;

	select id into strict battle_tempo_id from survivor_status where survivor_status_name = 'Battle Tempo' and not custom;
	select id into strict bloody_hands_id from survivor_status where survivor_status_name = 'Bloody Hands' and not custom;
	select id into strict dreaded_decade_id from survivor_status where survivor_status_name = 'Dreaded Decade' and not custom;
	select id into strict polarized_aura_id from survivor_status where survivor_status_name = 'Polarized Aura' and not custom;
	select id into strict somatic_static_id from survivor_status where survivor_status_name = 'Somatic Static' and not custom;

	select id into strict sword_id from weapon_type where weapon_type_name = 'Sword' and not custom;
	select id into strict dagger_id from weapon_type where weapon_type_name = 'Dagger' and not custom;
	select id into strict lantern_id from weapon_type where weapon_type_name = 'Lantern' and not custom;
	select id into strict shield_id from weapon_type where weapon_type_name = 'Shield' and not custom;
	select id into strict spear_id from weapon_type where weapon_type_name = 'Spear' and not custom;

	select id into strict founding_stone_id from gear where gear_name = 'Founding Stone' and not custom;
	select id into strict cloth_id from gear where gear_name = 'Cloth' and not custom;
	select id into strict bone_dagger_id from gear where gear_name = 'Bone Dagger' and not custom;
	select id into strict skull_helm_id from gear where gear_name = 'Skull Helm' and not custom;
	select id into strict rawhide_headband_id from gear where gear_name = 'Rawhide Headband' and not custom;
	select id into strict white_lion_gauntlet_id from gear where gear_name = 'White Lion Gauntlet' and not custom;
	select id into strict king_spear_id from gear where gear_name = 'King Spear' and not custom;
	select id into strict lantern_sword_id from gear where gear_name = 'Lantern Sword' and not custom;
	select id into strict gorment_mask_id from gear where gear_name = 'Gorment Mask' and not custom;

	select id into strict leader_id from fighting_art where fighting_art_name = 'Leader' and not custom;
	select id into strict mighty_strike_id from fighting_art where fighting_art_name = 'Mighty Strike' and not custom;
	select id into strict strategist_id from fighting_art where fighting_art_name = 'Strategist' and not custom;
	select id into strict acrobatics_id from fighting_art where fighting_art_name = 'Acrobatics' and not custom;
	select id into strict tough_id from fighting_art where fighting_art_name = 'Tough' and not custom;

	select id into strict red_fist_id from secret_fighting_art where secret_fighting_art_name = 'Red Fist' and not custom;
	select id into strict kings_step_id from secret_fighting_art where secret_fighting_art_name = 'King''s Step' and not custom;
	select id into strict synchronized_strike_id from secret_fighting_art where secret_fighting_art_name = 'Synchronized Strike' and not custom;

	select id into strict fear_of_the_dark_id from disorder where disorder_name = 'Fear of the Dark' and not custom;
	select id into strict cowardice_id from disorder where disorder_name = 'Cowardice' and not custom;
	select id into strict brain_smog_id from disorder where disorder_name = 'Brain Smog' and not custom;

	select id into strict veteran_id from ability_impairment where ability_impairment_name = 'Veteran' and not custom;
	select id into strict servant_of_fate_id from ability_impairment where ability_impairment_name = 'Servant of Fate' and not custom;
	select id into strict revenant_id from ability_impairment where ability_impairment_name = 'Revenant' and not custom;

	insert into vignette_encounter_definition (
		id,
		name,
		slug,
		description,
		source_monster_type,
		source_nemesis_id,
		source_quarry_id,
		sort_order,
		published
	)
	values
		(
			'33600000-0000-4000-8000-000000000101',
			'[Fixture] Lantern-Raked Lion',
			'fixture-lantern-raked-lion',
			'Fixture-only single-monster quarry vignette for integration and UI development.',
			'QUARRY',
			null,
			white_lion_id,
			10,
			true
		),
		(
			'33600000-0000-4000-8000-000000000102',
			'[Fixture] Three Witches at the Door',
			'fixture-three-witches-at-the-door',
			'Fixture-only multi-monster nemesis vignette for integration and UI development.',
			'NEMESIS',
			red_witches_id,
			null,
			20,
			true
		)
	on conflict (id) do update set
		name = excluded.name,
		slug = excluded.slug,
		description = excluded.description,
		source_monster_type = excluded.source_monster_type,
		source_nemesis_id = excluded.source_nemesis_id,
		source_quarry_id = excluded.source_quarry_id,
		sort_order = excluded.sort_order,
		published = excluded.published;

	insert into vignette_encounter_level (
		id,
		vignette_encounter_definition_id,
		level_number,
		movement,
		speed,
		accuracy,
		evasion,
		damage,
		toughness,
		wounds,
		ai_deck_size,
		hit_location_deck_size,
		basic_action,
		special_rules,
		sort_order
	)
	values
		(
			'33600000-0000-4000-8000-000000000201',
			'33600000-0000-4000-8000-000000000101',
			1,
			6,
			2,
			4,
			0,
			1,
			6,
			8,
			7,
			10,
			'Claw and Lantern Snap',
			'Fixture setup: a single White Lion prowls the edge of the lantern light.',
			10
		),
		(
			'33600000-0000-4000-8000-000000000202',
			'33600000-0000-4000-8000-000000000101',
			2,
			6,
			2,
			4,
			1,
			2,
			8,
			10,
			9,
			10,
			'Pounce Through the Dark',
			'Fixture setup: the lion is still a single monster, just meaner about it.',
			20
		),
		(
			'33600000-0000-4000-8000-000000000203',
			'33600000-0000-4000-8000-000000000102',
			1,
			5,
			2,
			4,
			1,
			1,
			7,
			12,
			8,
			12,
			'Witch-Flame Advance',
			'Fixture setup: Braal and Nico share the darkness as a multi-monster nemesis source.',
			10
		),
		(
			'33600000-0000-4000-8000-000000000204',
			'33600000-0000-4000-8000-000000000102',
			2,
			6,
			3,
			3,
			1,
			2,
			9,
			16,
			10,
			12,
			'Three-Fold Hex',
			'Fixture setup: Braal, Nico, and the Seer test multi-monster copy flows.',
			20
		)
	on conflict (id) do update set
		vignette_encounter_definition_id = excluded.vignette_encounter_definition_id,
		level_number = excluded.level_number,
		movement = excluded.movement,
		speed = excluded.speed,
		accuracy = excluded.accuracy,
		evasion = excluded.evasion,
		damage = excluded.damage,
		toughness = excluded.toughness,
		wounds = excluded.wounds,
		ai_deck_size = excluded.ai_deck_size,
		hit_location_deck_size = excluded.hit_location_deck_size,
		basic_action = excluded.basic_action,
		special_rules = excluded.special_rules,
		sort_order = excluded.sort_order;

	insert into vignette_encounter_level_mood (id, vignette_encounter_level_id, mood_id, sort_order)
	values
		('33600000-0000-4000-8000-000000000301', '33600000-0000-4000-8000-000000000201', feeding_time_id, 10),
		('33600000-0000-4000-8000-000000000302', '33600000-0000-4000-8000-000000000202', frantic_spinning_id, 10),
		('33600000-0000-4000-8000-000000000303', '33600000-0000-4000-8000-000000000203', necrotoxins_id, 10),
		('33600000-0000-4000-8000-000000000304', '33600000-0000-4000-8000-000000000204', aleatoric_melody_id, 10)
	on conflict (vignette_encounter_level_id, mood_id) do update set
		sort_order = excluded.sort_order;

	insert into vignette_encounter_level_trait (id, vignette_encounter_level_id, trait_id, sort_order)
	values
		('33600000-0000-4000-8000-000000000401', '33600000-0000-4000-8000-000000000201', cunning_id, 10),
		('33600000-0000-4000-8000-000000000402', '33600000-0000-4000-8000-000000000202', merciless_id, 10),
		('33600000-0000-4000-8000-000000000403', '33600000-0000-4000-8000-000000000203', boiling_blood_id, 10),
		('33600000-0000-4000-8000-000000000404', '33600000-0000-4000-8000-000000000203', discouraging_presence_id, 20),
		('33600000-0000-4000-8000-000000000405', '33600000-0000-4000-8000-000000000204', red_initiate_id, 10),
		('33600000-0000-4000-8000-000000000406', '33600000-0000-4000-8000-000000000204', witching_cloak_id, 20)
	on conflict (vignette_encounter_level_id, trait_id) do update set
		sort_order = excluded.sort_order;

	insert into vignette_encounter_level_survivor_status (id, vignette_encounter_level_id, survivor_status_id, sort_order)
	values
		('33600000-0000-4000-8000-000000000501', '33600000-0000-4000-8000-000000000201', bloody_hands_id, 10),
		('33600000-0000-4000-8000-000000000502', '33600000-0000-4000-8000-000000000202', battle_tempo_id, 10),
		('33600000-0000-4000-8000-000000000503', '33600000-0000-4000-8000-000000000203', somatic_static_id, 10),
		('33600000-0000-4000-8000-000000000504', '33600000-0000-4000-8000-000000000204', dreaded_decade_id, 10),
		('33600000-0000-4000-8000-000000000505', '33600000-0000-4000-8000-000000000204', polarized_aura_id, 20)
	on conflict (vignette_encounter_level_id, survivor_status_id) do update set
		sort_order = excluded.sort_order;

	insert into vignette_survivor_template (
		id,
		vignette_encounter_definition_id,
		survivor_name,
		survivor_type,
		gender,
		movement,
		accuracy,
		strength,
		evasion,
		luck,
		speed,
		survival,
		insanity,
		courage,
		understanding,
		weapon_proficiency,
		weapon_type_id,
		arm_armor,
		body_armor,
		head_armor,
		leg_armor,
		waist_armor,
		notes,
		sort_order
	)
	values
		(
			'33600000-0000-4000-8000-000000000601',
			'33600000-0000-4000-8000-000000000101',
			'[Fixture] Ashen Blade',
			'CORE',
			'FEMALE',
			5,
			1,
			1,
			1,
			0,
			0,
			3,
			4,
			2,
			1,
			2,
			sword_id,
			1,
			1,
			1,
			1,
			1,
			'Fixture-only survivor template for the single-monster quarry vignette.',
			10
		),
		(
			'33600000-0000-4000-8000-000000000602',
			'33600000-0000-4000-8000-000000000101',
			'[Fixture] Lantern Hook',
			'CORE',
			'MALE',
			5,
			0,
			1,
			2,
			0,
			1,
			4,
			2,
			1,
			2,
			1,
			dagger_id,
			2,
			1,
			1,
			0,
			1,
			'Fixture-only survivor template with an offset gear grid.',
			20
		),
		(
			'33600000-0000-4000-8000-000000000603',
			'33600000-0000-4000-8000-000000000102',
			'[Fixture] Braal Ward',
			'CORE',
			'FEMALE',
			5,
			0,
			2,
			0,
			1,
			0,
			2,
			5,
			3,
			1,
			3,
			shield_id,
			2,
			2,
			1,
			1,
			1,
			'Fixture-only survivor template for the multi-monster nemesis vignette.',
			10
		),
		(
			'33600000-0000-4000-8000-000000000604',
			'33600000-0000-4000-8000-000000000102',
			'[Fixture] Nico Spark',
			'CORE',
			'MALE',
			5,
			1,
			1,
			1,
			0,
			1,
			3,
			6,
			2,
			2,
			2,
			lantern_id,
			1,
			2,
			1,
			1,
			1,
			'Fixture-only survivor template carrying a lantern weapon type.',
			20
		),
		(
			'33600000-0000-4000-8000-000000000605',
			'33600000-0000-4000-8000-000000000102',
			'[Fixture] Seer Thread',
			'CORE',
			'FEMALE',
			6,
			1,
			0,
			2,
			1,
			0,
			5,
			8,
			4,
			4,
			1,
			spear_id,
			1,
			1,
			2,
			1,
			2,
			'Fixture-only survivor template for testing a fuller copied party.',
			30
		)
	on conflict (id) do update set
		vignette_encounter_definition_id = excluded.vignette_encounter_definition_id,
		survivor_name = excluded.survivor_name,
		survivor_type = excluded.survivor_type,
		gender = excluded.gender,
		movement = excluded.movement,
		accuracy = excluded.accuracy,
		strength = excluded.strength,
		evasion = excluded.evasion,
		luck = excluded.luck,
		speed = excluded.speed,
		survival = excluded.survival,
		insanity = excluded.insanity,
		courage = excluded.courage,
		understanding = excluded.understanding,
		weapon_proficiency = excluded.weapon_proficiency,
		weapon_type_id = excluded.weapon_type_id,
		arm_armor = excluded.arm_armor,
		body_armor = excluded.body_armor,
		head_armor = excluded.head_armor,
		leg_armor = excluded.leg_armor,
		waist_armor = excluded.waist_armor,
		notes = excluded.notes,
		sort_order = excluded.sort_order;

	insert into vignette_survivor_template_fighting_art (id, vignette_survivor_template_id, fighting_art_id, sort_order)
	values
		('33600000-0000-4000-8000-000000000701', '33600000-0000-4000-8000-000000000601', leader_id, 10),
		('33600000-0000-4000-8000-000000000702', '33600000-0000-4000-8000-000000000601', mighty_strike_id, 20),
		('33600000-0000-4000-8000-000000000703', '33600000-0000-4000-8000-000000000602', strategist_id, 10),
		('33600000-0000-4000-8000-000000000704', '33600000-0000-4000-8000-000000000603', tough_id, 10),
		('33600000-0000-4000-8000-000000000705', '33600000-0000-4000-8000-000000000604', acrobatics_id, 10),
		('33600000-0000-4000-8000-000000000706', '33600000-0000-4000-8000-000000000605', leader_id, 10)
	on conflict (vignette_survivor_template_id, fighting_art_id) do update set
		sort_order = excluded.sort_order;

	insert into vignette_survivor_template_secret_fighting_art (id, vignette_survivor_template_id, secret_fighting_art_id, sort_order)
	values
		('33600000-0000-4000-8000-000000000801', '33600000-0000-4000-8000-000000000601', red_fist_id, 10),
		('33600000-0000-4000-8000-000000000802', '33600000-0000-4000-8000-000000000603', kings_step_id, 10),
		('33600000-0000-4000-8000-000000000803', '33600000-0000-4000-8000-000000000605', synchronized_strike_id, 10)
	on conflict (vignette_survivor_template_id, secret_fighting_art_id) do update set
		sort_order = excluded.sort_order;

	insert into vignette_survivor_template_disorder (id, vignette_survivor_template_id, disorder_id, sort_order)
	values
		('33600000-0000-4000-8000-000000000901', '33600000-0000-4000-8000-000000000602', fear_of_the_dark_id, 10),
		('33600000-0000-4000-8000-000000000902', '33600000-0000-4000-8000-000000000604', brain_smog_id, 10),
		('33600000-0000-4000-8000-000000000903', '33600000-0000-4000-8000-000000000605', cowardice_id, 10)
	on conflict (vignette_survivor_template_id, disorder_id) do update set
		sort_order = excluded.sort_order;

	insert into vignette_survivor_template_ability_impairment (id, vignette_survivor_template_id, ability_impairment_id, sort_order)
	values
		('33600000-0000-4000-8000-000000001001', '33600000-0000-4000-8000-000000000601', veteran_id, 10),
		('33600000-0000-4000-8000-000000001002', '33600000-0000-4000-8000-000000000603', servant_of_fate_id, 10),
		('33600000-0000-4000-8000-000000001003', '33600000-0000-4000-8000-000000000605', revenant_id, 10)
	on conflict (vignette_survivor_template_id, ability_impairment_id) do update set
		sort_order = excluded.sort_order;

	insert into vignette_survivor_template_survivor_status (id, vignette_survivor_template_id, survivor_status_id, sort_order)
	values
		('33600000-0000-4000-8000-000000001101', '33600000-0000-4000-8000-000000000601', bloody_hands_id, 10),
		('33600000-0000-4000-8000-000000001102', '33600000-0000-4000-8000-000000000603', battle_tempo_id, 10),
		('33600000-0000-4000-8000-000000001103', '33600000-0000-4000-8000-000000000604', somatic_static_id, 10),
		('33600000-0000-4000-8000-000000001104', '33600000-0000-4000-8000-000000000605', polarized_aura_id, 10)
	on conflict (vignette_survivor_template_id, survivor_status_id) do update set
		sort_order = excluded.sort_order;

	insert into vignette_survivor_template_gear_grid (id, vignette_survivor_template_id, gear_id, row_number, column_number)
	values
		('33600000-0000-4000-8000-000000001201', '33600000-0000-4000-8000-000000000601', founding_stone_id, 0, 0),
		('33600000-0000-4000-8000-000000001202', '33600000-0000-4000-8000-000000000601', cloth_id, 0, 1),
		('33600000-0000-4000-8000-000000001203', '33600000-0000-4000-8000-000000000601', bone_dagger_id, 1, 0),
		('33600000-0000-4000-8000-000000001204', '33600000-0000-4000-8000-000000000601', rawhide_headband_id, 1, 1),
		('33600000-0000-4000-8000-000000001205', '33600000-0000-4000-8000-000000000602', white_lion_gauntlet_id, 0, 0),
		('33600000-0000-4000-8000-000000001206', '33600000-0000-4000-8000-000000000602', bone_dagger_id, 0, 1),
		('33600000-0000-4000-8000-000000001207', '33600000-0000-4000-8000-000000000602', skull_helm_id, 1, 0),
		('33600000-0000-4000-8000-000000001208', '33600000-0000-4000-8000-000000000603', king_spear_id, 0, 0),
		('33600000-0000-4000-8000-000000001209', '33600000-0000-4000-8000-000000000603', skull_helm_id, 1, 0),
		('33600000-0000-4000-8000-000000001210', '33600000-0000-4000-8000-000000000603', cloth_id, 2, 0),
		('33600000-0000-4000-8000-000000001211', '33600000-0000-4000-8000-000000000604', lantern_sword_id, 0, 0),
		('33600000-0000-4000-8000-000000001212', '33600000-0000-4000-8000-000000000604', gorment_mask_id, 1, 0),
		('33600000-0000-4000-8000-000000001213', '33600000-0000-4000-8000-000000000604', founding_stone_id, 1, 1),
		('33600000-0000-4000-8000-000000001214', '33600000-0000-4000-8000-000000000605', rawhide_headband_id, 0, 0),
		('33600000-0000-4000-8000-000000001215', '33600000-0000-4000-8000-000000000605', bone_dagger_id, 0, 1),
		('33600000-0000-4000-8000-000000001216', '33600000-0000-4000-8000-000000000605', cloth_id, 1, 1)
	on conflict (vignette_survivor_template_id, row_number, column_number) do update set
		gear_id = excluded.gear_id;
end $$;