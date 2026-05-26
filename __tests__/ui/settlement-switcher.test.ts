import {
  createAuthAccount,
  createConfirmedAuthAccount,
  logIn
} from '@/__tests__/ui/helpers/auth'
import {
  countSettlementsForUser,
  createSettlementFixture,
  createSettlementListFixtures,
  setSubscriptionPlanFixture,
  shareSettlementFixture
} from '@/__tests__/ui/helpers/settlement'
import { deleteUsersByEmail } from '@/__tests__/ui/helpers/supabase'
import { FREE_TIER_SETTLEMENT_LIMIT } from '@/lib/common'
import { FREE_TIER_SETTLEMENT_LIMIT_MESSAGE } from '@/lib/messages'
import { expect, type Page, test } from '@playwright/test'

test.describe('settlement switcher flow', () => {
  const emailsToDelete = new Set<string>()

  test.afterEach(async () => {
    await deleteUsersByEmail(emailsToDelete)
    emailsToDelete.clear()
  })

  test('selects owned settlements and distinguishes shared settlements', async ({
    page
  }) => {
    const ownerAccount = createAuthAccount('switch_owner')
    const collaboratorAccount = createAuthAccount('switch_guest')
    emailsToDelete.add(ownerAccount.email)
    emailsToDelete.add(collaboratorAccount.email)

    const owner = await createConfirmedAuthAccount(ownerAccount)
    const collaborator = await createConfirmedAuthAccount(collaboratorAccount)
    await createSettlementFixture({
      name: 'E2E Owned Lantern',
      userId: collaborator.id
    })
    await createSettlementFixture({
      name: 'E2E Owned Sun',
      userId: collaborator.id,
      campaignType: 'PEOPLE_OF_THE_SUN'
    })
    const sharedSettlementId = await createSettlementFixture({
      name: 'E2E Shared Lantern',
      userId: owner.id
    })
    await shareSettlementFixture({
      settlementId: sharedSettlementId,
      ownerId: owner.id,
      sharedUserId: collaborator.id
    })

    await logIn(page, collaboratorAccount)
    await openSettlementSwitcher(page)

    await expect(
      page.getByRole('menuitem', { name: /E2E Owned Lantern/ })
    ).toBeVisible()
    await expect(
      page.getByRole('menuitem', { name: /E2E Owned Sun/ })
    ).toBeVisible()
    await expect(
      page.getByRole('menuitem', { name: /E2E Shared Lantern/ })
    ).toBeVisible()
    await expect(
      page.getByLabel(`Shared by @${ownerAccount.username}`)
    ).toBeVisible()

    await page.getByRole('menuitem', { name: /E2E Owned Sun/ }).click()
    await expect(settlementSwitcherTrigger(page)).toContainText('E2E Owned Sun')

    await openSettlementSwitcher(page)
    await page.getByRole('menuitem', { name: /E2E Shared Lantern/ }).click()
    await expect(settlementSwitcherTrigger(page)).toContainText(
      'E2E Shared Lantern'
    )
  })

  test('blocks free users at the settlement limit', async ({ page }) => {
    const account = createAuthAccount('limit_free')
    emailsToDelete.add(account.email)
    const user = await createConfirmedAuthAccount(account)

    await createSettlementListFixtures(
      user.id,
      'E2E Free Limit',
      FREE_TIER_SETTLEMENT_LIMIT
    )

    await logIn(page, account)

    const foundSettlement = page.getByRole('button', {
      name: 'Found a settlement'
    })
    await expect(foundSettlement).toBeDisabled()
    await foundSettlement.hover({ force: true })
    await expect(
      page.getByText(
        FREE_TIER_SETTLEMENT_LIMIT_MESSAGE(FREE_TIER_SETTLEMENT_LIMIT)
      )
    ).toBeVisible()
    await expect
      .poll(() => countSettlementsForUser(user.id))
      .toBe(FREE_TIER_SETTLEMENT_LIMIT)
  })

  test('allows paid users to create beyond the free settlement limit', async ({
    page
  }) => {
    const account = createAuthAccount('limit_paid')
    emailsToDelete.add(account.email)
    const user = await createConfirmedAuthAccount(account)

    await createSettlementListFixtures(
      user.id,
      'E2E Paid Limit',
      FREE_TIER_SETTLEMENT_LIMIT
    )
    await setSubscriptionPlanFixture(user.id, 'lantern')

    await logIn(page, account)
    await page.getByRole('button', { name: 'Found a settlement' }).click()

    await expect(page.getByText('Choose the campaign')).toBeVisible()
  })
})

async function openSettlementSwitcher(page: Page): Promise<void> {
  const mobileSidebarIsClosed =
    (page.viewportSize()?.width ?? 0) < 768 &&
    (await page.getByRole('dialog').count()) === 0

  if (mobileSidebarIsClosed) await page.locator('header button').first().click()

  await settlementSwitcherTrigger(page).click()
}

function settlementSwitcherTrigger(page: Page) {
  return page
    .locator('[data-slot="sidebar-header"]')
    .getByRole('button')
    .first()
}
