# Vignette Encounters Implementation Plan

## Table of Contents

1. [Goals & Non-Goals](#1-goals--non-goals)
1. [Focus Areas](#2-focus-areas)
1. [Current Codebase Fit](#3-current-codebase-fit)
1. [Recommended Product Model](#4-recommended-product-model)
1. [Recommended Data Model](#5-recommended-data-model)
1. [Permissions, Sharing, and Limits](#6-permissions-sharing-and-limits)
1. [Frontend Architecture](#7-frontend-architecture)
1. [Testing Strategy](#8-testing-strategy)
1. [Milestone Plan](#9-milestone-plan)
1. [GitHub Issue Backlog](#10-github-issue-backlog)
1. [Open Questions](#11-open-questions)

---

## 1. Goals & Non-Goals

### Goals

- **G1.** Add first-class support for Vignette Encounters: standalone, one-shot
  showdowns with predefined survivors, predefined gear grids, and
  vignette-specific monster setup.
- **G2.** Keep Vignette Encounters outside the existing campaign loop. They do
  not create hunts, settlement phases, timeline entries, locations, settlement
  resources, or settlement survivors.
- **G3.** Model vignette encounter monsters separately from normal quarries and
  nemeses. Encounter stats, level data, moods, traits, and survivor statuses
  must not overwrite campaign monster data.
- **G4.** Support vignette encounter monsters whose source monster is either a
  quarry or a nemesis.
- **G5.** Copy predefined survivor templates and gear-grid templates into an
  active vignette instance so play can mutate wounds, survival, statuses, gear
  positions, and other encounter state without changing catalog templates.
- **G6.** Apply existing RLS, ownership, collaboration, realtime, and
  subscription standards. Lantern Hoard users can share active vignette
  encounters with other players.
- **G7.** Enforce a one-active-owned-vignette limit for every user regardless of
  subscription tier.
- **G8.** Allow a user to switch between their own active vignette encounter and
  any active vignette encounters shared with them.
- **G9.** Produce an issue backlog that can be converted into parent and child
  GitHub issues for `https://github.com/ncalteen/kdm-app`.

### Non-Goals

- **NG1.** Full automation of Kingdom Death: Monster combat rules. The feature
  tracks encounter state; it does not become a rules engine.
- **NG2.** Vignette hunt support. These are showdown-only experiences.
- **NG3.** Settlement location, timeline, endeavor, resource, or crafting
  integration for the one-shot encounter instance.
- **NG4.** Public anonymous sharing links.
- **NG5.** Importing a vignette as a full settlement or adding its predefined
  survivors to a campaign settlement.
- **NG6.** Reusing normal `showdown` rows if doing so requires nullable
  settlement IDs or phase-specific branching across existing campaign logic.
- **NG7.** User-created vignette encounter definitions. Vignette definitions,
  levels, survivor templates, and gear templates are app-authored catalog data
  for the initial architecture.

---

## 2. Focus Areas

1. **Vignette Encounter Landing** - a top-level one-shot navigation surface
   outside the settlement loop, with owned and shared active encounters visible.
1. **Encounter Setup** - monster level selection, predefined survivors, and no
   settlement timeline/location controls.
1. **Active Vignette Showdown** - turn tracking, monster state, survivor state,
   and owner-only end actions.
1. **Survivor Gear Detail** - copied survivor instance data and a vignette-only
   gear grid.
1. **Sharing and End State** - Lantern Hoard collaboration plus the active-slot
   clearing behavior after a vignette is ended.

Design direction:

- Add a new top-level sidebar group, likely **Vignette Encounters**, rather than
  hiding this feature inside the settlement Embark loop.
- Use the existing compact shadcn card language, lucide-style icon buttons,
  badges, tables, and dense list rows.
- Keep the UI practical and play-table friendly. This is a tracker, not a
  marketing page.
- Avoid any controls for locations, timelines, endeavors, settlement phase, or
  hunt board setup on vignette encounter screens.

---

## 3. Current Codebase Fit

### Relevant Existing Patterns

- The authenticated product currently renders a single application shell from
  [app/page.tsx](../app/page.tsx), with sidebar-driven tabs and shared state in
  `LocalContext`.
- Campaign flow surfaces are split into feature cards under
  [components/hunt](../components/hunt),
  [components/showdown](../components/showdown), and
  [components/settlement-phase](../components/settlement-phase).
- `TabType` in [lib/enums.ts](../lib/enums.ts) controls top-level navigation.
  Vignette Encounters should add a new tab rather than overloading
  `TabType.SHOWDOWN`.
- Sharing patterns are already established by settlement sharing. The long-term
  model is settlement membership for campaign play, owner-only share grants,
  collaborator gameplay edits, exact username lookup, realtime subscription
  updates, and paid share creation.
- Subscription entitlements already distinguish `lantern` and `lantern_hoard`
  for unlimited settlements in
  [lib/subscription-entitlements.ts](../lib/subscription-entitlements.ts).
  Vignette sharing should introduce a separate `canShareVignetteEncounters`
  helper that only returns true for active/trialing `lantern_hoard`.

### User-Created Vignette Definition Assessment

The initial architecture does not need to preserve a path for user-created
vignette encounter definitions. Removing that future support simplifies several
decisions:

- Catalog definition and template tables do not need `user_id`, `is_custom`,
  archive, ownership, or author-edit policies.
- Definition, level, survivor-template, and gear-template writes can be limited
  to migrations, seed scripts, service-role maintenance, or future admin tools.
- RLS for catalog setup tables can be read-only for authenticated users.
- There is no need for custom vignette definition schemas, custom definition UI,
  user-authored template validation, or transitive visibility rules for
  user-owned vignette definitions.

No remaining recommendation in this plan hinges on supporting user-created
vignette encounters later. The main future-facing choice is simply to avoid
hard-coding official content in application code; keep it in database-backed
catalog tables so app-authored content can grow through migrations or admin
maintenance.

### Why Vignettes Should Not Reuse Campaign Showdown Tables Directly

Normal showdowns are settlement-scoped and can hand off to settlement phase.
Vignette encounters intentionally have no settlement location, timeline, hunt,
or settlement phase. Reusing the normal tables would either require optional
foreign keys in core gameplay tables or many defensive branches in existing
showdown code. A separate vignette instance model keeps this feature isolated
and reduces regression risk to campaign play.

Shared component patterns can still be reused where they are truly generic:

- Monster stat display cards.
- Survivor calculated stat blocks.
- Gear grid rendering and interaction primitives.
- Turn tracker presentation.
- Sharing panel primitives.

---

## 4. Recommended Product Model

### Primary Concepts

| Concept                       | Description                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Vignette Encounter Definition | App-authored catalog record for the one-shot scenario. Includes title, rules summary, and source monster relationship. |
| Vignette Encounter Level      | Level-specific stats and setup for the encounter monster. Separate from normal quarry/nemesis level rows.              |
| Vignette Survivor Template    | Prebuilt survivor sheet data used when starting the vignette.                                                          |
| Vignette Gear Template        | Prebuilt gear-grid layout for a survivor template.                                                                     |
| Active Vignette Encounter     | User-owned playable instance copied from the templates. Only one active owned instance is allowed per user.            |
| Vignette Collaborator         | Another authenticated user invited into the active instance by a Lantern Hoard owner.                                  |
| Selected Vignette Encounter   | UI selection for either the user's owned active vignette or one shared with them.                                      |

### Lifecycle

1. User opens **Vignette Encounters** from the top-level app navigation.
1. The user sees their owned active vignette, if present, plus any active
   vignette encounters shared with them.
1. The user can switch between accessible active vignettes without affecting the
   one-active-owned-vignette limit.
1. If the user does not own an active vignette, they can select an encounter
   definition and monster level.
1. Creation copies survivor templates, gear-grid templates, and monster level
   setup into instance tables.
1. Owner and collaborators track the standalone showdown.
1. Owner ends the vignette when the table is done with it. The app does not
   record the outcome.
1. Ending the vignette clears the owner's active vignette slot. Any settlement
   consequences are tracked manually by the user.

### Owned and Shared Switching

The one-active limit applies only to vignettes the user owns. A user may still
have access to several active vignettes at the same time: their own active
vignette plus one or more active vignettes shared by Lantern Hoard owners. The
landing UI should therefore render an accessible vignette switcher rather than
assuming a single active card.

Recommended interaction model:

- Show **My Active Vignette** when the user owns one.
- Show **Shared With Me** for active vignette encounters where the user is a
  collaborator.
- Store a selected accessible vignette ID and role in local state, similar to
  settlement selection.
- Default selection order should prefer the user's owned active vignette, then
  the most recently updated shared vignette.
- Starting a new owned vignette is blocked only when the user already owns an
  active vignette. Shared vignettes do not count against this limit.
- Owner-only actions such as ending the vignette and managing shares should be
  hidden or disabled when the selected vignette role is `collaborator`.

---

## 5. Recommended Data Model

Names are provisional but intentionally explicit. The implementation should
follow existing migration naming, JSDoc, schema, and DAL conventions.

### Catalog Tables

#### `vignette_encounter_definition`

Core scenario record.

Important columns:

- `id uuid primary key`
- `name text not null`
- `slug text not null unique`
- `description text`
- `source_monster_type monster_type not null check in ('NEMESIS', 'QUARRY')`
- `source_nemesis_id uuid null references nemesis(id)`
- `source_quarry_id uuid null references quarry(id)`
- `sort_order integer not null default 0`
- `published boolean not null default false`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- Exactly one of `source_nemesis_id` or `source_quarry_id` must be present.
- `source_monster_type` must match the populated source foreign key.

#### `vignette_encounter_level`

Encounter-specific monster level data.

Important columns:

- `id uuid primary key`
- `vignette_encounter_definition_id uuid not null`
- `level integer not null`
- `movement integer not null`
- `speed integer not null`
- `accuracy integer not null`
- `evasion integer not null default 0`
- `damage integer not null`
- `toughness integer not null`
- `wounds integer null`
- `ai_deck_size integer null`
- `hit_location_deck_size integer null`
- `basic_action text null`
- `special_rules text null`

Constraints:

- Unique `(vignette_encounter_definition_id, level)`.
- Level stats are independent of `nemesis_level` and `quarry_level`.

#### Level Junction Tables

Add level-to-catalog junctions so level setup can reference existing catalog
rows without duplicating rules text:

- `vignette_encounter_level_mood`
- `vignette_encounter_level_trait`
- `vignette_encounter_level_survivor_status`

Each table should include:

- `vignette_encounter_level_id uuid not null`
- `<catalog>_id uuid not null`
- `sort_order integer not null default 0`
- Composite unique key on both IDs.

#### `vignette_survivor_template`

Prebuilt survivor sheet data for a definition.

Important columns:

- `id uuid primary key`
- `vignette_encounter_definition_id uuid not null`
- `name text not null`
- `survivor_type survivor_type not null`
- `gender gender null`
- Core attributes such as movement, accuracy, strength, evasion, luck, speed,
  survival, insanity, courage, understanding, weapon proficiency, and armor
  points as needed by existing survivor displays.
- `sort_order integer not null default 0`

Template junctions should mirror relevant existing survivor relationships where
needed:

- `vignette_survivor_template_fighting_art`
- `vignette_survivor_template_secret_fighting_art`
- `vignette_survivor_template_disorder`
- `vignette_survivor_template_ability_impairment`
- `vignette_survivor_template_survivor_status`

#### `vignette_survivor_template_gear_grid`

Prebuilt gear layout for each survivor template.

Important columns:

- `id uuid primary key`
- `vignette_survivor_template_id uuid not null`
- `gear_id uuid not null references gear(id)`
- `row integer not null`
- `column integer not null`

Constraints:

- Unique `(vignette_survivor_template_id, row, column)`.
- Use the same coordinate and validation conventions as existing gear-grid code.

### Instance Tables

#### `vignette_encounter`

User-owned playable instance.

Important columns:

- `id uuid primary key`
- `user_id uuid not null references auth.users(id)`
- `vignette_encounter_definition_id uuid not null`
- `vignette_encounter_level_id uuid not null`
- `status text not null check in ('ACTIVE', 'ENDED')`
- `round integer not null default 1`
- `turn text not null default 'MONSTER'`
- `notes text null`
- `ended_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Recommended one-active-owned limit:

```sql
create unique index one_active_vignette_encounter_per_user
on public.vignette_encounter (user_id)
where status = 'ACTIVE';
```

This allows historical ended rows while enforcing the gameplay limit. If history
is not useful, ending a vignette can delete the instance instead; the same
partial unique index still protects active ownership while the row exists.

#### `vignette_encounter_shared_user`

Active instance collaboration, modeled after `settlement_shared_user`.

Important columns:

- `vignette_encounter_id uuid not null references vignette_encounter(id)`
- `shared_user_id uuid not null references auth.users(id)`
- `created_by uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`

Constraints:

- Composite primary key `(vignette_encounter_id, shared_user_id)`.
- Owner cannot invite themselves.
- Only the owner can add or remove shares.
- Insert requires `can_share_vignette_encounters(auth.uid())`.

#### `vignette_encounter_monster`

Mutable monster state for the active instance.

Important columns:

- `id uuid primary key`
- `vignette_encounter_id uuid not null unique`
- `current_wounds integer null`
- `current_ai_cards integer null`
- `current_hit_location_cards integer null`
- `knocked_down boolean not null default false`
- `notes text null`

Level moods, traits, and survivor statuses are read from the level setup. If an
encounter needs mutable monster conditions, add a separate
`vignette_encounter_monster_condition` table rather than changing catalog rows.

#### `vignette_encounter_survivor`

Copied survivor instance.

Important columns:

- `id uuid primary key`
- `vignette_encounter_id uuid not null`
- `vignette_survivor_template_id uuid null`
- `name text not null`
- `survivor_type survivor_type not null`
- Survivor attributes copied from the template.
- Wound, armor, survival, insanity, dead/retired, knocked-down, and notes fields
  needed by the encounter tracker.
- `sort_order integer not null default 0`

Instance junctions should be separate from settlement survivor junctions:

- `vignette_encounter_survivor_fighting_art`
- `vignette_encounter_survivor_secret_fighting_art`
- `vignette_encounter_survivor_disorder`
- `vignette_encounter_survivor_ability_impairment`
- `vignette_encounter_survivor_status`

#### `vignette_encounter_gear_grid`

Copied gear-grid instance.

Important columns:

- `id uuid primary key`
- `vignette_encounter_survivor_id uuid not null`
- `gear_id uuid not null references gear(id)`
- `row integer not null`
- `column integer not null`

Constraints:

- Unique `(vignette_encounter_survivor_id, row, column)`.

---

## 6. Permissions, Sharing, and Limits

### RLS Rules

Use RLS as the source of truth.

Catalog setup tables:

- Published built-in definitions and levels are readable by authenticated users.
- Vignette definitions and templates are app-authored catalog data. Client users
  do not insert, update, or delete these rows.

Instance tables:

- Owner can select, update, end, and delete their own active vignette instance
  according to lifecycle rules.
- Collaborators can select and update gameplay state for shared active
  vignettes.
- Collaborators cannot end, delete, or manage shares.
- Strangers cannot select or mutate instance rows.

Sharing table:

- Owner can select shares for their vignette.
- Shared users can select their own membership rows.
- Owner can insert shares only when `can_share_vignette_encounters(auth.uid())`
  is true.
- Owner can delete shares.
- Collaborators cannot invite additional collaborators.

### Entitlements

Add a helper in
[lib/subscription-entitlements.ts](../lib/subscription-entitlements.ts):

```ts
export function canShareVignetteEncounters(
  subscription: Pick<UserSubscriptionDetail, 'plan_id' | 'status'> | null
): boolean
```

Expected behavior:

- `lantern_hoard` with `active` or `trialing`: can create shares.
- `lantern`, free, canceled, past-due, incomplete, or missing subscription: no
  share creation.
- A free invited collaborator can still fully participate in shared gameplay.

Add an equivalent SQL helper for RLS, likely named
`can_share_vignette_encounters(user_id uuid)`.

### One Active Owned Vignette Limit

The database must enforce this with a unique partial index, not only UI checks.
The UI should still preflight and show a useful message:

> Your lantern is already committed to a vignette. End it before stepping into
> another darkness.

Shared vignettes do not count against this limit. A user with one owned active
vignette and several shared active vignettes can switch among all of them, but
cannot create another owned vignette until their owned active vignette is ended.

---

## 7. Frontend Architecture

### Navigation

- Add `TabType.VIGNETTE_ENCOUNTERS`.
- Add a **One-Shots** sidebar group with a **Vignette Encounters** item.
- The tab should be accessible even when no settlement is selected.
- The surface should not depend on `selectedSettlement`, `selectedHunt`,
  `selectedShowdown`, or `selectedSettlementPhase`.
- The surface will depend on new state tracking fields such as
  `selectedVignetteEncounterId` and `selectedVignetteEncounterRole`.

### Suggested Component Structure

```text
components/vignette-encounters/
  vignette-encounters-card.tsx
  vignette-encounter-landing-card.tsx
  vignette-encounter-selection-card.tsx
  active-vignette-encounter-card.tsx
  vignette-monster-card.tsx
  vignette-monster-level-card.tsx
  vignette-survivors-card.tsx
  vignette-survivor-card.tsx
  vignette-survivor-gear-grid.tsx
  vignette-sharing-card.tsx
  vignette-end-dialog.tsx
```

### Suggested DAL Structure

```text
lib/dal/vignette-encounters.ts
schemas/vignette-encounter-input.ts
schemas/vignette-encounter-share-input.ts
schemas/vignette-encounter-end-input.ts
```

DAL functions should include:

- `getVignetteEncounterDefinitions()`
- `getActiveVignetteEncounterForUser()`
- `getSharedVignetteEncountersForUser()`
- `getAccessibleVignetteEncountersForUser()`
- `createVignetteEncounter(input)`
- `updateVignetteEncounter(id, input)`
- `endVignetteEncounter(id)`
- `getVignetteEncounterSharedUsers(id)`
- `addVignetteEncounterSharedUser(id, username)`
- `removeVignetteEncounterSharedUser(id, userId)`

### Realtime

Add vignette instance tables and `vignette_encounter_shared_user` to the
realtime publication.

Client behavior:

- Owner and collaborators see survivor, gear-grid, monster, and turn updates
  without a manual refresh.
- A recipient sees a newly shared vignette in their Vignette Encounters surface
  without reloading.
- Revocation removes access cleanly and returns the user to an empty or shared
  list state.
- If the selected shared vignette is revoked, selection falls back to the user's
  owned active vignette or the next shared vignette.

### User Messaging

Use `sonner` toasts and the app's existing error style. Suggested copy:

- Creation blocked by active limit:
  `End your active vignette encounter before lighting another lantern.`
- Share blocked by plan:
  `Only Lantern Hoard subscription holders may share vignette encounters.`
- Generic failure: use the existing fallback,
  `The darkness swallows your words. Please try again.` This should be sourced
  from `lib/messages.ts`, not copied ad nauseum.

---

## 8. Testing Strategy

### Unit Tests

- Zod schemas for create, update, share, and end inputs.
- Subscription entitlement helper for Lantern Hoard sharing.
- Data mappers from template rows to instance rows.
- Vignette survivor stat and gear-grid helpers.

### Integration Tests

- RLS owner, collaborator, and stranger access for every vignette instance
  table.
- RLS share creation allowed for Lantern Hoard owner and denied for all other
  plans.
- RLS share recipient can update gameplay rows but cannot end or manage shares.
- One active owned vignette unique index blocks a second active instance.
- Realtime publication includes the vignette tables.

### UI Tests

- User with no active vignette can select a definition and start a vignette.
- User with an active vignette sees the active tracker instead of the selection
  list.
- User with an owned active vignette and shared active vignettes can switch
  between them.
- Active limit blocks second creation with expected copy.
- Lantern Hoard owner can invite a collaborator by exact username.
- Free owner sees an upsell or blocked share path.
- Collaborator can edit survivor/turn state but cannot end the vignette.
- Owner ending a vignette clears the active slot without recording outcome or
  settlement consequence state.

---

## 9. Milestone Plan

### Milestone 0 - Design and Schema Foundation

Exit criteria:

- Static mockups and implementation plan are reviewed.
- Data model is accepted, including names for definition, level, template,
  instance, and sharing tables.
- Open questions are resolved enough to write migrations.

### Milestone 1 - Database and RLS

Exit criteria:

- Vignette catalog, template, instance, and sharing migrations land.
- RLS policies cover owner, collaborator, and stranger access.
- One-active-owned-vignette limit is enforced in the database.
- Lantern Hoard share entitlement is enforced in SQL.
- Realtime publication includes the new active-instance tables.
- Integration tests cover the permission matrix.

### Milestone 2 - DAL, Schemas, and Types

Exit criteria:

- TypeScript types and detail shapes are added.
- Zod schemas validate create, update, share, and end inputs.
- DAL helpers can fetch definitions, create instances from templates, update
  state, share, end, and fetch accessible owned/shared active vignettes.
- Unit tests cover schema and mapper behavior.

### Milestone 3 - Vignette Encounter UI

Exit criteria:

- Sidebar navigation exposes Vignette Encounters outside settlement selection.
- Landing, selection, active tracker, monster card, survivor cards, gear-grid
  detail, sharing panel, owned/shared switcher, and end dialog are implemented.
- UI uses existing card, button, dialog, toast, and icon patterns.
- Free and Lantern Hoard sharing states render correctly.

### Milestone 4 - Realtime and Multiplayer Polish

Exit criteria:

- Owner and collaborator browser sessions stay synchronized for gameplay rows.
- Share and revoke events update recipient views live.
- Revoked users exit active vignette state cleanly.
- UI tests cover owner/collaborator interactions.

### Milestone 5 - Active Switching and Edge-Case Polish

Exit criteria:

- Users can switch cleanly between owned and shared active vignettes.
- Shared vignettes never block owned vignette creation.
- Revoked, ended, or deleted shared vignettes clear selection gracefully.
- Empty, owned-only, shared-only, and owned-plus-shared states are covered by UI
  tests.

---

## 10. GitHub Issue Backlog

The following issue structure is intended to be copied into GitHub as parent
issues with child issues or task lists.

### Parent Issue 1 - Add Vignette Encounter Schema, RLS, and Realtime

Labels: `feature`, `database`, `supabase`, `vignette-encounters`

Summary:

Build the database foundation for standalone Vignette Encounters, including
catalog definitions, level setup, survivor templates, active instances, sharing,
RLS, and realtime publication membership.

Child issues:

- **Create vignette catalog and template migrations**
  - Add `vignette_encounter_definition` and `vignette_encounter_level`.
  - Add level junctions for moods, traits, and survivor statuses.
  - Add survivor template and template gear-grid tables.
  - Add constraints for quarry/nemesis source monster integrity.
- **Create vignette instance migrations**
  - Add `vignette_encounter`, `vignette_encounter_monster`,
    `vignette_encounter_survivor`, instance survivor junctions, and
    `vignette_encounter_gear_grid`.
  - Add the one-active-owned-vignette unique partial index.
- **Create vignette sharing migration and entitlement SQL**
  - Add `vignette_encounter_shared_user`.
  - Add SQL helper for Lantern Hoard share creation.
  - Prevent self-sharing and duplicate shares.
- **Add RLS policies for vignette tables**
  - Owner can manage own active instance.
  - Collaborator can read and update gameplay state.
  - Collaborator cannot end, delete, or manage shares.
  - Stranger has no access.
- **Add vignette tables to realtime publication**
  - Include sharing, survivor, gear-grid, monster, and encounter state tables.
  - Add integration tests that verify publication membership.
- **Seed initial vignette encounter fixture data**
  - Add at least one quarry-sourced and one nemesis-sourced definition.
  - Include level moods, traits, statuses, survivor templates, and gear grids.

Acceptance criteria:

- `npm test` targeted integration suites pass for RLS and realtime.
- A user cannot own two active vignette encounters.
- A non-Lantern-Hoard owner cannot insert share rows even if bypassing the UI.

### Parent Issue 2 - Add Vignette DAL, Schemas, and Entitlement Helpers

Labels: `feature`, `typescript`, `schemas`, `vignette-encounters`

Summary:

Add application types, validation schemas, DAL helpers, and subscription helpers
for Vignette Encounter workflows.

Child issues:

- **Add vignette TypeScript detail types**
  - Define definition, level, survivor template, active encounter, shared user,
    selected accessible vignette, and role detail types.
  - Keep instance types separate from settlement survivor/showdown types.
- **Add vignette Zod schemas**
  - Validate create, update, share, and end inputs.
  - Include useful refinement messages for active limit and invalid lifecycle
    transitions where applicable.
- **Add vignette DAL read helpers**
  - Fetch definitions and levels.
  - Fetch active owned vignette.
  - Fetch shared vignette encounters.
  - Fetch accessible owned/shared active vignette summaries for switching.
- **Add vignette DAL mutation helpers**
  - Create active instance from templates.
  - Update encounter, monster, survivor, and gear-grid state.
  - End encounters.
  - Add and remove shared users by exact username.
- **Add Lantern Hoard vignette sharing entitlement helper**
  - Add `canShareVignetteEncounters` in TypeScript.
  - Unit test active/trialing and non-entitled statuses.

Acceptance criteria:

- DAL helpers log errors with clear operation prefixes.
- Schema tests cover valid and invalid payloads.
- Template-to-instance creation is deterministic and covered by unit tests.

### Parent Issue 3 - Build Vignette Encounter Navigation and Landing UI

Labels: `feature`, `frontend`, `navigation`, `vignette-encounters`

Summary:

Expose Vignette Encounters as a top-level app surface outside settlement
selection and implement the landing and selection experience.

Child issues:

- **Add Vignette Encounters tab and sidebar entry**
  - Add `TabType.VIGNETTE_ENCOUNTERS`.
  - Add a **One-Shots** sidebar group.
  - Allow the tab when no settlement is selected.
- **Build vignette landing card**
  - Show active vignette if one exists.
  - Show available definitions if no active owned vignette exists.
  - Show shared vignette entries separately from owned active state.
- **Build owned/shared vignette switcher**
  - Let users select their owned active vignette or any shared active vignette.
  - Preserve role-aware owner/collaborator affordances after switching.
  - Ensure shared vignettes do not block creating a user's own active vignette.
- **Build encounter setup and level selection UI**
  - Display monster source type, level stats, moods, traits, statuses, and
    predefined survivors.
  - Avoid hunt, location, timeline, and settlement phase controls.
- **Add active-limit UX**
  - Disable or block creation when the user owns an active vignette.
  - Show themed toast copy.

Acceptance criteria:

- The surface works with no selected settlement.
- Users can inspect definitions and start one active vignette.
- Users can switch between owned and shared active vignettes.
- Existing settlement, hunt, showdown, and settlement phase navigation still
  behaves as before.

### Parent Issue 4 - Build Active Vignette Showdown UI

Labels: `feature`, `frontend`, `showdown`, `vignette-encounters`

Summary:

Build the active one-shot tracker for monster state, survivor state, turn
progress, gear grids, and owner-only ending.

Child issues:

- **Build active vignette shell**
  - Show monster, survivor, turn, share, and end sections.
  - Keep ending and share management owner-only.
- **Build vignette monster card**
  - Render level stats, current wounds, AI/hit-location counts, moods, traits,
    and notes.
- **Build vignette survivor cards**
  - Render copied survivor sheets and mutable encounter state.
  - Support statuses, disorders, fighting arts, and ability impairments needed
    by the templates.
- **Build vignette gear-grid component**
  - Reuse existing gear-grid display patterns where practical.
  - Persist instance gear-grid changes to vignette tables.
- **Build end-vignette dialog**
  - Ending clears the owner's active slot.
  - Ending does not record victory, defeat, or settlement consequence state.

Acceptance criteria:

- Owner can progress and end a vignette.
- Collaborator can update gameplay state but cannot end it.
- Ending returns the owner to an appropriate landing state.

### Parent Issue 5 - Add Vignette Sharing and Realtime Collaboration

Labels: `feature`, `frontend`, `realtime`, `vignette-encounters`

Summary:

Enable Lantern Hoard owners to share active vignette encounters and keep owner
and collaborator views synchronized.

Child issues:

- **Build vignette sharing panel**
  - Invite by exact username.
  - List collaborators.
  - Remove collaborators.
  - Show Lantern Hoard gating for non-entitled owners.
- **Add vignette realtime subscriptions**
  - Subscribe to active vignette instance rows.
  - Subscribe to share rows for recipient updates.
  - Re-fetch relevant detail state after changes.
- **Handle revocation and stale active state**
  - Remove revoked vignette from collaborator UI.
  - Clear selected shared vignette when access disappears.
  - Fall back to owned active or the next shared active vignette when possible.
  - Show a themed toast or empty state.
- **Add multiplayer UI tests**
  - Owner shares with collaborator.
  - Collaborator sees shared vignette without refresh.
  - Collaborator edit appears for owner.
  - Revocation removes access.

Acceptance criteria:

- Lantern Hoard owner can share active vignettes.
- Non-entitled owners cannot share from UI or direct database insert.
- Gameplay edits synchronize across two browser contexts.

### Parent Issue 6 - Polish Owned and Shared Vignette Switching

Labels: `feature`, `frontend`, `realtime`, `vignette-encounters`

Summary:

Make owned and shared active vignette switching reliable across empty,
owned-only, shared-only, and owned-plus-shared states.

Child issues:

- **Add accessible vignette selection state**
  - Track selected vignette ID and role separately from settlement state.
  - Prefer the user's owned active vignette by default.
  - Fall back cleanly when a selected vignette disappears.
- **Build shared-only and owned-plus-shared empty states**
  - Shared-only users can play shared vignettes and still start their own.
  - Owned-plus-shared users can switch without losing local selection.
- **Add switching UI tests**
  - No active owned or shared vignettes.
  - Owned active only.
  - Shared active only.
  - Owned active plus shared active.
  - Revoked selected shared vignette.

Acceptance criteria:

- Shared active vignettes never count against the one-active-owned-vignette
  limit.
- Role-aware controls update immediately when switching between owned and shared
  vignettes.

---

## 11. Open Questions

1. Should ended vignette instances be retained as neutral history rows, or
   deleted when the owner ends the encounter? This plan supports either, but
   recommends retaining `ENDED` rows only if a future history view is likely.
1. Should an owner be able to transfer ownership of an active vignette, or is
   revoke/reinvite enough? This plan assumes no ownership transfer.
1. How many shared active vignettes should be shown before the switcher needs
   search or filtering? This plan assumes a compact list is enough for launch.
