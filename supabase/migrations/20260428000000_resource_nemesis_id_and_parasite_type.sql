--------------------------------------------------------------------------------
-- Resource: Nemesis Source + Parasite Resource Type
-- Adds:
--   * 'PARASITE' value to the resource_type enum so resources sourced from
--     parasitic nemeses can be classified.
--   * resource.nemesis_id column so a resource can be sourced from a nemesis
--     instead of (or in addition to) a quarry.
--------------------------------------------------------------------------------
alter type resource_type
add value if not exists 'PARASITE';
alter table resource
add column if not exists nemesis_id uuid references nemesis(id) on delete cascade;
create index if not exists idx_resource_nemesis on resource(nemesis_id);