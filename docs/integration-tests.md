# Integration Tests

These tests exercise real Supabase auth and **Row Level Security** policies
against the local Supabase CLI stack. They do **not** mock `@/lib/supabase/*`.

## Prerequisites

1. Supabase CLI installed (`brew install supabase/tap/supabase`).
2. Stack running:

   ```bash
   supabase start
   ```

3. Export the local keys:

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
npm run test:integration
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
