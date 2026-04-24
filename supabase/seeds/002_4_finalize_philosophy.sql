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
    where knowledge_name = 'Chosen I'
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
    where knowledge_name = 'All for One I'
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
    where knowledge_name = 'Death Poet I'
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
    where knowledge_name = 'Guardian I'
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
    where knowledge_name = 'Physiognomy I'
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
    where knowledge_name = 'Invasive I'
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
    where knowledge_name = 'Health I'
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
    where knowledge_name = 'Dark Impulse I'
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
    where knowledge_name = 'Shatterstar I'
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
    where knowledge_name = 'Death Collector I'
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
    where knowledge_name = 'Osteophage I'
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
    where knowledge_name = 'Positivity I'
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
    where knowledge_name = 'Find the Castle I'
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
    where knowledge_name = 'Tenacity I'
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
    where knowledge_name = 'Hissing Arms I'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Frailty'
  )
where philosophy_name = 'Verminism';
-- Wanderer - Aenas
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Dubious Fare I'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Cravings'
  )
where philosophy_name = 'Wanderer - Aenas';
-- Wanderer - Candy & Cola
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Chain Dash I'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Afflicted'
  )
where philosophy_name = 'Wanderer - Candy & Cola';
-- Wanderer - Death Drifter
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Reframe I'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Compound Grief'
  )
where philosophy_name = 'Wanderer - Death Drifter';
-- Wanderer - Goth
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Adrenaline I'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Rotter'
  )
where philosophy_name = 'Wanderer - Goth';
-- Wanderer - Luck
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Fortune & Misfortune I'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Woebegone'
  )
where philosophy_name = 'Wanderer - Luck';
-- Wanderer - Preacher
update philosophy
set tenet_knowledge_id = (
    select id
    from knowledge
    where knowledge_name = 'Virtuous I'
  ),
  neurosis_id = (
    select id
    from neurosis
    where neurosis_name = 'Revered'
  )
where philosophy_name = 'Wanderer - Preacher';