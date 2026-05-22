# UI Tests

Browser UI tests use Playwright against the real Next.js app, the local Supabase
stack, and Supabase CLI's Mailpit server. They are intended for flows where the
user experience, browser code, Auth, database provisioning, and email capture
all need to move together.

## Run Locally

```bash
npm run ui-test
```

The runner temporarily overrides Supabase Auth SMTP to `inbucket:1025` with
local-only dummy credentials, starts Supabase if needed, reads
`supabase status -o env`, exports the app's public Supabase variables, verifies
Supabase Auth and Mailpit are reachable, and then starts a Next.js dev server
through Playwright's `webServer` configuration. It restores
`supabase/config.toml` when the command exits, whether the tests pass or fail.
If a local Supabase stack is already running with a different SMTP host, the
runner restarts it so the Mailpit override is applied.

Install the Chromium browser once on a fresh machine:

```bash
npx playwright install chromium
```

Pass Playwright arguments after `--`:

```bash
npm run ui-test -- __tests__/ui/auth-sign-up.test.ts --headed
```

## Sign-Up Pilot Coverage

The pilot spec in `__tests__/ui/auth-sign-up.test.ts` covers:

- Happy-path email sign-up, success-page navigation, auth user creation,
  `user_settings` provisioning, `user_subscription` provisioning, and Mailpit
  confirmation-email capture.
- Weak-password errors returned by Supabase Auth.
- Username conflicts caught by `check_username_available` before auth user
  creation.
- Confirmed-email conflicts returned by Supabase Auth.
- Supabase RPC failures surfaced in the inline form alert.

## CI

The `UI Tests (Playwright)` job in
`.github/workflows/continuous-integration.yml` runs on every pull request to
`main` as a GitHub Actions matrix. The current matrix runs the same small suite
against `desktop-chromium` and `mobile-chromium` in parallel on separate
runners, so each project gets its own Supabase stack, Mailpit instance, and
Next.js dev server.

Each matrix entry installs dependencies and the Chromium browser, then runs
`npm run ui-test -- --project=<project>`. The script owns the temporary SMTP
override, Supabase startup, local API/key/Mailpit environment export, service
verification, and config restoration so the same command works locally and in
CI.
