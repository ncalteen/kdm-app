--------------------------------------------------------------------------------
-- Armor Set: enforce unique name for built-in (non-custom) sets.
--
-- The seed script inserts built-in `armor_set` rows with `on conflict do
-- nothing` semantics, which silently no-ops without a matching unique
-- constraint. Re-running the seed against an already-populated database would
-- otherwise produce duplicate built-in rows.
--
-- Custom user-owned sets are intentionally excluded so multiple users may pick
-- the same name for their own creations.
--------------------------------------------------------------------------------
create unique index armor_set_unique_non_custom_name on armor_set (armor_set_name)
where not custom;