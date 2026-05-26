import {
  assertLoginPage,
  createAuthAccount,
  createConfirmedAuthAccount
} from '@/__tests__/ui/helpers/auth'
import { createSettlementFixture } from '@/__tests__/ui/helpers/settlement'
import { deleteUsersByEmail } from '@/__tests__/ui/helpers/supabase'
import {
  addSettlementGearFixture,
  createSurvivorFixture,
  getSurvivorRow,
  waitForGearGridSlot,
  waitForSurvivorByName,
  waitForSurvivorField
} from '@/__tests__/ui/helpers/survivor'
import { LOCAL_STORAGE_KEY } from '@/lib/common'
import { TabType } from '@/lib/enums'
import { expect, type Page, test } from '@playwright/test'

test.describe('survivor management flow', () => {
  const emailsToDelete = new Set<string>()

  test.afterEach(async () => {
    await deleteUsersByEmail(emailsToDelete)
    emailsToDelete.clear()
  })

  test('creates core and arc survivors through the UI', async ({ page }) => {
    const { account, coreSettlementId, arcSettlementId } =
      await createSurvivorScenario('create')
    emailsToDelete.add(account.email)

    await openSurvivorsTab(page, account, coreSettlementId)
    await createNamedSurvivor(page, 'E2E Core Survivor', 'Male')
    const coreSurvivor = await waitForSurvivorByName(
      coreSettlementId,
      'E2E Core Survivor'
    )
    expect(coreSurvivor.gender).toBe('MALE')
    expect(coreSurvivor.survival).toBe(1)

    await openSurvivorsTab(page, account, arcSettlementId)
    await createNamedSurvivor(page, 'E2E Arc Survivor', 'Female')
    const arcSurvivor = await waitForSurvivorByName(
      arcSettlementId,
      'E2E Arc Survivor'
    )
    expect(arcSurvivor.gender).toBe('FEMALE')
    expect(arcSurvivor.lumi).toBe(0)
    expect(arcSurvivor.systemic_pressure).toBe(0)
    await expect(page.getByText('Systemic')).toBeVisible()
  })

  test('creates a wanderer survivor through the UI', async ({ page }) => {
    const { account, coreSettlementId } =
      await createSurvivorScenario('wanderer')
    emailsToDelete.add(account.email)

    await openSurvivorsTab(page, account, coreSettlementId)
    await page.getByRole('button', { name: 'New Survivor' }).click()
    await page.getByRole('tab', { name: 'Wanderer' }).click()
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Aenas' }).click()
    await page.getByRole('button', { name: 'Raise your lantern' }).click()

    const wanderer = await waitForSurvivorByName(coreSettlementId, 'Aenas')
    expect(wanderer.wanderer).toBe(true)
    expect(wanderer.aenas_state).toBe('Hungry')
    await expect(
      page.getByRole('row', { name: /Aenas Wanderer/ })
    ).toBeVisible()
  })

  test('edits representative survivor fields and blocks invalid numeric changes', async ({
    page
  }) => {
    const { account, coreSettlementId } = await createSurvivorScenario('edit')
    emailsToDelete.add(account.email)
    const survivorId = await createSurvivorFixture({
      settlementId: coreSettlementId,
      name: 'E2E Editable Survivor'
    })

    await openSurvivorsTab(page, account, coreSettlementId, survivorId)

    await page.getByLabel('Dead').click()
    await waitForSurvivorField(survivorId, 'dead', true)

    await setNumericCardValue(page, 'Survival', 2)
    await waitForSurvivorField(survivorId, 'survival', 2)

    await setNumericCardValue(page, 'Head Armor', 1)
    await waitForSurvivorField(survivorId, 'head_armor', 1)

    await page
      .getByRole('spinbutton', { exact: true, name: 'Survival' })
      .click()
    const survivalDialog = page.getByRole('dialog')
    await expect(
      survivalDialog.getByRole('button', { name: 'Increase Survival' })
    ).toBeDisabled()
    await survivalDialog.getByRole('button', { name: 'Save' }).click()
    await expect
      .poll(async () => (await getSurvivorRow(survivorId)).survival)
      .toBe(2)
  })

  test('equips and unequips settlement gear through the gear grid', async ({
    page
  }) => {
    const { account, coreSettlementId } = await createSurvivorScenario('gear')
    emailsToDelete.add(account.email)
    const survivorId = await createSurvivorFixture({
      settlementId: coreSettlementId,
      name: 'E2E Gear Survivor'
    })
    const gearId = await addSettlementGearFixture(
      coreSettlementId,
      'Founding Stone'
    )

    await openSurvivorsTab(page, account, coreSettlementId, survivorId)
    await page.getByRole('button', { name: 'Equip Top Left' }).click()
    await page.getByPlaceholder('Search gear...').fill('Founding Stone')
    await page
      .locator('[data-slot="command-item"]')
      .filter({ hasText: 'Founding Stone' })
      .click()
    await page.getByRole('button', { name: 'Equip' }).click()
    await waitForGearGridSlot(survivorId, 'pos_top_left', gearId)

    await page
      .getByRole('button', { name: 'View Top Left: Founding Stone' })
      .click()
    await page.getByRole('button', { name: 'Unequip' }).click()
    await waitForGearGridSlot(survivorId, 'pos_top_left', null)
  })
})

async function createSurvivorScenario(prefix: string) {
  const account = createAuthAccount(`survivor_${prefix}`.slice(0, 20))
  const user = await createConfirmedAuthAccount(account)
  const coreSettlementId = await createSettlementFixture({
    name: `E2E Core ${prefix}`,
    survivalLimit: 2,
    userId: user.id,
    survivorType: 'CORE'
  })
  const arcSettlementId = await createSettlementFixture({
    name: `E2E Arc ${prefix}`,
    survivalLimit: 2,
    userId: user.id,
    survivorType: 'ARC'
  })

  return { account, coreSettlementId, arcSettlementId }
}

async function openSurvivorsTab(
  page: Page,
  account: { email: string; password: string; username: string },
  settlementId: string,
  selectedSurvivorId: string | null = null
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
  await page.evaluate(
    ({ selectedSettlementId, selectedSurvivorId, selectedTab, storageKey }) => {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          selectedHuntId: null,
          selectedHuntMonsterIndex: 0,
          selectedSettlementId,
          selectedSettlementPhaseId: null,
          selectedShowdownId: null,
          selectedShowdownMonsterIndex: 0,
          selectedSurvivorId,
          selectedTab
        })
      )
    },
    {
      selectedSettlementId: settlementId,
      selectedSurvivorId,
      selectedTab: TabType.SURVIVORS,
      storageKey: LOCAL_STORAGE_KEY
    }
  )
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'New Survivor' })).toBeVisible()
}

async function createNamedSurvivor(
  page: Page,
  survivorName: string,
  gender: 'Male' | 'Female'
): Promise<void> {
  await page.getByRole('button', { name: 'New Survivor' }).click()
  await page.getByPlaceholder('Survivor name...').fill(survivorName)
  await page.getByRole('radio', { exact: true, name: gender }).click()
  await page.getByRole('button', { name: 'Raise your lantern' }).click()
  await expect(page.getByText(survivorName).first()).toBeVisible()
}

async function setNumericCardValue(
  page: Page,
  title: string,
  desiredValue: number
): Promise<void> {
  await page.getByRole('spinbutton', { exact: true, name: title }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: title })).toBeVisible()

  const value = dialog.getByRole('spinbutton', { name: `${title} value` })
  while (Number(await value.inputValue()) < desiredValue)
    await dialog.getByRole('button', { name: `Increase ${title}` }).click()
  while (Number(await value.inputValue()) > desiredValue)
    await dialog.getByRole('button', { name: `Decrease ${title}` }).click()

  await dialog.getByRole('button', { name: 'Save' }).click()
}
