#!/usr/bin/env bash
#
# Run the integration test suite against a local Supabase stack.
#
# - Starts Supabase if it isn't already running (idempotent).
# - Exports the local URL + keys under the names the test helpers expect
#   (see __tests__/integration/helpers/supabase.ts).
# - Runs vitest against vitest.integration.config.ts and forwards any extra
#   CLI arguments (e.g. `npm run integration-test -- path/to/one.test.ts`).
set -euo pipefail

# Boot Supabase. `supabase start` is a no-op if the stack is already up.
npx supabase start >/dev/null

# `supabase status -o env` emits KEY="value" lines. Capture first, then
# source — piping directly via process substitution can cause npx to emit a
# spurious SIGPIPE warning when the reader closes early.
status_env="$(npx supabase status -o env)"
set -a
# shellcheck disable=SC1090
source /dev/stdin <<<"${status_env}"
set +a

export SUPABASE_URL="${API_URL}"
export SUPABASE_ANON_KEY="${ANON_KEY}"
export SUPABASE_SERVICE_ROLE_KEY="${SERVICE_ROLE_KEY}"

npx vitest run --config vitest.integration.config.ts "$@"
