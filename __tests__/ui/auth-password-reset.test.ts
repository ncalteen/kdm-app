import {
  assertAuthErrorPage,
  assertLoginFailure,
  createAuthAccount,
  createConfirmedAuthAccount,
  logIn,
  logOut,
  requestPasswordReset,
  updatePassword
} from '@/__tests__/ui/helpers/auth'
import {
  clearMailpitMessages,
  extractRecoveryUrl,
  waitForMessageTo
} from '@/__tests__/ui/helpers/mailpit'
import { deleteUsersByEmail } from '@/__tests__/ui/helpers/supabase'
import { expect, test } from '@playwright/test'

test.describe('password reset flow', () => {
  const emailsToDelete = new Set<string>()

  test.beforeEach(async () => {
    await clearMailpitMessages()
  })

  test.afterEach(async () => {
    await deleteUsersByEmail(emailsToDelete)
    emailsToDelete.clear()
    await clearMailpitMessages()
  })

  test('sends a recovery email, updates the password, and rejects a reused link', async ({
    page
  }) => {
    const account = createAuthAccount('recovery')
    const updatedAccount = { ...account, password: 'NewValidPass1!' }
    emailsToDelete.add(account.email)

    await createConfirmedAuthAccount(account)

    await requestPasswordReset(page, account.email)
    const message = await waitForMessageTo(account.email, {
      subjectIncludes: 'Reset Your Password'
    })
    const recoveryUrl = extractRecoveryUrl(message.detail)

    expect(JSON.stringify(message.detail)).toContain('Reset password')
    expect(recoveryUrl).toContain('/auth/v1/verify')
    expect(decodeURIComponent(recoveryUrl)).toContain('type=recovery')
    expect(decodeURIComponent(recoveryUrl)).toContain('/auth/update-password')

    await page.goto(recoveryUrl)
    await updatePassword(page, updatedAccount.password)
    await logOut(page)

    await assertLoginFailure(page, account, 'Invalid login credentials')
    await logIn(page, updatedAccount)
    await logOut(page)

    await page.goto(recoveryUrl)
    await assertAuthErrorPage(page)
  })
})
