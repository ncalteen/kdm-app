import {
  assertLoginPage,
  createAuthAccount,
  createConfirmedAuthAccount
} from '@/__tests__/ui/helpers/auth'
import {
  createCraftingFixture,
  createEconomyCatalogFixture,
  createEconomySettlementPhaseFixture,
  createEconomySurvivorFixture,
  createExpensiveGearFixture,
  createTimelineYearFixture,
  economyInnovationExists,
  economySettlementPhaseExists,
  getEconomySettlementNotes,
  getLocationUnlocked,
  getMilestoneComplete,
  getNemesisState,
  getPrincipleOptions,
  getQuarryUnlocked,
  getSettlementGearQuantity,
  getSettlementPhaseStep,
  getSettlementResourceQuantity,
  getSurvivorHealFields,
  getTimelineEntries,
  type CraftingFixture,
  type EconomyCatalogFixture
} from '@/__tests__/ui/helpers/economy'
import { createSettlementFixture } from '@/__tests__/ui/helpers/settlement'
import { deleteUsersByEmail } from '@/__tests__/ui/helpers/supabase'
import { LOCAL_STORAGE_KEY } from '@/lib/common'
import { TabType } from '@/lib/enums'
import { ERROR_MESSAGE } from '@/lib/messages'
import { expect, test, type Page } from '@playwright/test'

test.describe('settlement economy flow', () => {
  const emailsToDelete = new Set<string>()

  test.afterEach(async () => {
    await deleteUsersByEmail(emailsToDelete)
    emailsToDelete.clear()
  })

  test('moves settlement phase steps, heals returners, and ends the phase', async ({
    page
  }) => {
    const { account, settlementId } = await createEconomyScenario('phase')
    emailsToDelete.add(account.email)
    const survivorId = await createEconomySurvivorFixture(
      settlementId,
      'E2E Returning Survivor'
    )
    const settlementPhaseId = await createEconomySettlementPhaseFixture({
      returningSurvivorIds: [survivorId],
      settlementId,
      step: 'SURVIVORS_RETURN'
    })

    await openEconomyTab(page, account, settlementId, TabType.SETTLEMENT_PHASE)
    await page
      .getByRole('button', {
        name: 'Settlement phase space 4: Update Death Count'
      })
      .click()
    await expect
      .poll(() => getSettlementPhaseStep(settlementPhaseId))
      .toBe('UPDATE_DEATH_COUNT')

    await failNextRestPatch(page, '**/rest/v1/settlement_phase*')
    await page
      .getByRole('button', {
        name: 'Settlement phase space 5: Check Milestones'
      })
      .click()
    await expect(page.getByText(ERROR_MESSAGE())).toBeVisible()
    await expect
      .poll(() => getSettlementPhaseStep(settlementPhaseId))
      .toBe('UPDATE_DEATH_COUNT')

    await page.getByRole('button', { name: 'Heal Returning Survivors' }).click()
    await expect
      .poll(() => getSurvivorHealFields(survivorId))
      .toEqual({
        arm_armor: 0,
        arm_light_damage: false,
        body_armor: 0,
        body_light_damage: false,
        head_armor: 0,
        head_heavy_damage: false
      })

    await page
      .getByRole('button', {
        name: 'Settlement phase space 8: Special Showdown'
      })
      .click()
    await page
      .getByRole('button', { name: 'Proceed to Special Showdown' })
      .click()
    await expect(
      page.getByRole('button', { name: 'Begin Showdown' })
    ).toBeVisible()

    await selectEconomyTab(page, settlementId, TabType.SETTLEMENT_PHASE)
    await page
      .getByRole('button', {
        name: 'Settlement phase space 10: End Settlement Phase'
      })
      .click()
    await page
      .getByRole('button', { exact: true, name: 'End Settlement Phase' })
      .click()
    await expect
      .poll(() => economySettlementPhaseExists(settlementPhaseId))
      .toBe(false)
  })

  test('crafts gear by spending resources and prevents negative resource counts', async ({
    page
  }) => {
    const { account, settlementId, userId } =
      await createEconomyScenario('craft')
    emailsToDelete.add(account.email)
    const crafting = await createCraftingFixture({
      gearName: `E2E Bone Charm ${crypto.randomUUID().slice(0, 8)}`,
      resourceName: 'Monster Bone',
      resourceQuantity: 2,
      settlementId,
      userId
    })
    const expensiveGearName = `E2E Hungry Charm ${crypto.randomUUID().slice(0, 8)}`
    await createExpensiveGearFixture({
      gearName: expensiveGearName,
      quantity: 5,
      resourceName: crafting.resourceName,
      userId
    })

    await openEconomyTab(page, account, settlementId, TabType.CRAFTING)
    await craftGear(page, crafting)
    await expect
      .poll(() => getSettlementGearQuantity(settlementId, crafting.gearId))
      .toBe(1)
    await expect
      .poll(() =>
        getSettlementResourceQuantity(settlementId, crafting.resourceName)
      )
      .toBe(1)

    await openCraftDialog(page, expensiveGearName)
    await expect(
      page.getByRole('button', { name: 'Craft & Deduct' })
    ).toBeDisabled()
    await page.getByRole('button', { name: 'Cancel' }).click()

    await setNumericValue(page, `${crafting.resourceName} quantity`, 0)
    await expect
      .poll(() =>
        getSettlementResourceQuantity(settlementId, crafting.resourceName)
      )
      .toBe(0)

    await page
      .getByRole('spinbutton', {
        exact: true,
        name: `${crafting.resourceName} quantity`
      })
      .click()
    const quantityDialog = page.getByRole('dialog')
    await expect(
      quantityDialog.getByRole('button', {
        name: `Decrease ${crafting.resourceName} quantity`
      })
    ).toBeDisabled()
    await quantityDialog.getByRole('button', { name: 'Save' }).click()

    await page.getByRole('button', { name: 'Remove resource' }).click()
    await expect
      .poll(() =>
        getSettlementResourceQuantity(settlementId, crafting.resourceName)
      )
      .toBeNull()
  })

  test('edits timeline, society, monster, and notes surfaces', async ({
    page
  }) => {
    const { account, settlementId } = await createEconomyScenario('surfaces')
    emailsToDelete.add(account.email)
    await createTimelineYearFixture(settlementId)
    const catalog = await createEconomyCatalogFixture(settlementId)

    await openEconomyTab(page, account, settlementId, TabType.NOTES)
    await page
      .getByPlaceholder('Add notes about your settlement...')
      .fill('Lanterns trimmed. Stores counted. No one slept well.')
    await page.getByRole('button', { name: 'Save Notes' }).click()
    await expect
      .poll(() => getEconomySettlementNotes(settlementId))
      .toBe('Lanterns trimmed. Stores counted. No one slept well.')

    await selectEconomyTab(page, settlementId, TabType.TIMELINE)
    await page.getByRole('button', { name: 'Add event to Prologue' }).click()
    await page
      .getByPlaceholder('Prologue event...')
      .fill('E2E lantern year begins')
    await page.getByRole('button', { name: 'Save event' }).click()
    await expect
      .poll(() => getTimelineEntries(settlementId))
      .toEqual(['E2E lantern year begins'])

    await exerciseSocietySurface(page, settlementId, catalog)
    await exerciseMonsterSurface(page, settlementId, catalog)
  })
})

async function createEconomyScenario(prefix: string) {
  const account = createAuthAccount(`economy_${prefix}`.slice(0, 20))
  const user = await createConfirmedAuthAccount(account)
  const settlementId = await createSettlementFixture({
    name: `E2E Economy ${prefix}`,
    userId: user.id
  })

  return { account, settlementId, userId: user.id }
}

async function openEconomyTab(
  page: Page,
  account: { email: string; password: string; username: string },
  settlementId: string,
  selectedTab: TabType
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
  await selectEconomyTab(page, settlementId, selectedTab)
}

async function selectEconomyTab(
  page: Page,
  settlementId: string,
  selectedTab: TabType
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
    {
      selectedSettlementId: settlementId,
      selectedTab,
      storageKey: LOCAL_STORAGE_KEY
    }
  )
  await page.reload()
}

async function craftGear(page: Page, crafting: CraftingFixture): Promise<void> {
  await openCraftDialog(page, crafting.gearName)
  const dialog = page.getByRole('dialog')
  await expect(
    dialog.getByRole('heading', { name: `Craft ${crafting.gearName}` })
  ).toBeVisible()
  await expect(
    dialog.getByRole('listitem').filter({ hasText: crafting.resourceName })
  ).toContainText('2 / 1')
  await dialog.getByRole('button', { name: 'Craft & Deduct' }).click()
}

async function openCraftDialog(page: Page, gearName: string): Promise<void> {
  await page.getByRole('button', { name: 'Add gear' }).click()
  await page.getByPlaceholder('Search gear...').fill(gearName)
  await page
    .locator('[data-slot="command-item"]')
    .filter({ hasText: gearName })
    .click()
}

async function setNumericValue(
  page: Page,
  label: string,
  desiredValue: number
): Promise<void> {
  await page.getByRole('spinbutton', { exact: true, name: label }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: label })).toBeVisible()

  const value = dialog.getByRole('spinbutton', { name: `${label} value` })
  while (Number(await value.inputValue()) < desiredValue)
    await dialog.getByRole('button', { name: `Increase ${label}` }).click()
  while (Number(await value.inputValue()) > desiredValue)
    await dialog.getByRole('button', { name: `Decrease ${label}` }).click()

  await dialog.getByRole('button', { name: 'Save' }).click()
}

async function exerciseSocietySurface(
  page: Page,
  settlementId: string,
  catalog: EconomyCatalogFixture
): Promise<void> {
  await selectEconomyTab(page, settlementId, TabType.SOCIETY)

  await page
    .getByRole('checkbox', {
      name: 'Complete First time death count is updated'
    })
    .click()
  await expect
    .poll(() => getMilestoneComplete(catalog.firstDeathSettlementMilestoneId))
    .toBe(true)

  await page.getByRole('checkbox', { name: 'Graves' }).click()
  await expect
    .poll(() => getPrincipleOptions(catalog.deathSettlementPrincipleId))
    .toEqual({ option_1_selected: true, option_2_selected: false })

  await page.getByRole('checkbox', { name: 'Unlock Lantern Hoard' }).click()
  await expect
    .poll(() => getLocationUnlocked(catalog.lanternHoardSettlementLocationId))
    .toBe(true)

  await page.getByRole('button', { name: 'Remove innovation' }).click()
  await expect
    .poll(() => economyInnovationExists(catalog.hovelSettlementInnovationId))
    .toBe(false)
}

async function exerciseMonsterSurface(
  page: Page,
  settlementId: string,
  catalog: EconomyCatalogFixture
): Promise<void> {
  await selectEconomyTab(page, settlementId, TabType.MONSTERS)

  await page.getByRole('checkbox', { name: 'White Lion' }).click()
  await expect
    .poll(() => getQuarryUnlocked(catalog.whiteLionSettlementQuarryId))
    .toBe(true)

  await page.getByRole('checkbox', { name: 'Butcher' }).click()
  await expect
    .poll(() => getNemesisState(catalog.butcherSettlementNemesisId))
    .toEqual({ level_1_defeated: false, unlocked: true })

  await page.getByRole('checkbox', { name: 'L1' }).click()
  await expect
    .poll(() => getNemesisState(catalog.butcherSettlementNemesisId))
    .toEqual({ level_1_defeated: true, unlocked: true })
}

async function failNextRestPatch(page: Page, url: string): Promise<void> {
  let failed = false

  await page.route(url, async (route) => {
    if (!failed && route.request().method() === 'PATCH') {
      failed = true
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'E2E economy mutation failure' })
      })
      return
    }

    await route.continue()
  })
}
