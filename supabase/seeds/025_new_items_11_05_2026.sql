--------------------------------------------------------------------------------
-- Adding New Content
--------------------------------------------------------------------------------
insert into gear (
    gear_name,
    accessory,
    armor_points,
    armor_location,
    weapon_type_id
  )
values ('East Star Charnel Tag', false, 2, 'HEAD', null),
  (
    'East Star Athame',
    false,
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Dagger'
    )
  ),
  (
    'Stone Macuahuitl',
    false,
    null,
    null,
    (
      select id
      from weapon_type
      where weapon_type_name = 'Club'
    )
  );
--------------------------------------------------------------------------------
insert into seed_pattern (
    seed_pattern_name,
    crafting_limit,
    era,
    crafted_gear_id
  )
values (
    'Stone Macuahuitl',
    1,
    1,
    (
      select id
      from gear
      where gear_name = 'Stone Macuahuitl'
    )
  );