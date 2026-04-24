--------------------------------------------------------------------------------
-- Philosophy Ranks
--------------------------------------------------------------------------------
-- All built-in philosophies have 5 ranks (1-5). Rules are populated via
-- gameplay or later seeds.
insert into philosophy_rank (philosophy_id, rank_number)
select p.id,
  r.rank_number
from philosophy p
  cross join generate_series(1, 5) as r(rank_number)
where not p.custom;