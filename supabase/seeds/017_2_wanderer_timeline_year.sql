--------------------------------------------------------------------------------
-- Wanderer Timeline Year Entries
--------------------------------------------------------------------------------
insert into wanderer_timeline_year (wanderer_id, year_number, entries)
values -------------------------------------------------------------------------
  -- Aenas
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Aenas'
        and not custom
    ),
    7,
    '{"Wanderer - Aenas"}'
  ),
  ------------------------------------------------------------------------------
  -- Candy & Cola
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Candy & Cola'
        and not custom
    ),
    2,
    '{"Wanderer - Candy & Cola"}'
  ),
  ------------------------------------------------------------------------------
  -- Death Drifter
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Death Drifter'
        and not custom
    ),
    6,
    '{"Wanderer - Death Drifter"}'
  ),
  ------------------------------------------------------------------------------
  -- Goth
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Goth'
        and not custom
    ),
    4,
    '{"Wanderer - Goth"}'
  ),
  ------------------------------------------------------------------------------
  -- Luck
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Luck'
        and not custom
    ),
    23,
    '{"Wanderer - Luck"}'
  ),
  ------------------------------------------------------------------------------
  -- Preacher
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Preacher'
        and not custom
    ),
    8,
    '{"Wanderer - Preacher"}'
  );