--------------------------------------------------------------------------------
-- Wanderer Abilities / Impairments Catalog
--------------------------------------------------------------------------------
insert into ability_impairment (ability_impairment_name)
values ('Candypop'),
  ('Endless Appetite'),
  ('Lone Drifter'),
  ('Object of Devotion'),
  ('Revenant'),
  ('Servant of Fate'),
  ('Veteran');
--------------------------------------------------------------------------------
-- Wanderer → Ability/Impairment Assignments
--
-- All built-in wanderers receive Veteran. Each also receives a single
-- signature ability tied to their theme.
--------------------------------------------------------------------------------
insert into wanderer_ability_impairment (wanderer_id, ability_impairment_id)
values -------------------------------------------------------------------------
  -- Aenas: Endless Appetite + Veteran
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Aenas'
        and not custom
    ),
    (
      select id
      from ability_impairment
      where ability_impairment_name = 'Endless Appetite'
        and not custom
    )
  ),
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Aenas'
        and not custom
    ),
    (
      select id
      from ability_impairment
      where ability_impairment_name = 'Veteran'
        and not custom
    )
  ),
  ------------------------------------------------------------------------------
  -- Candy & Cola: Candypop + Veteran
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Candy & Cola'
        and not custom
    ),
    (
      select id
      from ability_impairment
      where ability_impairment_name = 'Candypop'
        and not custom
    )
  ),
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Candy & Cola'
        and not custom
    ),
    (
      select id
      from ability_impairment
      where ability_impairment_name = 'Veteran'
        and not custom
    )
  ),
  ------------------------------------------------------------------------------
  -- Death Drifter: Lone Drifter + Veteran
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Death Drifter'
        and not custom
    ),
    (
      select id
      from ability_impairment
      where ability_impairment_name = 'Lone Drifter'
        and not custom
    )
  ),
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Death Drifter'
        and not custom
    ),
    (
      select id
      from ability_impairment
      where ability_impairment_name = 'Veteran'
        and not custom
    )
  ),
  ------------------------------------------------------------------------------
  -- Goth: Revenant + Veteran
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Goth'
        and not custom
    ),
    (
      select id
      from ability_impairment
      where ability_impairment_name = 'Revenant'
        and not custom
    )
  ),
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Goth'
        and not custom
    ),
    (
      select id
      from ability_impairment
      where ability_impairment_name = 'Veteran'
        and not custom
    )
  ),
  ------------------------------------------------------------------------------
  -- Luck: Servant of Fate + Veteran
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Luck'
        and not custom
    ),
    (
      select id
      from ability_impairment
      where ability_impairment_name = 'Servant of Fate'
        and not custom
    )
  ),
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Luck'
        and not custom
    ),
    (
      select id
      from ability_impairment
      where ability_impairment_name = 'Veteran'
        and not custom
    )
  ),
  ------------------------------------------------------------------------------
  -- Preacher: Object of Devotion + Veteran
  ------------------------------------------------------------------------------
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Preacher'
        and not custom
    ),
    (
      select id
      from ability_impairment
      where ability_impairment_name = 'Object of Devotion'
        and not custom
    )
  ),
  (
    (
      select id
      from wanderer
      where wanderer_name = 'Preacher'
        and not custom
    ),
    (
      select id
      from ability_impairment
      where ability_impairment_name = 'Veteran'
        and not custom
    )
  );