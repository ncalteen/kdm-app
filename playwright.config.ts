import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000'
const base = new URL(baseURL)
const serverHost = base.hostname
const serverPort = base.port || (base.protocol === 'https:' ? '443' : '80')

export default defineConfig({
  testDir: '__tests__/ui',
  testMatch: '*.test.ts',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: `npx next dev --hostname ${serverHost} --port ${serverPort}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.SUPABASE_URL ??
        'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.SUPABASE_ANON_KEY ??
        '',
      SUPABASE_URL:
        process.env.SUPABASE_URL ??
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        'http://127.0.0.1:54321',
      SUPABASE_SECRET_KEY:
        process.env.SUPABASE_SECRET_KEY ??
        process.env.SUPABASE_SERVICE_ROLE_KEY ??
        '',
      SUBSCRIPTION_ALLOWLIST: process.env.SUBSCRIPTION_ALLOWLIST ?? ''
    }
  },
  timeout: 30_000,
  expect: { timeout: 10_000 }
})
