--------------------------------------------------------------------------------
-- Vignette Fixture Gear Data
--------------------------------------------------------------------------------
insert into gear (gear_name)
select fixture_gear.gear_name
from (
	values
		('Ambush Falchion'),
		('Braveshield'),
		('Bravesword'),
		('Cobbled Faulds'),
		('Cobbled Greaves'),
		('Cobbled Plackart'),
		('Cobbled Vambraces'),
		('Crusader Breastplate'),
		('Crusader Cuisses'),
		('Crusader Gauntlets'),
		('Crusader Heirloom'),
		('Crusader Sabatons'),
		('Heart of a Hero'),
		('Laurie''s Lenses'),
		('Locking Tome'),
		('Memento Blade'),
		('Mush Diadema'),
		('Protean Charm'),
		('Ram Photophore'),
		('Sacrificial Fang'),
		('Sculptor Beads'),
		('Shadowstalker Geta'),
		('Shadowstalker Houmongi'),
		('Shadowstalker Kasa'),
		('Shadowstalker Obi'),
		('Shadowstalker Sode'),
		('Stoic Mask'),
		('Stonescraper'),
		('Survival Spear'),
		('Tattered Archivist Robe'),
		('Warding Guidon Lance'),
		('Warding Tower Shield')
) as fixture_gear(gear_name)
where not exists (
	select 1
	from gear
	where gear.gear_name = fixture_gear.gear_name
		and gear.custom is false
);
--------------------------------------------------------------------------------
-- Vignette Monster Data
--------------------------------------------------------------------------------
insert into vignette_monster
(
	monster_name,
	multi_monster,
	source_monster_type,
	source_nemesis_id,
	source_quarry_id
)
values
(
	'Killenium Butcher', -- Name
	false, -- Multi Monster
	'NEMESIS', -- Source Monster Type
	(select id from nemesis where monster_name = 'Killenium Butcher'), -- Source Nemesis ID
	null -- Source Quarry ID
),
(
	'Screaming God', -- Name
	false, -- Multi Monster
	'QUARRY', -- Source Monster Type
	null, -- Source Nemesis ID
	(select id from quarry where monster_name = 'Screaming God') -- Source Quarry ID
),
(
	'Screaming Nukalope', -- Name
	false, -- Multi Monster
	'QUARRY', -- Source Monster Type
	null, -- Source Nemesis ID
	(select id from quarry where monster_name = 'Screaming Nukalope') -- Source Quarry ID
),
(
	'White Gigalion', -- Name
	false, -- Multi Monster
	'QUARRY', -- Source Monster Type
	null, -- Source Nemesis ID
	(select id from quarry where monster_name = 'White Gigalion') -- Source Quarry ID
);
--------------------------------------------------------------------------------
-- Vignette Monster Level Data
--------------------------------------------------------------------------------
insert into vignette_monster_level
(
	ai_deck_remaining,
	basic_cards,
	advanced_cards,
	legendary_cards,
	overtone_cards,
	accuracy,
	accuracy_tokens,
	damage,
	damage_tokens,
	evasion,
	evasion_tokens,
	level_number,
	life,
	luck,
	luck_tokens,
	movement,
	movement_tokens,
	sub_monster_name,
	speed,
	speed_tokens,
	strength,
	strength_tokens,
	toughness,
	toughness_tokens,
	vignette_monster_id
)
values
(
	15, -- AI Deck Remaining
	9, -- Basic Cards
	6, -- Advanced Cards
	0, -- Legendary Cards
	0, -- Overtone Cards
	0, -- Accuracy
	1, -- Accuracy Tokens
	1, -- Damage
	0, -- Damage Tokens
	0, -- Evasion
	0, -- Evasion Tokens
	2, -- Level Number
	null, -- Life
	0, -- Luck
	0, -- Luck Tokens
	5, -- Movement
	0, -- Movement Tokens
	null, -- Sub Monster Name
	1, -- Speed
	0, -- Speed Tokens
	0, -- Strength
	0, -- Strength Tokens
	13, -- Toughness
	0, -- Toughness Tokens
	(select id from vignette_monster where monster_name = 'Killenium Butcher') -- Vignette Monster ID
),
(
	16, -- AI Deck Remaining
	11, -- Basic Cards
	5, -- Advanced Cards
	0, -- Legendary Cards
	0, -- Overtone Cards
	0, -- Accuracy
	0, -- Accuracy Tokens
	0, -- Damage
	0, -- Damage Tokens
	0, -- Evasion
	0, -- Evasion Tokens
	1, -- Level Number
	null, -- Life
	0, -- Luck
	0, -- Luck Tokens
	-1, -- Movement
	0, -- Movement Tokens
	null, -- Sub Monster Name
	0, -- Speed
	0, -- Speed Tokens
	0, -- Strength
	0, -- Strength Tokens
	18, -- Toughness
	0, -- Toughness Tokens
	(select id from vignette_monster where monster_name = 'Screaming God') -- Vignette Monster ID
),
(
	16, -- AI Deck Remaining
	9, -- Basic Cards
	7, -- Advanced Cards
	0, -- Legendary Cards
	0, -- Overtone Cards
	0, -- Accuracy
	1, -- Accuracy Tokens
	0, -- Damage
	0, -- Damage Tokens
	0, -- Evasion
	0, -- Evasion Tokens
	2, -- Level Number
	null, -- Life
	0, -- Luck
	0, -- Luck Tokens
	9, -- Movement
	0, -- Movement Tokens
	null, -- Sub Monster Name
	2, -- Speed
	0, -- Speed Tokens
	0, -- Strength
	0, -- Strength Tokens
	11, -- Toughness
	0, -- Toughness Tokens
	(select id from vignette_monster where monster_name = 'Screaming Nukalope') -- Vignette Monster ID
),
(
	15, -- AI Deck Remaining
	10, -- Basic Cards
	5, -- Advanced Cards
	0, -- Legendary Cards
	0, -- Overtone Cards
	0, -- Accuracy
	0, -- Accuracy Tokens
	1, -- Damage
	0, -- Damage Tokens
	0, -- Evasion
	0, -- Evasion Tokens
	2, -- Level Number
	null, -- Life
	0, -- Luck
	0, -- Luck Tokens
	8, -- Movement
	0, -- Movement Tokens
	null, -- Sub Monster Name
	1, -- Speed
	0, -- Speed Tokens
	0, -- Strength
	0, -- Strength Tokens
	10, -- Toughness
	0, -- Toughness Tokens
	(select id from vignette_monster where monster_name = 'White Gigalion') -- Vignette Monster ID
);
--------------------------------------------------------------------------------
-- Vignette Monster Level Survivor Status
--------------------------------------------------------------------------------
insert into vignette_monster_level_survivor_status
(
	vignette_monster_level_id,
	survivor_status_id
)
values
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'Killenium Butcher'
		)
		and level_number = 2
	),
	(
		select id from survivor_status
		where survivor_status_name = 'Infectious Lunacy'
		and custom = false
	)
);
--------------------------------------------------------------------------------
-- Vignette Monster Level Trait
--------------------------------------------------------------------------------
insert into vignette_monster_level_trait
(
	vignette_monster_level_id,
	trait_id
)
values
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'Killenium Butcher'
		)
		and level_number = 2
	),
	(
		select id from trait
		where trait_name = 'Self-Aware'
		and custom = false
	)
),
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'Killenium Butcher'
		)
		and level_number = 2
	),
	(
		select id from trait
		where trait_name = 'Scorn'
		and custom = false
	)
),
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'Screaming Nukalope'
		)
		and level_number = 2
	),
	(
		select id from trait
		where trait_name = 'Atomic Vigor - Inert'
		and custom = false
	)
),
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'Screaming Nukalope'
		)
		and level_number = 2
	),
	(
		select id from trait
		where trait_name = 'Critical Mass - Inert'
		and custom = false
	)
),
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'Screaming Nukalope'
		)
		and level_number = 2
	),
	(
		select id from trait
		where trait_name = 'Prehensile Tail - Inert'
		and custom = false
	)
),
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'White Gigalion'
		)
		and level_number = 2
	),
	(
		select id from trait
		where trait_name = 'Vicious'
		and custom = false
	)
),
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'White Gigalion'
		)
		and level_number = 2
	),
	(
		select id from trait
		where trait_name = 'Giga Claws'
		and custom = false
	)
),
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'White Gigalion'
		)
		and level_number = 2
	),
	(
		select id from trait
		where trait_name = 'Smart Cat'
		and custom = false
	)
),
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'Screaming God'
		)
		and level_number = 1
	),
	(
		select id from trait
		where trait_name = 'Endless Horizon'
		and custom = false
	)
),
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'Screaming God'
		)
		and level_number = 1
	),
	(
		select id from trait
		where trait_name = 'Stampede'
		and custom = false
	)
),
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'Screaming God'
		)
		and level_number = 1
	),
	(
		select id from trait
		where trait_name = 'Withering Blast'
		and custom = false
	)
),
(
	(
		select id from vignette_monster_level
		where vignette_monster_id = (
			select id from vignette_monster
			where monster_name = 'Screaming God'
		)
		and level_number = 1
	),
	(
		select id from trait
		where trait_name = 'Grasping Undermaw'
		and custom = false
	)
);
--------------------------------------------------------------------------------
-- Vignette Survivor Data
--------------------------------------------------------------------------------
insert into vignette_survivor
(
	vignette_monster_id,
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
	notes
)
values
-- Killenium Butcher
(
	(select id from vignette_monster where monster_name = 'Killenium Butcher'),
	'Brave', -- Survivor Name
	'CORE', -- Survivor Type
	'MALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	0, -- Strength
	0, -- Evasion
	3, -- Luck
	0, -- Speed
	4, -- Survival
	4, -- Insanity
	7, -- Courage
	0, -- Understanding
	0, -- Weapon Proficiency
	null, -- Weapon Type ID
	4, -- Arm Armor
	4, -- Body Armor
	0, -- Head Armor
	4, -- Leg Armor
	4, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'Killenium Butcher'),
	'Hollow', -- Survivor Name
	'CORE', -- Survivor Type
	'FEMALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	0, -- Strength
	-1, -- Evasion
	0, -- Luck
	0, -- Speed
	3, -- Survival
	1, -- Insanity
	0, -- Courage
	0, -- Understanding
	0, -- Weapon Proficiency
	null, -- Weapon Type ID
	7, -- Arm Armor
	5, -- Body Armor
	6, -- Head Armor
	5, -- Leg Armor
	5, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'Killenium Butcher'),
	'Forgot', -- Survivor Name
	'CORE', -- Survivor Type
	'FEMALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	0, -- Strength
	0, -- Evasion
	0, -- Luck
	0, -- Speed
	5, -- Survival
	3, -- Insanity
	1, -- Courage
	5, -- Understanding
	0, -- Weapon Proficiency
	null, -- Weapon Type ID
	6, -- Arm Armor
	3, -- Body Armor
	3, -- Head Armor
	5, -- Leg Armor
	5, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'Killenium Butcher'),
	'Red', -- Survivor Name
	'CORE', -- Survivor Type
	'FEMALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	0, -- Strength
	0, -- Evasion
	0, -- Luck
	0, -- Speed
	5, -- Survival
	2, -- Insanity
	5, -- Courage
	2, -- Understanding
	3, -- Weapon Proficiency
	(select id from weapon_type where weapon_type_name = 'Spear' and custom is false), -- Weapon Type ID
	12, -- Arm Armor
	4, -- Body Armor
	3, -- Head Armor
	4, -- Leg Armor
	3, -- Waist Armor
	'' -- Notes
),
-- Screaming Nukalope
(
	(select id from vignette_monster where monster_name = 'Screaming Nukalope'),
	'Ashbloom', -- Survivor Name
	'CORE', -- Survivor Type
	'FEMALE', -- Gender
	6, -- Movement
	0, -- Accuracy
	2, -- Strength
	0, -- Evasion
	0, -- Luck
	0, -- Speed
	6, -- Survival
	5, -- Insanity
	6, -- Courage
	2, -- Understanding
	0, -- Weapon Proficiency
	null, -- Weapon Type ID
	4, -- Arm Armor
	4, -- Body Armor
	4, -- Head Armor
	4, -- Leg Armor
	0, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'Screaming Nukalope'),
	'Gnostin', -- Survivor Name
	'CORE', -- Survivor Type
	'MALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	0, -- Strength
	0, -- Evasion
	1, -- Luck
	0, -- Speed
	6, -- Survival
	5, -- Insanity
	2, -- Courage
	7, -- Understanding
	0, -- Weapon Proficiency
	null, -- Weapon Type ID
	4, -- Arm Armor
	4, -- Body Armor
	3, -- Head Armor
	2, -- Leg Armor
	2, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'Screaming Nukalope'),
	'Monday', -- Survivor Name
	'CORE', -- Survivor Type
	'FEMALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	0, -- Strength
	0, -- Evasion
	0, -- Luck
	0, -- Speed
	6, -- Survival
	3, -- Insanity
	4, -- Courage
	2, -- Understanding
	0, -- Weapon Proficiency
	null, -- Weapon Type ID
	2, -- Arm Armor
	2, -- Body Armor
	2, -- Head Armor
	2, -- Leg Armor
	2, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'Screaming Nukalope'),
	'Ashroot', -- Survivor Name
	'CORE', -- Survivor Type
	'MALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	0, -- Strength
	0, -- Evasion
	0, -- Luck
	0, -- Speed
	6, -- Survival
	3, -- Insanity
	1, -- Courage
	0, -- Understanding
	4, -- Weapon Proficiency
	(select id from weapon_type where weapon_type_name = 'Shield' and custom is false), -- Weapon Type ID
	6, -- Arm Armor
	6, -- Body Armor
	6, -- Head Armor
	6, -- Leg Armor
	6, -- Waist Armor
	'' -- Notes
),
-- White Gigalion
(
	(select id from vignette_monster where monster_name = 'White Gigalion'),
	'Rock Knight', -- Survivor Name
	'CORE', -- Survivor Type
	'FEMALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	1, -- Strength
	0, -- Evasion
	0, -- Luck
	0, -- Speed
	3, -- Survival
	6, -- Insanity
	0, -- Courage
	2, -- Understanding
	4, -- Weapon Proficiency
	(select id from weapon_type where weapon_type_name = 'Club' and custom is false), -- Weapon Type ID
	0, -- Arm Armor
	4, -- Body Armor
	3, -- Head Armor
	4, -- Leg Armor
	4, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'White Gigalion'),
	'Hungry Basalt', -- Survivor Name
	'CORE', -- Survivor Type
	'MALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	0, -- Strength
	0, -- Evasion
	0, -- Luck
	0, -- Speed
	3, -- Survival
	3, -- Insanity
	0, -- Courage
	0, -- Understanding
	0, -- Weapon Proficiency
	null, -- Weapon Type ID
	4, -- Arm Armor
	4, -- Body Armor
	4, -- Head Armor
	4, -- Leg Armor
	4, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'White Gigalion'),
	'Gadrock', -- Survivor Name
	'CORE', -- Survivor Type
	'MALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	0, -- Strength
	0, -- Evasion
	0, -- Luck
	0, -- Speed
	3, -- Survival
	4, -- Insanity
	6, -- Courage
	2, -- Understanding
	2, -- Weapon Proficiency
	(select id from weapon_type where weapon_type_name = 'Katar' and custom is false), -- Weapon Type ID
	3, -- Arm Armor
	3, -- Body Armor
	3, -- Head Armor
	3, -- Leg Armor
	3, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'White Gigalion'),
	'Breccia', -- Survivor Name
	'CORE', -- Survivor Type
	'FEMALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	0, -- Strength
	0, -- Evasion
	0, -- Luck
	0, -- Speed
	4, -- Survival
	2, -- Insanity
	1, -- Courage
	5, -- Understanding
	3, -- Weapon Proficiency
	(select id from weapon_type where weapon_type_name = 'Whip' and custom is false), -- Weapon Type ID
	4, -- Arm Armor
	4, -- Body Armor
	4, -- Head Armor
	4, -- Leg Armor
	4, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'Screaming God'),
	'Sage', -- Survivor Name
	'CORE', -- Survivor Type
	'FEMALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	2, -- Strength
	1, -- Evasion
	0, -- Luck
	0, -- Speed
	8, -- Survival
	0, -- Insanity
	7, -- Courage
	0, -- Understanding
	0, -- Weapon Proficiency
	null, -- Weapon Type ID
	10, -- Arm Armor
	10, -- Body Armor
	10, -- Head Armor
	10, -- Leg Armor
	10, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'Screaming God'),
	'Lyra', -- Survivor Name
	'CORE', -- Survivor Type
	'FEMALE', -- Gender
	5, -- Movement
	1, -- Accuracy
	7, -- Strength
	1, -- Evasion
	0, -- Luck
	0, -- Speed
	8, -- Survival
	3, -- Insanity
	0, -- Courage
	0, -- Understanding
	0, -- Weapon Proficiency
	null, -- Weapon Type ID
	3, -- Arm Armor
	3, -- Body Armor
	3, -- Head Armor
	3, -- Leg Armor
	3, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'Screaming God'),
	'Melody', -- Survivor Name
	'CORE', -- Survivor Type
	'FEMALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	3, -- Strength
	1, -- Evasion
	0, -- Luck
	0, -- Speed
	8, -- Survival
	9, -- Insanity
	5, -- Courage
	2, -- Understanding
	0, -- Weapon Proficiency
	null, -- Weapon Type ID
	4, -- Arm Armor
	4, -- Body Armor
	4, -- Head Armor
	4, -- Leg Armor
	4, -- Waist Armor
	'' -- Notes
),
(
	(select id from vignette_monster where monster_name = 'Screaming God'),
	'Harmony', -- Survivor Name
	'CORE', -- Survivor Type
	'FEMALE', -- Gender
	5, -- Movement
	0, -- Accuracy
	4, -- Strength
	1, -- Evasion
	0, -- Luck
	0, -- Speed
	8, -- Survival
	5, -- Insanity
	2, -- Courage
	5, -- Understanding
	5, -- Weapon Proficiency
	(select id from weapon_type where weapon_type_name = 'Axe' and custom is false), -- Weapon Type ID
	4, -- Arm Armor
	4, -- Body Armor
	4, -- Head Armor
	4, -- Leg Armor
	4, -- Waist Armor
	'' -- Notes
);
--------------------------------------------------------------------------------
-- Vignette Survivor Disorder Data
--------------------------------------------------------------------------------
insert into vignette_survivor_disorder (vignette_survivor_id, disorder_id) values
(
	(select id from vignette_survivor where survivor_name = 'Brave'),
	(select id from disorder where disorder_name = 'Quixotic')
),
(
	(select id from vignette_survivor where survivor_name = 'Ashroot'),
	(select id from disorder where disorder_name = 'Anxiety')
),
(
	(select id from vignette_survivor where survivor_name = 'Gadrock'),
	(select id from disorder where disorder_name = 'Hoarder')
),
(
	(select id from vignette_survivor where survivor_name = 'Hungry Basalt'),
	(select id from disorder where disorder_name = 'Binge Eating')
),
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from disorder where disorder_name = 'Squeamish')
),
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from disorder where disorder_name = 'Post-Traumatic Stress')
);
--------------------------------------------------------------------------------
-- Vignette Survivor Fighting Art Data
--------------------------------------------------------------------------------
insert into vignette_survivor_fighting_art (vignette_survivor_id, fighting_art_id) values
(
	(select id from vignette_survivor where survivor_name = 'Monday'),
	(select id from fighting_art where fighting_art_name = 'Trick Attack')
),
(
	(select id from vignette_survivor where survivor_name = 'Gnostin'),
	(select id from fighting_art where fighting_art_name = 'Strategist')
),
(
	(select id from vignette_survivor where survivor_name = 'Ashbloom'),
	(select id from fighting_art where fighting_art_name = 'Wardrobe Expert')
),
(
	(select id from vignette_survivor where survivor_name = 'Gadrock'),
	(select id from fighting_art where fighting_art_name = 'Orator of Death')
),
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from fighting_art where fighting_art_name = 'Clutch Fighter')
),
(
	(select id from vignette_survivor where survivor_name = 'Breccia'),
	(select id from fighting_art where fighting_art_name = 'Mighty Strike')
),
(
	(select id from vignette_survivor where survivor_name = 'Sage'),
	(select id from fighting_art where fighting_art_name = 'Leader')
),
(
	(select id from vignette_survivor where survivor_name = 'Sage'),
	(select id from fighting_art where fighting_art_name = 'Combo Master')
),
(
	(select id from vignette_survivor where survivor_name = 'Lyra'),
	(select id from fighting_art where fighting_art_name = 'Clutch Fighter')
),
(
	(select id from vignette_survivor where survivor_name = 'Lyra'),
	(select id from fighting_art where fighting_art_name = 'Extra Sense')
),
(
	(select id from vignette_survivor where survivor_name = 'Harmony'),
	(select id from fighting_art where fighting_art_name = 'Double Dash')
);
--------------------------------------------------------------------------------
-- Vignette Survivor Secret Fighting Art Data
--------------------------------------------------------------------------------
insert into vignette_survivor_secret_fighting_art (vignette_survivor_id, secret_fighting_art_id) values
(
	(select id from vignette_survivor where survivor_name = 'Gnostin'),
	(select id from secret_fighting_art where secret_fighting_art_name = 'Beetle Strength')
),
(
	(select id from vignette_survivor where survivor_name = 'Ashbloom'),
	(select id from secret_fighting_art where secret_fighting_art_name = 'Unshackled')
),
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from secret_fighting_art where secret_fighting_art_name = 'King''s Step')
);
--------------------------------------------------------------------------------
-- Vignette Survivor Gear Grid Data
--------------------------------------------------------------------------------
insert into vignette_survivor_gear_grid (
	vignette_survivor_id,
	gear_id,
	row_number,
	column_number
) values
-- Ashbloom
(
	(select id from vignette_survivor where survivor_name = 'Ashbloom'),
	(select id from gear where gear_name = 'Musk Bomb'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Ashbloom'),
	(select id from gear where gear_name = 'Warding Guidon Lance'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Ashbloom'),
	(select id from gear where gear_name = 'Warding Tower Shield'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Ashbloom'),
	(select id from gear where gear_name = 'Crusader Breastplate'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Ashbloom'),
	(select id from gear where gear_name = 'Crusader Heirloom'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Ashbloom'),
	(select id from gear where gear_name = 'Dried Acanthus'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Ashbloom'),
	(select id from gear where gear_name = 'Crusader Gauntlets'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Ashbloom'),
	(select id from gear where gear_name = 'Crusader Sabatons'),
	2,
	2
),
-- Ashroot
(
	(select id from vignette_survivor where survivor_name = 'Ashroot'),
	(select id from gear where gear_name = 'First Aid Kit'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Ashroot'),
	(select id from gear where gear_name = 'Crusader Cuisses'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Ashroot'),
	(select id from gear where gear_name = 'Warding Guidon Lance'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Ashroot'),
	(select id from gear where gear_name = 'Warding Tower Shield'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Ashroot'),
	(select id from gear where gear_name = 'Crusader Breastplate'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Ashroot'),
	(select id from gear where gear_name = 'Crusader Heirloom'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Ashroot'),
	(select id from gear where gear_name = 'Sunspot Dart'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Ashroot'),
	(select id from gear where gear_name = 'Crusader Gauntlets'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Ashroot'),
	(select id from gear where gear_name = 'Crusader Sabatons'),
	2,
	2
),
-- Gnostin
(
	(select id from vignette_survivor where survivor_name = 'Gnostin'),
	(select id from gear where gear_name = 'Phoenix Gauntlet'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Gnostin'),
	(select id from gear where gear_name = 'Stonesmasher'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Gnostin'),
	(select id from gear where gear_name = 'Lucky Charm'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Gnostin'),
	(select id from gear where gear_name = 'Sculptor Beads'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Gnostin'),
	(select id from gear where gear_name = 'Cycloid Scale Shoes'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Gnostin'),
	(select id from gear where gear_name = 'Stonescraper'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Gnostin'),
	(select id from gear where gear_name = 'Phoenix Plackart'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Gnostin'),
	(select id from gear where gear_name = 'White Lion Skirt'),
	2,
	2
),
-- Monday
(
	(select id from vignette_survivor where survivor_name = 'Monday'),
	(select id from gear where gear_name = 'Fecal Salve'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Monday'),
	(select id from gear where gear_name = 'Shadowstalker Houmongi'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Monday'),
	(select id from gear where gear_name = 'Ambush Falchion'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Monday'),
	(select id from gear where gear_name = 'Shadowstalker Kasa'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Monday'),
	(select id from gear where gear_name = 'Shadowstalker Sode'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Monday'),
	(select id from gear where gear_name = 'Shadowstalker Obi'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Monday'),
	(select id from gear where gear_name = 'Shadowstalker Geta'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Monday'),
	(select id from gear where gear_name = 'Scarab Circlet'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Monday'),
	(select id from gear where gear_name = 'Stone Noses'),
	2,
	2
),
-- Red
(
	(select id from vignette_survivor where survivor_name = 'Red'),
	(select id from gear where gear_name = 'Ram Photophore'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Red'),
	(select id from gear where gear_name = 'Tabard'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Red'),
	(select id from gear where gear_name = 'Hard Breastplate'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Red'),
	(select id from gear where gear_name = 'Leather Skirt'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Red'),
	(select id from gear where gear_name = 'Cloth Leggings'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Red'),
	(select id from gear where gear_name = 'Protean Charm'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Red'),
	(select id from gear where gear_name = 'Seasoned Monster Meat'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Red'),
	(select id from gear where gear_name = 'Survival Spear'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Red'),
	(select id from gear where gear_name = 'White Dragon Gauntlets'),
	2,
	2
),
-- Brave
(
	(select id from vignette_survivor where survivor_name = 'Brave'),
	(select id from gear where gear_name = 'Bravesword'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Brave'),
	(select id from gear where gear_name = 'Cobbled Vambraces'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Brave'),
	(select id from gear where gear_name = 'Braveshield'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Brave'),
	(select id from gear where gear_name = 'Cobbled Plackart'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Brave'),
	(select id from gear where gear_name = 'Heart of a Hero'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Brave'),
	(select id from gear where gear_name = 'Cobbled Faulds'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Brave'),
	(select id from gear where gear_name = 'Life Elixir'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Brave'),
	(select id from gear where gear_name = 'Cobbled Greaves'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Brave'),
	(select id from gear where gear_name = 'Bandages'),
	2,
	2
),
-- Forgot
(
	(select id from vignette_survivor where survivor_name = 'Forgot'),
	(select id from gear where gear_name = 'Tattered Archivist Robe'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Forgot'),
	(select id from gear where gear_name = 'Leather Cuirass'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Forgot'),
	(select id from gear where gear_name = 'Laurie''s Lenses'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Forgot'),
	(select id from gear where gear_name = 'Gloom Bracelets'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Forgot'),
	(select id from gear where gear_name = 'Gloom Cream'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Forgot'),
	(select id from gear where gear_name = 'Lantern Greaves'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Forgot'),
	(select id from gear where gear_name = 'Lantern Mail'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Forgot'),
	(select id from gear where gear_name = 'Locking Tome'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Forgot'),
	(select id from gear where gear_name = 'Memento Blade'),
	2,
	2
),
-- Hollow
(
	(select id from vignette_survivor where survivor_name = 'Hollow'),
	(select id from gear where gear_name = 'Sacrificial Fang'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Hollow'),
	(select id from gear where gear_name = 'Dragonskull Helm'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Hollow'),
	(select id from gear where gear_name = 'Dragon Belt'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Hollow'),
	(select id from gear where gear_name = 'Green Ring'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Hollow'),
	(select id from gear where gear_name = 'Dragon Mantle'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Hollow'),
	(select id from gear where gear_name = 'Stoic Mask'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Hollow'),
	(select id from gear where gear_name = 'Dragon Boots'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Hollow'),
	(select id from gear where gear_name = 'Bird Bread'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Hollow'),
	(select id from gear where gear_name = 'Dragon Gloves'),
	2,
	2
),
-- Rock Knight
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from gear where gear_name = 'Lovelorn Rock'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from gear where gear_name = 'Bone Darts'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from gear where gear_name = 'Armor Spikes'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from gear where gear_name = 'Skull Helm'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from gear where gear_name = 'Regal Plackart'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from gear where gear_name = 'Skullcap Hammer'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from gear where gear_name = 'Bone Earrings'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from gear where gear_name = 'Regal Faulds'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Rock Knight'),
	(select id from gear where gear_name = 'Regal Greaves'),
	2,
	2
),
-- Hungry Basalt
(
	(select id from vignette_survivor where survivor_name = 'Hungry Basalt'),
	(select id from gear where gear_name = 'Gorment Boots'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Hungry Basalt'),
	(select id from gear where gear_name = 'Monster Tooth Necklace'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Hungry Basalt'),
	(select id from gear where gear_name = 'Elder Earrings'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Hungry Basalt'),
	(select id from gear where gear_name = 'Gorment Sleeves'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Hungry Basalt'),
	(select id from gear where gear_name = 'Gorment Suit'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Hungry Basalt'),
	(select id from gear where gear_name = 'Gorment Mask'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Hungry Basalt'),
	(select id from gear where gear_name = 'Boss Mehndi'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Hungry Basalt'),
	(select id from gear where gear_name = 'Greater Gaxe'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Hungry Basalt'),
	(select id from gear where gear_name = 'Round Leather Shield'),
	2,
	2
),
-- Gadrock
(
	(select id from vignette_survivor where survivor_name = 'Gadrock'),
	(select id from gear where gear_name = 'Gorn'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Gadrock'),
	(select id from gear where gear_name = 'White Lion Boots'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Gadrock'),
	(select id from gear where gear_name = 'White Lion Skirt'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Gadrock'),
	(select id from gear where gear_name = 'White Lion Coat'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Gadrock'),
	(select id from gear where gear_name = 'Frenzy Drink'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Gadrock'),
	(select id from gear where gear_name = 'Lion Headdress'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Gadrock'),
	(select id from gear where gear_name = 'White Lion Helm'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Gadrock'),
	(select id from gear where gear_name = 'White Lion Gauntlet'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Gadrock'),
	(select id from gear where gear_name = 'Beast Knuckle'),
	2,
	2
),
-- Breccia
(
	(select id from vignette_survivor where survivor_name = 'Breccia'),
	(select id from gear where gear_name = 'Leather Cuirass'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Breccia'),
	(select id from gear where gear_name = 'Leather Mask'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Breccia'),
	(select id from gear where gear_name = 'Leather Skirt'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Breccia'),
	(select id from gear where gear_name = 'Hunter Whip'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Breccia'),
	(select id from gear where gear_name = 'Lucky Charm'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Breccia'),
	(select id from gear where gear_name = 'Brain Mint'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Breccia'),
	(select id from gear where gear_name = 'Leather Bracers'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Breccia'),
	(select id from gear where gear_name = 'Leather Boots'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Breccia'),
	(select id from gear where gear_name = 'Monster Grease'),
	2,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Melody'),
	(select id from gear where gear_name = 'Dark Water Vial'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Melody'),
	(select id from gear where gear_name = 'Gorn'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Melody'),
	(select id from gear where gear_name = 'Vandal Sledge'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Melody'),
	(select id from gear where gear_name = 'Count Tabard'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Melody'),
	(select id from gear where gear_name = 'Count Vest'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Melody'),
	(select id from gear where gear_name = 'Count Wrappings'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Melody'),
	(select id from gear where gear_name = 'Count Sandals'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Melody'),
	(select id from gear where gear_name = 'Count Treukh'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Melody'),
	(select id from gear where gear_name = 'Bone Dagger'),
	2,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Lyra'),
	(select id from gear where gear_name = 'White Lion Gauntlet'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Lyra'),
	(select id from gear where gear_name = 'White Lion Helm'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Lyra'),
	(select id from gear where gear_name = 'White Lion Skirt'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Lyra'),
	(select id from gear where gear_name = 'White Lion Boots'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Lyra'),
	(select id from gear where gear_name = 'Pipa'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Lyra'),
	(select id from gear where gear_name = 'Vespertine Cello'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Lyra'),
	(select id from gear where gear_name = 'Zanbato'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Lyra'),
	(select id from gear where gear_name = 'Monster Grease'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Lyra'),
	(select id from gear where gear_name = 'White Lion Coat'),
	2,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Sage'),
	(select id from gear where gear_name = 'Beacon Shield'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Sage'),
	(select id from gear where gear_name = 'Oxidized Lantern Helm'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Sage'),
	(select id from gear where gear_name = 'Meteor Unguis'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Sage'),
	(select id from gear where gear_name = 'Lantern Mail'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Sage'),
	(select id from gear where gear_name = 'Lantern Cuirass'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Sage'),
	(select id from gear where gear_name = 'Lantern Gauntlets'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Sage'),
	(select id from gear where gear_name = 'Mush Diadema'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Sage'),
	(select id from gear where gear_name = 'Lantern Greaves'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Sage'),
	(select id from gear where gear_name = 'Elder Earrings'),
	2,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Harmony'),
	(select id from gear where gear_name = 'Singing Pantaloons'),
	0,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Harmony'),
	(select id from gear where gear_name = 'Singing Gloves'),
	0,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Harmony'),
	(select id from gear where gear_name = 'Energy Drum'),
	0,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Harmony'),
	(select id from gear where gear_name = 'Singing Cap'),
	1,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Harmony'),
	(select id from gear where gear_name = 'Lucky Charm'),
	1,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Harmony'),
	(select id from gear where gear_name = 'Bandages'),
	1,
	2
),
(
	(select id from vignette_survivor where survivor_name = 'Harmony'),
	(select id from gear where gear_name = 'Singing Breastplate'),
	2,
	0
),
(
	(select id from vignette_survivor where survivor_name = 'Harmony'),
	(select id from gear where gear_name = 'Saxe'),
	2,
	1
),
(
	(select id from vignette_survivor where survivor_name = 'Harmony'),
	(select id from gear where gear_name = 'Singing Boots'),
	2,
	2
);