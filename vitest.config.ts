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
      // Exclude integration tests from unit test runs
      '__tests__/integration/**',
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
        'src/**/*.d.ts',
        'src/**/layout.tsx',
        'src/**/globals.css'
      ]
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'reports/vitest-junit.xml'
    }
  }
})
