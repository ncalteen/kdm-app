--------------------------------------------------------------------------------
-- Resources
--------------------------------------------------------------------------------
insert into resource (
    category,
    quarry_id,
    resource_name,
    resource_types
  )
values -------------------------------------------------------------------------
  -- Basic Resources
  ------------------------------------------------------------------------------
  (
    'BASIC',
    null,
    '???',
    '{ORGAN, BONE, HIDE, CONSUMABLE}'
  ),
  ('BASIC', null, 'Broken Lantern', '{SCRAP}'),
  ('BASIC', null, 'Broken Prism Lantern', '{SCRAP}'),
  (
    'BASIC',
    null,
    'Love Juice',
    '{ORGAN, CONSUMABLE}'
  ),
  ('BASIC', null, 'Monster Bone', '{BONE}'),
  ('BASIC', null, 'Monster Hide', '{HIDE}'),
  ('BASIC', null, 'Monster Organ', '{ORGAN}'),
  ('BASIC', null, 'Perfect Bone', '{PERFECT, BONE}'),
  ('BASIC', null, 'Perfect Hide', '{PERFECT, HIDE}'),
  (
    'BASIC',
    null,
    'Perfect Organ',
    '{PERFECT, ORGAN}'
  ),
  ('BASIC', null, 'Skull', '{BONE}'),
  ------------------------------------------------------------------------------
  -- Crimson Crocodile
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Blood Stool',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Crimson Bone',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Crimson Fin',
    '{HIDE, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Crimson Gland',
    '{INDOMITABLE, PERFECT, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Diamond Scabs',
    '{INDOMITABLE, PERFECT, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Diffuser Heart',
    '{INDOMITABLE, PERFECT, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Eye of Immortal',
    '{ORGAN, CONSUMABLE, OTHER}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Flat Vein',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Groomed Nails',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Immortal Tongue',
    '{BONE, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Pale Fingers',
    '{BONE, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Pale Flesh',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Pseudopenis',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Secret Stone',
    '{INDOMITABLE, PERFECT, STONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Tiny Ear',
    '{ORGAN, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Vampire Fang',
    '{INDOMITABLE, PERFECT, BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Crimson Crocodile'
        and not custom
    ),
    'Veined Glass',
    '{BONE, GLASS}'
  ),
  ------------------------------------------------------------------------------
  -- Dragon King
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    'Cabled Vein',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    'Dragon Iron',
    '{IRON}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    'Hardened Ribs',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    'Horn Fragment',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    'Husk',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    'King''s Claws',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    'King''s Tongue',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    'Radioactive Dung',
    '{ORGAN, SCRAP}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    'Serpentine Tailbone',
    '{INDOMITABLE, PERFECT, BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dragon King'
        and not custom
    ),
    'Veined Wing',
    '{HIDE}'
  ),
  ------------------------------------------------------------------------------
  -- Dung Beetle Knight
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    ),
    'Beetle Horn',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    ),
    'Century Fingernails',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    ),
    'Century Shell',
    '{HIDE, IRON}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    ),
    'Compound Eye',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    ),
    'Elytra',
    '{BONE, HIDE, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    ),
    'Scarab Shell',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    ),
    'Scarab Wing',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Dung Beetle Knight'
        and not custom
    ),
    'Underplate Fungus',
    '{HERB, HIDE, CONSUMABLE}'
  ),
  ------------------------------------------------------------------------------
  -- Frogdog
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Aqueous Eye',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Coated Femur',
    '{INDOMITABLE, PERFECT, COPPER, SCRAP, BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Elastic Tongue',
    '{HIDE, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Gaseous Bladder',
    '{HIDE, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Gilled Fungus',
    '{INDOMITABLE, PERFECT, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Ironclad Spine',
    '{BONE, IRON}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Mammary Gland',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Mossy Molar',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Oily Sphincter',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Spindly Paw',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Supple Nose',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Tatty Hide',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Waxy Dermis',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Frogdog'
        and not custom
    ),
    'Wiry Crest',
    '{HIDE}'
  ),
  ------------------------------------------------------------------------------
  -- Gorm
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Acid Gland',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Breathtaking Blubber',
    '{INDOMITABLE, PERFECT, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Dense Bone',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Gorm Brain',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Handed Skull',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Impacted Gusk',
    '{INDOMITABLE, PERFECT, BONE, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Jiggling Lard',
    '{ORGAN, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Mammoth Hand',
    '{BONE, HIDE, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Meaty Rib',
    '{BONE, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Milky Eye',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Stout Heart',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Stout Hide',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Stout Kidney',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Gorm'
        and not custom
    ),
    'Stout Vertebrae',
    '{BONE}'
  ),
  ------------------------------------------------------------------------------
  -- Flower Knight
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Flower Knight'
        and not custom
    ),
    'Lantern Bloom',
    '{FLOWER, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Flower Knight'
        and not custom
    ),
    'Lantern Bud',
    '{FLOWER, SCRAP}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Flower Knight'
        and not custom
    ),
    'Osseous Bloom',
    '{FLOWER, BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Flower Knight'
        and not custom
    ),
    'Sighing Bloom',
    '{FLOWER, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Flower Knight'
        and not custom
    ),
    'Warbling Bloom',
    '{FLOWER, HIDE}'
  ),
  ------------------------------------------------------------------------------
  -- King
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Ancient Blade',
    '{IRON, SCRAP}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Antique Bangle',
    '{BONE, SCRAP}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Heavy Chain',
    '{SCRAP}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Hollow Crown',
    '{HIDE, IRON, DEATHMETAL}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Huge Deathmetal Ingot',
    '{INDOMITABLE, PERFECT, IRON, SCRAP, DEATHMETAL}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Infinite Aperture',
    '{INDOMITABLE, PERFECT, IRON, SCRAP, DEATHMETAL}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'King''s Cloth',
    '{HIDE, CLOTH}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'King''s Coin',
    '{SCRAP, DEATHMETAL}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'King''s Collar',
    '{BONE, IRON, SCRAP}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Majestic Arm',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Miracle Liver',
    '{INDOMITABLE, PERFECT, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Origin Branch',
    '{INDOMITABLE, PERFECT, IRON, SCRAP, DEATHMETAL}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Pallium',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Pylorix',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Spiral Pauldron',
    '{IRON, SCRAP}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Stone Infant',
    '{BONE, HIDE, STONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'King'
        and not custom
    ),
    'Void Fabric',
    '{HIDE, CLOTH}'
  ),
  ------------------------------------------------------------------------------
  -- Phoenix
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Bird Beak',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Black Skull',
    '{IRON, SKULL, BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Fortune Feather',
    '{INDOMITABLE, PERFECT, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Gleaming Gizzard',
    '{INDOMITABLE, PERFECT, ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Hollow Wing Bones',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Muculent Droppings',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Neutron Seed',
    '{INDOMITABLE, PERFECT, ORGAN, STONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Phoenix Eye',
    '{ORGAN, SCRAP}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Phoenix Finger',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Phoenix Whisker',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Pustules',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Rainbow Droppings',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Shimmering Halo',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Small Feathers',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Small Hand Parasite',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Tail Feathers',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Violet Droppings',
    '{INDOMITABLE, PERFECT, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Violet Plume',
    '{INDOMITABLE, PERFECT, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Violet Small Feathers',
    '{INDOMITABLE, PERFECT, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Phoenix'
        and not custom
    ),
    'Wishbone',
    '{BONE}'
  ),
  ------------------------------------------------------------------------------
  -- Screaming Antelope
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    'Beast Steak',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    'Bladder',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    'Denticulated Bladehip',
    '{INDOMITABLE, BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    'Gnawed Gastrolith',
    '{INDOMITABLE, PERFECT, STONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    'Large Flat Tooth',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    'Muscly Gums',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    'Pelt',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    'Prime Beast Steak',
    '{INDOMITABLE, PERFECT, ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    'Screaming Brain',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    'Shank Bone',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Screaming Antelope'
        and not custom
    ),
    'Spiral Horn',
    '{BONE}'
  ),
  ------------------------------------------------------------------------------
  -- Smog Singers
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Belly Steel',
    '{INDOMITABLE, PERFECT, IRON, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Crystallized Song',
    '{INDOMITABLE, PERFECT, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Delicate Hand',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Foreskin Hood',
    '{INDOMITABLE, PERFECT, ORGAN, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Fluted Bone',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Fluted Severed Head',
    '{BONE, SKULL}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Fused Feet',
    '{INDOMITABLE, PERFECT, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Gaseous Belly',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Milky Milk Tooth',
    '{INDOMITABLE, PERFECT, BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Pink Flesh',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Pompous Face',
    '{INDOMITABLE, PERFECT, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Singing Tongue',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Tail Fat',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Vocal Chords',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Smog Singers'
        and not custom
    ),
    'Whistle Tooth',
    '{BONE, SCRAP}'
  ),
  ------------------------------------------------------------------------------
  -- Spidicules
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Aggregate Silk Gland',
    '{INDOMITABLE, PERFECT, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Arachnid Heart',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Chitin',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Exoskeleton',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Eyeballs',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Large Appendage',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Serrated Fangs',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Small Appendages',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Solenoglyphous Fang',
    '{INDOMITABLE, PERFECT, BONE, ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Spinnerets',
    '{ORGAN, SCRAP}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Stomach',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Thick Web Silk',
    '{SILK, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Unlaid Eggs',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Spidicules'
        and not custom
    ),
    'Venom Sac',
    '{ORGAN, CONSUMABLE}'
  ),
  ------------------------------------------------------------------------------
  -- Strange Resources
  ------------------------------------------------------------------------------
  (
    'STRANGE',
    null,
    '1,000 Year Sunspot',
    '{BONE, ORGAN}'
  ),
  (
    'STRANGE',
    null,
    '3,000 Year Sunspot',
    '{BONE, ORGAN, SCRAP}'
  ),
  (
    'STRANGE',
    null,
    'Active Thyroid',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'STRANGE',
    null,
    'Bioluminescent Tonsils',
    '{ORGAN}'
  ),
  (
    'STRANGE',
    null,
    'Black Lichen',
    '{BONE, ORGAN, HIDE, CONSUMABLE, OTHER}'
  ),
  ('STRANGE', null, 'Black Resin', '{ELASTOMER}'),
  (
    'STRANGE',
    null,
    'Blistering Plasma Fruit',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'STRANGE',
    null,
    'Blood Diamond Tear',
    '{ORGAN, DIAMOND}'
  ),
  ('STRANGE', null, 'Bugfish', '{FISH, ORGAN}'),
  (
    'STRANGE',
    null,
    'Burnished Encephalomatter',
    '{COPPER, SCRAP, ORGAN}'
  ),
  ('STRANGE', null, 'Canopic Jar', '{ORGAN, SCRAP}'),
  (
    'STRANGE',
    null,
    'Cocoon Membrane',
    '{ORGAN, OTHER}'
  ),
  ('STRANGE', null, 'Cold Living Flesh', '{ORGAN}'),
  (
    'STRANGE',
    null,
    'Crimson Vial',
    '{IRON, CONSUMABLE}'
  ),
  ('STRANGE', null, 'Crystal Ember', '{BONE}'),
  (
    'STRANGE',
    null,
    'Crystal Sword Mold',
    '{SCRAP, IRON}'
  ),
  (
    'STRANGE',
    null,
    'Dark Tower''s Ledger',
    '{PERFECT, IRON, ORGAN, SCRAP}'
  ),
  ('STRANGE', null, 'Dark Water', '{OTHER}'),
  (
    'STRANGE',
    null,
    'Deathmetal',
    '{IRON, SCRAP, DEATHMETAL}'
  ),
  (
    'STRANGE',
    null,
    'Denture Jabillo',
    '{PERFECT, BONE, FRUIT, VIRID}'
  ),
  (
    'STRANGE',
    null,
    'Dreaming Baneberry',
    '{FRUIT, CONSUMABLE, VIRID}'
  ),
  (
    'STRANGE',
    null,
    'Drifting Dream Fruit',
    '{CONSUMABLE}'
  ),
  ('STRANGE', null, 'Elder Cat Teeth', '{BONE}'),
  (
    'STRANGE',
    null,
    'Fissile Pancreas',
    '{PERFECT, ORGAN}'
  ),
  ('STRANGE', null, 'Fresh Acanthus', '{HERB}'),
  (
    'STRANGE',
    null,
    'Ghost Pepper',
    '{VEGETABLE, CONSUMABLE}'
  ),
  ('STRANGE', null, 'Gormite', '{SCRAP, IRON}'),
  ('STRANGE', null, 'Gular Sac', '{HIDE, ORGAN}'),
  ('STRANGE', null, 'Hagfish', '{FISH, BONE, HIDE}'),
  (
    'STRANGE',
    null,
    'Heart of the Sword Saint',
    '{PERFECT, ORGAN}'
  ),
  ('STRANGE', null, 'Hollow Stone', '{STONE}'),
  ('STRANGE', null, 'Hooked Claw', '{BONE}'),
  ('STRANGE', null, 'Iron', '{SCRAP}'),
  (
    'STRANGE',
    null,
    'Irregular Optic Nerve',
    '{ORGAN}'
  ),
  (
    'STRANGE',
    null,
    'Jagged Marrow Fruit',
    '{BONE, SCRAP, CONSUMABLE}'
  ),
  ('STRANGE', null, 'Jowls', '{FISH, IRON}'),
  ('STRANGE', null, 'Joy of Gaming', '{EMOTION}'),
  (
    'STRANGE',
    null,
    'Lantern Tube',
    '{ORGAN, SCRAP}'
  ),
  ('STRANGE', null, 'Leather', '{HIDE}'),
  (
    'STRANGE',
    null,
    'Legendary Horns',
    '{BONE, SCRAP}'
  ),
  ('STRANGE', null, 'Life String', '{ORGAN}'),
  (
    'STRANGE',
    null,
    'Lifting Milkweed',
    '{HERB, VIRID}'
  ),
  ('STRANGE', null, 'Lonely Fruit', '{CONSUMABLE}'),
  (
    'STRANGE',
    null,
    'Lustrous Tooth',
    '{PERFECT, BONE}'
  ),
  (
    'STRANGE',
    null,
    'Lucky Dice',
    '{BONE, HIDE, ORGAN, OTHER}'
  ),
  (
    'STRANGE',
    null,
    'Lungs of the Sword Saint',
    '{PERFECT, ORGAN}'
  ),
  (
    'STRANGE',
    null,
    'Master Key',
    '{PERFECT, BONE, IRON, SCRAP}'
  ),
  ('STRANGE', null, 'Old Blue Box', '{SCRAP}'),
  ('STRANGE', null, 'Perfect Crucible', '{IRON}'),
  ('STRANGE', null, 'Phoenix Crest', '{ORGAN}'),
  ('STRANGE', null, 'Pituitary Gland', '{ORGAN}'),
  (
    'STRANGE',
    null,
    'Porous Flesh Fruit',
    '{HIDE, CONSUMABLE}'
  ),
  (
    'STRANGE',
    null,
    'Preserved Caustic Dung',
    '{ORGAN, CONSUMABLE, DUNG}'
  ),
  ('STRANGE', null, 'Prime Tusk', '{BONE}'),
  ('STRANGE', null, 'Pure Bulb', '{ORGAN}'),
  ('STRANGE', null, 'Pyrolytic Light', '{IRON}'),
  ('STRANGE', null, 'Radiant Heart', '{ORGAN}'),
  ('STRANGE', null, 'Rage Pawn', '{STONE}'),
  ('STRANGE', null, 'Red Thread', '{HIDE}'),
  ('STRANGE', null, 'Red Vial', '{CONSUMABLE}'),
  (
    'STRANGE',
    null,
    'Reticulated Grabber',
    '{BONE, HIDE, ORGAN}'
  ),
  ('STRANGE', null, 'Sarcophagus', '{IRON}'),
  ('STRANGE', null, 'Salt', '{}'),
  ('STRANGE', null, 'Scell', '{ORGAN, CONSUMABLE}'),
  ('STRANGE', null, 'Second Heart', '{ORGAN, BONE}'),
  ('STRANGE', null, 'Shining Liver', '{ORGAN}'),
  (
    'STRANGE',
    null,
    'Silken Nervous System',
    '{ORGAN}'
  ),
  (
    'STRANGE',
    null,
    'Stonenail Jericho',
    '{HERB, VIRID}'
  ),
  ('STRANGE', null, 'Stomach Lining', '{ORGAN}'),
  ('STRANGE', null, 'Sunstones', '{BONE}'),
  ('STRANGE', null, 'Triptych', '{HIDE, SCRAP}'),
  (
    'STRANGE',
    null,
    'Unclean Endroot',
    '{PERFECT, ORGAN}'
  ),
  (
    'STRANGE',
    null,
    'Vim Basil',
    '{HERB, CONSUMABLE, VIRID}'
  ),
  (
    'STRANGE',
    null,
    'Wailing Rattlegrass',
    '{HERB, VIRID}'
  ),
  ('STRANGE', null, 'Web Silk', '{SILK}'),
  (
    'STRANGE',
    null,
    'White Charcoal',
    '{PERFECT, ORGAN}'
  ),
  ------------------------------------------------------------------------------
  -- Sunstalker
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Black Lens',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Brain Root',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Cycloid Scales',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Fertility Tentacles',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Huge Sunteeth',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Inner Shadow Skin',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Prismatic Gills',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Shadow Ink Gland',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Shadow Tentacles',
    '{ORGAN, HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Shark Tongue',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Small Sunteeth',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Stink Lung',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Sunshark Blubber',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Sunshark Bone',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'Sunstalker'
        and not custom
    ),
    'Sunshark Fin',
    '{BONE, HIDE}'
  ),
  ------------------------------------------------------------------------------
  -- Vermin
  ------------------------------------------------------------------------------
  (
    'VERMIN',
    null,
    'Carmine Cochineal',
    '{ORGAN, VERMIN}'
  ),
  (
    'VERMIN',
    null,
    'Crab Spider',
    '{HIDE, VERMIN, CONSUMABLE}'
  ),
  (
    'VERMIN',
    null,
    'Cyclops Fly',
    '{VERMIN, CONSUMABLE}'
  ),
  (
    'VERMIN',
    null,
    'Fiddler Crab Spider',
    '{HIDE, VERMIN, CONSUMABLE}'
  ),
  (
    'VERMIN',
    null,
    'Golden Frog',
    '{VERMIN, CONSUMABLE}'
  ),
  (
    'VERMIN',
    null,
    'Hissing Cockroach',
    '{VERMIN, CONSUMABLE}'
  ),
  (
    'VERMIN',
    null,
    'Lonely Ant',
    '{VERMIN, CONSUMABLE}'
  ),
  (
    'VERMIN',
    null,
    'Nightmare Tick',
    '{VERMIN, CONSUMABLE}'
  ),
  (
    'VERMIN',
    null,
    'Sword Beetle',
    '{VERMIN, CONSUMABLE}'
  ),
  ------------------------------------------------------------------------------
  -- White Lion
  ------------------------------------------------------------------------------
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'Cat Tongue',
    '{INDOMITABLE, PERFECT, ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'Curious Hand',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'Eye of Cat',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'Golden Whiskers',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'Great Cat Bones',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'Layered Maxilla',
    '{INDOMITABLE, PERFECT, BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'Lion Claw',
    '{BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'Lion Tail',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'Lion Testes',
    '{ORGAN, CONSUMABLE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'Overgrown Dewclaw',
    '{INDOMITABLE, PERFECT, BONE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'Shimmering Mane',
    '{HIDE}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'Sinew',
    '{ORGAN}'
  ),
  (
    'MONSTER',
    (
      select id
      from quarry
      where monster_name = 'White Lion'
        and not custom
    ),
    'White Fur',
    '{HIDE}'
  );