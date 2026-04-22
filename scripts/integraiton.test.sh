# Set up integration test environment
npx supabase start
eval "$(npx supabase status -o env | awk -F= '{print "export "$1"="$2}')"
vitest run --config vitest.integration.config.ts
