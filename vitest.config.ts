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
      include: ['lib/settlement/**/*.ts', 'src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        '.next',
        'dist',
        'node_modules',
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
