# Realtime Junction Settlement Scope

## Status

Accepted

## Context

Issue #189 follows up on the realtime publication audit. Several gameplay
junction tables did not carry `settlement_id`, so `hooks/use-realtime.tsx`
subscribed to them without a row filter and relied on RLS to limit delivered
events. That protected data visibility but still meant a user with access to
multiple settlements could receive events for another accessible settlement and
trigger unnecessary active-settlement refetches.

## Challenge

- Supabase realtime filters cannot express joins from a junction row back to
  `survivor`, `hunt_monster`, or `showdown_monster`.
- The affected rows still need direct RLS predicates, FK integrity, and safe
  backfills for existing data.
- Catalog tables intentionally keep the coarse subscription model because their
  transitive visibility graph is broader and rules-text edits are rare.

## Goals

- Filter every gameplay junction realtime subscription by the active
  `settlement_id`.
- Keep `settlement_id` authoritative at the schema layer rather than relying on
  callers to duplicate parent scope correctly.
- Preserve collaborator CRUD behavior for settlement members.
- Leave catalog-table realtime behavior unchanged.

## Risks

- Denormalized scope can drift if parent rows are moved without synchronizing
  children.
- Generated Supabase types may expose the new column to callers even though the
  database derives it.
- RLS rewrites can accidentally narrow collaborator access or widen stranger
  access if the direct predicates are wrong.

## Decision

Use approach A from issue #189. Add `settlement_id` to every affected gameplay
junction table, backfill it from the parent row, enforce a FK to `settlement`,
and maintain parity with trigger functions. RLS policies on those tables use
direct
`is_settlement_owner(settlement_id) or is_settlement_collaborator(settlement_id)`
predicates, and the realtime table map filters them by `settlement_id`.

Affected tables:

- `survivor_ability_impairment`
- `survivor_cursed_gear`
- `survivor_disorder`
- `survivor_fighting_art`
- `survivor_secret_fighting_art`
- `gear_grid`
- `hunt_monster_mood`
- `hunt_monster_survivor_status`
- `hunt_monster_trait`
- `showdown_monster_mood`
- `showdown_monster_survivor_status`
- `showdown_monster_trait`

## Consequences

Gameplay realtime events are now scoped at the publication filter layer, so an
unrelated accessible settlement does not cause a refetch of the active
settlement's survivor, hunt, or showdown data. RLS predicates are simpler and
match the direct settlement-scoped policy pattern used by the rest of the
gameplay graph. Future gameplay junctions should include `settlement_id` when
they need realtime filtering; catalog tables remain covered by the documented
coarse subscription model.
