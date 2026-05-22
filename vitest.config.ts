import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  test: {
    environment: 'node',
    // env: loadEnv('test', process.cwd(), ''),
    silent: 'passed-only',
    clearMocks: true,
    include: ['__tests__/**/*.test.{ts,tsx}'],
    exclude: [
      '.next',
      // Exclude integration and UI tests from unit test runs
      '__tests__/integration/**',
      '__tests__/ui/**',
      'local',
      'node_modules',
      'out'
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['json-summary', 'json', 'html', 'lcov', 'text'],
      include: [
        'lib/**/*.{ts,tsx}',
        'schemas/**/*.{ts,tsx}',
        'src/**/*.{ts,tsx}'
      ],
      exclude: [
        '.next',
        'dist',
        'node_modules',
        'lib/**/*.d.ts',
        'lib/database.types.ts',
        'lib/types.ts',
        // Static seed data — excluded from coverage as it is a pure data
        // module rather than executable code paths to test.
        'lib/seed.ts',
        'lib/supabase/**',
        'src/**/*.d.ts',
        'src/**/layout.tsx',
        'src/**/globals.css'
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'reports/vitest-junit.xml'
    }
  }
})
