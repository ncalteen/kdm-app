--------------------------------------------------------------------------------
-- Neuroses
--------------------------------------------------------------------------------
insert into neurosis (neurosis_name, philosophy_id)
values (
    'Spoiled',
    (
      select id
      from philosophy
      where philosophy_name = 'Ambitionism'
    )
  ),
  (
    'Compelled',
    (
      select id
      from philosophy
      where philosophy_name = 'Champion'
    )
  ),
  (
    'Selfless',
    (
      select id
      from philosophy
      where philosophy_name = 'Collectivism'
    )
  ),
  (
    'Disembodied',
    (
      select id
      from philosophy
      where philosophy_name = 'Deadism'
    )
  ),
  (
    'Sleepless',
    (
      select id
      from philosophy
      where philosophy_name = 'Dreamism'
    )
  ),
  (
    'Fixated',
    (
      select id
      from philosophy
      where philosophy_name = 'Faceism'
    )
  ),
  (
    'Inquisitive',
    (
      select id
      from philosophy
      where philosophy_name = 'Gatherism'
    )
  ),
  (
    'Ravenous',
    (
      select id
      from philosophy
      where philosophy_name = 'Gourmandism'
    )
  ),
  (
    'Murderer',
    (
      select id
      from philosophy
      where philosophy_name = 'Homicidalism'
    )
  ),
  (
    'Unrestrained',
    (
      select id
      from philosophy
      where philosophy_name = 'Impermanism'
    )
  ),
  (
    'Phototaxis',
    (
      select id
      from philosophy
      where philosophy_name = 'Lanternism'
    )
  ),
  (
    'Arrogance',
    (
      select id
      from philosophy
      where philosophy_name = 'Marrowism'
    )
  ),
  (
    'Important',
    (
      select id
      from philosophy
      where philosophy_name = 'Optimism'
    )
  ),
  (
    'Inferiority Complex',
    (
      select id
      from philosophy
      where philosophy_name = 'Regalism'
    )
  ),
  (
    'Dilettante',
    (
      select id
      from philosophy
      where philosophy_name = 'Romanticism'
    )
  ),
  (
    'Selfish',
    (
      select id
      from philosophy
      where philosophy_name = 'Survivalism'
    )
  ),
  (
    'Frailty',
    (
      select id
      from philosophy
      where philosophy_name = 'Verminism'
    )
  );