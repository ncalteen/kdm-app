import {
  createAuthAccount,
  createConfirmedAuthAccount,
  logIn
} from '@/__tests__/ui/helpers/auth'
import {
  createHuntFixture,
  createSettlementFixture,
  createSettlementPhaseFixture,
  createShowdownFixture,
  getSettlementUsesScouts,
  huntExists,
  settlementExists,
  settlementPhaseExists,
  showdownExists,
  waitForSettlementUsesScouts
} from '@/__tests__/ui/helpers/settlement'
import { deleteUsersByEmail } from '@/__tests__/ui/helpers/supabase'
import { expect, type Page, test } from '@playwright/test'

const ERROR_MESSAGE = 'The darkness swallows your words. Please try again.'

test.describe('settlement settings flow', () => {
  const emailsToDelete = new Set<string>()

  test.afterEach(async () => {
    await deleteUsersByEmail(emailsToDelete)
    emailsToDelete.clear()
  })

  test('toggles scout usage and rolls back failed updates', async ({
    page
  }) => {
    const { account, settlementId } = await createSettingsFixture('scouts')
    emailsToDelete.add(account.email)

    await openSettlementSettings(page, account, settlementId)

    const scoutsSwitch = page.getByRole('switch', { name: 'Uses Scouts' })
    await expect(scoutsSwitch).toHaveAttribute('data-state', 'unchecked')

    await scoutsSwitch.click()
    await expect(scoutsSwitch).toHaveAttribute('data-state', 'checked')
    await waitForSettlementUsesScouts(settlementId, true)

    await failNextSettlementUpdate(page)
    await scoutsSwitch.click()

    await expect(page.getByText(ERROR_MESSAGE)).toBeVisible()
    await expect(scoutsSwitch).toHaveAttribute('data-state', 'checked')
    await expect.poll(() => getSettlementUsesScouts(settlementId)).toBe(true)
  })

  test('requires confirmation before deleting an active hunt', async ({
    page
  }) => {
    const { account, settlementId } = await createSettingsFixture('hunt')
    emailsToDelete.add(account.email)
    const huntId = await createHuntFixture(settlementId)

    await openSettlementSettings(page, account, settlementId)
    await expect(page.getByText('Active Hunt')).toBeVisible()

    await expectConfirmedDeletion({
      page,
      triggerName: 'Delete Hunt',
      dialogTitle: 'Delete Hunt',
      exists: () => huntExists(huntId)
    })
    await expect(page.getByText('Active Hunt')).toBeHidden()
  })

  test('requires confirmation before deleting an active showdown', async ({
    page
  }) => {
    const { account, settlementId } = await createSettingsFixture('showdown')
    emailsToDelete.add(account.email)
    const showdownId = await createShowdownFixture(settlementId)

    await openSettlementSettings(page, account, settlementId)
    await expect(page.getByText('Active Showdown')).toBeVisible()

    await expectConfirmedDeletion({
      page,
      triggerName: 'Delete Showdown',
      dialogTitle: 'Delete Showdown',
      exists: () => showdownExists(showdownId)
    })
    await expect(page.getByText('Active Showdown')).toBeHidden()
  })

  test('requires confirmation before deleting an active settlement phase', async ({
    page
  }) => {
    const { account, settlementId } = await createSettingsFixture('phase')
    emailsToDelete.add(account.email)
    const settlementPhaseId = await createSettlementPhaseFixture(settlementId)

    await openSettlementSettings(page, account, settlementId)
    await expect(page.getByText('Active Settlement Phase')).toBeVisible()

    await expectConfirmedDeletion({
      page,
      triggerName: 'Delete Settlement Phase',
      dialogTitle: 'Delete Settlement Phase',
      exists: () => settlementPhaseExists(settlementPhaseId)
    })
    await expect(page.getByText('Active Settlement Phase')).toBeHidden()
  })

  test('requires confirmation before deleting a settlement', async ({
    page
  }) => {
    const { account, settlementId, settlementName } =
      await createSettingsFixture('delete')
    emailsToDelete.add(account.email)

    await openSettlementSettings(page, account, settlementId)

    await expectConfirmedDeletion({
      page,
      triggerName: `Delete ${settlementName}`,
      dialogTitle: 'Delete Settlement',
      exists: () => settlementExists(settlementId)
    })
    await expect(page.getByText('No Settlement Selected')).toBeVisible()
  })
})

async function createSettingsFixture(prefix: string) {
  const account = createAuthAccount(`settings_${prefix}`.slice(0, 20))
  const user = await createConfirmedAuthAccount(account)
  const settlementName = `E2E Settings ${prefix} ${crypto.randomUUID().slice(0, 8)}`
  const settlementId = await createSettlementFixture({
    name: settlementName,
    userId: user.id
  })

  return { account, settlementId, settlementName }
}

async function openSettlementSettings(
  page: Page,
  account: { email: string; password: string; username: string },
  settlementId: string
): Promise<void> {
  await logIn(page, account)
  await page.evaluate((selectedSettlementId) => {
    localStorage.setItem(
      'kdm-archivist-local',
      JSON.stringify({
        selectedHuntId: null,
        selectedHuntMonsterIndex: 0,
        selectedSettlementId,
        selectedSettlementPhaseId: null,
        selectedShowdownId: null,
        selectedShowdownMonsterIndex: 0,
        selectedSurvivorId: null,
        selectedTab: 'settlementSettings'
      })
    )
  }, settlementId)
  await page.goto('/')
  await expect(page.getByText('Settlement Settings')).toBeVisible()
}

async function failNextSettlementUpdate(page: Page): Promise<void> {
  let failed = false

  await page.route('**/rest/v1/settlement*', async (route) => {
    if (!failed && route.request().method() === 'PATCH') {
      failed = true
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'E2E settlement update failure' })
      })
      return
    }

    await route.continue()
  })
}

async function expectConfirmedDeletion({
  page,
  triggerName,
  dialogTitle,
  exists
}: {
  page: Page
  triggerName: string
  dialogTitle: string
  exists: () => Promise<boolean>
}): Promise<void> {
  await page.getByRole('button', { name: triggerName }).click()
  const dialog = page.getByRole('alertdialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: dialogTitle })).toBeVisible()

  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect.poll(exists).toBe(true)

  await page.getByRole('button', { name: triggerName }).click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: triggerName })
    .click()

  await expect.poll(exists).toBe(false)
}
