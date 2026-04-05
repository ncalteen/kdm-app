import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  test: {
    environment: 'node',
    // env: loadEnv('test', process.cwd(), ''),
    silent: 'passed-only',
    // setupFiles: ['__tests__/setup.ts'],
    clearMocks: true,
    include: ['__tests__/**/*.test.{ts,tsx}'],
    exclude: ['.next', 'local', 'node_modules', 'out'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['json-summary', 'json', 'html', 'lcov', 'text'],
      include: ['lib/**/*.{ts,tsx}'],
      exclude: [
        '.next',
        'dist',
        'node_modules',
        'lib/dal/**',
        'lib/settlement/**',
        'lib/supabase/**',
        'lib/**/*.d.ts',
        'lib/database.types.ts',
        'lib/types.ts'
      ]
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'reports/vitest-junit.xml'
    }
  }
})
