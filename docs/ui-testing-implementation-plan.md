# UI Testing Implementation Plan

## Table of Contents

1. [Goals & Non-Goals](#1-goals--non-goals)
1. [Current State of the Codebase](#2-current-state-of-the-codebase)
1. [Prioritization Model](#3-prioritization-model)
1. [Recommended Test Architecture](#4-recommended-test-architecture)
1. [Milestone Plan](#5-milestone-plan)
1. [Issue Backlog](#6-issue-backlog)
1. [Coverage Matrix](#7-coverage-matrix)
1. [Cross-Cutting Requirements](#8-cross-cutting-requirements)
1. [Open Questions](#9-open-questions)
1. [Appendix A - UI Surface Inventory](#appendix-a---ui-surface-inventory)
1. [Appendix B - Edge Case Catalog](#appendix-b---edge-case-catalog)

---

## 1. Goals & Non-Goals

### Goals

- **G1.** Expand Playwright coverage from the sign-up pilot into the highest
  risk user journeys first: authentication, settlement lifecycle, sharing,
  survivor management, hunt, showdown, and settlement phase.
- **G2.** Exercise the real browser app, local Supabase, RLS policies, realtime
  subscriptions, Mailpit, and user-visible error states together.
- **G3.** Prefer scenario-level tests for workflows where several components
  must agree on state, permissions, optimistic updates, or navigation.
- **G4.** Keep each UI test deterministic, isolated, and self-cleaning through
  service-role fixtures.
- **G5.** Produce a backlog that can be copied into GitHub issues and grouped
  into milestones.

### Non-Goals

- **NG1.** Exhaustively retest every DAL function or RLS branch already covered
  by unit and integration tests.
- **NG2.** Pixel-perfect visual regression testing. Playwright screenshots are
  useful for failure artifacts, but this plan focuses on behavior.
- **NG3.** Full Kingdom Death rules simulation. UI tests should verify the app's
  workflows and guardrails, not become a tabletop rules engine.
- **NG4.** Browser coverage for every catalog item type in the first pass.
  Custom content should use representative high-risk flows, then broaden once
  shared helpers are stable.

---

## 2. Current State of the Codebase

### Existing Browser Test Harness

- Playwright is configured in [`playwright.config.ts`](../playwright.config.ts)
  with a Chromium project, serial CI execution, failure traces, screenshots, and
  videos.
- The test runner [`scripts/ui-test.sh`](../scripts/ui-test.sh) starts local
  Supabase, temporarily routes Auth email through Mailpit/Inbucket, exports the
  app's Supabase environment, verifies Supabase Auth and Mailpit, runs
  Playwright, and restores `supabase/config.toml` on exit.
- The sign-up pilot lives at
  [`__tests__/ui/auth-sign-up.test.ts`](../__tests__/ui/auth-sign-up.test.ts)
  and covers happy-path registration, provisioning, Mailpit confirmation email
  capture, weak password errors, username conflicts, confirmed email conflicts,
  and RPC failures.

### Existing Non-Browser Coverage

- Unit coverage is broad across DAL helpers, schemas, messages, campaign
  templates, settings cards, sharing card units, notifications, survivor card
  rendering, and utility functions.
- Integration coverage is especially strong for Supabase RLS, realtime
  publication membership, settlement sharing, subscription provisioning,
  collaborator CRUD, catalog visibility, unshare blockers, and notification
  triggers.
- The browser gap is therefore not "does the database allow this?" but "does a
  player complete the workflow successfully, see the right state, and recover
  from failure without stale UI?"

### Application Shape

- Public routes are mostly authentication routes:
  - [`app/auth/login/page.tsx`](../app/auth/login/page.tsx)
  - [`app/auth/sign-up/page.tsx`](../app/auth/sign-up/page.tsx)
  - [`app/auth/sign-up-success/page.tsx`](../app/auth/sign-up-success/page.tsx)
  - [`app/auth/forgot-password/page.tsx`](../app/auth/forgot-password/page.tsx)
  - [`app/auth/update-password/page.tsx`](../app/auth/update-password/page.tsx)
  - [`app/auth/error/page.tsx`](../app/auth/error/page.tsx)
- The authenticated product is a single shell at
  [`app/page.tsx`](../app/page.tsx) with sidebar-driven tabs and state from
  `LocalContext`.
- Major authenticated surfaces are rendered by
  [`components/settlement/settlement-card.tsx`](../components/settlement/settlement-card.tsx):
  timeline, monsters, survivors, society, crafting, notes, hunt, showdown,
  settlement phase, sharing, settings, subscription, user content, admin, and
  help.

### Practical Implications

- UI tests should invest early in reusable login/session helpers, settlement
  builders, tab navigation helpers, toast/assertion helpers, and multi-user
  browser contexts.
- The highest-value tests are end-to-end slices that cross component and data
  boundaries: registration to email, settlement creation to navigation,
  collaborator invite to realtime visibility, hunt to showdown to settlement
  phase.
- Tests should not rely on seeded display order alone. Use fixtures with unique
  names and assert persisted database state through service-role helpers when a
  UI state could be ambiguous.

---

## 3. Prioritization Model

### Priority Signals

| Signal                       | Why It Matters                                                                          | Examples                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Data loss risk**           | A failed or misdirected UI action can delete or corrupt campaign state.                 | Delete settlement, cancel hunt, end showdown, revoke share                     |
| **Multi-step orchestration** | Several tables/components must change together.                                         | Create settlement, start hunt, proceed to showdown, begin settlement phase     |
| **Permission complexity**    | Owner, collaborator, admin, subscription, and feature flags change visible affordances. | Sharing, settlement settings, admin tabs, subscription CTAs                    |
| **Optimistic UI / rollback** | Users see immediate changes that must roll back correctly on failure.                   | Hunt board movement, settlement phase board, list cards, sharing invite/revoke |
| **External services**        | Flow depends on Supabase Auth, Mailpit, Stripe, realtime, or Edge Config.               | Password reset, checkout, portal, presence                                     |
| **High usage frequency**     | A small regression affects most sessions.                                               | Login, settlement switcher, survivor edits, crafting inventory                 |

### Priority Levels

- **P0 - Release-blocking browser coverage.** Core account access and campaign
  state flows. Regressions here can lock users out, lose data, or break the main
  gameplay loop.
- **P1 - High-value workflow coverage.** Common gameplay and collaboration flows
  where UI state, permissions, and optimistic updates interact.
- **P2 - Breadth and confidence.** Catalog, admin, billing nuance, responsive
  behavior, accessibility, and representative edge cases.

---

## 4. Recommended Test Architecture

### 4.1 Directory Direction

```text
__tests__/ui/
  auth-sign-up.test.ts
  auth-login.test.ts
  auth-password-reset.test.ts
  settlement-lifecycle.test.ts
  settlement-sharing.test.ts
  survivor-management.test.ts
  gameplay-loop.test.ts
  crafting-resources.test.ts
  settings-billing.test.ts
  custom-content.test.ts
  helpers/
    auth.ts
    mailpit.ts
    navigation.ts
    settlement.ts
    survivor.ts
    supabase.ts
    assertions.ts
```

### 4.2 Helper Responsibilities

- **`helpers/auth.ts`**: create confirmed users, log in through the browser,
  preserve authenticated storage state when safe, log out, assert protected
  route redirects, and handle password reset links from Mailpit.
- **`helpers/settlement.ts`**: create settlement fixtures through service-role
  setup for tests that do not need to exercise the creation UI; create through
  UI when the form itself is under test.
- **`helpers/survivor.ts`**: seed core and arc survivors with common statuses,
  gear, disorders, fighting arts, and hunt/showdown eligibility states.
- **`helpers/navigation.ts`**: select sidebar tabs, choose settlements from the
  switcher, open dialogs/drawers, and handle mobile sidebar variants.
- **`helpers/assertions.ts`**: assert themed toasts, inline alerts, empty
  states, optimistic rollback, and no stale loading state.
- **`helpers/supabase.ts`**: extend the existing admin client with teardown by
  test-owned email/settlement prefix and fixture builders for paid plans,
  collaborators, hunts, showdowns, settlement phases, catalog rows, and
  subscriptions.

### 4.3 Test Data Rules

- Every test-created email, username, settlement name, survivor name, and custom
  catalog name should include a unique `e2e-` prefix.
- Use service-role cleanup in `afterEach`. Browser-driven deletes can be part of
  the assertion, but teardown should not depend on the UI working.
- For heavy scenarios, seed directly through Supabase and reserve browser steps
  for the workflow being tested.
- Keep Playwright workers serial until fixture isolation and local Supabase
  performance are proven under parallel load.

### 4.4 Assertion Strategy

- Assert both **browser state** and **database state** for data-changing flows.
- Prefer accessible labels, button names, and stable UI copy. Add explicit test
  ids only when a custom control has no reliable accessible handle.
- Assert negative paths using the actual user-facing alert/toast text,
  especially for themed error copy from [`lib/messages.ts`](../lib/messages.ts).
- For optimistic UI flows, intentionally fail one network/RPC request and assert
  the visible rollback.

---

## 5. Milestone Plan

### Milestone 0 - Harness Hardening

**Goal:** Make all later issue work cheap, deterministic, and reviewable.

Exit criteria:

- Shared login helper can authenticate a confirmed user through the UI.
- Shared fixture helpers can seed and clean users, settlements, subscriptions,
  collaborators, survivors, hunts, showdowns, and settlement phases.
- Navigation helpers can select settlements and tabs on desktop and mobile.
- Toast/alert helpers avoid collisions with Next.js route announcer alerts.
- CI artifact retention is documented for traces, screenshots, and videos.

### Milestone 1 - Auth, Session, and Account Recovery

**Goal:** Ensure users can get in, recover access, and leave safely.

Exit criteria:

- Sign-up pilot remains green.
- Login succeeds for confirmed users and rejects bad credentials.
- Protected app shell redirects anonymous users to login.
- Password reset request sends Mailpit email and update-password accepts a valid
  recovery flow.
- Expired or malformed confirmation/reset links reach the auth error surface.
- Logout clears the session and blocks access to `/`.

### Milestone 2 - Settlement Lifecycle and Navigation

**Goal:** Cover the top-level campaign shell, settlement creation, switching,
and destructive settlement actions.

Exit criteria:

- Create settlement through the UI for each campaign family with campaign
  defaults verified in the database.
- Settlement switcher shows owned and shared settlements with the correct role
  affordances.
- Free-tier settlement limit disables or blocks creation with the expected copy.
- Settlement settings can toggle `uses_scouts`, cancel active hunt/showdown or
  settlement phase, and delete a settlement with confirmation.
- Empty states remain useful when no settlement is selected.

### Milestone 3 - Sharing and Collaboration

**Goal:** Exercise the highest-permission-risk feature as real users in separate
browser contexts.

Exit criteria:

- Paid owner can invite an exact username and the collaborator sees the shared
  settlement without a manual refresh.
- Free owner sees the upsell path instead of the invite form.
- Self-invite, invalid username, unknown username, duplicate invite, and
  rate-limit-shaped failures surface the correct messages.
- Collaborator can perform allowed gameplay edits but cannot use owner-only
  settlement settings, share management, or destructive settlement actions.
- Owner can revoke a collaborator; blocked revokes show the blockers dialog;
  successful revokes remove collaborator access in the second browser context.

### Milestone 4 - Survivor Management

**Goal:** Cover the most frequently edited player data.

Exit criteria:

- Create core and arc survivors through the UI, including campaign-derived
  defaults.
- Create a wanderer survivor and verify the selected wanderer populates special
  fields.
- Edit attributes, survival, insanity, bleed, armor locations, hunt XP, courage,
  understanding, once-per-lifetime flags, scout state, and status.
- Add/remove disorders, fighting arts, secret fighting arts, cursed gear,
  knowledge, philosophy, weapon proficiency, and gear grid entries.
- Max fighting art rules and invalid/negative numeric edits are blocked or
  rolled back with visible feedback.
- Survivors on active hunt/showdown cannot be deleted or mutated in ways the UI
  should prevent.

### Milestone 5 - Core Gameplay Loop

**Goal:** Verify the app can carry a campaign through the main KDM loop.

Exit criteria:

- Start a hunt from an eligible settlement with selected quarry, level,
  survivors, and optional scout.
- Hunt validates existing showdown conflicts, scout rules, survivor eligibility,
  and gear shortages.
- Active hunt board movement and event edits persist and roll back on failure.
- Proceed from hunt to showdown creates showdown records, monsters, AI decks,
  survivors, and clears the hunt.
- Start a standalone or special showdown, including quarry/nemesis choice,
  ambush, starting turn, alternate/vignette gating, and scout rules.
- Active showdown turn/monster/survivor controls persist and roll back on
  failure.
- Proceed from showdown to settlement phase creates returning survivors and the
  correct phase state.

### Milestone 6 - Settlement Phase, Crafting, and Economy

**Goal:** Cover the densest settlement-management surfaces and inventory risks.

Exit criteria:

- Settlement phase board movement persists and rolls back on failure.
- Phase actions for survivors return, update death count, special showdown, and
  end phase produce the correct state transitions.
- Resources can be added, removed, and archived without negative quantities.
- Gear crafting validates costs, consumes resources, increments gear stock, and
  records settlement phase outputs when applicable.
- Patterns and seed patterns unlock/craft through representative flows.
- Timeline, milestones, principles, innovations, locations, quarries, nemeses,
  notes, departure bonuses, and arrival bonuses can be edited from both the
  normal tabs and settlement-phase contextual tabs.

### Milestone 7 - Custom Content and User Content

**Goal:** Cover representative custom catalog creation/edit/delete flows without
trying to exhaust all catalog tables at once.

Exit criteria:

- Create/edit/delete one simple catalog item using the shared custom item dialog
  pattern.
- Create/edit/delete one complex catalog item with nested fields, such as gear
  or philosophy.
- Custom rules sheets render markdown safely and expose owner-only edit
  affordances.
- Archive/in-use delete guards surface actionable copy.
- Custom content attached to a settlement is visible through settlement and
  survivor UI where applicable.

### Milestone 8 - Billing, Settings, Admin, and Cross-Device Polish

**Goal:** Round out lower-frequency but high-trust surfaces.

Exit criteria:

- Subscription tab renders correct plan/status CTAs for free, active paid,
  canceled, past due, incomplete, and cancel-at-period-end states.
- Checkout and portal button flows are tested with mocked route responses or
  controlled test redirects; Stripe-hosted pages are not required in CI.
- User settings can update username, reject invalid format, reject duplicate
  usernames, and persist theme choice.
- Admin tabs are visible only for admins and hidden/blocked for regular users.
- Notification bell renders unread counts, marks notifications read, and handles
  realtime notification inserts.
- Mobile viewport covers sidebar opening, settlement switching, tab navigation,
  dialogs, drawers, long-press controls, and key dense surfaces like gear grid.

---

## 6. Issue Backlog

Each item below is scoped to be a GitHub issue. Milestones can be created from
the milestone names in §5.

### P0 Issues

#### UI-001 - Add Auth Session Helpers

**Milestone:** Harness Hardening

Scope:

- Add confirmed-user fixture helper.
- Add browser login helper using
  [`components/login-form.tsx`](../components/login-form.tsx).
- Add logout helper using
  [`components/logout-button.tsx`](../components/logout-button.tsx) or
  `/auth/sign-out`.
- Add protected-route redirect assertion.

Acceptance criteria:

- A test can create a user, log in through the UI, reach `/`, reload, and remain
  authenticated.
- A test can log out and verify `/` redirects to `/auth/login`.

#### UI-002 - Password Reset and Update Password Flow

**Milestone:** Auth, Session, and Account Recovery

Scope:

- Cover
  [`components/forgot-password-form.tsx`](../components/forgot-password-form.tsx)
  and
  [`components/update-password-form.tsx`](../components/update-password-form.tsx).
- Capture recovery email through Mailpit.
- Follow the recovery link and update the password.
- Verify old password fails and new password succeeds.

Acceptance criteria:

- Mailpit contains a recovery email for the target user.
- Valid recovery updates the password.
- Invalid or reused recovery link reaches the auth error surface.

#### UI-003 - Settlement Creation Matrix

**Milestone:** Settlement Lifecycle and Navigation

Scope:

- Cover
  [`components/settlement/create-settlement-card.tsx`](../components/settlement/create-settlement-card.tsx).
- Exercise People of the Lantern, People of the Sun, People of the Stars, People
  of the Dream Keeper, Squires of the Citadel, and Custom.
- Verify campaign defaults, survivor type locks, scout locks, monster nodes, and
  wanderer selection.

Acceptance criteria:

- Each campaign can create a settlement with a unique name.
- Database assertions confirm expected campaign type, survivor type,
  `uses_scouts`, quarries, nemeses, and wanderers.
- Empty or invalid settlement names surface validation feedback.

#### UI-004 - Settlement Switcher and Free-Tier Limit

**Milestone:** Settlement Lifecycle and Navigation

Scope:

- Cover
  [`components/menu/settlement-switcher.tsx`](../components/menu/settlement-switcher.tsx)
  and the empty-state creation affordance in
  [`components/settlement/settlement-card.tsx`](../components/settlement/settlement-card.tsx).
- Seed users with zero, one, many, and free-tier-limit settlements.
- Seed paid-tier subscriptions for unlimited creation.

Acceptance criteria:

- Owned settlements can be selected and render the correct overview.
- Shared settlements are distinguished from owned settlements.
- Free-tier limit disables or blocks additional creation with the expected copy.
- Paid-tier user can create beyond the free limit.

#### UI-005 - Settlement Settings Destructive Actions

**Milestone:** Settlement Lifecycle and Navigation

Scope:

- Cover
  [`components/settings/settlement-settings-card.tsx`](../components/settings/settlement-settings-card.tsx).
- Test toggling scouts, deleting active hunt, deleting active showdown, deleting
  settlement phase, and deleting the settlement.

Acceptance criteria:

- Each destructive action requires confirmation.
- Browser state and database state agree after deletion.
- Failed mutations leave the previous state visible and show an error toast.

#### UI-006 - Sharing Owner Invite and Collaborator Visibility

**Milestone:** Sharing and Collaboration

Scope:

- Cover
  [`components/settlement/sharing/collaborators-panel.tsx`](../components/settlement/sharing/collaborators-panel.tsx)
  with two browser contexts.
- Seed owner with an active sharing entitlement and collaborator with a regular
  account.
- Invite by exact username.

Acceptance criteria:

- Owner sees optimistic collaborator row and reconciled server row.
- Collaborator sees the settlement in the switcher without a manual page reload.
- Service-role assertions confirm `settlement_shared_user` row exists.

#### UI-007 - Survivor Create and Edit Smoke

**Milestone:** Survivor Management

Scope:

- Cover
  [`components/survivor/create-survivor-form.tsx`](../components/survivor/create-survivor-form.tsx),
  [`components/settlement/survivors/settlement-survivors-card.tsx`](../components/settlement/survivors/settlement-survivors-card.tsx),
  and
  [`components/survivor/survivor-card.tsx`](../components/survivor/survivor-card.tsx).
- Create one core survivor and one arc survivor.
- Edit representative numeric, checkbox, and selection controls.

Acceptance criteria:

- Created survivors appear in the survivor table and persist in the database.
- Updated survival, insanity, attributes, armor damage, and statuses persist.
- Invalid numeric edits are blocked or rolled back.

#### UI-008 - Hunt to Showdown to Settlement Phase Happy Path

**Milestone:** Core Gameplay Loop

Scope:

- Cover
  [`components/hunt/create-hunt/create-hunt-card.tsx`](../components/hunt/create-hunt/create-hunt-card.tsx),
  [`components/hunt/active-hunt/active-hunt-card.tsx`](../components/hunt/active-hunt/active-hunt-card.tsx),
  [`components/showdown/active-showdown/active-showdown-card.tsx`](../components/showdown/active-showdown/active-showdown-card.tsx),
  and
  [`components/settlement-phase/settlement-phase-card.tsx`](../components/settlement-phase/settlement-phase-card.tsx).
- Seed an eligible settlement with four survivors and sufficient gear.

Acceptance criteria:

- Hunt creation persists hunt, monsters, hunt board, survivors, and AI deck.
- Proceeding to showdown clears the hunt and creates showdown records.
- Proceeding to settlement phase clears showdown and creates returning survivor
  records.

### P1 Issues

#### UI-009 - Sharing Negative Paths and Paywall

**Milestone:** Sharing and Collaboration

Scope:

- Cover invalid username, unknown username, self-invite, duplicate invite, free
  owner paywall, and RLS-shaped insert failures.
- Cover
  [`components/settlement/sharing/upsell-modal.tsx`](../components/settlement/sharing/upsell-modal.tsx).

Acceptance criteria:

- Each negative path shows the intended themed message.
- Free owners see the upsell affordance instead of a usable invite form.
- Failed invite does not leave stale optimistic collaborators.

#### UI-010 - Sharing Revoke and Unshare Blockers

**Milestone:** Sharing and Collaboration

Scope:

- Cover successful revocation and blocked revocation through
  [`components/settlement/sharing/unshare-blockers-dialog.tsx`](../components/settlement/sharing/unshare-blockers-dialog.tsx).
- Use a collaborator with custom content attached to the shared settlement for
  blocker scenarios.

Acceptance criteria:

- Successful revoke removes access for collaborator context.
- Blocked revoke opens the blockers dialog and does not delete share rows.

#### UI-011 - Collaborator Permissions in Browser

**Milestone:** Sharing and Collaboration

Scope:

- Log in as collaborator on a shared settlement.
- Verify owner-only controls are absent for settlement settings, sharing, and
  destructive settlement actions.
- Verify collaborator can perform allowed gameplay edits.

Acceptance criteria:

- Collaborator can edit settlement child gameplay data.
- Collaborator cannot rename/delete/share the settlement through the UI.
- Database state matches the visible permission model.

#### UI-012 - Hunt Validation and Rollback

**Milestone:** Core Gameplay Loop

Scope:

- Cover active showdown conflict, no survivors, scout required, scout conflict,
  dead/retired/skip-next-hunt survivors, and gear shortage validation.
- Force one hunt board update failure.

Acceptance criteria:

- Invalid embark attempts do not create hunt records.
- Gear shortage message lists missing gear.
- Failed board update rolls visible board state back.

#### UI-013 - Showdown Creation and Active Controls

**Milestone:** Core Gameplay Loop

Scope:

- Cover standalone showdown creation from quarries and nemeses.
- Cover special showdown handoff from settlement phase.
- Cover active showdown turn controls, monster attributes, survivor rows, and
  cancel dialog.

Acceptance criteria:

- Regular and special showdowns persist correct type, ambush, turn, monsters,
  survivors, and scout state.
- Failed active showdown mutation rolls back.

#### UI-014 - Settlement Phase Board and Actions

**Milestone:** Settlement Phase, Crafting, and Economy

Scope:

- Cover board step movement and action buttons for survivors return, update
  death count, special showdown, and end phase.
- Cover contextual tabs shown during Develop.

Acceptance criteria:

- Step changes persist and roll back on failure.
- Special showdown action switches to the showdown tab and resumes settlement
  phase afterward.

#### UI-015 - Crafting and Resource Economy

**Milestone:** Settlement Phase, Crafting, and Economy

Scope:

- Cover
  [`components/settlement/resources/resources-card.tsx`](../components/settlement/resources/resources-card.tsx),
  [`components/settlement/gear/gear-card.tsx`](../components/settlement/gear/gear-card.tsx),
  and
  [`components/crafting/craft-item-dialog.tsx`](../components/crafting/craft-item-dialog.tsx).
- Seed resources and craft a representative gear item.

Acceptance criteria:

- Crafting consumes required resources and adds gear stock.
- Insufficient resources block crafting.
- Resource counts cannot become negative.

#### UI-016 - Gear Grid and Survivor Loadout

**Milestone:** Survivor Management

Scope:

- Cover
  [`components/survivor/gear-grid/gear-grid-card.tsx`](../components/survivor/gear-grid/gear-grid-card.tsx)
  and picker dialog.
- Equip, move, remove, and persist gear.
- Cover long-press/touch behavior where practical.

Acceptance criteria:

- Gear grid persists across reload.
- Gear picker respects available settlement gear.
- Active hunt/showdown gear shortage validation sees equipped gear.

#### UI-017 - Timeline, Society, and Notes Editing

**Milestone:** Settlement Phase, Crafting, and Economy

Scope:

- Cover timeline year edits, milestone toggles, principles, innovations,
  locations, quarries, nemeses, notes, and list-card bonuses.

Acceptance criteria:

- Representative edit in each card persists and appears after reload.
- Failed mutation rolls back or shows themed fallback.

### P2 Issues

#### UI-018 - Custom Content Representative Coverage

**Milestone:** Custom Content and User Content

Scope:

- Cover one simple shared custom dialog and one complex custom dialog.
- Recommended pair: custom disorder or milestone, plus custom gear.
- Cover
  [`components/custom/custom-rules-sheet.tsx`](../components/custom/custom-rules-sheet.tsx).

Acceptance criteria:

- Create, edit, archive/delete, and in-use guard behavior are visible and
  persisted.
- Markdown preview renders sanitized user content.

#### UI-019 - User Settings and Username Changes

**Milestone:** Billing, Settings, Admin, and Cross-Device Polish

Scope:

- Cover
  [`components/settings/user-settings-card.tsx`](../components/settings/user-settings-card.tsx)
  and
  [`components/update-username-form.tsx`](../components/update-username-form.tsx).

Acceptance criteria:

- Valid username changes persist and update visible user identity.
- Invalid format and duplicate username show expected messages.

#### UI-020 - Subscription Card States

**Milestone:** Billing, Settings, Admin, and Cross-Device Polish

Scope:

- Cover
  [`components/settings/subscription-card.tsx`](../components/settings/subscription-card.tsx)
  with seeded subscription rows.
- Mock checkout and portal route responses at the browser/network boundary.

Acceptance criteria:

- Free, active, trialing, canceled, past due, incomplete, and pending
  cancellation states render the correct badges and CTAs.
- Checkout/portal errors show themed fallback.

#### UI-021 - Admin Gating Smoke

**Milestone:** Billing, Settings, Admin, and Cross-Device Polish

Scope:

- Cover admin sidebar entries and cards for admin vs regular users.
- Use existing admin role fixtures from integration coverage where possible.

Acceptance criteria:

- Admin sees adoption, development, and user-management tabs.
- Regular user cannot navigate to admin UI through sidebar or stale local state.

#### UI-022 - Notifications and Realtime Toasting

**Milestone:** Billing, Settings, Admin, and Cross-Device Polish

Scope:

- Cover
  [`components/notifications/notification-bell.tsx`](../components/notifications/notification-bell.tsx).
- Seed unread notifications and trigger one realtime notification insert.

Acceptance criteria:

- Unread badge formats correctly.
- Opening the bell marks notifications read.
- Realtime insert appears without page reload.

#### UI-023 - Mobile Navigation and Dense Controls

**Milestone:** Billing, Settings, Admin, and Cross-Device Polish

Scope:

- Add a mobile Playwright project or targeted mobile tests using an existing
  device profile.
- Cover sidebar open/close, settlement switcher, tab selection, dialogs,
  drawers, gear grid, and survivor selection drawers.

Acceptance criteria:

- Primary navigation is usable on mobile viewport.
- Dialogs/drawers are not clipped and submit controls remain reachable.

---

## 7. Coverage Matrix

| Area                   | Current Coverage         | Target Browser Coverage                                | Priority |
| ---------------------- | ------------------------ | ------------------------------------------------------ | -------- |
| Sign-up                | Playwright pilot         | Keep as regression anchor                              | P0       |
| Login/logout/session   | Minimal browser coverage | Login, invalid credentials, protected redirect, logout | P0       |
| Password reset         | Unit/API only            | Mailpit reset and update-password                      | P0       |
| Settlement creation    | Schema/unit/DAL          | Campaign matrix through UI                             | P0       |
| Settlement switcher    | Unit/DAL                 | Owned/shared selection and free limit                  | P0       |
| Settlement settings    | Unit/DAL                 | Destructive confirmations and rollback                 | P0       |
| Sharing                | Unit + integration/RLS   | Two-context invite/revoke/permissions/paywall          | P0/P1    |
| Survivor management    | Unit/DAL                 | Create/edit representative survivor state              | P0/P1    |
| Hunt                   | DAL/integration          | Create, active board, validations, transition          | P0/P1    |
| Showdown               | DAL/integration          | Create, active controls, transition                    | P0/P1    |
| Settlement phase       | DAL/integration          | Board, actions, contextual tabs                        | P1       |
| Crafting/resources     | Unit/DAL                 | Resource inventory and gear crafting                   | P1       |
| Timeline/society/notes | DAL/unit pieces          | Representative edit persistence                        | P1       |
| Custom content         | Unit/DAL                 | Representative simple + complex catalog flows          | P2       |
| Subscription UI        | Component/API unit       | Seeded plan states and route handoff                   | P2       |
| Admin UI               | Component/API unit       | Role-gated smoke                                       | P2       |
| Notifications          | Unit/integration         | Bell read/realtime behavior                            | P2       |
| Mobile/responsive      | None                     | Navigation and dense controls                          | P2       |

---

## 8. Cross-Cutting Requirements

### 8.1 CI and Runtime

- Keep UI tests in their separate CI job so unit/integration feedback remains
  fast.
- Continue using `npm run ui-test` as the only supported entrypoint for local
  and CI browser tests.
- Do not run Playwright against a developer's production or linked Supabase
  project.
- Keep local Supabase and Mailpit health checks inside the runner.

### 8.2 Reliability

- Prefer direct service-role seeding for setup and cleanup.
- Avoid arbitrary sleeps; use locator assertions, database polling helpers, and
  Mailpit polling helpers.
- Keep tests independent. No test should depend on a settlement/user created by
  a previous test.
- Use serial execution until fixture namespacing and cleanup are robust enough
  for parallel workers.

### 8.3 Error and Rollback Testing

- Each high-risk optimistic UI area should have at least one forced failure test
  using Playwright route interception or a fixture that triggers RLS denial.
- Error assertions should target app alerts/toasts, not Next route announcer
  alerts.
- Rollback tests should assert both visible state and persisted database state.

### 8.4 Multi-User and Realtime Testing

- Use separate browser contexts for owner and collaborator.
- Keep the two users' emails/usernames unique and clean both accounts after the
  test.
- Realtime tests should assert the second browser updates without
  `page.reload()`.
- If realtime is flaky under CI load, quarantine only realtime-specific cases,
  not the non-realtime sharing assertions.

### 8.5 Accessibility and Selectors

- Prefer `getByRole`, `getByLabel`, and visible command text.
- Add `aria-label` or accessible names to icon-only controls when tests reveal
  ambiguity.
- Add test ids sparingly for canvas-like boards, repeated grid cells, or custom
  controls where accessible selectors cannot uniquely express intent.

---

## 9. Open Questions

1. **Stripe UI strategy:** Should browser tests mock checkout/portal route
   responses, or should CI use Stripe test mode for a very small number of smoke
   tests?
1. **Feature flag control:** What is the preferred UI-test mechanism for forcing
   `subscription-management` on/off: env allowlist, seeded Edge Config mock, or
   route interception?
1. **Mobile CI cost:** Should mobile tests run on every PR or only as a smaller
   smoke subset?
1. **Realtime flake budget:** What timeout/retry policy is acceptable for
   two-browser realtime assertions on GitHub Actions?
1. **Custom content breadth:** Which custom content types are most valuable to
   test first beyond gear and one simple text-based catalog item?
1. **Page objects vs task helpers:** Should tests use class-style page objects
   or plain task helpers? Plain helpers match the current codebase better, but a
   formal choice will keep contributions consistent.

---

## Appendix A - UI Surface Inventory

### Public Auth Routes

- Login: [`components/login-form.tsx`](../components/login-form.tsx)
- Sign-up: [`components/sign-up-form.tsx`](../components/sign-up-form.tsx)
- Forgot password:
  [`components/forgot-password-form.tsx`](../components/forgot-password-form.tsx)
- Update password:
  [`components/update-password-form.tsx`](../components/update-password-form.tsx)
- Auth confirmation route:
  [`app/auth/confirm/route.ts`](../app/auth/confirm/route.ts)
- Auth error route: [`app/auth/error/page.tsx`](../app/auth/error/page.tsx)

### Authenticated Shell

- Root shell: [`app/page.tsx`](../app/page.tsx)
- Sidebar: [`components/app-sidebar.tsx`](../components/app-sidebar.tsx)
- Sidebar navigation: [`components/nav-main.tsx`](../components/nav-main.tsx)
- Settlement switcher:
  [`components/menu/settlement-switcher.tsx`](../components/menu/settlement-switcher.tsx)
- Main tab renderer:
  [`components/settlement/settlement-card.tsx`](../components/settlement/settlement-card.tsx)

### Settlement Tabs

- Overview:
  [`components/settlement/overview/overview-card.tsx`](../components/settlement/overview/overview-card.tsx)
- Timeline:
  [`components/settlement/timeline/timeline-card.tsx`](../components/settlement/timeline/timeline-card.tsx)
- Monsters:
  [`components/settlement/quarries/quarries-card.tsx`](../components/settlement/quarries/quarries-card.tsx),
  [`components/settlement/nemeses/nemeses-card.tsx`](../components/settlement/nemeses/nemeses-card.tsx)
- Survivors:
  [`components/settlement/survivors/settlement-survivors-card.tsx`](../components/settlement/survivors/settlement-survivors-card.tsx)
- Society: milestones, principles, innovations, locations
- Crafting: resources, gear, patterns, seed patterns
- Arc: philosophies, knowledges, collective cognition rewards and victories
- Squires: suspicions and progression cards
- Notes:
  [`components/settlement/notes/notes-card.tsx`](../components/settlement/notes/notes-card.tsx)
- Sharing:
  [`components/settlement/sharing/sharing-card.tsx`](../components/settlement/sharing/sharing-card.tsx)

### Gameplay Phases

- Hunt: [`components/hunt/hunt-card.tsx`](../components/hunt/hunt-card.tsx),
  [`components/hunt/create-hunt/create-hunt-card.tsx`](../components/hunt/create-hunt/create-hunt-card.tsx),
  [`components/hunt/active-hunt/active-hunt-card.tsx`](../components/hunt/active-hunt/active-hunt-card.tsx)
- Showdown:
  [`components/showdown/showdown-card.tsx`](../components/showdown/showdown-card.tsx),
  [`components/showdown/create-showdown/create-showdown-card.tsx`](../components/showdown/create-showdown/create-showdown-card.tsx),
  [`components/showdown/active-showdown/active-showdown-card.tsx`](../components/showdown/active-showdown/active-showdown-card.tsx)
- Settlement phase:
  [`components/settlement-phase/settlement-phase-card.tsx`](../components/settlement-phase/settlement-phase-card.tsx)

### User, Settings, Billing, Admin

- User content:
  [`components/user/user-card.tsx`](../components/user/user-card.tsx)
- User settings:
  [`components/settings/user-settings-card.tsx`](../components/settings/user-settings-card.tsx)
- Settlement settings:
  [`components/settings/settlement-settings-card.tsx`](../components/settings/settlement-settings-card.tsx)
- Subscription:
  [`components/settings/subscription-card.tsx`](../components/settings/subscription-card.tsx)
- Admin adoption:
  [`components/settings/admin-adoption-card.tsx`](../components/settings/admin-adoption-card.tsx)
- Admin development:
  [`components/settings/admin-development-card.tsx`](../components/settings/admin-development-card.tsx)
- Admin user management:
  [`components/settings/admin-user-management-card.tsx`](../components/settings/admin-user-management-card.tsx)

### Custom Content

- Custom catalog cards live under [`components/custom`](../components/custom)
  and include gear, resources, innovations, patterns, seed patterns, milestones,
  principles, disorders, fighting arts, secret fighting arts, abilities and
  impairments, survivor statuses, weapon types, philosophies, neuroses,
  knowledges, collective cognition rewards, wanderers, monsters, traits, moods,
  locations, characters, archived catalog, and rules sheets.

---

## Appendix B - Edge Case Catalog

### Authentication

- Duplicate confirmed email.
- Duplicate unconfirmed email idempotency.
- Weak password requirements.
- Username format and duplicate username.
- Expired, reused, or malformed email links.
- Mailpit unavailable.
- Supabase Auth temporary failure.

### Settlement Lifecycle

- Free-tier settlement limit.
- Campaign template fetch failure.
- Squires campaign disables monster and scout selections.
- People of the Dream Keeper locks survivor type and scout selection.
- Empty settlement name.
- Delete settlement with active hunt, showdown, or settlement phase.

### Sharing

- Free owner paywall.
- Self-invite.
- Invalid username format.
- Unknown/rate-limited username lookup.
- Duplicate collaborator invite.
- Revoke blocked by collaborator-owned custom content.
- Collaborator loses access while viewing the settlement.
- Owner and collaborator edit the same gameplay area concurrently.

### Survivor Management

- Negative numeric values.
- Core vs arc fighting art limits.
- Duplicate fighting arts/disorders/gear.
- Dead, retired, or skip-next-hunt survivors excluded from embark.
- Wanderer defaults and campaign-specific special fields.
- Gear grid persistence and availability conflicts.

### Hunt and Showdown

- Hunt already active or showdown already active.
- Scout required and scout conflict.
- Gear shortage on embark and before hunt-to-showdown transition.
- Multi-monster carousel state.
- Alternate/vignette monster unlock gating.
- Cancel hunt/showdown confirmation.
- Special showdown resumes existing settlement phase.

### Settlement Phase and Economy

- Settlement phase absent empty state.
- Settlement phase step rollback.
- Endeavor/resource quantity cannot go below zero.
- Insufficient crafting resources.
- Pattern or seed pattern craft failure rollback.
- Death count and milestone-triggered state changes.

### Billing and Admin

- Duplicate checkout attempt.
- Portal unavailable.
- Canceled/past-due/incomplete subscription CTAs.
- Non-admin stale local state attempting admin tabs.
- Admin user deletion of self blocked.
