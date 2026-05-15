# Integration Tests

These tests exercise real Supabase auth and **Row Level Security** policies
against the local Supabase CLI stack. They do **not** mock `@/lib/supabase/*`.

## Prerequisites

1. Supabase CLI installed (`brew install supabase/tap/supabase`).
1. Stack running:

   ```bash
   supabase start
   ```

1. Export the local keys:

   ```bash
   eval "$(npx supabase status -o env | awk -F= '{print "export "$1"="$2}')"
   ```

   ```bash
   export SUPABASE_URL=http://127.0.0.1:54321
   export SUPABASE_ANON_KEY=<anon key from `supabase status`>
   export SUPABASE_SERVICE_ROLE_KEY=<service_role key from `supabase status`>
   ```

   > The service-role key is used **only** for fixture setup/teardown (creating
   > throwaway users, seeding rows). It is never imported from application code.

## Run

```bash
npm run integration-test
```

Tests use `fileParallelism: false` because each file owns its schema fixtures.

## Pattern Overview

All RLS policies in this codebase follow one of four templates:

- **A — Settlement-scoped**:
  `exists (select 1 from settlement where id = settlement_id and user_id = auth.uid())`.
- **A′ — Survivor-scoped**: as above, joined through `survivor`.
- **B — Custom content**: `not custom` is globally readable; `custom` is gated
  by `user_id = auth.uid()` or a share row.
- **C — Nested entity**: gated through the parent (`quarry`, `nemesis`,
  `wanderer`).
- **D — User-scoped**: `user_id = auth.uid()` on the row itself (only
  `user_settings`).

Each test file targets one pattern so a failure points directly at the class of
policy that regressed.

## Coverage Tool

The repo ships a lightweight static cross-reference tool that reports which RLS
policies (by `table × command` cell) are exercised by the integration suite. It
is **not** a runtime instrumentation tool and does not require the Supabase
stack to be running.

```bash
npm run rls:coverage
```

Add `--json` for machine-readable output, or `--strict` to exit `1` when any
cell is uncovered:

```bash
npm run rls:coverage -- --json
npm run rls:coverage -- --strict
```

### What it measures

1. Walks `supabase/migrations/*.sql` and harvests every
   `create policy ... on <table-name> for <cmd-name>` (handling `drop policy` /
   `drop table` and dynamic `do $$ ... execute format(...)` array loops).
1. Walks `__tests__/integration/rls/*.test.ts` and detects table references in
   two passes:
   - **Exact**: literal `.from('<table>').<select|insert|update|upsert|delete>`
     gives a precise `(table, cmd)` touch.
   - **Indirect**: any `'<known-table>'` string literal anywhere in the test
     file. This catches the very common pattern where a test loops over an array
     of table names. The command cannot be statically determined, so the touch
     is recorded under `'*'` and the cell is reported as "indirect-only"
     coverage.
1. Reports per-cell coverage, lists tables that were never touched, and notes
   indirect-only cells (which deserve a follow-up exact assertion if a
   regression would otherwise be invisible).

### Limitations

- Cell coverage proves that **some** test exercises `(table, cmd)` — it does NOT
  prove every distinct policy branch was hit. For per-branch coverage, layer in
  a manifest of `(table, policy)` → test files and reconcile against
  `pg_policies` at runtime.
- `Allow all for admin` policies are gated by `is_admin()` and bypassed by
  `service_role`. Integration tests deliberately run as authenticated anon-key
  clients, so these policies are unreachable through the tested surface and are
  excluded from the matrix.
- The parser uses regex against migration SQL, so unusual `create policy`
  formatting may slip past it. Differences vs. live `pg_policies` (visible by
  running both side-by-side) are typically a handful and limited to admin
  policies; user-facing policies have been validated against the live DB.
