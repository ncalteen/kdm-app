import {
  assertLoginPage,
  createAuthAccount,
  createConfirmedAuthAccount,
  logOut,
  type AuthAccount
} from '@/__tests__/ui/helpers/auth'
import {
  createNotificationFixture,
  getUnreadNotificationCountFixture,
  getUsernameFixture,
  notificationIsReadFixture,
  setAdminRoleFixture,
  setSubscriptionFixture,
  setUsernameRenamedAtFixture
} from '@/__tests__/ui/helpers/account-surfaces'
import { createSettlementFixture } from '@/__tests__/ui/helpers/settlement'
import { deleteUsersByEmail } from '@/__tests__/ui/helpers/supabase'
import { LOCAL_STORAGE_KEY } from '@/lib/common'
import { TabType } from '@/lib/enums'
import {
  ERROR_MESSAGE,
  USERNAME_INVALID_FORMAT_MESSAGE,
  USERNAME_RENAME_SUCCESS_MESSAGE
} from '@/lib/messages'
import { expect, type Page, test } from '@playwright/test'

test.describe('account and device surfaces', () => {
  const emailsToDelete = new Set<string>()

  test.afterEach(async () => {
    await deleteUsersByEmail(emailsToDelete)
    emailsToDelete.clear()
  })

  test('updates usernames and rejects invalid or duplicate names', async ({
    page
  }) => {
    const existingAccount = createAuthAccount('settings_taken')
    const existingUser = await createConfirmedAuthAccount(existingAccount)
    emailsToDelete.add(existingAccount.email)

    const account = createAuthAccount('settings_user')
    const user = await createConfirmedAuthAccount(account)
    emailsToDelete.add(account.email)
    await setUsernameRenamedAtFixture({ renamedAt: null, userId: user.id })

    await openAccountTab(page, account, TabType.SETTINGS)
    await page.getByLabel('Username').fill('no spaces')
    await expect(
      page.getByText(USERNAME_INVALID_FORMAT_MESSAGE())
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Save new name' })
    ).toBeDisabled()

    const newUsername = `renamed_${crypto.randomUUID().replaceAll('-', '').slice(0, 8)}`
    await page.getByLabel('Username').fill(newUsername)
    await expect(page.getByText('This name is yours to take.')).toBeVisible()
    await page.getByRole('button', { name: 'Save new name' }).click()
    await expect(
      page.getByText(USERNAME_RENAME_SUCCESS_MESSAGE())
    ).toBeVisible()
    await expect.poll(() => getUsernameFixture(user.id)).toBe(newUsername)

    await logOut(page)
    const duplicateAccount = createAuthAccount('settings_dup')
    await createConfirmedAuthAccount(duplicateAccount)
    emailsToDelete.add(duplicateAccount.email)
    await openAccountTab(page, duplicateAccount, TabType.SETTINGS)
    await page.getByLabel('Username').fill(existingAccount.username)
    await expect(
      page.getByText('Another survivor already answers to this name.')
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Save new name' })
    ).toBeDisabled()
    expect(existingUser.id).toBeTruthy()
  })

  test('renders subscription states and handles billing route failures', async ({
    page
  }) => {
    const account = createAuthAccount('billing')
    const user = await createConfirmedAuthAccount(account)
    emailsToDelete.add(account.email)

    await openAccountTab(page, account, TabType.SUBSCRIPTION)
    await expect(
      page.locator('[data-plan="free"][data-current="true"]')
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Light a Lantern — $1 / month' })
    ).toBeVisible()

    await mockBillingFailure(page, 'checkout')
    await page
      .getByRole('button', { name: 'Light a Lantern — $1 / month' })
      .click()
    await expect(page.getByText(ERROR_MESSAGE())).toBeVisible()

    const periodEnd = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString()
    await setSubscriptionFixture({
      currentPeriodEnd: periodEnd,
      planId: 'lantern',
      status: 'active',
      userId: user.id
    })
    await selectAccountTab(page, TabType.SUBSCRIPTION)
    await expect(page.getByText('Active')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Manage subscription' })
    ).toBeVisible()

    await mockBillingFailure(page, 'portal')
    await page.getByRole('button', { name: 'Manage subscription' }).click()
    await expect(page.getByText(ERROR_MESSAGE())).toBeVisible()

    await assertSubscriptionBadge(page, user.id, 'trialing', 'Trial')
    await assertSubscriptionBadge(page, user.id, 'past_due', 'Payment Past Due')
    await assertSubscriptionBadge(page, user.id, 'incomplete', 'Incomplete')
    await assertSubscriptionBadge(page, user.id, 'canceled', 'Canceled')
    await setSubscriptionFixture({
      cancelAtPeriodEnd: true,
      currentPeriodEnd: periodEnd,
      planId: 'lantern',
      status: 'active',
      userId: user.id
    })
    await selectAccountTab(page, TabType.SUBSCRIPTION)
    await expect(page.getByText('Ending')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Rekindle the lantern' })
    ).toBeVisible()
  })

  test('gates admin navigation for regular and admin users', async ({
    page
  }, testInfo) => {
    const regularAccount = createAuthAccount('regular_gate')
    await createConfirmedAuthAccount(regularAccount)
    emailsToDelete.add(regularAccount.email)

    await openAccountTab(page, regularAccount, TabType.ADMIN_ADOPTION)
    await expect(page.getByRole('button', { name: 'Adoption' })).toBeHidden()
    await expect(page.getByText('The lantern is unlit.')).toBeVisible()

    await logOut(page)
    const adminAccount = createAuthAccount('admin_gate')
    const adminUser = await createConfirmedAuthAccount(adminAccount)
    emailsToDelete.add(adminAccount.email)
    await setAdminRoleFixture(adminUser.id)

    await openAccountTab(page, adminAccount, TabType.ADMIN_ADOPTION)
    await expect(page.getByRole('heading', { name: 'Adoption' })).toBeVisible()
    if (testInfo.project.name === 'mobile-chromium')
      await page.getByRole('button', { name: 'Toggle Sidebar' }).click()
    await expect(page.getByRole('button', { name: 'Adoption' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Development' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'User Management' })
    ).toBeVisible()
    await selectAccountTab(page, TabType.ADMIN_DEVELOPMENT)
    await expect(page.getByRole('main').getByText('Development')).toBeVisible()
  })

  test('shows unread notifications, marks them read, and receives realtime inserts', async ({
    page
  }) => {
    const account = createAuthAccount('notify')
    const user = await createConfirmedAuthAccount(account)
    emailsToDelete.add(account.email)
    const notificationId = await createNotificationFixture({
      payload: { owner: 'Lantern Keeper', settlement_name: 'First Watch' },
      recipientUserId: user.id
    })

    await openAccountTab(page, account, TabType.USER)
    await expect(
      page.getByRole('button', { name: '1 unread notifications' })
    ).toBeVisible()
    await page.getByRole('button', { name: '1 unread notifications' }).click()
    await expect(
      page.getByText('Lantern Keeper has invited you to First Watch.')
    ).toBeVisible()
    await page.getByRole('button', { name: 'Mark all read' }).click()
    await expect
      .poll(() => notificationIsReadFixture(notificationId))
      .toBe(true)
    await expect.poll(() => getUnreadNotificationCountFixture(user.id)).toBe(0)

    await createNotificationFixture({
      payload: { owner: 'Realtime Keeper', settlement_name: 'Realtime Camp' },
      recipientUserId: user.id
    })
    await expect(
      page.getByText('Realtime Keeper has invited you to Realtime Camp.')
    ).toBeVisible()
    await expect.poll(() => getUnreadNotificationCountFixture(user.id)).toBe(1)
  })

  test('uses mobile sidebar navigation and settlement switching', async ({
    page
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'mobile-chromium',
      'mobile-only coverage'
    )

    const account = createAuthAccount('mobile_nav')
    const user = await createConfirmedAuthAccount(account)
    emailsToDelete.add(account.email)
    const firstSettlementId = await createSettlementFixture({
      name: 'E2E Mobile First',
      userId: user.id
    })
    await createSettlementFixture({
      name: 'E2E Mobile Second',
      userId: user.id
    })

    await openAccountTab(page, account, TabType.TIMELINE, firstSettlementId)
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click()
    await expect(page.locator('[data-mobile="true"]')).toBeVisible()
    await page
      .getByRole('button', { name: 'E2E Mobile First People of the Lantern' })
      .click()
    await page.getByRole('menuitem', { name: /E2E Mobile Second/ }).click()
    await expect(
      page.getByRole('button', { name: /E2E Mobile Second/ })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Survivors' }).click()
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('button', { name: 'New Survivor' })
    ).toBeVisible()
  })
})

async function openAccountTab(
  page: Page,
  account: AuthAccount,
  selectedTab: TabType,
  selectedSettlementId: string | null = null
): Promise<void> {
  await page.goto('/auth/login')
  await page.evaluate(
    (storageKey) => localStorage.removeItem(storageKey),
    LOCAL_STORAGE_KEY
  )
  await assertLoginPage(page)
  await page.getByLabel('Email').fill(account.email)
  await page.getByLabel('Password').fill(account.password)
  await page.getByRole('button', { name: /^Login$/ }).click()
  await expect(page).toHaveURL(/\/$/)
  await selectAccountTab(page, selectedTab, selectedSettlementId)
}

async function selectAccountTab(
  page: Page,
  selectedTab: TabType,
  selectedSettlementId: string | null = null
): Promise<void> {
  await page.evaluate(
    ({ selectedSettlementId, selectedTab, storageKey }) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          selectedHuntId: null,
          selectedHuntMonsterIndex: 0,
          selectedSettlementId,
          selectedSettlementPhaseId: null,
          selectedShowdownId: null,
          selectedShowdownMonsterIndex: 0,
          selectedSurvivorId: null,
          selectedTab
        })
      )
    },
    { selectedSettlementId, selectedTab, storageKey: LOCAL_STORAGE_KEY }
  )
  await page.reload()
}

async function mockBillingFailure(
  page: Page,
  routeName: 'checkout' | 'portal'
): Promise<void> {
  await page.route(`**/api/billing/${routeName}`, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'E2E billing failure' })
    })
  })
}

async function assertSubscriptionBadge(
  page: Page,
  userId: string,
  status: 'canceled' | 'incomplete' | 'past_due' | 'trialing',
  label: string
): Promise<void> {
  await setSubscriptionFixture({
    currentPeriodEnd: new Date(
      Date.now() + 5 * 24 * 60 * 60 * 1000
    ).toISOString(),
    planId: 'lantern',
    status,
    userId
  })
  await selectAccountTab(page, TabType.SUBSCRIPTION)
  await expect(
    page
      .locator('[data-plan="lantern"][data-current="true"]')
      .getByText(label, {
        exact: true
      })
  ).toBeVisible()
}
