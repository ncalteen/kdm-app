# Multiplayer Sharing Model

## Status

Approved (target end state for Phases 0–4)

> [!NOTE]
>
> This ADR captures the decision and consequences. The full architectural
> rationale, schema sketches, RLS policy bodies, and edge-case catalog live in
> [`docs/sharing-architecture.md`](../../docs/sharing-architecture.md). This
> document links back to that source of truth rather than restating every
> detail.

## Context

Archivist currently ships **two parallel sharing models** that contradict each
other and produce the wrong polarity of permissions for every table the user
actually cares about ([architecture §3](../../docs/sharing-architecture.md), §4
problems **P1–P12**):

1. **Settlement-scoped sharing** via `settlement_shared_user`. Grants the
   invitee read access to a settlement and its child rows, but **denies**
   collaborator INSERT/UPDATE/DELETE on every settlement-child table — exactly
   the operations a co-player needs to perform turn-by-turn.
1. **Per-catalog sharing** via ~27 `*_shared_user` junction tables (one per
   custom catalog table: `knowledge_shared_user`, `disorder_shared_user`,
   `gear_shared_user`, …). Each grant is per-row, and — perversely — the
   existing `Allow update for shared and custom` policy lets the
   **collaborator** edit the rules text the author wrote.

The user's stated permission intent is the inverse of what RLS does today
(architecture §4 P1):

| Object                    | User wants            | RLS allows today             |
| ------------------------- | --------------------- | ---------------------------- |
| Catalog custom rules text | Author only           | Author **and** collaborators |
| Settlement-child rows     | Owner + collaborators | Owner only                   |
| Settlement metadata       | Owner only            | Owner **and** collaborators  |

The team has already shipped a precedent for the recommended direction:
[`supabase/migrations/20260503000000_gear_grid_settlement_rls.sql`](../../supabase/migrations/20260503000000_gear_grid_settlement_rls.sql)
collapsed `gear_grid` from catalog-style sharing to settlement-scoped sharing
after running into collaborator visibility problems. That migration is the
template for the rest of the schema.

Beyond fixing polarity, there are five additional pressures (architecture §4
P4–P12):

- **P4/P6** — Realtime publication is missing both the catalog tables and
  `settlement_shared_user`. Edits and invitations are invisible until reload.
- **P5** — `settlement` itself is partially writable by collaborators (rename,
  change campaign type) — pinned by an integration test that documents the wrong
  behaviour.
- **P9/P12** — Sharing by username has no search endpoint, and OAuth users
  routinely receive auto-generated usernames they can't rename.
- **P10** — There is no plumbing for "sharing is a paid feature." Any gate has
  to be enforced in RLS, not just UI.
- **P11** — Catalog deletes cascade silently into collaborator settlements
  mid-campaign.

## Challenge

- **No service role.** All current data access is browser-side via the
  publishable anon key. RLS is the only line of defense; switching to
  service-role bypass would require a full DAL rewrite (architecture §5.4). Any
  change must keep RLS as the security ground truth.
- **Realtime depends on RLS for SELECT.** Hiding writes server-side would still
  surface via realtime to clients with SELECT access, so policy correctness must
  precede UX work.
- **Catalog ownership ≠ catalog visibility.** The author owns rules text
  forever, but a co-player needs to _see_ that rules text inside any settlement
  they're a member of — including after the author has left the settlement, as
  long as the row is still attached. This cannot be expressed as a simple
  `user_id = auth.uid()` predicate.
- **Backwards compatibility.** Each phase has to be independently shippable and
  reversible (architecture §10), because Archivist is already in users' hands.
- **Paid gating cannot regress free users.** A free user must remain able to _be
  invited_ and to participate fully in a paid owner's settlement (architecture
  §9.5).

## Goals

1. **Single sharing dimension** the user reasons about: settlement membership.
   Custom-content visibility flows from membership automatically.
1. **Author-owned definitions, settlement-shared instances.** Rules text belongs
   to the author forever; the _placement_ of that rule on a shared settlement is
   what is shared.
1. **Polarity flip:** owner controls metadata; collaborators perform gameplay;
   authors keep their rules text.
1. **Paid sharing** without paywalling collaboration: only the share _creator_
   needs an entitlement.
1. **Every change must be RLS-enforced**, not UI-enforced.

Success looks like:

- Two browsers logged in as different users can edit the same settlement
  (different survivors, different milestones, different hunt state) and see each
  other's edits live within ≤ 300 ms.
- A collaborator opening a settlement can read the rules text of a custom
  knowledge authored by the owner without a per-knowledge share ever having been
  created.
- The catalog `*_shared_user` tables are gone from the schema.
- A free user clicking "Share" hits an upsell modal _and_ RLS denies the INSERT
  if the modal is bypassed.

## Risks

| Risk                                                                                      | Likelihood | Impact | Mitigation                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RLS policy regression locks owners out of their own settlements                           | Low        | High   | Phase-gated rollout (architecture §10); integration test suite under `__tests__/integration/rls/` exercises owner / collaborator / stranger paths per table before merge.   |
| Transitive `is_catalog_row_visible_via_settlement` predicate triggers RLS recursion       | Medium     | Medium | Wrap the lookup in a `SECURITY DEFINER` helper with `set search_path = ''`, mirroring the existing `is_settlement_owner` pattern (architecture §5.2 D3).                    |
| Catalog hard-delete cascades remove rows from collaborator settlements mid-campaign (P11) | High       | High   | `BEFORE DELETE` trigger on every catalog table that blocks deletion while the row is attached to a non-owned settlement (architecture §5.5). Soft-delete is a Phase 2 goal. |
| Realtime subscription on every catalog table balloons traffic                             | Medium     | Medium | Coarse subscription with client-side filter on currently-selected settlement (architecture §8 / D6); revisit if it becomes a bottleneck.                                    |
| OAuth users receive `u_<uuid>` placeholder handles and cannot be invited                  | High       | Medium | Username rename DAL + UI (E0.6 / issue #127) ships before paid-share-by-username. OAuth backfill captures `avatar_url` (E0.7 / issue #128) so identity is recognizable.     |
| Paid-feature gating requires Stripe webhook trust                                         | Medium     | High   | `user_subscription` is read by RLS only; Stripe webhook handler is the _only_ writer; failures fail closed (no entitlement → no share) (architecture §9.6).                 |
| Username enumeration attacks via search endpoint                                          | Medium     | Medium | Resolved D8.9: require **exact match** instead of prefix/substring (architecture §11 Q9 / OWNER ANSWER).                                                                    |

## Decision

Adopt the architecture described in
[`docs/sharing-architecture.md` §5](../../docs/sharing-architecture.md):

> **Collapse to a single sharing dimension — settlement membership — and let
> visibility of related custom catalog rows flow transitively from settlement
> membership.**

The design is captured in seven sub-decisions, all of which have been accepted.
Each cross-references the corresponding `architecture.md` section.

### D1 — Settlement membership is the sole access grant for shared playthroughs

Keep `settlement_shared_user` exactly as it is structurally. Adjust the RLS
posture on settlement-scoped tables: full collaborator CRUD on gameplay data;
owner-only on metadata. (architecture §5.2 D1)

### D2 — Eliminate catalog `*_shared_user` junctions

For each custom catalog table, replace the per-row sharing junction with a
transitive SELECT policy that walks
`settlement_<thing> → settlement_shared_user`:

> _"You can read this custom row if you can read any `settlement_<thing>` row
> that references it OR if you authored it yourself."\_

INSERT remains author-only. UPDATE on rules text becomes author-only (removing
the existing `Allow update for shared and custom` policy). DELETE remains
author-only with an attached-to-non-owned-settlement guard (D8.8 → Phase 2 /
soft-delete; see architecture §5.2 D2 / §5.5).

### D3 — Promote settlement-scoped child tables to full collaborator CRUD

A new `is_settlement_collaborator(settlement uuid)` `SECURITY DEFINER` helper
mirrors `is_settlement_owner`. Every settlement-child table, every
survivor-owned junction (`survivor`, `survivor_disorder`,
`survivor_cursed_gear`, `survivor_fighting_art`, `survivor_secret_fighting_art`,
`survivor_status`, `survivor_ability_impairment`, `gear_grid`), and every
`hunt_*` / `showdown_*` / `settlement_phase*` table replaces its owner-only
write policies with
`is_settlement_owner(...) or is_settlement_collaborator(...)`. (architecture
§5.2 D3)

### D4 — Hybrid owner/collaborator split on `settlement` itself

The architecture document originally proposed two options. The **hybrid
override** is the accepted decision:

- **Owner-only fields:** `settlement_name`, `campaign_type`, `survivor_type`,
  `user_id`, `uses_scouts`, share grants, settlement deletion.
- **Collaborator-writable fields:** `arrival_bonuses`, `current_year`,
  `departing_bonuses`, `notes`, `survival_limit`, `lantern_research`,
  `monster_volumes`.

Implementation is via a column-aware UPDATE policy (or split table) rather than
the simpler "owner-only" Option A. (architecture §5.2 D4 **OVERRIDE** + §11 Q1
owner answer)

### D5 — Add `settlement_shared_user` to the realtime publication

Invitations appear in the recipient's settlement switcher live; revoke removes
the entry silently. The `use-realtime` hook gains a per-user channel listening
for additions/removals where `shared_user_id = auth.uid()`. (architecture §5.2
D5 / §8.1)

### D6 — Add catalog tables to realtime, scoped client-side by settlement

When an author updates the rules of a custom knowledge attached to a shared
settlement, collaborators see the new rules within ≤ 300 ms. Postgres realtime
can't express the join, so the hook receives the raw change and re-fetches if
the row is in the currently-selected settlement's transitive set. (architecture
§5.2 D6 / §8.2)

### D7 — Replace `shared: boolean` with `role: 'owner' | 'collaborator'`

Promote the membership dimension into the type system. `getSettlementForUser`
already returns `shared: boolean`; rename to `role` in `lib/types.ts` and use it
for every ownership-conditional render. An `<OwnerOnly>` component (Phase 0.3)
wraps owner-only UI. (architecture §5.2 D7 / §10 Phase 0)

### D8 — Resolved owner-facing open questions

The 10 open questions in [architecture §11](../../docs/sharing-architecture.md)
have been answered by the owner and are part of the binding decision:

| #     | Question                                                                             | Resolution                                                                  |
| ----- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| D8.1  | Who can edit `settlement_name`, `notes`, `campaign_type`?                            | **Owner only**, plus `uses_scouts` and `survivor_type`.                     |
| D8.2  | Can collaborators delete survivors?                                                  | **Yes.**                                                                    |
| D8.3  | Can collaborators invite further collaborators?                                      | **No.** Owner-only share grants.                                            |
| D8.4  | What happens when the settlement owner cancels their subscription?                   | **Existing shares persist; no new shares can be created.** (§9.3 confirmed) |
| D8.5  | Does paid sharing gate on the owner only, or do invitees need a plan too?            | **Owner only.** Free invitees collaborate fully. (§9.5 confirmed)           |
| D8.6  | Do free users get unlimited custom catalog rows, or a quota?                         | **Unlimited.** (§9.4 option A confirmed)                                    |
| D8.7  | Hard cap on collaborators per settlement?                                            | **No hard cap.**                                                            |
| D8.8  | Should soft-delete / archive replacement for hard delete come in Phase 2 or Phase 4? | **Phase 2** (more correct, accepts the larger Phase 2 scope).               |
| D8.9  | Username search anti-enumeration: prefix match, substring, or exact?                 | **Exact match.** No autocomplete; the recipient's exact handle is required. |
| D8.10 | Notification preferences for "you've been shared with"?                              | **UI bell badge only** for first launch.                                    |

The hybrid override on D4 is the direct consequence of D8.1.

### Permission Matrix (target end state)

Lifted from [architecture §6](../../docs/sharing-architecture.md), with the D4
hybrid override applied. Definitions:

- **Owner** = `settlement.user_id = auth.uid()`
- **Collaborator** = exists `settlement_shared_user` row where
  `shared_user_id = auth.uid()`

| Action                                                                                                                                                                                        | Owner                                                  | Collaborator                                  | Stranger |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------- | -------- |
| **Settlement metadata**                                                                                                                                                                       |                                                        |                                               |          |
| View settlement                                                                                                                                                                               | ✓                                                      | ✓                                             | ✗        |
| Rename, change `campaign_type`, change `survivor_type`, change `uses_scouts` (D8.1 / D4 owner-only)                                                                                           | ✓                                                      | ✗                                             | ✗        |
| Edit gameplay-relevant fields (`survival_limit`, `current_year`, `lantern_research`, `monster_volumes`, `arrival_bonuses`, `departing_bonuses`, `notes`) — D4 hybrid                          | ✓                                                      | ✓                                             | ✗        |
| Share with new user / revoke share (D8.3)                                                                                                                                                     | ✓                                                      | ✗                                             | ✗        |
| Delete settlement                                                                                                                                                                             | ✓                                                      | ✗                                             | ✗        |
| **Settlement child rows** (`settlement_knowledge`, `settlement_milestone`, `settlement_quarry`, …)                                                                                            |                                                        |                                               |          |
| View                                                                                                                                                                                          | ✓                                                      | ✓                                             | ✗        |
| Add / update / delete                                                                                                                                                                         | ✓                                                      | ✓                                             | ✗        |
| **Survivors** (`survivor`)                                                                                                                                                                    |                                                        |                                               |          |
| View                                                                                                                                                                                          | ✓                                                      | ✓                                             | ✗        |
| Create / update / delete (D8.2)                                                                                                                                                               | ✓                                                      | ✓                                             | ✗        |
| **Survivor child rows** (`survivor_disorder`, `survivor_cursed_gear`, `survivor_fighting_art`, `survivor_secret_fighting_art`, `gear_grid`, `survivor_status`, `survivor_ability_impairment`) |                                                        |                                               |          |
| All actions                                                                                                                                                                                   | ✓                                                      | ✓                                             | ✗        |
| **Hunt / Showdown / Settlement Phase**                                                                                                                                                        |                                                        |                                               |          |
| All actions                                                                                                                                                                                   | ✓                                                      | ✓                                             | ✗        |
| **Custom catalog content** (`knowledge`, `disorder`, `gear`, …)                                                                                                                               |                                                        |                                               |          |
| View built-ins                                                                                                                                                                                | ✓                                                      | ✓                                             | ✓        |
| View custom (any author)                                                                                                                                                                      | ✓ if author or attached to one of my settlements       | ✓ if attached to a settlement I'm a member of | ✗        |
| Update rules text                                                                                                                                                                             | ✓ if author                                            | ✗                                             | ✗        |
| Delete custom row                                                                                                                                                                             | ✓ if author and not attached to a non-owned settlement | ✗                                             | ✗        |
| Create new custom row (D8.6 unlimited)                                                                                                                                                        | ✓                                                      | ✓                                             | ✗        |
| **`user_settings`**                                                                                                                                                                           |                                                        |                                               |          |
| All actions on own row                                                                                                                                                                        | ✓                                                      | ✓                                             | ✗        |

> **Owner column nuance for "View custom catalog content"**: includes _other
> people's_ custom content that has been attached to a settlement the user owns.
> Example: if collaborator B (the author) places B's custom gear on A's shared
> settlement, A can read that gear's rules even after B leaves the settlement,
> **as long as the `settlement_gear` attachment row exists**.
>
> `weapon_type`, `philosophy`, and `neurosis` are referenced directly from
> `survivor` columns. The transitive RLS predicate must extend to "any custom
> catalog row referenced by any survivor in any settlement I'm a member of."
> (architecture §6 notes)

## Consequences

### Easier

- **Single mental model for sharing** — the user thinks about settlements;
  everything else follows. UI mirrors RLS.
- **Adding a new custom catalog table** (a future expansion-of-the-game shape)
  requires one transitive SELECT policy and one row in the realtime publication,
  not a new `*_shared_user` junction with its own CRUD surface.
- **Live multiplayer** — once D5/D6 land, two browsers see each other's edits
  without reload, including invitations and rules-text changes.
- **Paid gating** — `user_can_share()` is one helper consulted in one RLS policy
  (`settlement_shared_user.INSERT`). DAL doesn't need to know about
  subscriptions.
- **Onboarding** — `<OwnerOnly>` (E0.3) and the username rename flow (E0.6)
  together remove the "I clicked the button and got a generic error" experience.

### Harder

- **Phase 2 schema demolition** — dropping ~27 catalog `*_shared_user` tables
  and rewriting the `Allow select for shared and custom` /
  `Allow update for shared and custom` policies on each catalog table is the
  largest single migration in the project's history. It must ship in one atomic
  migration per table, with integration tests for each, before the DAL stops
  writing to the old junctions (architecture §10 Phase 2).
- **Cascade safety** — `BEFORE DELETE` triggers on every catalog table add a
  moving part the team has not maintained before. The long-term fix (D8.8 /
  soft-delete) is on the Phase 2 roadmap rather than Phase 4.
- **Presence (Phase 4.1)** — once collaborators can both edit the same
  settlement live, "who's editing what" needs a new realtime channel
  (presence-only, not table-replication). Avatars from D5 (E0.7 / issue #128)
  feed directly into this.
- **Realtime traffic on catalog tables** — adding `knowledge`, `disorder`,
  `gear`, etc. to `supabase_realtime` increases per-client message volume even
  for users on settlements that don't reference the changed row. Mitigation is
  client-side filtering today; server-side filter would require row-level RLS
  publication features.
- **Stripe operational burden** — owner cancel/`past_due` flows need in-app
  banners, webhook idempotency, and customer-portal links. RLS reads
  `user_subscription` directly, so any drift between Stripe and
  `user_subscription` is observable as "I paid but can't share."
- **Hybrid `settlement` UPDATE policy** — D4's hybrid override is more complex
  than the original Option A "owner-only edit." It requires either a
  column-aware policy or a split table. Reviewers must verify that adding a new
  `settlement` column does not silently grant collaborators write access to it.

### Migration order (per architecture §10)

| Phase | Scope                                                                                  | Issues / PRs                                                |
| ----- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 0     | Stabilize: `role`, `<OwnerOnly>`, realtime audit, docs, username + avatar              | E0.1–E0.8 (issues #120, #126, #127, #128, #130, #131, #132) |
| 1     | Settlement-scoped collaborator CRUD; `is_settlement_collaborator`; D4 hybrid; share UI | TBD                                                         |
| 2     | Catalog visibility via transitive membership; drop `*_shared_user`; soft-delete        | TBD                                                         |
| 3     | Paid-feature gating; Stripe; `user_can_share()`                                        | TBD                                                         |
| 4     | Polish: presence, "updated by" toasts, audit log, notifications                        | TBD                                                         |

## References

- [`docs/sharing-architecture.md`](../../docs/sharing-architecture.md) — Full
  source of truth: §3 current state, §4 problems P1–P12, §5 recommended
  architecture (D1–D7), §6 permission matrix, §8 realtime, §9 paid gating, §10
  phased plan, §11 owner answers (D8).
- [`docs/template-adr.md`](../template-adr.md) — ADR template this document
  follows.
- [`supabase/migrations/20260503000000_gear_grid_settlement_rls.sql`](../../supabase/migrations/20260503000000_gear_grid_settlement_rls.sql)
  — Precedent migration that collapsed `gear_grid` to settlement-scoped RLS; the
  template for Phase 1 / Phase 2.
- [`supabase/migrations/20260324185335_fix_shared_user_rls_recursion.sql`](../../supabase/migrations/20260324185335_fix_shared_user_rls_recursion.sql)
  — `is_settlement_owner` pattern that `is_settlement_collaborator` mirrors.
- Epic E0 — Phase 0: Foundation & Membership Model (issue #120) and its resolved
  sub-issues:
  - E0.3 — `<OwnerOnly>` (#130, PR #187)
  - E0.4 — Realtime publication audit (#126, PR #188)
  - E0.5 — RLS contradiction documentation (#131, PR #190)
  - E0.6 — Username rename DAL + UI (#127, PR #191)
  - E0.7 — `avatar_url` + OAuth backfill + `<UserAvatar>` (#128, PR #192)
  - E0.8 — This ADR (#132)
