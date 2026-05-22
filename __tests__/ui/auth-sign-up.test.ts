import {
  clearMailpitMessages,
  extractConfirmationUrl,
  waitForMessageTo
} from '@/__tests__/ui/helpers/mailpit'
import {
  admin,
  createConfirmedUserFixture,
  deleteUsersByEmail,
  findAuthUserByEmail,
  waitForAuthUserByEmail
} from '@/__tests__/ui/helpers/supabase'
import { expect, type Page, test } from '@playwright/test'

interface SignUpAccount {
  email: string
  password: string
  username: string
}

test.describe('sign-up flow', () => {
  const emailsToDelete = new Set<string>()
  const formAlert = (page: Page) => page.locator('[data-slot="alert"]')

  test.beforeEach(async () => {
    await clearMailpitMessages()
  })

  test.afterEach(async () => {
    await deleteUsersByEmail(emailsToDelete)
    emailsToDelete.clear()
    await clearMailpitMessages()
  })

  test('creates a user, provisions defaults, and sends a confirmation email', async ({
    page
  }) => {
    const account = createAccount('happy')
    emailsToDelete.add(account.email)

    await submitSignUp(page, account)

    await expect(page).toHaveURL(/\/auth\/sign-up-success$/)
    await expect(page.getByText('A spark has been struck.')).toBeVisible()

    const user = await waitForAuthUserByEmail(account.email)
    const { data: settings, error: settingsError } = await admin
      .from('user_settings')
      .select('username')
      .eq('user_id', user.id)
      .single()
    expect(settingsError).toBeNull()
    expect(settings?.username).toBe(account.username)

    const { data: subscription, error: subscriptionError } = await admin
      .from('user_subscription')
      .select('plan_id, status')
      .eq('user_id', user.id)
      .single()
    expect(subscriptionError).toBeNull()
    expect(subscription).toEqual({ plan_id: 'free', status: 'active' })

    const message = await waitForMessageTo(account.email, {
      subjectIncludes: 'Welcome, Survivor'
    })
    const confirmationUrl = extractConfirmationUrl(message.detail)

    expect(JSON.stringify(message.detail)).toContain('Confirm Email')
    expect(confirmationUrl).toContain('/auth/v1/verify')
    expect(decodeURIComponent(confirmationUrl)).toContain('/auth/confirm')
  })

  test('surfaces weak password errors from Supabase Auth', async ({ page }) => {
    const account = { ...createAccount('weak'), password: 'password' }
    emailsToDelete.add(account.email)

    await submitSignUp(page, account)

    await expect(page).toHaveURL(/\/auth\/sign-up$/)
    await expect(formAlert(page)).toContainText(/password/i)
    expect(await findAuthUserByEmail(account.email)).toBeNull()
  })

  test('blocks duplicate usernames before creating the auth user', async ({
    page
  }) => {
    const existingAccount = createAccount('taken')
    const account = {
      ...createAccount('dupeuser'),
      username: existingAccount.username
    }
    emailsToDelete.add(existingAccount.email)
    emailsToDelete.add(account.email)

    await createConfirmedUserFixture(existingAccount)
    await submitSignUp(page, account)

    await expect(page).toHaveURL(/\/auth\/sign-up$/)
    await expect(formAlert(page)).toHaveText('Username is already in use')
    expect(await findAuthUserByEmail(account.email)).toBeNull()
  })

  test('surfaces duplicate email errors for existing confirmed users', async ({
    page
  }) => {
    const existingAccount = createAccount('email')
    const account = { ...createAccount('fresh'), email: existingAccount.email }
    emailsToDelete.add(existingAccount.email)

    await createConfirmedUserFixture(existingAccount)
    await submitSignUp(page, account)

    await expect(page).toHaveURL(/\/auth\/sign-up$/)
    await expect(formAlert(page)).toHaveText('User already registered')
  })

  test('surfaces Supabase RPC exceptions without creating a user', async ({
    page
  }) => {
    const account = createAccount('rpcfail')
    emailsToDelete.add(account.email)

    await page.route(
      '**/rest/v1/rpc/check_username_available',
      async (route) => {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'E2E_RPC_FAILURE',
            message: 'The username oracle has gone dark.'
          })
        })
      }
    )

    await submitSignUp(page, account)

    await expect(page).toHaveURL(/\/auth\/sign-up$/)
    await expect(formAlert(page)).toHaveText(
      'The darkness swallows your words. Please try again.'
    )
    expect(await findAuthUserByEmail(account.email)).toBeNull()
  })
})

function createAccount(prefix: string): SignUpAccount {
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 10)

  return {
    email: `e2e-${prefix}-${suffix}@example.test`,
    password: 'ValidPass1!',
    username: `${prefix}_${suffix}`.slice(0, 20)
  }
}

async function submitSignUp(page: Page, account: SignUpAccount): Promise<void> {
  await page.goto('/auth/sign-up')

  await expect(page.getByText('Begin your chronicle.')).toBeVisible()
  await page.getByLabel('Email').fill(account.email)
  await page.getByLabel('Username').fill(account.username)
  await page.getByLabel('Password', { exact: true }).fill(account.password)
  await page.getByLabel('Repeat Password').fill(account.password)
  await page.getByRole('button', { name: /^Sign up$/ }).click()
}
