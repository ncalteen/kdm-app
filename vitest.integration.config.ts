import { defineConfig } from 'vitest/config'

/**
 * Vitest Integration Config
 *
 * Runs the integration-test suite against the local Supabase CLI stack
 * (http://127.0.0.1:54321). These tests use real auth + real RLS and MUST
 * NOT mock `@/lib/supabase/client`.
 *
 * Usage:
 *   supabase start
 *   npm run test:integration
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  test: {
    environment: 'node',
    include: ['__tests__/integration/**/*.test.{ts,tsx}'],
    exclude: ['.next', 'node_modules', 'out'],
    testTimeout: 20_000,
    hookTimeout: 30_000,
    fileParallelism: false,
    sequence: { concurrent: false },
    coverage: { enabled: false },
    reporters: ['default']
  }
})
