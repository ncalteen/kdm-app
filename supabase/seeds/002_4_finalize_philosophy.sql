--------------------------------------------------------------------------------
-- Philosophies
--------------------------------------------------------------------------------
-- Ambitionism
-- Note: Ambitionism's tenet knowledge is decided through gameplay.
update philosophy
set neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Spoiled'
  )
where philosophy_name = 'Ambitionism';
-- Champion
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Chosen'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Compelled'
  )
where philosophy_name = 'Champion';
-- Collectivism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'All for One'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Selfless'
  )
where philosophy_name = 'Collectivism';
-- Deadism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Death Poet'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Disembodied'
  )
where philosophy_name = 'Deadism';
-- Dreamism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Guardian'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Sleepless'
  )
where philosophy_name = 'Dreamism';
-- Faceism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Physiognomy'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Fixated'
  )
where philosophy_name = 'Faceism';
-- Gatherism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Invasive'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Inquisitive'
  )
where philosophy_name = 'Gatherism';
-- Gourmandism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Health'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Ravenous'
  )
where philosophy_name = 'Gourmandism';
-- Homicidalism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Dark Impulse'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Murderer'
  )
where philosophy_name = 'Homicidalism';
-- Impermanism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Shatterstar'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Unrestrained'
  )
where philosophy_name = 'Impermanism';
-- Lanternism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Death Collector'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Phototaxis'
  )
where philosophy_name = 'Lanternism';
-- Marrowism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Osteophage'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Arrogance'
  )
where philosophy_name = 'Marrowism';
-- Optimism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Positivity'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Important'
  )
where philosophy_name = 'Optimism';
-- Regalism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Find the Castle'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Inferiority Complex'
  )
where philosophy_name = 'Regalism';
-- Romanticism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Wanderlust'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Dilettante'
  )
where philosophy_name = 'Romanticism';
-- Survivalism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Tenacity'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Selfish'
  )
where philosophy_name = 'Survivalism';
-- Verminism
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Hissing Arms'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Frailty'
  )
where philosophy_name = 'Verminism';