import {
  createConfirmedUserFixture,
  type ConfirmedUserFixture
} from '@/__tests__/ui/helpers/supabase'
import { expect, type Page } from '@playwright/test'
import { type User } from '@supabase/supabase-js'

/** Auth Account Fixture */
export type AuthAccount = ConfirmedUserFixture

/**
 * Create Auth Account
 *
 * Builds a unique auth account fixture for UI tests.
 *
 * @param prefix Account Prefix
 * @returns Auth Account Fixture
 */
export function createAuthAccount(prefix: string): AuthAccount {
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 10)

  return {
    email: `e2e-${prefix}-${suffix}@example.test`,
    password: 'ValidPass1!',
    username: `${prefix}_${suffix}`.slice(0, 20)
  }
}

/**
 * Create Confirmed Auth Account
 *
 * Creates a confirmed auth user with the application default user rows.
 *
 * @param account Auth Account Fixture
 * @returns Created Auth User
 */
export async function createConfirmedAuthAccount(
  account: AuthAccount
): Promise<User> {
  return createConfirmedUserFixture(account)
}

/**
 * Assert Login Page
 *
 * @param page Playwright Page
 */
export async function assertLoginPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/auth\/login$/)
  await expect(page.getByText('Welcome back, survivor.')).toBeVisible()
}

/**
 * Log In
 *
 * Logs in through the public email/password login form.
 *
 * @param page Playwright Page
 * @param account Auth Account Fixture
 */
export async function logIn(page: Page, account: AuthAccount): Promise<void> {
  await page.goto('/auth/login')
  await assertLoginPage(page)

  await page.getByLabel('Email').fill(account.email)
  await page.getByLabel('Password').fill(account.password)
  await page.getByRole('button', { name: /^Login$/ }).click()

  await assertAuthenticatedShell(page)
}

/**
 * Log Out
 *
 * Logs out through the sign-out route and verifies the login redirect.
 *
 * @param page Playwright Page
 */
export async function logOut(page: Page): Promise<void> {
  await page.goto('/auth/sign-out')
  await assertLoginPage(page)
}

/**
 * Assert Authenticated Shell
 *
 * Verifies that the authenticated app shell has rendered for a user with no
 * selected settlement.
 *
 * @param page Playwright Page
 */
export async function assertAuthenticatedShell(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByText('The lantern is unlit.')).toBeVisible()
}

/**
 * Assert Protected Route Redirects To Login
 *
 * @param page Playwright Page
 */
export async function assertProtectedRouteRedirectsToLogin(
  page: Page
): Promise<void> {
  await page.goto('/')
  await assertLoginPage(page)
}
