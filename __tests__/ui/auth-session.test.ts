import {
  assertAuthenticatedShell,
  assertProtectedRouteRedirectsToLogin,
  createAuthAccount,
  createConfirmedAuthAccount,
  logIn,
  logOut
} from '@/__tests__/ui/helpers/auth'
import { deleteUsersByEmail } from '@/__tests__/ui/helpers/supabase'
import { test } from '@playwright/test'

test.describe('auth session flow', () => {
  const emailsToDelete = new Set<string>()

  test.afterEach(async () => {
    await deleteUsersByEmail(emailsToDelete)
    emailsToDelete.clear()
  })

  test('logs in a confirmed user, persists the session, and logs out', async ({
    page
  }) => {
    const account = createAuthAccount('session')
    emailsToDelete.add(account.email)

    await createConfirmedAuthAccount(account)
    await assertProtectedRouteRedirectsToLogin(page)

    await logIn(page, account)
    await page.reload()
    await assertAuthenticatedShell(page)

    await logOut(page)
    await assertProtectedRouteRedirectsToLogin(page)
  })
})
