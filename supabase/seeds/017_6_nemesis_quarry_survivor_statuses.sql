--------------------------------------------------------------------------------
-- Killenium Butcher
--------------------------------------------------------------------------------
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Killenium Butcher'
    and nl.level_number = 3
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Infectious Lunacy');
--------------------------------------------------------------------------------
-- Butcher
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Butcher'
    and nl.level_number = 1
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Infectious Lunacy');
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Butcher'
    and nl.level_number = 2
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Infectious Lunacy');
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Butcher'
    and nl.level_number = 3
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Infectious Lunacy');
--------------------------------------------------------------------------------
-- The Hand
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'The Hand'
    and nl.level_number = 1
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Polarized Aura');
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'The Hand'
    and nl.level_number = 2
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Polarized Aura');
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'The Hand'
    and nl.level_number = 3
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Polarized Aura');
--------------------------------------------------------------------------------
-- King's Man
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'King''s Man'
    and nl.level_number = 1
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Battle Tempo');
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'King''s Man'
    and nl.level_number = 2
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Battle Tempo');
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'King''s Man'
    and nl.level_number = 3
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Battle Tempo');
--------------------------------------------------------------------------------
-- Pariah
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Pariah'
    and nl.level_number = 1
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Somatic Static');
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Pariah'
    and nl.level_number = 2
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Somatic Static');
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Pariah'
    and nl.level_number = 3
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Somatic Static');
--------------------------------------------------------------------------------
-- Slenderman
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Slenderman'
    and nl.level_number = 1
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Madness Inversion');
-- Level 2
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Slenderman'
    and nl.level_number = 2
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Madness Inversion');
-- Level 3
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Slenderman'
    and nl.level_number = 3
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Madness Inversion');
--------------------------------------------------------------------------------
-- Watcher
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select nl.id
  from nemesis_level nl
    join nemesis p on p.id = nl.nemesis_id
  where p.monster_name = 'Watcher'
    and nl.level_number = 1
)
insert into nemesis_level_survivor_status (nemesis_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Retinue');
--------------------------------------------------------------------------------
-- Phoenix
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select ql.id
  from quarry_level ql
    join quarry p on p.id = ql.quarry_id
  where p.monster_name = 'Phoenix'
    and ql.level_number = 1
)
insert into quarry_level_survivor_status (quarry_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Dreaded Decade');
-- Level 2
with lvl as (
  select ql.id
  from quarry_level ql
    join quarry p on p.id = ql.quarry_id
  where p.monster_name = 'Phoenix'
    and ql.level_number = 2
)
insert into quarry_level_survivor_status (quarry_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Dreaded Decade');
-- Level 3
with lvl as (
  select ql.id
  from quarry_level ql
    join quarry p on p.id = ql.quarry_id
  where p.monster_name = 'Phoenix'
    and ql.level_number = 3
)
insert into quarry_level_survivor_status (quarry_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Dreaded Decade');
--------------------------------------------------------------------------------
-- Smog Singers
--------------------------------------------------------------------------------
-- Level 1
with lvl as (
  select ql.id
  from quarry_level ql
    join quarry p on p.id = ql.quarry_id
  where p.monster_name = 'Smog Singers'
    and ql.level_number = 1
)
insert into quarry_level_survivor_status (quarry_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Bloody Hands');
-- Level 2
with lvl as (
  select ql.id
  from quarry_level ql
    join quarry p on p.id = ql.quarry_id
  where p.monster_name = 'Smog Singers'
    and ql.level_number = 2
)
insert into quarry_level_survivor_status (quarry_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Bloody Hands');
-- Level 3
with lvl as (
  select ql.id
  from quarry_level ql
    join quarry p on p.id = ql.quarry_id
  where p.monster_name = 'Smog Singers'
    and ql.level_number = 3
)
insert into quarry_level_survivor_status (quarry_level_id, survivor_status_id)
select lvl.id,
  c.id
from lvl,
  survivor_status c
where c.survivor_status_name in ('Bloody Hands');
