#!/usr/bin/env bash
#
# Run browser UI tests against a local Supabase stack and captured-mail server.
# Configures Supabase to use Mailpit for email delivery during tests, and
# restores the original configuration on exit.
set -euo pipefail

config_path="supabase/config.toml"
config_backup="$(mktemp)"
project_id="$(awk -F' = ' '$1 == "project_id" {gsub(/"/, "", $2); print $2; exit}' "${config_path}")"

cp "${config_path}" "${config_backup}"

# Restores the original Supabase configuration on exit.
restore_config() {
	local exit_code=$?
	set +e

	if [[ -f "${config_backup}" ]]; then
		if ! node scripts/ui-test-restore-supabase-smtp.mjs "${config_path}" "${config_backup}"; then
			if ! cp "${config_backup}" "${config_path}"; then
				echo "Failed to restore ${config_path}" >&2
				exit_code=1
			fi
		fi
		rm -f "${config_backup}"
	fi

	exit "${exit_code}"
}
trap restore_config EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

node scripts/ui-test-configure-supabase-mailpit.mjs "${config_path}"

if command -v docker >/dev/null 2>&1 &&
	docker inspect "supabase_auth_${project_id}" >/dev/null 2>&1; then
	smtp_host="$(docker inspect "supabase_auth_${project_id}" --format '{{range .Config.Env}}{{println .}}{{end}}' | awk -F'=' '/^GOTRUE_SMTP_HOST=/ {print $2}')"
	if [[ "${smtp_host}" != "inbucket" ]]; then
		npx supabase stop >/dev/null
	fi
fi

# `supabase start` is idempotent when the stack is already running.
npx supabase start >/dev/null

status_env="$(npx supabase status -o env)"
set -a
# shellcheck disable=SC1090
source /dev/stdin <<<"${status_env}"
set +a

export SUPABASE_URL="${API_URL}"
export SUPABASE_ANON_KEY="${ANON_KEY}"
export SUPABASE_SERVICE_ROLE_KEY="${SERVICE_ROLE_KEY}"
export SUPABASE_SECRET_KEY="${SECRET_KEY:-${SERVICE_ROLE_KEY}}"
export NEXT_PUBLIC_SUPABASE_URL="${API_URL}"
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="${PUBLISHABLE_KEY:-${ANON_KEY}}"
export MAILPIT_URL="${MAILPIT_URL:-${INBUCKET_URL:-http://127.0.0.1:54324}}"
export PLAYWRIGHT_BASE_URL="${PLAYWRIGHT_BASE_URL:-http://127.0.0.1:3000}"

node scripts/ui-test-verify-endpoint.mjs \
	"Supabase Auth" \
	"${SUPABASE_URL}/auth/v1/health"

node scripts/ui-test-verify-endpoint.mjs \
	"Mailpit" \
	"${MAILPIT_URL}/api/v1/messages"

npx playwright test "$@"
