# [E1.10] Owner-only UI gating sweep — scope analysis and follow-ups

Companion to PR for issue #137. Captures the audit that led to the minimal
changeset in this PR and lists follow-up items that the owner may want to
address in separate issues.

## TL;DR

After a full RLS-policy + DAL + UI sweep, **only two control groups in the
entire app today need an `<OwnerOnly>` wrapper** for [E1.10]:

1. Settings tab → **Settlement Settings** card (`uses_scouts` toggle).
2. Settings tab → **Danger Zone** card (Delete Settlement button).

Both lived in
[components/settings/settings-card.tsx](components/settings/settings-card.tsx)
behind inline `selectedSettlement.role === 'owner'` checks. This PR replaces
those inline checks with `<OwnerOnly>` for consistency with [E0.3]/[E1.7] and to
future-proof against the `<OwnerOnly>` gate getting tightened (e.g. the
id-vs-resolved-settlement synchronization check it adds).

The sharing panel (collaborators-panel) is already wrapped in `<OwnerOnly>` per
[E1.7].

## Full audit

### Owner-only mutation surfaces (per current RLS state)

| Surface                                | Owner-only? | Reason                                                                    | UI call sites                                                                                                                       |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `settlement.settlement_name` UPDATE    | Yes         | [E1.3] trigger                                                            | None — no rename UI exists in the app today                                                                                         |
| `settlement.campaign_type` UPDATE      | Yes         | [E1.3] trigger                                                            | None — only set at creation in [components/settlement/create-settlement-card.tsx](components/settlement/create-settlement-card.tsx) |
| `settlement.survivor_type` UPDATE      | Yes         | [E1.3] trigger                                                            | None — only set at creation                                                                                                         |
| `settlement.uses_scouts` UPDATE        | Yes         | [E1.3] trigger                                                            | `components/settings/settings-card.tsx` Uses Scouts toggle ✅ now wrapped                                                           |
| `settlement.user_id` UPDATE            | Yes         | [E1.3] trigger                                                            | None — no ownership-transfer UI exists                                                                                              |
| `settlement` DELETE                    | Yes         | Original "Allow delete for owner" policy (no later migration replaced it) | `components/settings/settings-card.tsx` Delete Settlement button ✅ now wrapped                                                     |
| `settlement_shared_user` INSERT/DELETE | Yes         | Sharing policies                                                          | `components/settlement/sharing/collaborators-panel.tsx` ✅ already wrapped (was the [E1.7] deliverable)                             |

All other settlement-scoped tables (`survivor`, `hunt`, `showdown`, the
survivor- owned junctions like `survivor_disorder`, `survivor_cursed_gear`,
`gear_grid`, the settlement junctions, settlement-phase tables, and the
hunt/showdown junctions) were converted to **member** policies in the
`20260508000001..20260508000005_*_collaborator_crud.sql` migration series. Those
surfaces are collaborator-CRUD and intentionally do **not** require gating.

### Settings card content (per role)

After this PR,
[components/settings/settings-card.tsx](components/settings/settings-card.tsx)
renders the following sections per caller role:

| Section                                 | Owner | Collaborator                        | No settlement selected |
| --------------------------------------- | ----- | ----------------------------------- | ---------------------- |
| Update Username form                    | ✅    | ✅                                  | ✅                     |
| Update Password form                    | ✅    | ✅                                  | ✅                     |
| Global Settings → Disable Notifications | ✅    | ✅                                  | ✅                     |
| Development Tools (dev only)            | ✅    | ✅                                  | ✅                     |
| **Settlement Settings (Uses Scouts)**   | ✅    | ❌                                  | ❌                     |
| Delete Current Hunt (when active)       | ✅    | ✅ (collaborator CRUD per [E1.2.d]) | n/a                    |
| Delete Current Showdown (when active)   | ✅    | ✅ (collaborator CRUD per [E1.2.d]) | n/a                    |
| **Danger Zone (Delete Settlement)**     | ✅    | ❌                                  | ❌                     |

## Notes for the maintainer

These are observations from the audit, not blockers for the PR. Please call out
which (if any) should become new issues.

### 1. Issue scope mentions controls that don't exist yet

The issue scope explicitly lists:

> - Settlement rename input
> - Campaign type, survivor type, uses scouts toggles

There is **no settlement rename input** in the app today — `settlement_name` is
only set at creation in
[components/settlement/create-settlement-card.tsx](components/settlement/create-settlement-card.tsx).
The same is true of the campaign-type / survivor-type pickers (set at creation
only).

The scope wording reads as future-proofing rather than describing an existing
gap. This PR doesn't add those controls; if/when they're added, they should be
wrapped in `<OwnerOnly>` per the precedent in this PR.

### 2. Custom catalog rules text edits are explicitly deferred to [E2.10]

The issue's "Out of scope" line says:

> Custom catalog rules-text edit fields stay editable in Phase 1; they're
> handled in [E2.10] (after author-only enforcement lands).

That is **deliberately not touched here**. Today, the rules-text edit fields on
custom catalog items render for any user who can see the row (i.e. settlement
collaborators see them on a shared settlement). The "author-only" guard hasn't
landed yet, so wrapping them in `<OwnerOnly>` would either:

- (a) lock the author out of their own customs when the catalog row is shared
  via a settlement they don't own, or
- (b) require a different gate ("author-only", not "owner-only") that the
  `<OwnerOnly>` component does not express.

[E2.10] is the right place for this — flagging here for completeness.

### 3. Stale repository memory about survivor-owned junction RLS

I updated my agent memory while researching this. The previous note said
survivor-owned junction tables (`survivor_disorder`, `survivor_cursed_gear`,
`gear_grid`) were owner-only. That was true at the time it was written but is no
longer accurate as of
[supabase/migrations/20260508000004_survivor_collaborator_crud.sql](supabase/migrations/20260508000004_survivor_collaborator_crud.sql)
— those tables now use member policies (collaborator CRUD). No code change
needed; just calling out that the older memory note is now obsolete.

### 4. Defensive `<OwnerOnly>` belt-and-braces is _not_ applied to the user-account section

The `UpdateUsernameForm` / `UpdatePasswordForm` / Disable Notifications toggle
in the Settings tab are **user-scoped**, not settlement-scoped, so they
intentionally remain visible to collaborators. They aren't owner-only controls
and aren't covered by [E1.3].

If the long-term intent is that the Settings tab is reserved for the
settlement-owner-only experience (the architecture doc bullet "Settlement rename
/ campaign type / **settings tab**" can be read either way), this is a
deliberate divergence worth flagging.

### 5. `<OwnerOnly>` does not display a tooltip fallback for hidden controls

By design (and consistent with the [E1.7] collaborators panel), the wrapped
controls disappear entirely for collaborators — no tooltip, no disabled
affordance. The lantern-themed `NOT_AUTHORIZED_MESSAGE` from [E1.9] never fires
for these controls (you can't click what you can't see), which is the desired
"don't see destructive affordances" outcome from the issue's acceptance line.
