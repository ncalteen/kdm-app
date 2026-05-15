# Multiplayer & Settlement Sharing Architecture

## Table of Contents

1. [Goals & Non-Goals](#1-goals--non-goals)
1. [What "sharing" means in KDM](#2-what-sharing-means-in-kdm)
1. [Current State of the Codebase](#3-current-state-of-the-codebase)
1. [Problems & Inconsistencies in the Current Model](#4-problems--inconsistencies-in-the-current-model)
1. [Recommended Architecture](#5-recommended-architecture)
1. [Permission Matrix](#6-permission-matrix)
1. [User Experience Recommendations](#7-user-experience-recommendations)
1. [Real-Time Live Editing](#8-real-time-live-editing)
1. [Paid-Feature Gating](#9-paid-feature-gating)
1. [Action Plan](#10-action-plan-phased)
1. [Open Questions](#11-open-questions)
1. [Appendix A — Inventory of Existing Tables](#appendix-a--inventory-of-existing-tables)
1. [Appendix B — Edge Cases Catalog](#appendix-b--edge-cases-catalog)

---

## 1. Goals & Non-Goals

### Stated User Intent

> _"A user should be able to say 'I want to share settlement 1234 with a user by
> their username. Regardless of what is associated with that settlement and who
> owns it, the user I shared it with should be able to see and interact with
> that content. If it is not something they own directly, they shouldn't be able
> to modify it (e.g. update rules text). Only the actual owner of an object
> should be able to do that. However, if multiple players have access to a
> settlement, they should be able to do things like modify survivors in that
> settlement, add knowledges, add disorders, etc.'"_

### Goals

- **G1.** A settlement owner can invite another user (by username) to
  collaborate on that settlement.
- **G2.** Both owner and collaborator can edit the settlement, its survivors,
  hunts, showdowns, settlement-phase progress, and gear grids
  **simultaneously**.
- **G3.** A change made by one player is visible to the other within a few
  hundred milliseconds.
- **G4.** Custom content (knowledges, disorders, gear, etc.) attached to a
  shared settlement is **visible** to the collaborator regardless of who
  authored it.
- **G5.** Custom content **rules text / definitions** can only be modified by
  the original creator. Collaborators may view them only.
- **G6.** When the owner unshares a settlement (or removes a custom item from
  it), collaborators lose access cleanly.
- **G7.** Sharing is gated behind a paid plan; the free tier remains fully
  usable for solo play.
- **G8.** Sharing is **safe** — usernames are not enumerable, share invites
  cannot be forged, and revocation is reliable.

### Non-Goals

- **NG1.** Granular per-table permissions (e.g. "can edit hunts but not
  survivors"). Settlement membership is binary.
- **NG2.** Public/published settlements (read-only links, anonymous viewers).
- **NG3.** Transferring ownership of a settlement.
- **NG4.** Importing a copy of someone else's settlement into your own account.
  (This is the "fork" model and is explicitly different from "share".)
- **NG5.** Mobile push notifications when a settlement is shared with you.
  (Future? Maybe. Not in scope for the initial implementation.)
- **NG6.** Editing the rules text of catalog (custom) content concurrently.
  Custom content is single-author by design.

---

## 2. What "Sharing" Means in KDM

Kingdom Death: Monster is played by **one campaign group** at a time. The common
multiplayer expectations for this app are:

| Real-world scenario                                                                                              | App behavior                                                                                           |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Two friends playing together at the same table, taking turns running the app                                     | Both should see live changes, no refreshing required                                                   |
| One player runs a remote game over voice chat for two others                                                     | All three should see the same settlement state                                                         |
| Two friends want to consult a custom gear card the third created last week                                       | All three should be able to **see** that card on the settlement; only the author can rewrite its rules |
| One person owns the campaign; they don't want a friend to delete a survivor when the friend is no longer playing | Settlement owner retains the right to revoke access at any time                                        |
| The author of a custom knowledge wants to keep using it across their own settlements after a co-op campaign ends | The custom item belongs to the author, not the settlement                                              |

This means **sharing has two distinct dimensions**:

1. **Settlement sharing** — granting another user the right to participate in a
   particular playthrough. This is a _relationship between users on a campaign
   instance_.
1. **Catalog content sharing** — granting another user the right to use a custom
   card/rule you authored across any settlement they own.

The first is the **primary** product feature to be addressed in this document.
The second is a **derived consequence** that we should consider thoroughly in
the design of the sharing model to ensure that it can be supported at a later
date.

---

## 3. Current State of the Codebase

### Frontend Reality

This section reflects the in-tree implementation as of the migrations through
`20260525000000_catalog_sub_row_realtime_publication.sql`:

- **Owner-only sharing UI exists.** The
  [`components/settlement/sharing/collaborators-panel.tsx`](../components/settlement/sharing/collaborators-panel.tsx)
  surface lets a settlement owner add, list, and remove collaborators by
  username. The DAL helpers `getSettlementSharedUsers`,
  `addSettlementSharedUsers`, and `removeSettlementSharedUsers` are now consumed
  by that UI in addition to the integration tests. Catalog-level `*_shared_user`
  UI is intentionally absent because the transitive-visibility migrations
  (`20260512000000` … `20260524000000`) make it redundant; only
  `settlement_shared_user` is user-managed.
- **Username lookup is implemented but rate-limited and exact-match only.**
  [`lookupUserByUsername`](../lib/dal/user.ts) (in `lib/dal/user.ts`) is the
  invariant used by the sharing UI's recipient picker. It enforces case
  preservation, exact-match semantics, and the no-enumeration contract from §4
  P9. There is still no fuzzy search and no listing of all users.
- The settlement switcher (`components/menu/settlement-switcher.tsx`) fetches
  both owned and shared settlements via
  [`getSettlementForUser`](../lib/dal/user.ts). The `shared` flag is now used by
  the renderer to badge shared settlements; destructive actions in downstream UI
  surfaces check `settlement.shared` to hide owner-only controls.
- No client-side gating exists for **every** RLS rule yet — some surfaces still
  rely on the database to block disallowed mutations and surface a "darkness
  swallows your words" toast. Phase 2 UX work continues to push client checks
  for the common deny paths.
- `hooks/use-realtime.tsx` **does** subscribe to `settlement_shared_user` via
  `useUserRealtimeSubscriptions`, listening for inserts/deletes filtered by
  `shared_user_id`. Recipients can therefore receive share membership changes in
  realtime, even though there is still no dedicated sharing UI for managing
  invites or surfacing richer collaboration state.
- There is **no payment / billing / entitlement infrastructure** anywhere in the
  codebase. No Stripe, no subscription tables, no plan / tier / paywall
  references. Sharing is currently free for everyone with database access.
  Initially, the intent will be to charge a nominal fee to users who share
  settlements, likely on a per-share basis or as part of a low-cost subscription
  tier, to offset the cost of supporting multi-user collaboration in the
  backend. This will need to be designed and implemented before sharing can be
  monetized in a production environment. For now, assume that a user can share
  their settlement(s) with others if they subscribe for $1-$5 USD per month.

### Custom Content + Settlement Junction Reality

The current settlement creation flow (`lib/dal/settlement.ts: createSettlement`)
attaches **only built-in** catalog rows — it never attaches a user's custom
knowledges/disorders/gear/etc. to a fresh settlement. Custom rows get added
later through component flows (e.g. `addKnowledge` → `addSettlementKnowledges`),
all of which require **settlement ownership** at the RLS layer. This is
partially OK. If a user owns a settlement, they should be able to attach their
custom content to it, but if a settlement is shared, the current RLS rules
prevent collaborators from doing the same even though the user experience would
suggest that they should be able to contribute custom content to a shared
settlement.

Consequence: today, even though the backend has `*_shared_user` junctions for
catalog content, **shared collaborators cannot in practice add custom content to
a shared settlement**. The custom-content sharing model is essentially unused.
This will need to be addressed so that collaborators on a shared settlement can
contribute their own custom content in a way that respects the RLS rules and
propagates appropriately to other users with access to the settlement. It should
also cleanly support shared users adding/removing built-in content.

---

## 4. Problems & Inconsistencies in the Current Model

These are the items that make the current implementation hard to reason about
and that the recommendation in §5 aims to resolve.

### P1 — The Two Sharing Models Contradict the Permission Intent

> \_"Only the actual owner of an object should be able to do edit rules text.
> However, if multiple players have access to a settlement, they should be able
> to do things like modify survivors in that settlement, add knowledges, add
> disorders, etc."\_

| Object                                                | What user wants                            | What RLS allows today                                                                |
| ----------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| Catalog custom rules text (e.g. `knowledge.rules`)    | **Owner only**                             | Owner **and shared collaborators** can update (`Allow update for shared and custom`) |
| Settlement child tables (e.g. `settlement_knowledge`) | **Owner and shared collaborators**         | Owner only                                                                           |
| Settlement-scoped survivor edits                      | **Owner and shared collaborators**         | Owner only                                                                           |
| Settlement metadata (`settlement_name`, `notes`)      | Owner only? collaborators? (open question) | Both can update                                                                      |

The polarity is **inverted** for nearly every table relative to the user's
stated goals.

### P2 — Catalog `*_shared_user` is a Per-Item Burden

If user A has 30 custom knowledges and shares a settlement with user B, A must
also separately share each of the 30 knowledges, otherwise B can't even **read**
the knowledge rules text on the shared settlement. This contradicts goal G4. The
current design effectively requires the share UI to mirror the catalog graph,
multiplying the number of share rows by ~22 categories. This is **not** an ideal
user experience and creates a significant maintenance burden on the backend, as
every new custom catalog item must be explicitly shared with every collaborator
on every settlement it is attached to.

### P3 — Per-Resource Sharing has Lifecycle Pitfalls

The user explicitly raised this:

> _"If a user A adds one of their custom knowledges to a settlement that is
> shared with user B, then removes it, should user B still have access to that
> knowledge object?"_

In the current per-resource model the answer is "depends": yes if A also
explicitly shared the knowledge with B (orphaned access), no if A only gave B
access via the settlement attachment (broken UX — the rules text disappears
mid-campaign). Either way the answer is wrong.

### P4 — Catalog Tables aren't in Realtime

`supabase_realtime` does not include `knowledge`, `disorder`, `gear`, etc. If
user A edits the rules text of a custom knowledge that is currently displayed in
user B's view, B doesn't see the change until next reload. This needs to be
corrected.

### P5 — `settlement` Itself is Partially Sharable for Write

The pinned test (`__tests__/integration/rls/settlement-shared.test.ts:78-105`)
documents that a guest user can rename a shared settlement. The DAL historically
doesn't expect this (the `getSettlement` flow distinguishes owned vs. shared
with `shared: boolean`, implying read-only intent). Collaborators **should not
be able to edit `settlement_name`, `campaign_type`, or `uses_scouts`.**

### P6 — `settlement_shared_user` Table not in Realtime Publication

Adding/removing collaborators is invisible until the recipient reloads. This
turns "share now" into a manual "tell your friend to refresh".

### P7 — `gear_grid` Migration is the Desired Direction

The migration history shows the team already tried catalog-style sharing for
`gear_grid`, hit collaborator visibility problems, and migrated to a pure
settlement-scoped model on 2026-05-03
(`20260503000000_gear_grid_settlement_rls.sql`). That migration is the
**template for what should happen across the board**: collapse to a single
sharing dimension (the settlement) and let visibility of related catalog rows
flow from settlement membership.

### P8 — RLS-Only Authorization with no Client-Side Gating

DALs trust RLS for everything; the UI doesn't pre-check ownership. This is
generally fine, but it means:

- A collaborator clicking "Delete settlement" gets a generic error toast.
- A collaborator opening the custom-rules edit dialog can type freely and only
  learn it failed when they hit Save.
- Any future "add survivor" flow performed by a collaborator would silently fail
  until the collaborator's mutation is wrapped in an RLS-aware check.

### P9 — Username Search is Missing

`getSettlementSharedUsers` joins `user_settings(username)` for **already**
shared users. There is no `searchUsers(byUsername)` function. The
`check_username_available` RPC is for sign-up only and returns a boolean; it
cannot be used for autocomplete. For security and privacy reasons, any username
search exposed to the client must be carefully rate-limited and sanitized so
that users cannot enumerate the full set of registered usernames. Users should
not be able to share unless they can resolve the recipient's username via a
safe, rate-limited search endpoint rather than by guessing or enumerating all
usernames.

### P10 — No Paid-Feature Plumbing Exists

A grep across the codebase for `subscription`, `billing`, `stripe`, `premium`,
`pro`, `paywall`, `entitlement`, `plan`, `tier` finds zero hits. We're at a
clean starting point — but every recommendation below has to plan for a gating
layer that doesn't yet exist. Any gating logic for paid sharing will need to be
plumbed into the DAL and enforced at the RLS layer so that free users cannot
create shares while still allowing them to participate in settlements shared
with them by paid users.

### P11 — Catalog Deletion Cascades Aren't Thought Through

If user A deletes a custom knowledge that is attached (via
`settlement_knowledge`) to user B's shared settlement, the cascade is
`on delete cascade`: the row vanishes from B's settlement silently. There's no
"you cannot delete; in use" guard. This is a foot-gun for both authors and
collaborators. There needs to be a guard in place so that authors cannot delete
catalog rows that are actively attached to a shared settlement, or at minimum
present a confirmation dialog that clearly communicates the impact of the
deletion on collaborators.

### P12 — Sign-Up / OAuth Username Collision Quietly Normalizes

`handle_new_oauth_user` (`20260427000000_handle_new_oauth_user.sql`) generates
usernames from provider metadata and falls back to `u_<uuid>` after 25 attempts.
In a paid-share-by-username world, OAuth users may end up with usernames they
don't recognize and can't easily change (no rename DAL exists, just
`addUserSettings`). They'll need a "set your username" step before they can be
invited or invite others.

---

## 5. Recommended Architecture

### 5.1 Guiding Principles

1. **One sharing dimension.** Settlement membership is the only access grant the
   user thinks about. Custom-content visibility flows from settlement membership
   automatically.
1. **Author-owned definitions, settlement-shared instances.** Rules text belongs
   to the author forever; the **placement** of that rule on a shared settlement
   is what gets shared.
1. **RLS is the boundary; UI is the experience.** RLS stays the security ground
   truth. The UI must mirror RLS so users understand what they can and cannot
   do.
1. **Sharing is paid; viewing-when-shared is free.** A free user can be invited
   and participate in a shared settlement. A free user cannot _create_ shares.
   (See §9 for nuance.)

### 5.2 Schema Direction

#### Decision 1 — Make Settlement Membership the **Sole** Access Grant for Shared Playthroughs

Keep `settlement_shared_user` exactly as it is structurally. Adjust the **RLS
posture** on settlement-scoped tables (full CRUD for collaborators on gameplay
data; metadata-only for the settlement owner — see §6).

#### Decision 2 — Eliminate Catalog `*_shared_user` Junctions

For each catalog table, sharing should now flow **transitively** through
settlement membership:

> _"You can read this custom knowledge if you can read any
> `settlement_knowledge` row that references it OR if you authored it
> yourself."_

The cleanest implementation:

- **Drop** the `*_shared_user` table per catalog table. (Or keep them around as
  no-ops in a deprecation phase.)
- Replace the catalog table's "shared" SELECT/UPDATE policies with a single
  "transitive" SELECT policy:

```sql
-- Example for `knowledge`:
create policy "Allow select for collaborator via settlement" on knowledge for
select to authenticated using (
  custom and exists (
    select 1
    from settlement_knowledge sk
    join settlement_shared_user su on su.settlement_id = sk.settlement_id
    where sk.knowledge_id = knowledge.id
      and su.shared_user_id = auth.uid()
  )
);
```

- Drop "Allow update for shared and custom" on every catalog table. Rules text
  becomes author-only.
- INSERT remains author-only (`custom and user_id = auth.uid()`).
- DELETE remains author-only **but gets a guard** (see §5.5) preventing deletion
  while attached to any settlement the author doesn't own.

**Symmetric policy for survivor-owned junction targets**
(`survivor.weapon_type_id`, `survivor.knowledge_1_id`, `survivor.philosophy_id`,
`survivor.neurosis_id`, etc.): same transitive read access via the settlement.

This is a one-time RLS rewrite per catalog table, not a per-row data migration.
The existing custom rows already have the correct `user_id`.

#### Decision 3 — Promote Settlement-Scoped Child Tables to Full Collaborator CRUD

Today `settlement_knowledge` etc. require ownership for INSERT/UPDATE/DELETE.
Replace those policies with:

```sql
-- Replaces "Allow insert/update/delete for owner":
create policy "Allow write for owner or collaborator" on settlement_knowledge for
all to authenticated using (
  exists (select 1 from settlement s
          where s.id = settlement_id
            and (s.user_id = auth.uid()
                 or exists (select 1 from settlement_shared_user su
                            where su.settlement_id = s.id
                              and su.shared_user_id = auth.uid()))))
with check (... same predicate ...);
```

Apply the equivalent transformation to all settlement-child tables and to all
survivor-owned junctions (`survivor`, `survivor_disorder`,
`survivor_cursed_gear`, `survivor_fighting_art`, `survivor_secret_fighting_art`,
`survivor_status`, `survivor_ability_impairment`, `gear_grid`, `hunt*`,
`showdown*`, `settlement_phase*`).

A SECURITY DEFINER helper avoids RLS recursion, mirroring the existing
`is_settlement_owner` pattern from
`20260324185335_fix_shared_user_rls_recursion.sql`:

```sql
create or replace function is_settlement_collaborator(target_settlement uuid)
returns boolean language sql stable security definer
set search_path = '' as $$
  select exists (
    select 1 from public.settlement_shared_user
     where settlement_id = target_settlement
       and shared_user_id = auth.uid())
$$;
```

Then policies become a clean disjunction:
`is_settlement_owner(...) or is_settlement_collaborator(...)`.

#### Decision 4 — Tighten `settlement` Itself to "Owner-Only Edit" Except for Collaborator-Relevant Fields

Currently shared users can rename and reconfigure the settlement. Two options:

- **Option A (recommended):** Restrict UPDATE on `settlement` to owner-only.
  Settlement metadata (name, campaign type, uses scouts) is the owner's
  prerogative. The integration test that pins the current behaviour
  (`__tests__/integration/rls/settlement-shared.test.ts:78-105`) gets inverted
  to assert `error.code` is RLS denial.
- **Option B:** Allow collaborators to update **gameplay-relevant** fields
  (`survival_limit`, `current_year`, `lantern_research`, `monster_volumes`,
  `arrival_bonuses`, `departing_bonuses`) but not
  `settlement_name`/`campaign_type`/`user_id`/`uses_scouts`. This requires a
  row-level trigger or split table.

Recommendation: **Option A** for simplicity. Use a "Settlement settings" panel
guarded as owner-only in the UI. Live gameplay touches happen on
settlement-child tables (timeline year entries, milestone progress,
quarry/nemesis levels), which collaborators _can_ edit.

OVERRIDE: Combine Option A and Option B so that the owner retains control over
`settlement_name`/`campaign_type`/`survivor_type`/`user_id`/`uses_scouts` while
collaborators can still update gameplay-relevant fields (`arrival_bonuses`,
`current_year`, `departing_bonuses`, `notes`, `survival_limit`,
`lantern_research`, `monster_volumes`) without requiring a split table or
row-level trigger.

#### Decision 5 — Add `settlement_shared_user` to the Realtime Publication

So that an invitation appears in the recipient's settlement switcher without a
reload, and revoke happens silently for the now-removed user.

```sql
alter publication supabase_realtime add table settlement_shared_user;
```

Pair with an extension to `hooks/use-realtime.tsx` that listens at the **user
level** (not settlement level) for additions to/removals from
`settlement_shared_user` where `shared_user_id = auth.uid()`. (See §8.)

#### Decision 6 — Add Catalog Tables to Realtime, Scoped by Settlement

So that when an author updates the rules of a knowledge attached to a shared
settlement, collaborators see the new rules text live.

```sql
alter publication supabase_realtime add table knowledge;
-- ... and for each catalog table ...
```

Realtime row-level filtering on catalog tables is best done client-side: the
realtime hook receives the change, looks up whether the row is relevant to the
currently selected settlement, then re-fetches if so. (Postgres doesn't expose a
join filter to the realtime channel.)

#### Decision 7 — Introduce Explicit `settlement_member` Semantics in Code

Replace `shared: boolean` with a richer model in domain types:

```ts
type SettlementMembership =
  | { role: 'owner'; user_id: string }
  | { role: 'collaborator'; user_id: string; shared_at: string }
```

`getSettlementForUser` already returns `shared: boolean`; promote that to
`role: 'owner' | 'collaborator'` in `lib/types.ts`. UI uses `role` for
ownership-conditional rendering.

### 5.3 Why not just Snapshot Custom Items at Attach Time?

A reasonable alternative is to **copy** the custom row's data into the
settlement junction when attaching, so that the settlement carries its own
frozen copy of the rules text. This avoids author-update propagation entirely.

**Rejected** because:

- It double-stores `name`/`rules` for every settlement-resource pair, inflating
  the schema.
- Authors expect "fix a typo in my custom rule" to propagate to active
  campaigns. Live propagation is the better default in a multiplayer context.
- It interacts poorly with future features (versioning, rule update
  notifications).

If we ever need "freeze on archive" (e.g. an end-of-campaign export), we add a
one-off snapshot step at archive time, not on attach.

### 5.4 Why not Server Actions / Bypassing RLS?

Some teams move multi-table writes into Postgres functions or Next.js server
actions and use a service role to bypass RLS.

**Rejected** because:

- All current DAL code is browser-side and uses the publishable anon key. RLS is
  the only line of defense; switching to service-role bypass would require a
  full DAL rewrite.
- Realtime depends on RLS for SELECT; trying to hide writes server-side would
  still surface via realtime to clients that have SELECT access.
- The closer the access logic is to Postgres, the smaller the blast radius if a
  UI bug forgets to check ownership.

### 5.5 Custom Content Lifecycle Rules

> _"If a user A adds one of their custom knowledges to a settlement that is
> shared with user B, then removes it, should user B still have access to that
> knowledge object?"_

**Answer:** No. Access is bound to the settlement attachment, not to a separate
share. When A removes the knowledge from the settlement, the
`settlement_knowledge` row is deleted, the transitive RLS predicate stops being
satisfied, and B can no longer SELECT that knowledge. This is the correct,
predictable behaviour.

**But** this introduces P11 (cascade foot-gun): if A deletes the custom
knowledge entirely while it's attached to B's settlement, the cascade removes
the `settlement_knowledge` row on B's settlement mid-campaign, and any survivor
that had `knowledge_1_id` pointing to it loses the reference (FK is
`on delete set null`).

Mitigation: a `BEFORE DELETE` trigger on each catalog table that checks for
attachment to any settlement not owned by the author and raises an error with a
friendly message. Owners can still delete a custom item on settlements they
personally own (cascade is fine there). Authors who hit the trigger learn "this
knowledge is in use in 2 collaborator settlements; remove it from those
settlements first or transfer ownership."

(Stretch goal: a "soft delete" / archive flag instead of hard delete, which
sidesteps the issue and matches the lantern/darkness theme — _"Some knowledge
cannot truly be unlearned, only forgotten."_)

---

## 6. Permission Matrix

### Owner = `settlement.user_id = auth.uid()`

### Collaborator = there exists a `settlement_shared_user` row where `shared_user_id = auth.uid()`

| Action                                                                                                                                                                                        | Owner                                                  | Collaborator                                  | Stranger |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------- | -------- |
| **Settlement metadata**                                                                                                                                                                       |                                                        |                                               |          |
| View settlement                                                                                                                                                                               | ✓                                                      | ✓                                             | ✗        |
| Rename, change campaign type, change survivor type, change uses scouts                                                                                                                        | ✓                                                      | ✗                                             | ✗        |
| Share with new user / revoke share                                                                                                                                                            | ✓                                                      | ✗                                             | ✗        |
| Delete settlement                                                                                                                                                                             | ✓                                                      | ✗                                             | ✗        |
| **Settlement child rows** (`settlement_knowledge`, `settlement_milestone`, `settlement_quarry`, etc.)                                                                                         |                                                        |                                               |          |
| View                                                                                                                                                                                          | ✓                                                      | ✓                                             | ✗        |
| Add / update / delete                                                                                                                                                                         | ✓                                                      | ✓                                             | ✗        |
| **Survivors** (`survivor`)                                                                                                                                                                    |                                                        |                                               |          |
| View                                                                                                                                                                                          | ✓                                                      | ✓                                             | ✗        |
| Create / update / delete                                                                                                                                                                      | ✓                                                      | ✓                                             | ✗        |
| **Survivor child rows** (`survivor_disorder`, `survivor_cursed_gear`, `survivor_fighting_art`, `survivor_secret_fighting_art`, `gear_grid`, `survivor_status`, `survivor_ability_impairment`) |                                                        |                                               |          |
| All actions                                                                                                                                                                                   | ✓                                                      | ✓                                             | ✗        |
| **Hunt / Showdown / Settlement Phase**                                                                                                                                                        |                                                        |                                               |          |
| All actions                                                                                                                                                                                   | ✓                                                      | ✓                                             | ✗        |
| **Custom catalog content (the row in `knowledge`/`disorder`/`gear` etc.)**                                                                                                                    |                                                        |                                               |          |
| View built-ins                                                                                                                                                                                | ✓                                                      | ✓                                             | ✓        |
| View custom (where author is **anyone**)                                                                                                                                                      | ✓ if author / attached to any of my settlements        | ✓ if attached to a settlement I'm a member of | ✗        |
| Update rules text                                                                                                                                                                             | ✓ if author                                            | ✗                                             | ✗        |
| Delete                                                                                                                                                                                        | ✓ if author and not attached to a non-owned settlement | ✗                                             | ✗        |
| Create new custom                                                                                                                                                                             | ✓                                                      | ✓ (paid? See §9)                              | ✗        |
| **`user_settings`**                                                                                                                                                                           |                                                        |                                               |          |
| All actions on own row                                                                                                                                                                        | ✓                                                      | ✓                                             | ✗        |

### Notes on the Matrix

- The owner column for "View custom catalog content" includes _other people's_
  custom content that's been attached to a settlement the user owns. Example: if
  collaborator B (the author) puts B's custom gear on A's shared settlement, A
  can read that gear's rules even after B leaves the settlement, **as long as
  the `settlement_gear` attachment row exists**.
- `weapon_type`, `philosophy`, `neurosis` are referenced directly from
  `survivor` columns. The transitive RLS predicate must extend to "any custom
  catalog row referenced by any survivor in any settlement I'm a member of."
  This is covered by an additional RLS clause on each catalog table.
- "Stranger" never has access to anything custom. Built-in rows remain
  global-readable to authenticated users (so settlement creation can reference
  them).

---

## 7. User Experience Recommendations

### 7.1 Sharing UI Surface

Add a **Settlement → Settings → Collaborators** panel (only visible when
`role === 'owner'`):

```text
┌─────────────────────────────────────────────────────┐
│ Light another lantern                               │
│ Invite a survivor to share this settlement.         │
│                                                     │
│ ┌─────────────────────────┐                         │
│ │ Username…              ▾│  [ Invite ]             │
│ └─────────────────────────┘                         │
│                                                     │
│ Lanterns shared with:                               │
│ • @ashen.veil       Removed: 2 days ago     [×]     │
│ • @stone-faced      Joined: 14 days ago     [×]     │
└─────────────────────────────────────────────────────┘
```

Implementation:

- Username field has **NO** typeahead. Users must type the exact username of the
  survivor they wish to invite.
- Inviting calls `addSettlementSharedUsers` which already resolves to a user_id.
  Apparent latency: instant, with optimistic UI update.
- Revoke calls `removeSettlementSharedUsers`.

Related:

- Include the ability for users to set their own username in their profile so
  that they can be reliably invited by others via their exact username.

### 7.2 Settlement Switcher / "Shared with Me" Indicator

Render a small lantern badge ("shared by @ashen.veil") next to settlements where
`role === 'collaborator'`. Theme idea:

> _"You see another's lantern flickering in the dark."_

This addresses P3 in §4.

### 7.3 Owner-Only UI Gating

Wrap owner-only controls in a `<OwnerOnly>` component that reads
`selectedSettlement.role` from `LocalContext`. If collaborator, render either
nothing or a tooltip explaining "Only the settlement's founder may do this."
Examples of owner-only UI:

- Settlement rename / campaign type / settings tab
- "Delete settlement" button
- "Share / collaborators" panel
- Custom catalog item **rules text** edit fields (only the author can modify)

### 7.4 "Authored by" Chip on Custom Content

Every custom card in the UI shows a small `By @username` chip in the corner. For
your own custom items it reads `By you`. This makes it obvious why a
collaborator can _see but not edit_ the rules text on a shared settlement.

### 7.5 Toast Messages

Use `toast.error` / `toast.success` per the user-messaging convention in
`.github/copilot-instructions.md`. Suggested phrasings:

| Event                              | Message                                                                |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Settlement shared successfully     | `"A new lantern joins the watch."`                                     |
| Share already exists               | `"That survivor already keeps watch with you."`                        |
| Share revoked                      | `"The lantern dims. They walk in darkness once more."`                 |
| Cannot edit because not owner      | `"This is not yours to mend. Speak to the keeper of this settlement."` |
| Cannot delete custom item — in use | `"You cannot unmake what others rely upon."`                           |
| Generic failure                    | `"The darkness swallows your words. Please try again."`                |
| Paywall encountered                | `"This lantern needs more oil. Restock to continue."`                  |

### 7.6 Conflict Resolution & Presence

For live-edit (§8), some lightweight presence indicators help keep two players
from stepping on each other:

- Small avatar dots on the survivor card showing _"@ashen.veil is editing this"_
  when the other user has the editor open.
- Last-write-wins for individual fields, since most fields are either numeric or
  short text. KDM editing happens in short focused bursts (incrementing courage
  by 1, marking a milestone), so conflicts are rare.
- For free-form `notes` fields: show a "(updated by @ashen.veil)" toast when the
  local copy is overwritten, but don't try to merge.

CRDT-style merging is **out of scope**. The volume of simultaneous edits in a
typical KDM session is low; LWW is fine.

---

## 8. Real-Time Live Editing

### 8.1 What's Already in Place

- `hooks/use-realtime.tsx` subscribes to a `settlement-{id}` channel filtered by
  `settlement_id` for most settlement-child tables, and unfiltered (relying on
  RLS) for survivor-owned junctions.
- 300ms debounce per domain (settlement, hunt, showdown, settlement phase,
  survivor) to batch rapid changes into a single re-fetch.
- `LocalContext` holds `selectedSettlement: SettlementDetail` etc., refetched on
  each domain change.
- Optimistic mutations via `hooks/use-optimistic-mutation.tsx` (apply locally →
  persist → reconcile or rollback).

### 8.2 What Needs to Change

#### 8.2.1 Add `settlement_shared_user` to Realtime + a User-Level Subscription

A second channel (`user-{uid}`) listens for inserts/deletes on
`settlement_shared_user` where `shared_user_id = my_uid`. Trigger a re-fetch of
`getSettlementForUser`. Without this, joining a shared settlement still requires
a manual reload.

#### 8.2.2 Subscribe to Catalog Tables Once a Settlement is Selected

When the active settlement contains a custom row from another author and that
author edits the row's rules text, the collaborator must see the change. Two
approaches:

- **A - Per-id subscription:** at settlement load time, collect all custom
  catalog row IDs referenced by the settlement and subscribe to each on a
  per-table basis with `id=in.(...)` filters. Requires resubscribing whenever
  attachments change. ~22 tables × N rows = potentially many subscriptions.

- **B - Coarse table-level subscription with client-side filter:** subscribe to
  each catalog table with no filter; on any change, the hook checks whether the
  changed row's id is referenced by the current settlement state and triggers a
  domain refetch only if so. Approximation simpler in code; pays a small
  bandwidth cost (events for irrelevant rows are received and discarded).

Recommendation: **B**, with the understanding that it works only because
rules-text changes are rare relative to gameplay edits.

#### 8.2.3 Confirm Publication Membership of Newer Junctions

The migrations after `20260327000000` have introduced new tables
(`survivor_status`, `survivor_ability_impairment`, `hunt_monster_trait_mood`,
`showdown_monster_trait_mood`, `armor_set_slots`, etc.). Some are added to the
publication piecemeal (e.g. `gear_grid` was). Audit and ensure every
settlement-scoped table is in `supabase_realtime` before launching multiplayer.

#### 8.2.4 Optimistic Mutations Need RLS-Aware Error Handling

When a collaborator tries to do something they can't, the DAL today throws a
generic Postgres error. Wrap mutations with a check:

```ts
async function persist() {
  if (!canEdit(local)) throw new Error('NOT_AUTHORIZED')
  return ...
}

const { rollback } = options
options.rollback = (err) => {
  rollback?.(err)
  if (err.message === 'NOT_AUTHORIZED')
    toast.error('This is not yours to mend...')
}
```

Better: the UI never shows the action in the first place (see §7.3).

### 8.3 Realtime Security Model

RLS continues to gate **what rows are SELECTed** when realtime delivers a change
notification. A collaborator subscribed to `survivor_disorder` will **not** see
notifications for survivors in settlements they're not a member of, because the
realtime infrastructure honours RLS on the SELECT side.

This is the foundation that lets the catalog-table coarse subscription (§8.2.2
option B) be safe: even though we subscribe to all rows, RLS filters out
anything the user can't read. With Decision 2 in §5.2, that means anything not
transitively shared via a settlement.

---

## 9. Paid-Feature Gating

Sharing as a paid feature is a clean addition to the recommended model. Below is
a sketch — concrete details depend on payment provider choice.

> [!NOTE]
>
> Payment provider of choice will be Stripe.

### 9.1 Entitlement model

Two new tables (rough sketch):

```sql
create table subscription_plan (
  id text primary key,            -- 'free', 'lantern', 'lantern_hoard'
  display_name varchar not null,
  monthly_price_cents int not null,
  max_owned_settlements int,      -- null = unlimited
  max_collaborators_per_settlement int,     -- null = unlimited
  may_share boolean not null default false,
  may_be_invited boolean not null default true,
  may_create_custom boolean not null default true
);

create table user_subscription (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text not null references subscription_plan(id),
  status varchar not null default 'active',  -- 'active' | 'past_due' | 'canceled' | 'trialing'
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz not null default now()
);
```

A SECURITY DEFINER helper:

```sql
create or replace function user_can_share() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((
    select sp.may_share
      from public.user_subscription us
      join public.subscription_plan sp on sp.id = us.plan_id
     where us.user_id = auth.uid()
       and us.status in ('active','trialing')
  ), false)
$$;
```

### 9.2 RLS Gating for Sharing

Add a clause to the `settlement_shared_user` INSERT policy:

```sql
create policy "Allow insert by paying owner" on settlement_shared_user for
insert to authenticated with check (
  user_can_share()
  and is_settlement_owner(settlement_id)
  and user_id = auth.uid());
```

Free users:

- Can _be_ a `shared_user_id` (collaborate when invited).
- Can read shared settlements they were invited to.
- Cannot create new shares — RLS denies the INSERT, UI hides the button with a
  "subscribe to share" prompt.

This means a paying user can run a settlement with two free friends — the
friends never need to pay. **This is the right default** for the product because
it maximizes the network effect and keeps the gate at the "settlement keeper"
role, which is the role that benefits most from the collaboration.

### 9.3 What Happens When an Owner Cancels?

When a paying owner downgrades to free:

- Existing shares persist; no new ones can be created. (least friction; matches
  "you bought it.")

Include an in-app banner if `user_subscription.status` is `past_due`/`canceled`
warning that further sharing is blocked. This should only be displayed on the
sharing page to avoid alarming users who are not actively trying to share.

### 9.4 Custom-Content Creation Gating?

Open question. The user said "sharing is a paid feature" — does that include
**creating** custom catalog rows?

- Free users can create unlimited custom catalog rows (knowledge, gear, etc.),
  but cannot share. Custom content authoring is core to KDM and a generous free
  tier protects the value prop.

Implementable via RLS predicates on the catalog INSERT policies
(`custom and user_id = auth.uid() and (count_user_custom() < limit or user_is_paid())`).

### 9.5 What can Free Invitees do Inside a Paid-Shared Settlement?

Per §6, **everything a paid collaborator can do**. The revenue gate is on the
share creator, not the invitee.

### 9.6 Stripe + Webhooks

Standard Stripe Checkout flow into a serverless function that updates
`user_subscription`. The DAL doesn't need to know — RLS reads
`user_subscription` directly.

---

## 10. Action Plan (Phased)

Each phase is independently shippable and reversible.

### Phase 0 — Stabilize What Exists (no schema change)

- **0.1** Add `role: 'owner' | 'collaborator'` to the `getSettlementForUser`
  return shape and the `SettlementDetail` type. Replace `shared: boolean`
  callers.
- **0.2** Render the lantern badge / "shared by @username" indicator in
  `settlement-switcher.tsx`.
- **0.3** Add owner-only UI gating component (`<OwnerOnly>`).
- **0.4** Audit the realtime publication for any settlement-scoped table added
  since `20260327000000` and add the missing ones.
- **0.5** Document the current contradictory RLS posture inline in code comments
  so the next change is not a surprise.

Acceptance: opening a shared settlement renders without errors, but
collaborators cannot do anything yet (UI buttons hidden where appropriate).

### Phase 1 — Settlement-Scoped Collaborator CRUD (Core Multiplayer Loop)

- **1.1** New migration: `is_settlement_collaborator(uuid)` SECURITY DEFINER
  helper.
- **1.2** Per settlement-child table, replace owner-only INSERT/UPDATE/ DELETE
  policies with `is_settlement_owner(...) or is_settlement_collaborator(...)`.
  Tables: every `settlement_*` table, `survivor`, every `survivor_*` junction,
  `gear_grid`, every `hunt_*`, every `showdown_*`, every `settlement_phase*`.
- **1.3** Tighten `settlement` UPDATE to owner-only (Decision 4 / Option A).
  Invert the integration test in
  `__tests__/integration/rls/settlement-shared.test.ts:78-105`.
- **1.4** Add `settlement_shared_user` to `supabase_realtime` and extend
  `use-realtime.tsx` with a per-user channel.
- **1.5** Build the share UI in Settlement → Settings → Collaborators with exact
  username specification.
- **1.6** Integration tests under `__tests__/integration/rls/`: collaborator CAN
  insert/update/delete on every relevant table; collaborator CANNOT delete
  settlement, share, change name.

Acceptance: two browsers logged in as different users can edit the same
settlement (different survivors, different milestones, different hunt state) and
see each other's edits live.

### Phase 2 — Catalog Visibility via Transitive Settlement Membership

- **2.1** Create `is_catalog_row_visible_via_settlement(table, row_id)` family
  of helpers (or per-table policies inlining the join). _Status:_ shipped
  per-table via `20260512000000_catalog_visibility_via_settlement.sql` (E2.1.a —
  13 settlement-attached parents),
  `20260515000000_catalog_transitive_via_survivor.sql` (E2.1.b — 4 survivor FK
  catalogs), and `20260516000000_catalog_transitive_hunt_showdown.sql` (E2.1.c —
  `trait`, `mood`, `armor_set`, `armor_set_slot`, `quarry_level`,
  `nemesis_level` + the trait/mood sub-row junctions). No central helper was
  needed; each catalog inlines the join.
- **2.2** Per catalog table, replace "Allow select for shared and custom" with
  "Allow select via settlement membership". Drop "Allow update for shared and
  custom" entirely. _Status:_ legacy `Allow select for shared and custom`
  dropped wholesale by `20260520000000_drop_catalog_shared_user_tables.sql`.
  Transitive replacement policies extended to the 15 catalog sub-row tables
  (cost children of `gear` / `pattern` / `seed_pattern`, `armor_set_slot_gear`,
  `quarry_level_survivor_status`, `nemesis_level_survivor_status`) and to the
  `survivor_status` catalog parent (4-way UNION) by
  `20260524000000_catalog_sub_row_transitive_select.sql`. Catalogs without a
  settlement-bound junction (`character`, `strain_milestone`, `wanderer`,
  `constellation`) remain author-only — see Phase 2.7.
- **2.2.1** Extend transitive SELECT to catalog rows referenced by a custom
  recipe's cost / requirement junction rows. `20260524000000` exposed the cost
  junction rows themselves (`gear_gear_cost`, `pattern_gear_cost`,
  `seed_pattern_gear_cost`, `gear_resource_cost`, `pattern_resource_cost`,
  `seed_pattern_resource_cost`, `pattern_innovation_requirement`,
  `seed_pattern_innovation_requirement`), but not the catalog rows the cost
  columns point at (`cost_gear_id`, `resource_id`, `innovation_id`). Without
  those, collaborator-visible custom recipes render their cost lines as "Unknown
  gear / resource / innovation" because the UI resolves cost names through the
  global catalog maps.
  `20260526000000_catalog_referenced_row_transitive_select.sql` closes the gap
  by adding `Allow select via referenced cost` on `gear`, `resource`, and
  `innovation`. The policy is gated on
  `is_settlement_member(sj.settlement_id, <ref>.user_id)` so stranger-authored
  catalog rows referenced by a settlement collaborator's recipe stay hidden;
  EC-7 (author unshared) also collapses the new path cleanly.
  `*_resource_type_cost` and `*_other_cost` reference an enum / free-text label
  and have no referenced-row visibility gap. `pattern.crafted_gear_id` (recipe
  output) is out of scope here.
- **2.3** Add a `BEFORE DELETE` trigger on each catalog table to block deletion
  while attached to a settlement the author doesn't own. _Status:_ shipped by
  `20260518000000_catalog_delete_guard_trigger.sql`.
- **2.4** Add catalog tables to `supabase_realtime`. Extend the realtime hook
  with the coarse subscription (§8.2.2 option B). _Status:_ shipped for the 35
  catalog parents by `20260519000000_catalog_realtime_publication.sql` and
  extended to the 15 catalog sub-row tables by
  `20260525000000_catalog_sub_row_realtime_publication.sql`. The hook's
  `TABLE_DOMAIN_MAP` in `hooks/use-realtime.tsx` includes all of them.
- **2.5** Quarantine `*_shared_user` tables — keep them in place but stop
  writing to them from the DAL. Plan a follow-up migration to drop them after a
  grace period. (NOTE: They are not in use currently and can be dropped without
  risk). _Status:_ the 27 `*_shared_user` catalog tables and 26 dead owner
  helpers were dropped by `20260520000000_drop_catalog_shared_user_tables.sql`.
  `settlement_shared_user` is retained as the backbone of multiplayer
  collaboration.
- **2.6** Add the "By @username" authorship chip to all custom-content cards.
  Disable rules-text editing in the UI for non-author viewers. _Status:_ pending
  — frontend role gating (`<OwnerOnly>` + per-row author check) still to land.
- **2.7** Extend transitive SELECT to catalogs that currently have no
  settlement-bound junction: `character`, `strain_milestone`, `wanderer`,
  `constellation`. None of these are reachable from a settlement today, so
  custom rows remain author-only until each grows a survivor / settlement
  attachment point. Track as a follow-up.

Acceptance: collaborator opens a settlement and can read the rules text of a
custom knowledge authored by the owner (and vice versa). Author updates their
rules text → collaborator sees the new text within 300ms.

### Phase 3 — Paid-Feature Gating

- **3.1** Add `subscription_plan` and `user_subscription` tables. Pre-populate
  `subscription_plan` with `free` and one paid tier.
- **3.2** Stripe integration: Checkout session, customer portal, webhook handler
  that writes to `user_subscription`. (note; this will require providing
  documentation to the Stripe account owner so they understand how the webhook
  updates `user_subscription` in your system.)
- **3.3** Add `user_can_share()` RLS helper. Gate
  `settlement_shared_user.INSERT` policy on `user_can_share()`.
- **3.4** UI: subscription page; when free user clicks "Share" → modal with
  upsell. Banner on `past_due`/`canceled`.
- **3.5** Test matrix: free owner cannot share, paid owner can share, free
  invitee can collaborate fully on paid-shared settlement.

Acceptance: payment flow end-to-end; revenue model active.

### Phase 4 — Polish & Advanced UX

- **4.1** Presence indicators (who's editing what). Include ability for users to
  provide an avatar or display name that will appear next to their edits in real
  time.
- **4.2** "Updated by @username" toast on remote-overwrite of free-form text
  fields.
- **4.3** Notifications: in-app bell with "shared a settlement with you",
  "removed you from a settlement", etc.
- **4.4** Soft-delete / archive for custom catalog content (replaces hard delete
  cascade gotcha — see P11).
- **4.5** Audit log: per-settlement event stream of who did what when, visible
  to settlement members. Useful for KDM specifically because most settlements
  are long-lived.

---

## 11. Open Questions

These need user decisions before/while building Phase 1.

1. **Who can edit `settlement_name`, `notes`, `campaign_type`?** Recommendation
   in §5.2 Decision 4 = owner only.

   OWNER ONLY (including `uses_scouts` and `survivor_type`)

1. **Can collaborators delete survivors?**

   YES

1. **Can collaborators invite further collaborators?**

   NO

1. **What happens when the settlement owner cancels their subscription?**
   Recommendation §9.3 = existing shares persist; no new shares can be created.
   Confirm.

   CONFIRMED

1. **Does "paid sharing" gate on the owner only, or do invitees need a plan
   too?** Recommendation §9.5 = owner only. Confirm.

   OWNER ONLY

1. **Do free users get unlimited custom catalog rows, or a quota?**
   Recommendation §9.4 = unlimited (option A). Confirm.

   UNLIMITED

1. **Hard cap on collaborators per settlement?** Recommendation = 4 (matches KDM
   core box player count) but easy to change later.

   NO HARD CAP

1. **Should the soft-delete / archive replacement for hard delete come in Phase
   2 or Phase 4?** Phase 4 keeps Phase 2 simpler; Phase 2 is more correct.
   Recommendation = Phase 2.

   PHASE 2

1. **Username search anti-enumeration: exact match only, or broader search?**
   Recommendation = require exact username match only; do not implement prefix
   or substring search. Broader search reveals user existence too easily.

   REQUIRE EXACT MATCH

1. **Notification preferences for "you've been shared with"?** Out of scope for
   first launch; just a UI bell badge is enough.

   JUST A UI BELL BADGE

---

## Appendix A — Inventory of Existing Tables

This inventory was reconciled against the migration history through
`20260526000000_catalog_referenced_row_transitive_select.sql` (which closed the
cost-reference gap on `gear`, `resource`, and `innovation` left by
`20260524000000_catalog_sub_row_transitive_select.sql`),
`20260525000000_catalog_sub_row_realtime_publication.sql` (which extended the
transitive SELECT policies and realtime publication added by
`20260524000000_catalog_sub_row_transitive_select.sql` and the author-membership
SELECT predicates introduced in
`20260523000000_catalog_author_membership_select.sql`). Where the recommended
phases reference a table that has since been split or renamed, the actual table
names from the current schema are used.

### A.1 Tables that need RLS rewrites in Phase 1 (collaborator CRUD)

These are settlement-instance, survivor-instance, hunt-instance, and
showdown-instance tables. They have no `custom` column and no `*_shared_user`
junction — visibility and write access flow entirely from
`settlement_shared_user` (and `is_settlement_collaborator`).

**Settlement-instance state:**

`settlement` (UPDATE tightening — see Decision 4 / §6),
`settlement_collective_cognition_reward`, `settlement_gear`,
`settlement_innovation`, `settlement_knowledge`, `settlement_location`,
`settlement_milestone`, `settlement_nemesis`, `settlement_pattern`,
`settlement_philosophy`, `settlement_principle`, `settlement_quarry`,
`settlement_resource`, `settlement_seed_pattern`, `settlement_timeline_year`,
`settlement_phase`, `settlement_phase_returning_survivor`.

**Survivor-instance state:**

`survivor` (also note direct catalog FKs: `weapon_type_id`, `philosophy_id`,
`neurosis_id`, `knowledge_1_id`, `knowledge_2_id`, `constellation_id`,
`parent_1_id`, `parent_2_id`), `survivor_disorder`, `survivor_cursed_gear`,
`survivor_fighting_art`, `survivor_secret_fighting_art`,
`survivor_ability_impairment`, `gear_grid`.

> Note: there is no `survivor`-side junction table for `survivor_status`. The
> four `*_survivor_status` junctions all hang off hunt/showdown monsters or off
> catalog levels: `hunt_monster_survivor_status` (A.1 hunt-instance),
> `showdown_monster_survivor_status` (A.1 showdown-instance),
> `quarry_level_survivor_status` (A.2 sub-row under `quarry`), and
> `nemesis_level_survivor_status` (A.2 sub-row under `nemesis`). The catalog
> parent `survivor_status` is in A.2 below.

**Hunt-instance state:**

`hunt`, `hunt_ai_deck`, `hunt_hunt_board`, `hunt_monster`, `hunt_monster_mood`,
`hunt_monster_survivor_status`, `hunt_monster_trait`, `hunt_survivor`.

> Note: the original draft referenced `hunt_monster_trait_mood` as a single
> table. Migrations `20260422000005` and `20260424000006` split it into the
> three junctions listed above. The same applies to showdown below.

**Showdown-instance state:**

`showdown`, `showdown_ai_deck`, `showdown_monster`, `showdown_monster_mood`,
`showdown_monster_survivor_status`, `showdown_monster_trait`,
`showdown_survivor`.

### A.2 Tables that need transitive-visibility RLS rewrites in Phase 2

These are author-owned catalog tables. Each currently carries a `custom` column,
a `user_id` author column, and a paired `*_shared_user` junction (scheduled for
drop in A.5). The Phase 2 work replaces "Allow select for shared and custom"
with the transitive predicate from §5.2 Decision 2, and removes "Allow update
for shared and custom" entirely.

**Top-level catalog tables (each has its own `*_shared_user` triad):**

`ability_impairment`, `armor_set`, `character`, `collective_cognition_reward`,
`constellation`, `disorder`, `fighting_art`, `gear`, `innovation`, `knowledge`,
`location`, `milestone`, `mood`, `nemesis`, `neurosis`, `pattern`, `philosophy`,
`principle`, `quarry`, `resource`, `secret_fighting_art`, `seed_pattern`,
`strain_milestone`, `survivor_status`, `trait`, `wanderer`, `weapon_type`.

> Note: `survivor_status` is reached transitively through four physical
> junctions — `hunt_monster_survivor_status`,
> `showdown_monster_survivor_status`, `quarry_level_survivor_status`, and
> `nemesis_level_survivor_status`. The Phase 2 transitive SELECT is a 4-way
> UNION mirroring `trait` and `mood` (installed by
> `20260524000000_catalog_sub_row_transitive_select.sql`).

**Catalog sub-rows and junctions (no `*_shared_user` of their own — RLS
piggy-backs on the parent catalog's policies):**

- Philosophy: `philosophy_rank`.
- Quarry: `quarry_level`, `quarry_location`, `quarry_timeline_year`,
  `quarry_hunt_board`, `quarry_hunt_board_position`,
  `quarry_collective_cognition_reward`, `quarry_level_mood`,
  `quarry_level_survivor_status`, `quarry_level_trait`.
- Nemesis: `nemesis_level`, `nemesis_location`, `nemesis_timeline_year`,
  `nemesis_level_mood`, `nemesis_level_survivor_status`, `nemesis_level_trait`.
- Wanderer: `wanderer_timeline_year`, `wanderer_ability_impairment`.
- Armor set: `armor_set_slot`, `armor_set_slot_gear`.
- Crafting costs (children of `gear`): `gear_gear_cost`, `gear_other_cost`,
  `gear_resource_cost`, `gear_resource_type_cost`.
- Crafting costs (children of `pattern`): `pattern_gear_cost`,
  `pattern_innovation_requirement`, `pattern_resource_cost`,
  `pattern_resource_type_cost`.
- Crafting costs (children of `seed_pattern`): `seed_pattern_gear_cost`,
  `seed_pattern_innovation_requirement`, `seed_pattern_resource_cost`,
  `seed_pattern_resource_type_cost`.

> Note: the original draft referenced `armor_set_slots` (plural),
> `quarry_level_trait_mood`, `nemesis_level_trait_mood`, and a legacy
> `armor_set_gear` table. The actual schema uses singular `armor_set_slot` and
> split-junction tables as listed above; `armor_set_gear` was dropped in
> `20260425000000_armor_set_slots.sql` and replaced by the slot-based model
> (`armor_set_slot` + `armor_set_slot_gear`).

### A.3 Account, lookup, and infrastructure tables

These do not fit cleanly into Phase 1 or Phase 2 but are central to the sharing
model overall:

- `settlement_shared_user` — the keeper of the model. Already covered by
  Decision 5; added to `supabase_realtime` in
  `20260509000001_settlement_shared_user_realtime.sql`.
- `user_settings` — username and avatar_url, recipient resolution surface.
- `lookup_user_audit` — rate-limit / anti-enumeration log for username search
  (`20260510000000_lookup_user_by_username.sql`).

### A.4 Tables that need to be added to `supabase_realtime`

In Phase 1: `settlement_shared_user` (already done by
`20260509000001_settlement_shared_user_realtime.sql`). Audit for any
post-`20260327` settlement-, survivor-, hunt-, or showdown-scoped table that was
added later — at minimum:

- `survivor_status`, `survivor_ability_impairment`
- `hunt_monster_mood`, `hunt_monster_survivor_status`, `hunt_monster_trait`
- `showdown_monster_mood`, `showdown_monster_survivor_status`,
  `showdown_monster_trait`
- `gear_grid` (added by `20260503000001_gear_grid_realtime.sql`)

In Phase 2: every top-level catalog table from A.2 and any sub-row table whose
changes need to propagate live (rules-text edits on `philosophy_rank`,
`quarry_level`, `nemesis_level`, `armor_set_slot`, and all crafting-cost
children).

`20260506000000_audit_realtime_publication.sql` and
`20260519000000_catalog_realtime_publication.sql` codify part of this work; both
should be checked against the table list above before launching multiplayer.

### A.5 Tables to deprecate / drop

In Phase 2 (already scheduled by
`20260520000000_drop_catalog_shared_user_tables.sql`): every `*_shared_user`
catalog junction. Their data does not need to be migrated — the new
transitive-visibility predicate replaces them entirely.

For completeness, the full list of junctions being dropped:

`ability_impairment_shared_user`, `armor_set_shared_user`,
`character_shared_user`, `collective_cognition_reward_shared_user`,
`constellation_shared_user`, `disorder_shared_user`, `fighting_art_shared_user`,
`gear_grid_shared_user`, `gear_shared_user`, `innovation_shared_user`,
`knowledge_shared_user`, `location_shared_user`, `milestone_shared_user`,
`mood_shared_user`, `nemesis_shared_user`, `neurosis_shared_user`,
`pattern_shared_user`, `philosophy_shared_user`, `principle_shared_user`,
`quarry_shared_user`, `resource_shared_user`, `secret_fighting_art_shared_user`,
`seed_pattern_shared_user`, `strain_milestone_shared_user`,
`survivor_status_shared_user`, `trait_shared_user`, `wanderer_shared_user`,
`weapon_type_shared_user`.

`settlement_shared_user` is the **only** `*_shared_user` table that survives —
it is the keeper of the entire model.

The drop migration `20260520000000_drop_catalog_shared_user_tables.sql` has
already shipped. No DAL code in `lib/dal/` writes to any catalog `*_shared_user`
table — reads are made redundant by the transitive-visibility predicate
(`is_settlement_member` + `Allow select via settlement membership` on the
catalog tables and their sub-rows).

---

## Appendix B — Edge Cases Catalog

A non-exhaustive list of edge cases that the recommended model handles
correctly. Use this for test planning.

| #     | Scenario                                                                                                                | Expected behaviour under recommendation                                                                                                                                                                                                                                                                       |
| ----- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EC-1  | A invites B; B accepts; B opens settlement                                                                              | B sees full state; can edit gameplay rows; cannot rename or delete settlement                                                                                                                                                                                                                                 |
| EC-2  | A creates custom knowledge K; A attaches K to settlement S; A shares S with B                                           | B can read K (rules included). B cannot edit K's rules text.                                                                                                                                                                                                                                                  |
| EC-3  | (EC-2) + A unshares S                                                                                                   | B loses access to S. K's rules continue to be A's.                                                                                                                                                                                                                                                            |
| EC-4  | (EC-2) + A removes K from S                                                                                             | B can no longer read K (no other settlement attaches it).                                                                                                                                                                                                                                                     |
| EC-5  | (EC-2) + A deletes K entirely                                                                                           | Delete is allowed because all attachments are on settlements A owns.                                                                                                                                                                                                                                          |
| EC-6  | A shares S with B; B creates own custom disorder D; B attaches D to a survivor in S                                     | A can read D's rules. A cannot edit D's rules.                                                                                                                                                                                                                                                                |
| EC-7  | (EC-6) + A removes B from S                                                                                             | A loses the ability to read D's rules (no other settlement of A's references D). The `survivor_disorder` row remains; the disorder name still renders, but the rules text becomes unavailable until B reattaches. (UX consideration: maybe show a stub.)                                                      |
| EC-8  | (EC-6) + B deletes D                                                                                                    | Trigger blocks: "D is in use in A's settlement S, which you collaborate on; remove it from that settlement first."                                                                                                                                                                                            |
| EC-9  | A shares S with B and C; B and C edit different survivors simultaneously                                                | Both edits land; realtime propagates each to the others.                                                                                                                                                                                                                                                      |
| EC-10 | A shares S with B; B and A edit the same survivor's `notes` field at the same time                                      | Last write wins. Realtime overrides B's local copy with A's value. UX: show a "(updated by @ashen.veil)" toast.                                                                                                                                                                                               |
| EC-11 | A is on free plan; tries to share S                                                                                     | RLS denies INSERT to `settlement_shared_user`; UI shows upsell prompt.                                                                                                                                                                                                                                        |
| EC-12 | A is on paid plan, shared S with B (free); A downgrades to free                                                         | B remains a collaborator (Option 1 from §9.3). A cannot create new shares. UI banner reminds A of the lapsed subscription.                                                                                                                                                                                    |
| EC-13 | A invites B by typing username "ashen.veil"; B is signed up via OAuth with collision-suffixed username "ashen.veil1234" | Exact-match entry only: "ashen.veil" does not match "ashen.veil1234". UI returns a generic "Username not found" error and does not surface suggestions or alternate usernames.                                                                                                                                |
| EC-14 | A invites B but B has not yet set a username (empty default)                                                            | A cannot find B because the username search RPC excludes empty usernames. We surface a hint: "Friends not appearing? Make sure they've chosen a name on the lantern hoard."                                                                                                                                   |
| EC-15 | A is admin/superuser                                                                                                    | All admin-bypass RLS clauses (`is_admin()`) continue to apply unchanged.                                                                                                                                                                                                                                      |
| EC-16 | A's account is deleted (auth cascade)                                                                                   | All A's owned settlements cascade-delete. Settlements where A was a collaborator: A's `settlement_shared_user` row cascades; the settlement itself remains for the owner. A's custom catalog rows cascade-delete; a `BEFORE DELETE` trigger on auth.users? Probably out of scope; cleanup pass is acceptable. |
| EC-17 | Collaborator B drops out mid-hunt; what happens to `hunt_survivor` rows for survivors B added?                          | Rows persist (no cascade on collaborator removal). The owner can clean up.                                                                                                                                                                                                                                    |
| EC-18 | Settlement S has 4 collaborators; owner tries to add a 5th and the limit is 4                                           | RLS or app-layer policy returns "Settlement is at capacity".                                                                                                                                                                                                                                                  |
| EC-19 | Realtime subscription dies mid-session                                                                                  | Existing reconnect logic in supabase-js handles retry. After reconnect, full re-fetch via existing refetch handlers brings client back to canonical state.                                                                                                                                                    |
| EC-20 | Two clients submit the same milestone "complete" toggle simultaneously                                                  | Idempotent — both writes set `complete = true`; no conflict.                                                                                                                                                                                                                                                  |

---

## TL;DR

1. **The current schema has two contradictory sharing models** layered on top of
   each other (`*_shared_user` catalog triads + `settlement_shared_user`). The
   polarity of permissions is mostly inverted from what the user wants.
1. **Collapse to a single sharing dimension: settlement membership.** Custom
   content visibility flows transitively through the settlement's child rows
   that reference it.
1. **Settlement-child tables get full collaborator CRUD.** The owner remains the
   only one who can rename, delete, or share the settlement itself.
1. **Catalog rules text stays author-only.** Only the original creator of a
   custom knowledge/disorder/gear can edit its rules; every collaborator on a
   settlement that uses it can read it.
1. **`settlement_shared_user` and catalog tables join the realtime publication**
   so invitations and rules edits propagate live.
1. **A small payment/entitlement layer gates _share creation_** — invitees stay
   free. The free tier is solo-friendly; paying users unlock the "host a co-op
   campaign" feature.
1. **Phase 1 (collaborator CRUD + share UI) is shippable independently of Phase
   2 (catalog transitive visibility) and Phase 3 (paid gating).** Each phase
   reduces a discrete cluster of risk. None of the phases require a data
   migration — every change is RLS rewrite + new helper functions + UI work.
